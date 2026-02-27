import {
  validateFile,
  validateFileType,
  generateUniqueFilename,
  getFileCategory,
  ALL_SUPPORTED_TYPES,
} from '../../lib/file-upload';

jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({
    url: 'https://blob.vercel-storage.com/test-file',
    downloadUrl: 'https://blob.vercel-storage.com/test-file',
  }),
}));

describe('upload-files API logic', () => {
  describe('file validation integration', () => {
    it('should validate files correctly', () => {
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      
      const result = validateFile(validFile);
      expect(result.valid).toBe(true);
    });

    it('should reject empty files', () => {
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
      Object.defineProperty(emptyFile, 'size', { value: 0 });
      
      const result = validateFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should validate file types correctly', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileType(pdfFile, ALL_SUPPORTED_TYPES);
      expect(result.valid).toBe(true);
      
      const unsupportedFile = new File(['content'], 'test.exe', { type: 'application/octet-stream' });
      const unsupportedResult = validateFileType(unsupportedFile, ALL_SUPPORTED_TYPES);
      expect(unsupportedResult.valid).toBe(false);
    });

    it('should categorize files correctly', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('application/pdf')).toBe('document');
      expect(getFileCategory('text/plain')).toBe('code');
      expect(getFileCategory('application/octet-stream')).toBe('other');
    });

    it('should generate unique filenames', () => {
      const filename = generateUniqueFilename('document.pdf');
      expect(filename).toMatch(/document-\d{14,15}\.pdf$/);
    });
  });

  describe('error handling', () => {
    it('should handle FormData without files', () => {
      const formData = new FormData();
      const files = formData.getAll('files');
      expect(files).toHaveLength(0);
    });

    it('should detect non-File entries in FormData', () => {
      const formData = new FormData();
      formData.append('files', 'not a file');
      formData.append('files', new File(['content'], 'actual.txt', { type: 'text/plain' }));
      
      const entries = formData.getAll('files');
      const fileCount = entries.filter(e => e instanceof File).length;
      const nonFileCount = entries.filter(e => !(e instanceof File)).length;
      
      expect(fileCount).toBe(1);
      expect(nonFileCount).toBe(1);
    });
  });

  describe('supported file types', () => {
    it('should support image types', () => {
      expect(ALL_SUPPORTED_TYPES).toContain('image/jpeg');
      expect(ALL_SUPPORTED_TYPES).toContain('image/png');
      expect(ALL_SUPPORTED_TYPES).toContain('image/webp');
    });

    it('should support document types', () => {
      expect(ALL_SUPPORTED_TYPES).toContain('application/pdf');
      expect(ALL_SUPPORTED_TYPES).toContain('text/csv');
    });

    it('should support code file types', () => {
      expect(ALL_SUPPORTED_TYPES).toContain('text/plain');
      expect(ALL_SUPPORTED_TYPES).toContain('application/json');
    });
  });
});
