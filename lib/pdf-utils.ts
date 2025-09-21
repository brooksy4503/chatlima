import jsPDF from 'jspdf';

/**
 * Parses markdown text into segments with style information.
 * @param text - The markdown text to parse.
 * @returns Array of text segments with style info.
 */
function parseMarkdown(text: string): Array<{ text: string, style: string, size?: number }> {
    // Preprocess inline markdown
    let processed = text;
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<bold>$1</bold>');
    processed = processed.replace(/\*(.*?)\*/g, '<italic>$1</italic>');
    processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
    processed = processed.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Strip links to plain text

    const lines = processed.split('\n');
    const segments: Array<{ text: string, style: string, size?: number }> = [];

    for (const line of lines) {
        if (line.startsWith('# ')) {
            const headerText = line.substring(2);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 16 });
            }
        } else if (line.startsWith('## ')) {
            const headerText = line.substring(3);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 14 });
            }
        } else if (line.startsWith('- ')) {
            const listText = line.substring(2);
            const inlineSegments = parseInline(listText);
            for (let i = 0; i < inlineSegments.length; i++) {
                const prefix = i === 0 ? '• ' : '';
                segments.push({ text: prefix + inlineSegments[i].text, style: inlineSegments[i].style });
            }
        } else {
            // Parse inline styles
            const inlineSegments = parseInline(line);
            segments.push(...inlineSegments);
        }
    }

    return segments;
}

/**
 * Parses inline markdown tags into segments.
 * @param text - The text with inline tags.
 * @returns Array of text segments.
 */
function parseInline(text: string): Array<{ text: string, style: string }> {
    const segments: Array<{ text: string, style: string }> = [];
    const regex = /<(bold|italic|code)>(.*?)<\/\1>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ text: text.substring(lastIndex, match.index), style: 'normal' });
        }
        segments.push({ text: match[2], style: match[1] });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        segments.push({ text: text.substring(lastIndex), style: 'normal' });
    }

    return segments;
}

/**
 * Renders markdown text to PDF with formatting.
 * @param doc - The jsPDF document instance.
 * @param markdownText - The markdown text to render.
 * @param x - The x-coordinate.
 * @param y - The y-coordinate.
 * @param options - Options for rendering.
 * @returns The new y-coordinate after rendering.
 */
export function renderMarkdownToPDF(
    doc: jsPDF,
    markdownText: string,
    x: number,
    y: number,
    options: { maxWidth: number, lineHeight?: number, pageHeight?: number } = { maxWidth: 170, lineHeight: 6, pageHeight: 280 }
): number {
    const segments = parseMarkdown(markdownText);
    let currentY = y;
    const lineHeight = options.lineHeight || 6;
    const pageHeight = options.pageHeight || 280;

    for (const segment of segments) {
        // Set font style
        const fontStyle = segment.style === 'bold' ? 'bold' : segment.style === 'italic' ? 'italic' : 'normal';
        const fontFamily = segment.style === 'code' ? 'courier' : 'helvetica';
        doc.setFont(fontFamily, fontStyle);

        // Set font size
        doc.setFontSize(segment.size || 12);

        // Split text into lines
        const lines = doc.splitTextToSize(segment.text, options.maxWidth);
        const lineArray = Array.isArray(lines) ? lines : [lines];

        for (const line of lineArray) {
            if (currentY + lineHeight > pageHeight) {
                doc.addPage();
                currentY = 30; // Reset to top margin
            }
            doc.text(line, x, currentY);
            currentY += lineHeight;
        }
    }

    return currentY;
}

/**
 * Creates a new jsPDF document with default settings.
 * @param options - Optional configuration for the PDF document.
 * @returns A new jsPDF instance.
 */
export function createPDF(options?: {
    orientation?: 'p' | 'l';
    unit?: 'mm' | 'cm' | 'in' | 'px';
    format?: string | number[];
}): jsPDF {
    return new jsPDF(options);
}

/**
 * Adds wrapped text to the PDF document with proper pagination.
 * @param doc - The jsPDF document instance.
 * @param text - The text to add.
 * @param x - The x-coordinate.
 * @param y - The y-coordinate.
 * @param maxWidth - The maximum width for text wrapping.
 * @param lineHeight - The height of each line.
 * @param pageHeight - The height of the page for pagination.
 * @returns The new y-coordinate after adding the text.
 */
export function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number = 5,
    pageHeight: number = 280
): number {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (!lines || lines.length === 0) {
        console.log(`PDF Debug: addWrappedText - No lines to add for text: "${text.substring(0, 50)}..."`);
        return y;
    }
    const lineArray = Array.isArray(lines) ? lines : [lines];
    console.log(`PDF Debug: addWrappedText - Starting y=${y}, numLines=${lineArray.length}, pageHeight=${pageHeight}`);

    let currentY = y;

    for (let i = 0; i < lineArray.length; i++) {
        const line = lineArray[i];
        console.log(`PDF Debug: addWrappedText - Processing line ${i + 1}/${lineArray.length}, currentY=${currentY}, lineHeight=${lineHeight}, wouldEndAt=${currentY + lineHeight}`);

        // Check if adding this line would exceed the page height
        if (currentY + lineHeight > pageHeight) {
            console.log(`PDF Debug: addWrappedText - Line ${i + 1} would exceed page, adding new page`);
            doc.addPage();
            currentY = 30; // Reset to top margin
            console.log(`PDF Debug: addWrappedText - After page break, currentY=${currentY}, pages=${doc.getNumberOfPages()}`);
        }

        // Add the line
        doc.text(line, x, currentY);
        currentY += lineHeight;
    }

    console.log(`PDF Debug: addWrappedText - Finished, final y=${currentY}, pages=${doc.getNumberOfPages()}`);
    return currentY;
}

/**
 * Adds a new page to the PDF if the current y position exceeds the page height.
 * @param doc - The jsPDF document instance.
 * @param y - The current y-coordinate.
 * @param pageHeight - The height of the page.
 * @returns The updated y-coordinate (reset to 30 if page added).
 */
export function addPageIfNeeded(
    doc: jsPDF,
    y: number,
    pageHeight: number = 280
): number {
    console.log(`PDF Debug: addPageIfNeeded called with y=${y}, pageHeight=${pageHeight}, needsNewPage=${y > pageHeight}`);
    if (y > pageHeight) {
        console.log(`PDF Debug: Adding new page at y=${y}, pageHeight=${pageHeight}`);
        doc.addPage();
        return 30; // Reset to top margin
    }
    return y;
}

/**
 * Sets the typography (font size and family) for the PDF document.
 * @param doc - The jsPDF document instance.
 * @param fontSize - The font size.
 * @param fontFamily - The font family.
 */
export function setTypography(
    doc: jsPDF,
    fontSize: number = 12,
    fontFamily: string = 'helvetica'
): void {
    doc.setFontSize(fontSize);
    doc.setFont(fontFamily);
}