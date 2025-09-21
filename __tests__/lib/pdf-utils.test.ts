import jsPDF from 'jspdf';
import { createPDF, addWrappedText, setTypography, addPageIfNeeded } from '../../lib/pdf-utils';

// Mock jsPDF
jest.mock('jspdf', () => {
    const mockJsPDF = jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        text: jest.fn(),
        splitTextToSize: jest.fn(),
        addPage: jest.fn(),
        output: jest.fn(),
    }));
    return mockJsPDF;
});

describe('PDF Utils', () => {
    let mockDoc: jest.Mocked<jsPDF>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDoc = new jsPDF() as jest.Mocked<jsPDF>;
    });

    describe('createPDF', () => {
        it('should create a new jsPDF instance with default options', () => {
            const doc = createPDF();

            expect(jsPDF).toHaveBeenCalledWith(undefined);
            expect(doc).toBeDefined();
        });

        it('should create a new jsPDF instance with custom options', () => {
            const options = {
                orientation: 'l' as const,
                unit: 'in' as const,
                format: 'a4' as const,
            };

            const doc = createPDF(options);

            expect(jsPDF).toHaveBeenCalledWith(options);
            expect(doc).toBeDefined();
        });

        it('should handle all jsPDF options', () => {
            const options = {
                orientation: 'p' as const,
                unit: 'mm' as const,
                format: [210, 297],
            };

            const doc = createPDF(options);

            expect(jsPDF).toHaveBeenCalledWith(options);
        });
    });

    describe('addWrappedText', () => {
        it('should add wrapped text to the PDF document', () => {
            const text = 'This is a long text that should be wrapped';
            const x = 10;
            const y = 20;
            const maxWidth = 100;
            const lineHeight = 5;

            mockDoc.splitTextToSize.mockReturnValue(['This is a long text', 'that should be wrapped']);

            const newY = addWrappedText(mockDoc, text, x, y, maxWidth, lineHeight);

            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(mockDoc.text).toHaveBeenCalledWith(['This is a long text', 'that should be wrapped'], x, y);
            expect(newY).toBe(y + 2 * lineHeight); // 2 lines * 5 lineHeight
        });

        it('should use default line height when not provided', () => {
            const text = 'Short text';
            const x = 10;
            const y = 20;
            const maxWidth = 100;

            mockDoc.splitTextToSize.mockReturnValue(['Short text']);

            const newY = addWrappedText(mockDoc, text, x, y, maxWidth);

            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(mockDoc.text).toHaveBeenCalledWith(['Short text'], x, y);
            expect(newY).toBe(y + 1 * 5); // 1 line * default lineHeight (5)
        });

        it('should handle single line text', () => {
            const text = 'Single line';
            const x = 10;
            const y = 20;
            const maxWidth = 100;

            mockDoc.splitTextToSize.mockReturnValue(['Single line']);

            const newY = addWrappedText(mockDoc, text, x, y, maxWidth);

            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(mockDoc.text).toHaveBeenCalledWith(['Single line'], x, y);
            expect(newY).toBe(y + 5);
        });

        it('should handle empty text', () => {
            const text = '';
            const x = 10;
            const y = 20;
            const maxWidth = 100;

            mockDoc.splitTextToSize.mockReturnValue(['']);

            const newY = addWrappedText(mockDoc, text, x, y, maxWidth);

            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(mockDoc.text).toHaveBeenCalledWith([''], x, y);
            expect(newY).toBe(y + 5);
        });

        it('should handle very long text with many lines', () => {
            const text = 'Very long text that will be split into multiple lines';
            const x = 10;
            const y = 20;
            const maxWidth = 50;
            const lineHeight = 6;

            const lines = ['Very long text', 'that will be', 'split into', 'multiple lines'];
            mockDoc.splitTextToSize.mockReturnValue(lines);

            const newY = addWrappedText(mockDoc, text, x, y, maxWidth, lineHeight);

            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(text, maxWidth);
            expect(mockDoc.text).toHaveBeenCalledWith(lines, x, y);
            expect(newY).toBe(y + 4 * lineHeight); // 4 lines * 6 lineHeight
        });
    });

    describe('setTypography', () => {
        it('should set font size and family with provided values', () => {
            const fontSize = 14;
            const fontFamily = 'arial';

            setTypography(mockDoc, fontSize, fontFamily);

            expect(mockDoc.setFontSize).toHaveBeenCalledWith(fontSize);
            expect(mockDoc.setFont).toHaveBeenCalledWith(fontFamily);
        });

        it('should use default values when not provided', () => {
            setTypography(mockDoc);

            expect(mockDoc.setFontSize).toHaveBeenCalledWith(12);
            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica');
        });

        it('should use default font size when only font family provided', () => {
            const fontFamily = 'times';

            setTypography(mockDoc, undefined, fontFamily);

            expect(mockDoc.setFontSize).toHaveBeenCalledWith(12);
            expect(mockDoc.setFont).toHaveBeenCalledWith(fontFamily);
        });

        it('should use default font family when only font size provided', () => {
            const fontSize = 16;

            setTypography(mockDoc, fontSize);

            expect(mockDoc.setFontSize).toHaveBeenCalledWith(fontSize);
            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica');
        });
    });

    describe('addPageIfNeeded', () => {
        it('should not add page when y position is below page height', () => {
            const y = 100;
            const pageHeight = 200;

            addPageIfNeeded(mockDoc, y, pageHeight);

            expect(mockDoc.addPage).not.toHaveBeenCalled();
        });

        it('should add page when y position exceeds page height', () => {
            const y = 250;
            const pageHeight = 200;

            addPageIfNeeded(mockDoc, y, pageHeight);

            expect(mockDoc.addPage).toHaveBeenCalledTimes(1);
        });

        it('should use default page height when not provided', () => {
            const y = 285; // Above default page height of 280

            addPageIfNeeded(mockDoc, y);

            expect(mockDoc.addPage).toHaveBeenCalledTimes(1);
        });

        it('should not add page when y equals page height', () => {
            const y = 200;
            const pageHeight = 200;

            addPageIfNeeded(mockDoc, y, pageHeight);

            expect(mockDoc.addPage).not.toHaveBeenCalled();
        });

        it('should handle edge case where y is exactly at page boundary', () => {
            const y = 280;
            const pageHeight = 280;

            addPageIfNeeded(mockDoc, y, pageHeight);

            expect(mockDoc.addPage).not.toHaveBeenCalled();
        });
    });

    describe('Integration Tests', () => {
        it('should work together to create a complete PDF workflow', () => {
            // Create PDF
            const doc = createPDF({ format: 'a4' });
            expect(jsPDF).toHaveBeenCalledWith({ format: 'a4' });

            // Set typography
            setTypography(doc, 14, 'arial');
            expect(doc.setFontSize).toHaveBeenCalledWith(14);
            expect(doc.setFont).toHaveBeenCalledWith('arial');

            // Add wrapped text
            (doc.splitTextToSize as jest.MockedFunction<any>).mockReturnValue(['First line', 'Second line']);
            const newY = addWrappedText(doc, 'Test content', 20, 30, 150, 7);
            expect(doc.splitTextToSize).toHaveBeenCalledWith('Test content', 150);
            expect(doc.text).toHaveBeenCalledWith(['First line', 'Second line'], 20, 30);
            expect(newY).toBe(30 + 2 * 7); // 30 + 14

            // Check page addition - should trigger because 250 > 270 is false, so no page added
            addPageIfNeeded(doc, 250, 270);
            expect(doc.addPage).not.toHaveBeenCalled();
        });

        it('should handle multiple text additions with page management', () => {
            const doc = createPDF();

            // First text block
            (doc.splitTextToSize as jest.MockedFunction<any>).mockReturnValueOnce(['First paragraph']);
            let y = addWrappedText(doc, 'First paragraph', 20, 30, 150);

            // Second text block - should trigger page addition
            (doc.splitTextToSize as jest.MockedFunction<any>).mockReturnValueOnce(['Second paragraph']);
            y = addWrappedText(doc, 'Second paragraph', 20, y + 10, 150);

            addPageIfNeeded(doc, 150, 100); // y=150 > pageHeight=100, should trigger addition
            expect(doc.addPage).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle jsPDF constructor errors gracefully', () => {
            // Mock jsPDF to throw error
            (jsPDF as jest.MockedFunction<any>).mockImplementationOnce(() => {
                throw new Error('PDF creation failed');
            });

            expect(() => createPDF()).toThrow('PDF creation failed');
        });

        it('should handle splitTextToSize errors', () => {
            mockDoc.splitTextToSize.mockImplementation(() => {
                throw new Error('Text splitting failed');
            });

            expect(() => {
                addWrappedText(mockDoc, 'test', 10, 20, 100);
            }).toThrow('Text splitting failed');
        });

        it('should handle setFontSize errors', () => {
            mockDoc.setFontSize.mockImplementation(() => {
                throw new Error('Font size setting failed');
            });

            expect(() => {
                setTypography(mockDoc, 14);
            }).toThrow('Font size setting failed');
        });

        it('should handle setFont errors', () => {
            mockDoc.setFont.mockImplementation(() => {
                throw new Error('Font setting failed');
            });

            expect(() => {
                setTypography(mockDoc, 12, 'arial');
            }).toThrow('Font setting failed');
        });

        it('should handle addPage errors', () => {
            mockDoc.addPage.mockImplementation(() => {
                throw new Error('Page addition failed');
            });

            expect(() => {
                addPageIfNeeded(mockDoc, 300, 200);
            }).toThrow('Page addition failed');
        });
    });

    describe('Performance Tests', () => {
        it('should handle large text efficiently', () => {
            const largeText = 'A'.repeat(10000); // 10KB of text
            mockDoc.splitTextToSize.mockReturnValue(['A'.repeat(100)]);

            const startTime = Date.now();
            addWrappedText(mockDoc, largeText, 10, 20, 100);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
            expect(mockDoc.splitTextToSize).toHaveBeenCalledWith(largeText, 100);
        });

        it('should handle many page additions efficiently', () => {
            const startTime = Date.now();

            for (let i = 0; i < 100; i++) {
                addPageIfNeeded(mockDoc, 300 + i, 200);
            }

            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
            expect(mockDoc.addPage).toHaveBeenCalledTimes(100);
        });
    });
});