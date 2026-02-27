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
    // unpdf has no pdf worker dependency and works in server runtimes.
    const { extractText, getMeta } = await import('unpdf');
    const uint8Array = new Uint8Array(buffer);
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });

    const normalizedText = (text || '')
      .replace(/\s+/g, ' ')
      .trim();

    let metaInfo: any = null;
    try {
      const meta = await getMeta(uint8Array);
      metaInfo = meta?.info;
    } catch {
      // Metadata extraction is optional.
    }

    if (!normalizedText) {
      return {
        success: false,
        error: 'No extractable text found in PDF. The file may be scanned or image-based and require OCR.',
      };
    }

    return {
      success: true,
      text: normalizedText,
      info: {
        pages: totalPages,
        title: metaInfo?.Title,
        author: metaInfo?.Author,
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
