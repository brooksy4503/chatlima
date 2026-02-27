export function parseText(buffer: Buffer): {
  success: boolean;
  text?: string;
  error?: string;
} {
  try {
    const text = buffer.toString('utf-8');

    return {
      success: true,
      text,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse text file';
    console.error('[TextParser] Error:', error);
    return { success: false, error: message };
  }
}

export function textToSummary(text: string, filename: string): string {
  const lines = text.split('\n');
  const lineCount = lines.length;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  let summary = `File Summary: ${filename}\n`;
  summary += `- Characters: ${charCount.toLocaleString()}\n`;
  summary += `- Words: ${wordCount.toLocaleString()}\n`;
  summary += `- Lines: ${lineCount.toLocaleString()}\n\n`;

  const maxPreviewLength = 10000;
  if (text.length > maxPreviewLength) {
    summary += 'Content Preview:\n';
    summary += text.substring(0, maxPreviewLength) + '...\n';
    summary += `\n[Content truncated. Total length: ${text.length} characters]`;
  } else {
    summary += 'Full Content:\n';
    summary += text;
  }

  return summary;
}

export function codeToSummary(code: string, filename: string, mimeType?: string): string {
  const lines = code.split('\n');
  const lineCount = lines.length;
  const charCount = code.length;

  const language = getLanguageFromMimeType(mimeType) || getLanguageFromFilename(filename);

  let summary = `Code File: ${filename}\n`;
  if (language) summary += `Language: ${language}\n`;
  summary += `- Lines: ${lineCount.toLocaleString()}\n`;
  summary += `- Characters: ${charCount.toLocaleString()}\n\n`;

  const maxPreviewLength = 15000;
  if (code.length > maxPreviewLength) {
    summary += `Code Preview (first ${maxPreviewLength} characters):\n\`\`\`${language || ''}\n`;
    summary += code.substring(0, maxPreviewLength) + '\n...\n```';
    summary += `\n\n[Code truncated. Total length: ${code.length} characters]`;
  } else {
    summary += `Full Code:\n\`\`\`${language || ''}\n`;
    summary += code;
    summary += '\n```';
  }

  return summary;
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
