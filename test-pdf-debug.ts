// Test script to debug PDF generation with long messages
import { createPDF, addWrappedText, setTypography, addPageIfNeeded } from './lib/pdf-utils';

// Mock message type
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: Array<{ type: 'text'; text: string }>;
    createdAt: Date;
}

// Mock chat type
interface Chat {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
}

// Helper to extract text content from message parts
function extractMessageText(message: Message): string {
    try {
        return message.content.map(part => part.text).join('');
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

// Generate PDF from chat data (copied from route.ts)
function generateChatPDF(chat: Chat): Buffer {
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
            if (textContent.trim()) {
                y = addWrappedText(doc, textContent, margin + 10, y, maxWidth - 10, 6, 280);
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

// Create a test chat with long messages
const testChat: Chat = {
    id: 'test-chat-123',
    title: 'Test Chat with Long Messages',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
        {
            id: 'msg-1',
            role: 'user',
            content: [{ type: 'text', text: 'This is a very long user message that should cause text wrapping and potentially page breaks. '.repeat(50) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-2',
            role: 'assistant',
            content: [{ type: 'text', text: 'This is an even longer assistant response that will definitely require multiple lines and might span across pages. '.repeat(100) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-3',
            role: 'user',
            content: [{ type: 'text', text: 'Another long message to test page breaks. '.repeat(80) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-4',
            role: 'assistant',
            content: [{ type: 'text', text: 'Final long message to ensure we see multiple page breaks. '.repeat(120) }],
            createdAt: new Date(),
        },
    ],
};

console.log('Starting PDF generation test...');
try {
    const pdfBuffer = generateChatPDF(testChat);
    console.log(`PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
} catch (error) {
    console.error('Error generating PDF:', error);
}