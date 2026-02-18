export async function parsePDF(buffer: Buffer): Promise<{
  success: boolean;
  text?: string;
  info?: {
    pages?: number;
    title?: string;
    author?: string;
  };
  error?: string;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer, {
      max: 0,
    });

    const text = data.text
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      text,
      info: {
        pages: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse PDF';
    console.error('[PDFParser] Error:', error);
    return { success: false, error: message };
  }
}

export function pdfToSummary(
  text: string,
  info?: { pages?: number; title?: string; author?: string }
): string {
  let summary = 'PDF Summary:\n';
  
  if (info) {
    if (info.title) summary += `- Title: ${info.title}\n`;
    if (info.author) summary += `- Author: ${info.author}\n`;
    if (info.pages) summary += `- Pages: ${info.pages}\n`;
    summary += '\n';
  }

  summary += 'Content Preview:\n';
  
  const maxPreviewLength = 5000;
  if (text.length > maxPreviewLength) {
    summary += text.substring(0, maxPreviewLength) + '...\n';
    summary += `\n[Content truncated. Total length: ${text.length} characters]`;
  } else {
    summary += text;
  }

  return summary;
}
