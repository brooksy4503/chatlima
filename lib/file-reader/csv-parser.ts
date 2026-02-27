export async function parseCSV(buffer: Buffer): Promise<{
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
  rowCount?: number;
  headers?: string[];
}> {
  try {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());

    if (lines.length === 0) {
      return { success: false, error: 'CSV file is empty' };
    }

    const delimiter = detectCSVDelimiter(lines[0]);
    const headers = parseCSVLine(lines[0], delimiter);

    if (headers.length === 0) {
      return { success: false, error: 'No headers found in CSV' };
    }

    const data: Record<string, unknown>[] = [];
    const maxRows = 10000;

    for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
      const values = parseCSVLine(lines[i], delimiter);
      if (values.length > 0) {
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ?? '';
        });
        data.push(row);
      }
    }

    return {
      success: true,
      data,
      rowCount: data.length,
      headers,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse CSV';
    console.error('[CSVParser] Error:', error);
    return { success: false, error: message };
  }
}

function detectCSVDelimiter(line: string): string {
  const delimiters = [',', ';', '\t', '|'];
  let maxCount = 0;
  let bestDelimiter = ',';

  for (const delimiter of delimiters) {
    const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

export function csvToSummary(data: Record<string, unknown>[], headers: string[]): string {
  if (data.length === 0) {
    return 'CSV file is empty';
  }

  let summary = `CSV Summary:\n`;
  summary += `- Total rows: ${data.length}\n`;
  summary += `- Columns (${headers.length}): ${headers.join(', ')}\n\n`;
  summary += `First 5 rows:\n`;

  data.slice(0, 5).forEach((row, index) => {
    summary += `\nRow ${index + 1}:\n`;
    headers.forEach(header => {
      const value = row[header];
      const displayValue = typeof value === 'string' && value.length > 100 
        ? value.substring(0, 100) + '...' 
        : String(value);
      summary += `  ${header}: ${displayValue}\n`;
    });
  });

  if (data.length > 5) {
    summary += `\n... and ${data.length - 5} more rows`;
  }

  return summary;
}
