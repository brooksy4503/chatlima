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
 * Adds wrapped text to the PDF document.
 * @param doc - The jsPDF document instance.
 * @param text - The text to add.
 * @param x - The x-coordinate.
 * @param y - The y-coordinate.
 * @param maxWidth - The maximum width for text wrapping.
 * @param lineHeight - The height of each line.
 * @returns The new y-coordinate after adding the text.
 */
export function addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number = 5
): number {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (!lines || lines.length === 0) {
        return y;
    }
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
}

/**
 * Adds a new page to the PDF if the current y position exceeds the page height.
 * @param doc - The jsPDF document instance.
 * @param y - The current y-coordinate.
 * @param pageHeight - The height of the page.
 */
export function addPageIfNeeded(
    doc: jsPDF,
    y: number,
    pageHeight: number = 280
): void {
    if (y > pageHeight) {
        doc.addPage();
    }
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