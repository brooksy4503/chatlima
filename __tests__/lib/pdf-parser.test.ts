import { parsePDF, pdfToSummary } from '@/lib/file-reader/pdf-parser';
import { extractText, getMeta } from 'unpdf';

jest.mock('unpdf', () => ({
  extractText: jest.fn(),
  getMeta: jest.fn(),
}));

describe('pdf parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses pdf text and metadata successfully', async () => {
    (extractText as jest.Mock).mockResolvedValue({
      text: 'Hello   PDF',
      totalPages: 3,
    });
    (getMeta as jest.Mock).mockResolvedValue({
      info: { Title: 'Doc Title', Author: 'Author Name' },
    });

    const result = await parsePDF(Buffer.from('fake'));

    expect(result.success).toBe(true);
    expect(result.text).toBe('Hello PDF');
    expect(result.info).toEqual({
      pages: 3,
      title: 'Doc Title',
      author: 'Author Name',
    });
  });

  it('returns no-text error when extraction is empty', async () => {
    (extractText as jest.Mock).mockResolvedValue({
      text: '   ',
      totalPages: 2,
    });
    (getMeta as jest.Mock).mockResolvedValue(undefined);

    const result = await parsePDF(Buffer.from('fake'));

    expect(result.success).toBe(false);
    expect(result.error).toContain('No extractable text found in PDF');
  });

  it('returns parser failure when extractText throws', async () => {
    (extractText as jest.Mock).mockRejectedValue(new Error('boom'));

    const result = await parsePDF(Buffer.from('fake'));

    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
  });

  it('builds truncated summary for long content', () => {
    const longText = 'x'.repeat(6000);
    const summary = pdfToSummary(longText, { pages: 10, title: 'T', author: 'A' });

    expect(summary).toContain('PDF Summary:');
    expect(summary).toContain('- Pages: 10');
    expect(summary).toContain('Content Preview:');
    expect(summary).toContain('[Content truncated.');
  });
});
