import {
  validateFile,
  validateFileType,
  generateUniqueFilename,
  formatFileSize,
  getMimeTypeFromExtension,
  getFileCategory,
  isImageFile,
  isDocumentFile,
  isCodeFile,
  MAX_FILE_SIZE,
  ALL_SUPPORTED_TYPES,
  SUPPORTED_FILE_TYPES,
} from '../../lib/file-upload';

describe('file-upload utilities', () => {
  describe('constants', () => {
    it('should have correct max file size (30MB)', () => {
      expect(MAX_FILE_SIZE).toBe(31_457_280);
    });

    it('should have all supported types defined', () => {
      expect(ALL_SUPPORTED_TYPES).toContain('image/jpeg');
      expect(ALL_SUPPORTED_TYPES).toContain('image/png');
      expect(ALL_SUPPORTED_TYPES).toContain('application/pdf');
      expect(ALL_SUPPORTED_TYPES).toContain('text/csv');
      expect(ALL_SUPPORTED_TYPES).toContain('application/json');
    });

    it('should have correct image types', () => {
      expect(SUPPORTED_FILE_TYPES.images).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    });

    it('should have correct document types', () => {
      expect(SUPPORTED_FILE_TYPES.documents).toContain('application/pdf');
      expect(SUPPORTED_FILE_TYPES.documents).toContain('text/csv');
      expect(SUPPORTED_FILE_TYPES.documents).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('isImageFile', () => {
    it('should return true for image mime types', () => {
      expect(isImageFile('image/jpeg')).toBe(true);
      expect(isImageFile('image/png')).toBe(true);
      expect(isImageFile('image/webp')).toBe(true);
    });

    it('should return false for non-image mime types', () => {
      expect(isImageFile('application/pdf')).toBe(false);
      expect(isImageFile('text/plain')).toBe(false);
      expect(isImageFile('application/json')).toBe(false);
    });
  });

  describe('isDocumentFile', () => {
    it('should return true for document mime types', () => {
      expect(isDocumentFile('application/pdf')).toBe(true);
      expect(isDocumentFile('text/csv')).toBe(true);
      expect(isDocumentFile('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
    });

    it('should return false for non-document mime types', () => {
      expect(isDocumentFile('image/jpeg')).toBe(false);
      expect(isDocumentFile('text/plain')).toBe(false);
    });
  });

  describe('isCodeFile', () => {
    it('should return true for code mime types', () => {
      expect(isCodeFile('text/plain')).toBe(true);
      expect(isCodeFile('application/json')).toBe(true);
      expect(isCodeFile('application/javascript')).toBe(true);
      expect(isCodeFile('text/x-typescript')).toBe(true);
    });

    it('should return false for non-code mime types', () => {
      expect(isCodeFile('image/jpeg')).toBe(false);
      expect(isCodeFile('application/pdf')).toBe(false);
    });
  });

  describe('getFileCategory', () => {
    it('should return "image" for image types', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
    });

    it('should return "document" for document types', () => {
      expect(getFileCategory('application/pdf')).toBe('document');
      expect(getFileCategory('text/csv')).toBe('document');
    });

    it('should return "code" for code types', () => {
      expect(getFileCategory('text/plain')).toBe('code');
      expect(getFileCategory('application/json')).toBe('code');
    });

    it('should return "other" for unknown types', () => {
      expect(getFileCategory('application/octet-stream')).toBe('other');
      expect(getFileCategory('unknown/type')).toBe('other');
    });
  });

  describe('validateFile', () => {
    const createMockFile = (name: string, size: number): File => {
      const file = new File([''], name);
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should validate a valid file', () => {
      const file = createMockFile('test.pdf', 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject file with empty name', () => {
      const file = createMockFile('', 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must have a valid name');
    });

    it('should reject file with whitespace-only name', () => {
      const file = createMockFile('   ', 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must have a valid name');
    });

    it('should reject empty file', () => {
      const file = createMockFile('test.pdf', 0);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should reject file exceeding max size', () => {
      const file = createMockFile('test.pdf', MAX_FILE_SIZE + 1);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject file without extension', () => {
      const file = createMockFile('test.', 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must have an extension');
    });

    it('should accept file at max size boundary', () => {
      const file = createMockFile('test.pdf', MAX_FILE_SIZE);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should use custom max size when provided', () => {
      const customMaxSize = 1024;
      const file = createMockFile('test.pdf', 2048);
      const result = validateFile(file, customMaxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });
  });

  describe('validateFileType', () => {
    const createMockFile = (name: string, type: string): File => {
      return new File([''], name, { type });
    };

    it('should validate file with allowed mime type', () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should reject file with unsupported mime type', () => {
      const file = createMockFile('test.exe', 'application/octet-stream');
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should validate file by extension when mime type is not in list', () => {
      const file = createMockFile('test.pdf', 'application/octet-stream');
      const result = validateFileType(file, ['application/pdf']);
      expect(result.valid).toBe(true);
    });

    it('should use custom allowed types when provided', () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      const result = validateFileType(file, ['image/jpeg', 'image/png']);
      expect(result.valid).toBe(false);
    });

    it('should validate image types', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg');
      expect(validateFileType(jpegFile).valid).toBe(true);

      const pngFile = createMockFile('test.png', 'image/png');
      expect(validateFileType(pngFile).valid).toBe(true);
    });

    it('should validate code file types', () => {
      const jsonFile = createMockFile('test.json', 'application/json');
      expect(validateFileType(jsonFile).valid).toBe(true);

      const jsFile = createMockFile('test.js', 'application/javascript');
      expect(validateFileType(jsFile).valid).toBe(true);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate filename with timestamp', () => {
      const result = generateUniqueFilename('document.pdf');
      expect(result).toMatch(/document-\d{14,15}\.pdf$/);
    });

    it('should sanitize special characters', () => {
      const result = generateUniqueFilename('my file@name#.pdf');
      expect(result).not.toContain(' ');
      expect(result).not.toContain('@');
      expect(result).not.toContain('#');
    });

    it('should replace multiple underscores with single', () => {
      const result = generateUniqueFilename('my__file.pdf');
      expect(result).not.toContain('__');
    });

    it('should truncate long base names to 50 characters', () => {
      const longName = 'a'.repeat(100);
      const result = generateUniqueFilename(`${longName}.pdf`);
      const baseName = result.split('-')[0];
      expect(baseName.length).toBeLessThanOrEqual(50);
    });

    it('should handle files without extension', () => {
      const result = generateUniqueFilename('noextension');
      expect(result).toMatch(/noextension-\d+$/);
    });

    it('should preserve extension', () => {
      const result = generateUniqueFilename('document.PDF');
      expect(result.endsWith('.PDF')).toBe(true);
    });

    it('should handle multiple dots in filename', () => {
      const result = generateUniqueFilename('my.file.name.pdf');
      expect(result.endsWith('.pdf')).toBe(true);
      expect(result).toMatch(/my_file_name-\d+\.pdf$/);
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should round to 2 decimal places', () => {
      const result = formatFileSize(1234567);
      expect(result).toMatch(/^\d+\.\d{2} MB$/);
    });
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return correct mime type for common extensions', () => {
      expect(getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('jpeg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('png')).toBe('image/png');
      expect(getMimeTypeFromExtension('pdf')).toBe('application/pdf');
      expect(getMimeTypeFromExtension('csv')).toBe('text/csv');
      expect(getMimeTypeFromExtension('json')).toBe('application/json');
    });

    it('should handle extensions with dots', () => {
      expect(getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('.pdf')).toBe('application/pdf');
    });

    it('should be case-insensitive', () => {
      expect(getMimeTypeFromExtension('JPG')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('PDF')).toBe('application/pdf');
      expect(getMimeTypeFromExtension('JSON')).toBe('application/json');
    });

    it('should return null for unknown extensions', () => {
      expect(getMimeTypeFromExtension('xyz')).toBeNull();
      expect(getMimeTypeFromExtension('unknown')).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(getMimeTypeFromExtension(undefined)).toBeNull();
    });

    it('should return correct mime type for code files', () => {
      expect(getMimeTypeFromExtension('js')).toBe('application/javascript');
      expect(getMimeTypeFromExtension('ts')).toBe('text/x-typescript');
      expect(getMimeTypeFromExtension('py')).toBe('text/x-python');
      expect(getMimeTypeFromExtension('html')).toBe('text/html');
      expect(getMimeTypeFromExtension('css')).toBe('text/css');
    });

    it('should return correct mime type for spreadsheet files', () => {
      expect(getMimeTypeFromExtension('xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(getMimeTypeFromExtension('xls')).toBe('application/vnd.ms-excel');
    });

    it('should return correct mime type for yaml files', () => {
      expect(getMimeTypeFromExtension('yaml')).toBe('text/yaml');
      expect(getMimeTypeFromExtension('yml')).toBe('text/x-yaml');
    });
  });
});
