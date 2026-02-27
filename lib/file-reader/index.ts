export { parseCSV, csvToSummary } from './csv-parser';
export { parseExcel } from './excel-parser';
export { parsePDF, pdfToSummary } from './pdf-parser';
export { parseText, textToSummary, codeToSummary } from './text-parser';

import { parseCSV, csvToSummary } from './csv-parser';
import { parseExcel } from './excel-parser';
import { parsePDF, pdfToSummary } from './pdf-parser';
import { parseText, textToSummary, codeToSummary } from './text-parser';
import { getMimeTypeFromExtension } from '../file-upload';

export async function parseFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> {
  const ext = filename.split('.').pop()?.toLowerCase();
  const effectiveMimeType = mimeType || getMimeTypeFromExtension(ext) || '';

  if (!effectiveMimeType && !ext) {
    return { success: false, error: 'Unable to determine file type' };
  }

  try {
    if (effectiveMimeType === 'text/csv' || ext === 'csv') {
      const result = await parseCSV(buffer);
      if (result.success && result.data && result.headers) {
        return {
          success: true,
          content: csvToSummary(result.data, result.headers),
        };
      }
      return { success: false, error: result.error };
    }

    if (
      effectiveMimeType === 'application/vnd.ms-excel' ||
      effectiveMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      ext === 'xlsx' ||
      ext === 'xls'
    ) {
      const result = await parseExcel(buffer);
      if (result.success && result.data) {
        return { success: true, content: result.data.summary };
      }
      return { success: false, error: result.error };
    }

    if (effectiveMimeType === 'application/pdf' || ext === 'pdf') {
      const result = await parsePDF(buffer);
      if (result.success && result.text) {
        return {
          success: true,
          content: pdfToSummary(result.text, result.info),
        };
      }
      return { success: false, error: result.error };
    }

    const textResult = parseText(buffer);
    if (textResult.success && textResult.text) {
      const isCode =
        effectiveMimeType.startsWith('text/x-') ||
        effectiveMimeType === 'application/javascript' ||
        effectiveMimeType === 'application/json' ||
        ['js', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'css', 'html'].includes(ext || '');

      if (isCode) {
        return {
          success: true,
          content: codeToSummary(textResult.text, filename, effectiveMimeType),
        };
      }

      return {
        success: true,
        content: textToSummary(textResult.text, filename),
      };
    }

    return { success: false, error: textResult.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file';
    console.error('[FileParser] Error:', error);
    return { success: false, error: message };
  }
}
