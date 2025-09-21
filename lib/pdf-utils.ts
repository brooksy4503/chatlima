import jsPDF from 'jspdf';

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