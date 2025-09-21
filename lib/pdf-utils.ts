import jsPDF from 'jspdf';

/**
 * Parses markdown text into segments with style information.
 * @param text - The markdown text to parse.
 * @returns Array of text segments with style info.
 */
function parseMarkdown(text: string): Array<{ text: string, style: string, size?: number, isListItem?: boolean, listLevel?: number, isListItemStart?: boolean }> {
    // Preprocess inline markdown
    let processed = text;
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<bold>$1</bold>');
    processed = processed.replace(/\*(.*?)\*/g, '<italic>$1</italic>');
    processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');
    processed = processed.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Strip links to plain text

    const lines = processed.split('\n');
    const segments: Array<{ text: string, style: string, size?: number, isListItem?: boolean, listLevel?: number, isListItemStart?: boolean }> = [];
    let currentListLevel = 0;
    let pendingOrderedPrefix: { prefix: string, level: number } | null = null;
    let inFence = false;

    // Buffer to join soft-wrapped lines into a single paragraph like the chat renderer
    const paragraphBuffer: string[] = [];
    const flushParagraph = (addSpacing: boolean) => {
        if (paragraphBuffer.length === 0) return;
        const paragraphText = paragraphBuffer.join(' ');
        const inlineSegments = parseInline(paragraphText);
        for (const seg of inlineSegments) {
            segments.push({ text: seg.text, style: seg.style });
        }
        if (addSpacing) {
            segments.push({ text: '', style: 'normal', size: 12 });
        }
        paragraphBuffer.length = 0;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Toggle fenced code blocks
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence;
        }

        // Handle empty lines - flush paragraph and reset list state (match chat renderer)
        if (trimmedLine === '') {
            flushParagraph(true);
            if (!inFence) {
                currentListLevel = 0;
                pendingOrderedPrefix = null;
            }
            continue;
        }

        // If a bare ordered prefix was captured on previous line, use it now
        if (pendingOrderedPrefix && !trimmedLine.match(/^[-*+]/)) {
            flushParagraph(true);
            const indent = '  '.repeat(pendingOrderedPrefix.level);
            const inlineSegments = parseInline(trimmedLine);
            for (let j = 0; j < inlineSegments.length; j++) {
                const maybePrefix = j === 0 ? pendingOrderedPrefix.prefix + ' ' : '';
                segments.push({
                    text: indent + maybePrefix + inlineSegments[j].text,
                    style: inlineSegments[j].style,
                    isListItem: true,
                    listLevel: pendingOrderedPrefix.level
                });
            }
            pendingOrderedPrefix = null;
            continue;
        }

        // Handle headers
        if (trimmedLine.startsWith('# ')) {
            flushParagraph(true);
            currentListLevel = 0; // Reset list level for headers
            const headerText = trimmedLine.substring(2);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 18 });
            }
            segments.push({ text: '', style: 'normal', size: 12 }); // Add spacing after header
            continue;
        }

        if (trimmedLine.startsWith('## ')) {
            flushParagraph(true);
            currentListLevel = 0;
            const headerText = trimmedLine.substring(3);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 16 });
            }
            segments.push({ text: '', style: 'normal', size: 12 });
            continue;
        }

        if (trimmedLine.startsWith('### ')) {
            flushParagraph(true);
            currentListLevel = 0;
            const headerText = trimmedLine.substring(4);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 14 });
            }
            segments.push({ text: '', style: 'normal', size: 12 });
            continue;
        }

        if (trimmedLine.startsWith('#### ')) {
            flushParagraph(true);
            currentListLevel = 0;
            const headerText = trimmedLine.substring(5);
            const inlineSegments = parseInline(headerText);
            for (const seg of inlineSegments) {
                segments.push({ text: seg.text, style: 'bold', size: 13 });
            }
            segments.push({ text: '', style: 'normal', size: 12 });
            continue;
        }

        // Handle unordered list items: -, *, +
        if (/^[-*+]\s+/.test(trimmedLine)) {
            flushParagraph(true);
            const listText = trimmedLine.replace(/^[-*+]\s+/, '');
            const inlineSegments = parseInline(listText);
            const leadingSpaces = line.length - line.trimStart().length;
            const listLevel = Math.floor(leadingSpaces / 2);
            currentListLevel = listLevel;

            for (let j = 0; j < inlineSegments.length; j++) {
                const prefix = j === 0 ? '• ' : '';
                const indent = '  '.repeat(listLevel);
                segments.push({
                    text: indent + prefix + inlineSegments[j].text,
                    style: inlineSegments[j].style,
                    isListItem: true,
                    listLevel: listLevel,
                    isListItemStart: j === 0
                });
            }
            continue;
        }

        // Handle ordered list items: "1. foo" or "1) foo"
        const orderedMatch = trimmedLine.match(/^(\d+)[\.)]\s*(.*)$/);
        if (orderedMatch) {
            flushParagraph(true);
            const num = orderedMatch[1];
            const listText = orderedMatch[2];
            const leadingSpaces = line.length - line.trimStart().length;
            const listLevel = Math.floor(leadingSpaces / 2);
            currentListLevel = listLevel;

            // If the item has no following text (e.g., line is just "1."), capture prefix for next line
            if (!listText) {
                pendingOrderedPrefix = { prefix: `${num}.`, level: listLevel };
            } else {
                const inlineSegments = parseInline(listText);
                for (let j = 0; j < inlineSegments.length; j++) {
                    const prefix = j === 0 ? `${num}. ` : '';
                    const indent = '  '.repeat(listLevel);
                    segments.push({
                        text: indent + prefix + inlineSegments[j].text,
                        style: inlineSegments[j].style,
                        isListItem: true,
                        listLevel: listLevel,
                        isListItemStart: j === 0
                    });
                }
            }
            continue;
        }

        // Regular paragraph or continuation of list item
        const inlineSegments = parseInline(trimmedLine);
        if (currentListLevel > 0 && trimmedLine.length > 0) {
            // This is a continuation of a list item
            for (const seg of inlineSegments) {
                const indent = '  '.repeat(currentListLevel) + '  ';
                segments.push({
                    text: indent + seg.text,
                    style: seg.style,
                    isListItem: true,
                    listLevel: currentListLevel,
                    isListItemStart: false
                });
            }
        } else {
            // Regular paragraph (accumulate soft-wrapped lines)
            currentListLevel = 0;
            paragraphBuffer.push(trimmedLine);
        }
    }

    // Flush any trailing paragraph without adding extra spacing at the end
    flushParagraph(false);

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
    const baseLineHeight = options.lineHeight || 6;
    const pageHeight = options.pageHeight || 280;

    // Helper to set font by style
    const applyStyle = (style: string | undefined, size: number = 12) => {
        const fontFamily = style === 'code' ? 'courier' : 'helvetica';
        const fontStyle = style === 'bold' ? 'bold' : style === 'italic' ? 'italic' : 'normal';
        doc.setFont(fontFamily, fontStyle);
        doc.setFontSize(size);
    };

    // Render a group of inline segments as a single wrapped paragraph, preserving inline styles
    const renderInlineGroup = (
        group: Array<{ text: string, style: string }>,
        startX: number,
        startY: number,
        lineHeight: number,
        rightLimitX: number,
    ): number => {
        let cx = startX;
        let cy = startY;
        const maxX = rightLimitX;

        // Tokenize segments while preserving spaces
        for (const seg of group) {
            const tokens = seg.text.match(/\S+|\s+/g) || [seg.text];
            for (let t of tokens) {
                // Normalize tabs to two spaces to avoid width spikes
                if (t === '\t') t = '  ';

                applyStyle(seg.style, 12);
                const token = t;
                // Avoid leading spaces at the start of lines
                if ((/\s+/.test(token)) && cx === startX) {
                    continue;
                }

                const tokenWidth = doc.getTextWidth(token);

                // New line if token doesn't fit
                if (cx + tokenWidth > maxX) {
                    // Move to next line
                    cy += lineHeight;
                    if (cy + lineHeight > pageHeight) {
                        doc.addPage();
                        cy = 30;
                    }
                    cx = startX;
                    // Skip leading spaces at new line
                    if (/\s+/.test(token)) {
                        continue;
                    }
                }

                // Draw token at current position
                doc.text(token, cx, cy);
                cx += tokenWidth;
            }
        }

        // Return the Y position for the next baseline
        return cy + lineHeight;
    };

    // Iterate and group segments into paragraphs/list blocks
    let i = 0;
    while (i < segments.length) {
        const seg = segments[i];

        // Spacing markers
        if (!seg.text) {
            currentY += baseLineHeight * 0.5;
            i++;
            continue;
        }

        // Headers (size > 12)
        if (seg.size && seg.size > 12) {
            let headerText = '';
            const headerSize = seg.size;
            // Collect contiguous header segments
            while (i < segments.length && segments[i].size === headerSize) {
                headerText += segments[i].text;
                i++;
            }

            applyStyle('bold', headerSize);
            // Add extra spacing before headers for visual separation
            if (currentY > 30) {
                const preSpacing = baseLineHeight * 0.9;
                if (currentY + preSpacing + baseLineHeight * 1.5 > pageHeight) {
                    doc.addPage();
                    currentY = 30;
                } else {
                    currentY += preSpacing;
                }
            }

            // Page break if needed after adding pre-spacing
            if (currentY + baseLineHeight * 1.5 > pageHeight) {
                doc.addPage();
                currentY = 30;
            }
            doc.text(headerText, x, currentY);
            currentY += baseLineHeight * 1.5;
            continue;
        }

        // Helper to detect the beginning of a new list item by its text prefix
        const isNewListItemText = (text: string): boolean => {
            return /^\s*(•|\d+[\.)])\s+/.test(text);
        };

        if (seg.isListItem) {
            // Render ONE list item at a time to keep bullets on their own lines
            const group: Array<{ text: string, style: string }> = [];
            const localLineHeight = baseLineHeight * 1.1;
            const startIndex = i;

            // Collect segments that belong to the same list item (continuations don't start with a bullet/number)
            while (i < segments.length) {
                const s = segments[i];
                if (!s.text) break;
                if (!s.isListItem) break;
                if (group.length > 0 && (s as any).isListItemStart) break; // next list item starts
                if (s.size && s.size > 12) break;
                group.push({ text: s.text, style: s.style });
                i++;
            }

            if (currentY + localLineHeight > pageHeight) {
                doc.addPage();
                currentY = 30;
            }

            // Compute indentation and bullet label from the first segment's original text
            const firstSeg = segments[startIndex];
            const level = (firstSeg as any).listLevel || 0;
            const baseX = x + doc.getTextWidth('  ') * level; // two spaces per nesting level
            const firstTextOriginal = (firstSeg && firstSeg.text) || '';
            const afterSpaces = firstTextOriginal.replace(/^\s+/, '');
            const bulletMatch = afterSpaces.match(/^((?:•)|(?:\d+[\.)]))\s+/);
            const bulletLabel = bulletMatch ? bulletMatch[1] : '•';

            // Remove the bullet and any leading spaces from the first content fragment
            if (group.length > 0) {
                group[0] = {
                    ...group[0],
                    text: group[0].text.replace(/^\s*((?:•)|(?:\d+[\.)]))\s+/, ''),
                };
            }

            // Draw bullet/number at the base indent
            applyStyle('normal', 12);
            doc.text(bulletLabel, baseX, currentY);

            // Render the rest with hanging indent
            const gapWidth = doc.getTextWidth('  ');
            const startXForText = baseX + doc.getTextWidth(bulletLabel) + gapWidth;
            const rightLimitX = x + options.maxWidth;
            currentY = renderInlineGroup(group, startXForText, currentY, localLineHeight, rightLimitX);
            continue;
        }

        // Paragraph block (non-list)
        const group: Array<{ text: string, style: string }> = [];
        const localLineHeight = baseLineHeight;
        while (i < segments.length) {
            const s = segments[i];
            if (!s.text) break;
            if (s.isListItem) break;
            if (s.size && s.size > 12) break;
            group.push({ text: s.text, style: s.style });
            i++;
        }

        if (currentY + localLineHeight > pageHeight) {
            doc.addPage();
            currentY = 30;
        }

        currentY = renderInlineGroup(group, x, currentY, localLineHeight, x + options.maxWidth);
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
