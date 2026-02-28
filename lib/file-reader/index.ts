export { parseCSV, csvToSummary } from './csv-parser';
export { parseExcel } from './excel-parser';
export { parsePDF, pdfToSummary } from './pdf-parser';
export { parseText, textToSummary, codeToSummary } from './text-parser';

import { parseCSV, csvToSummary, csvToFullContent } from './csv-parser';
import { parseExcel, excelToFullContent } from './excel-parser';
import { parsePDF, pdfToSummary } from './pdf-parser';
import { parseText, textToSummary, codeToSummary } from './text-parser';
import { getMimeTypeFromExtension } from '../file-upload';

// Global safety cap: ~100k-125k tokens (assuming ~4 chars per token)
const MAX_FILE_CONTENT_CHARS = 500_000;

function applyContentCap(content: string): string {
  if (content.length <= MAX_FILE_CONTENT_CHARS) {
    return content;
  }
  return (
    content.substring(0, MAX_FILE_CONTENT_CHARS) +
    '\n\n[Content truncated. Total length: ' +
    content.length +
    ' characters]'
  );
}

function getLanguageFromMimeType(mimeType?: string): string | null {
  if (!mimeType) return null;

  const mimeToLang: Record<string, string> = {
    'application/javascript': 'javascript',
    'text/x-typescript': 'typescript',
    'text/x-python': 'python',
    'text/x-java': 'java',
    'text/x-c': 'c',
    'text/x-cpp': 'cpp',
    'text/html': 'html',
    'text/css': 'css',
    'application/json': 'json',
    'text/markdown': 'markdown',
    'text/yaml': 'yaml',
    'text/x-yaml': 'yaml',
  };

  return mimeToLang[mimeType] || null;
}

function getLanguageFromFilename(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;

  const extToLang: Record<string, string> = {
    js: 'javascript',
    mjs: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    txt: 'text',
  };

  return extToLang[ext] || null;
}

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
        let content = csvToFullContent(result.data, result.headers);
        content = applyContentCap(content);
        return {
          success: true,
          content,
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
        let content = excelToFullContent(result.data.sheets, result.data.sheetData);
        content = applyContentCap(content);
        return { success: true, content };
      }
      return { success: false, error: result.error };
    }

    if (effectiveMimeType === 'application/pdf' || ext === 'pdf') {
      const result = await parsePDF(buffer);
      if (result.success && result.text) {
        let content = '';
        if (result.info) {
          if (result.info.title) content += `Title: ${result.info.title}\n`;
          if (result.info.author) content += `Author: ${result.info.author}\n`;
          if (result.info.pages) content += `Pages: ${result.info.pages}\n`;
          if (content) content += '\n';
        }
        content += result.text;
        content = applyContentCap(content);
        return {
          success: true,
          content,
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
        // Reuse language detection from codeToSummary
        const language =
          getLanguageFromMimeType(effectiveMimeType) || getLanguageFromFilename(filename);
        let content = `Code File: ${filename}\n`;
        if (language) content += `Language: ${language}\n`;
        content += '\n';
        content += '```' + (language || '') + '\n';
        content += textResult.text;
        content += '\n```';
        content = applyContentCap(content);
        return {
          success: true,
          content,
        };
      }

      let content = `File: ${filename}\n\n`;
      content += textResult.text;
      content = applyContentCap(content);
      return {
        success: true,
        content,
      };
    }

    return { success: false, error: textResult.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file';
    console.error('[FileParser] Error:', error);
    return { success: false, error: message };
  }
}
