import { NextResponse, NextRequest } from "next/server";
import { getChatById } from "@/lib/chat-store";
import { auth } from "@/lib/auth";
import { createPDF, addWrappedText, setTypography, addPageIfNeeded, renderMarkdownToPDF } from "@/lib/pdf-utils";
import { getTextContent } from "@/lib/chat-store";
import type { Message } from "@/lib/db/schema";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// Helper to get user ID from authenticated session only
async function getRequestUserId(request: NextRequest | Request): Promise<string | null> {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id || null;
}

// Helper to extract text content from message parts
function extractMessageText(message: Message): string {
    try {
        return getTextContent(message);
    } catch (error) {
        console.error('Error extracting text from message:', error);
        return '[Error extracting message content]';
    }
}

// Helper to format date for PDF header
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate PDF from chat data
function generateChatPDF(chat: any): Buffer {
    const doc = createPDF({ format: 'a4' });
    setTypography(doc, 12, 'helvetica');

    const pageWidth = 210; // A4 width in mm
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let y = 30;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Chat: ${chat.title || 'Untitled Chat'}`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${formatDate(chat.createdAt)}`, margin, y);
    y += 20;

    // Messages
    if (chat.messages && chat.messages.length > 0) {
        chat.messages.forEach((message: Message, index: number) => {
            console.log(`PDF Debug: Processing message ${index + 1}/${chat.messages.length}, current y=${y}`);

            // Add page if needed before role label
            y = addPageIfNeeded(doc, y, 280);

            // Role label
            const role = message.role === 'user' ? 'User:' : 'Assistant:';
            doc.setFont('helvetica', 'bold');
            doc.text(role, margin, y);
            y += 8;

            // Message content
            doc.setFont('helvetica', 'normal');
            const textContent = extractMessageText(message);
            console.log(`PDF Debug: Message ${index + 1} textContent length: ${textContent.length}, first 100 chars: "${textContent.substring(0, 100)}"`);
            if (textContent.trim()) {
                const beforeY = y;
                y = renderMarkdownToPDF(doc, textContent, margin + 10, y, { maxWidth: maxWidth - 10, lineHeight: 6, pageHeight: 280 });
                console.log(`PDF Debug: renderMarkdownToPDF returned y=${y} (was ${beforeY}), pages=${doc.getNumberOfPages()}`);
            } else {
                y = addWrappedText(doc, '[No text content]', margin + 10, y, maxWidth - 10, 6, 280);
            }

            // Check for page break after content
            y = addPageIfNeeded(doc, y, 280);

            y += 10; // Space between messages

            console.log(`PDF Debug: After message ${index + 1}, y=${y}, pages=${doc.getNumberOfPages()}`);
        });
    } else {
        doc.text('No messages found in this chat.', margin, y);
    }

    console.log(`PDF Debug: Final PDF has ${doc.getNumberOfPages()} pages`);

    // Return PDF as buffer
    return Buffer.from(doc.output('arraybuffer'));
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        // Authentication check
        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Get chat ID from params
        const { id: chatId } = await params;

        // Fetch chat with ownership validation
        const chat = await getChatById(chatId, userId);
        if (!chat) {
            // Check if chat exists at all to differentiate between 404 and 403
            // For now, we'll assume getChatById handles this properly
            return NextResponse.json(
                { error: "Chat not found or access denied" },
                { status: 404 }
            );
        }

        // Generate PDF
        let pdfBuffer: Buffer;
        try {
            pdfBuffer = generateChatPDF(chat);
        } catch (error) {
            console.error('Error generating PDF:', error);
            return NextResponse.json(
                { error: "Failed to generate PDF" },
                { status: 500 }
            );
        }

        // Return PDF as downloadable file
        const sanitizedTitle = (chat.title || 'untitled')
            .replace(/[^a-zA-Z0-9\s\-_]/g, '_') // Replace special chars with underscores
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50); // Limit length
        const filename = `chat-${sanitizedTitle}-${chatId.slice(0, 8)}.pdf`;

        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error("Error in chat PDF export:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}