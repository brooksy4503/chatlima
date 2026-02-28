import * as XLSX from 'xlsx';

export async function parseExcel(buffer: Buffer): Promise<{
  success: boolean;
  data?: {
    sheets: string[];
    sheetData: Record<string, Record<string, unknown>[]>;
    summary: string;
  };
  error?: string;
}> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { success: false, error: 'Excel file has no sheets' };
    }

    const sheets = workbook.SheetNames;
    const sheetData: Record<string, Record<string, unknown>[]> = {};

    for (const sheetName of sheets) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
        raw: false,
      });

      sheetData[sheetName] = jsonData;
    }

    const summary = generateExcelSummary(sheets, sheetData);

    return {
      success: true,
      data: {
        sheets,
        sheetData,
        summary,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse Excel file';
    console.error('[ExcelParser] Error:', error);
    return { success: false, error: message };
  }
}

export function excelToFullContent(
  sheets: string[],
  sheetData: Record<string, Record<string, unknown>[]>
): string {
  const parts: string[] = [];

  for (const sheetName of sheets) {
    const data = sheetData[sheetName];
    if (!data || data.length === 0) {
      parts.push(`## Sheet: "${sheetName}"\n(empty)\n`);
      continue;
    }

    const headers = Object.keys(data[0]);
    parts.push(`## Sheet: "${sheetName}"`);
    parts.push(`Rows: ${data.length}, Columns: ${headers.length}`);
    parts.push('');

    // Header row
    parts.push(headers.join('\t'));

    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Convert to string, handle null/undefined, and escape tabs/newlines
        const str = String(value ?? '');
        return str.replace(/\t/g, ' ').replace(/\n/g, ' ');
      });
      parts.push(values.join('\t'));
    }

    parts.push('');
  }

  return parts.join('\n');
}

function generateExcelSummary(
  sheets: string[],
  sheetData: Record<string, Record<string, unknown>[]>
): string {
  let summary = `Excel File Summary:\n`;
  summary += `- Total sheets: ${sheets.length}\n`;
  summary += `- Sheet names: ${sheets.join(', ')}\n\n`;

  for (const sheetName of sheets) {
    const data = sheetData[sheetName];
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      summary += `Sheet "${sheetName}":\n`;
      summary += `  - Rows: ${data.length}\n`;
      summary += `  - Columns (${headers.length}): ${headers.slice(0, 10).join(', ')}`;
      if (headers.length > 10) {
        summary += `... and ${headers.length - 10} more`;
      }
      summary += '\n';

      summary += `  - Sample data (first 3 rows):\n`;
      data.slice(0, 3).forEach((row, index) => {
        summary += `    Row ${index + 1}: `;
        const values = headers.slice(0, 5).map(h => `${h}=${row[h]}`);
        summary += values.join(', ');
        if (headers.length > 5) summary += '...';
        summary += '\n';
      });
      summary += '\n';
    }
  }

  return summary;
}
