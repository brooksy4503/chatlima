import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload, FileUploadStatus, getFileIcon } from '../../components/file-upload';
import type { FileAttachment } from '@/lib/types';

jest.mock('../../lib/image-utils', () => ({
  processImageFile: jest.fn().mockResolvedValue({
    dataUrl: 'data:image/png;base64,test',
    metadata: {
      width: 100,
      height: 100,
      originalWidth: 100,
      originalHeight: 100,
      originalSize: 1024,
      compressedSize: 512,
    },
  }),
  validateImageFile: jest.fn().mockReturnValue({ valid: true }),
}));

jest.mock('../../lib/file-upload', () => ({
  getFileCategory: jest.fn((mimeType: string) => {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType?.includes('pdf') || mimeType?.includes('csv') || mimeType?.includes('excel')) return 'document';
    if (mimeType?.includes('text/') || mimeType?.includes('json')) return 'code';
    return 'other';
  }),
  ALL_SUPPORTED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/json',
  ],
  MAX_FILE_SIZE: 31457280,
  formatFileSize: jest.fn((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }),
}));

describe('FileUpload Component', () => {
  const mockOnFileSelect = jest.fn();
  const defaultProps = {
    onFileSelect: mockOnFileSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render upload area', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Click or drag files to upload')).toBeInTheDocument();
    });

    it('should render choose files button', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Choose Files')).toBeInTheDocument();
    });

    it('should render supported file types info', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText(/Images \(JPEG, PNG, WebP\)/)).toBeInTheDocument();
      expect(screen.getByText(/Documents \(PDF, CSV, Excel\)/)).toBeInTheDocument();
    });

    it('should render max files and size info', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText(/Max 5 files/)).toBeInTheDocument();
      expect(screen.getByText(/30MB per file/)).toBeInTheDocument();
    });

    it('should render detail selector by default', () => {
      render(<FileUpload {...defaultProps} />);
      expect(screen.getByText('Image Detail:')).toBeInTheDocument();
    });

    it('should not render detail selector when showDetailSelector is false', () => {
      render(<FileUpload {...defaultProps} showDetailSelector={false} />);
      expect(screen.queryByText('Image Detail:')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable upload when disabled prop is true', () => {
      render(<FileUpload {...defaultProps} disabled />);
      const uploadArea = document.querySelector('.image-upload-area');
      expect(uploadArea).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should disable button when disabled', () => {
      render(<FileUpload {...defaultProps} disabled />);
      const button = screen.getByText('Choose Files').closest('button');
      expect(button).toBeDisabled();
    });
  });

  describe('file selection via button', () => {
    it('should trigger file input when button is clicked', () => {
      render(<FileUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]');
      const clickSpy = jest.spyOn(fileInput as HTMLInputElement, 'click');
      
      const button = screen.getByText('Choose Files').closest('button') as HTMLButtonElement;
      fireEvent.click(button);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should process files when selected via input', async () => {
      render(<FileUpload {...defaultProps} />);
      
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled();
      });
    });
  });

  describe('drag and drop', () => {
    it('should show drop state on drag enter', () => {
      render(<FileUpload {...defaultProps} />);
      
      const uploadArea = document.querySelector('.image-upload-area');
      fireEvent.dragEnter(uploadArea as Element);
      
      expect(uploadArea).toHaveClass('border-primary');
    });

    it('should remove drop state on drag leave', () => {
      render(<FileUpload {...defaultProps} />);
      
      const uploadArea = document.querySelector('.image-upload-area');
      fireEvent.dragEnter(uploadArea as Element);
      fireEvent.dragLeave(uploadArea as Element);
      
      expect(uploadArea).not.toHaveClass('border-primary');
    });

    it('should process files on drop', async () => {
      render(<FileUpload {...defaultProps} />);
      
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const uploadArea = document.querySelector('.image-upload-area');
      
      fireEvent.drop(uploadArea as Element, {
        dataTransfer: { files: [file] },
      });
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled();
      });
    });

    it('should not process files when disabled on drop', async () => {
      render(<FileUpload {...defaultProps} disabled />);
      
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const uploadArea = document.querySelector('.image-upload-area');
      
      fireEvent.drop(uploadArea as Element, {
        dataTransfer: { files: [file] },
      });
      
      await waitFor(() => {
        expect(mockOnFileSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe('file validation', () => {
    it('should reject empty files', async () => {
      render(<FileUpload {...defaultProps} />);
      
      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 0 });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/File is empty/)).toBeInTheDocument();
      });
    });

    it('should reject files exceeding max size', async () => {
      render(<FileUpload {...defaultProps} maxSizePerFile={1024} />);
      
      const file = new File(['x'.repeat(2000)], 'large.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 2000 });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/exceeds maximum/)).toBeInTheDocument();
      });
    });

    it('should limit number of files', async () => {
      render(<FileUpload {...defaultProps} maxFiles={2} />);
      
      const files = [
        new File(['1'], 'file1.txt', { type: 'text/plain' }),
        new File(['2'], 'file2.txt', { type: 'text/plain' }),
        new File(['3'], 'file3.txt', { type: 'text/plain' }),
      ];
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files } });
      
      await waitFor(() => {
        expect(screen.getByText(/Maximum 2 files allowed/)).toBeInTheDocument();
      });
    });
  });

  describe('image processing', () => {
    it('should process image files with detail level', async () => {
      render(<FileUpload {...defaultProps} defaultDetail="high" />);
      
      const file = new File(['image content'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'image',
              detail: 'high',
            }),
          ])
        );
      });
    });
  });

  describe('upload status', () => {
    it('should call onFileSelect with processed files', async () => {
      render(<FileUpload {...defaultProps} />);
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalled();
      });
    });
  });

  describe('custom props', () => {
    it('should use custom max files', () => {
      render(<FileUpload {...defaultProps} maxFiles={10} />);
      expect(screen.getByText(/Max 10 files/)).toBeInTheDocument();
    });

    it('should use custom max size', () => {
      render(<FileUpload {...defaultProps} maxSizePerFile={5242880} />);
      expect(screen.getByText(/5MB per file/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<FileUpload {...defaultProps} className="custom-class" />);
      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('FileUploadStatus Component', () => {
  it('should show processing state', () => {
    render(<FileUploadStatus isUploading={true} fileCount={0} errors={[]} />);
    expect(screen.getByText('Processing files...')).toBeInTheDocument();
  });

  it('should show error count', () => {
    render(<FileUploadStatus isUploading={false} fileCount={0} errors={['error1', 'error2']} />);
    expect(screen.getByText('2 errors occurred')).toBeInTheDocument();
  });

  it('should show singular error', () => {
    render(<FileUploadStatus isUploading={false} fileCount={0} errors={['error1']} />);
    expect(screen.getByText('1 error occurred')).toBeInTheDocument();
  });

  it('should show file count when complete', () => {
    render(<FileUploadStatus isUploading={false} fileCount={3} errors={[]} />);
    expect(screen.getByText('3 files ready to send')).toBeInTheDocument();
  });

  it('should show singular file count', () => {
    render(<FileUploadStatus isUploading={false} fileCount={1} errors={[]} />);
    expect(screen.getByText('1 file ready to send')).toBeInTheDocument();
  });

  it('should return null when no state', () => {
    const { container } = render(<FileUploadStatus isUploading={false} fileCount={0} errors={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('getFileIcon', () => {
  it('should return ImageIcon for image type', () => {
    const Icon = getFileIcon('image');
    expect(Icon).toBeTruthy();
  });

  it('should return FileSpreadsheet for spreadsheet documents', () => {
    const Icon = getFileIcon('document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(Icon).toBeTruthy();
  });

  it('should return FileSpreadsheet for CSV', () => {
    const Icon = getFileIcon('document', 'text/csv');
    expect(Icon).toBeTruthy();
  });

  it('should return FileText for PDF documents', () => {
    const Icon = getFileIcon('document', 'application/pdf');
    expect(Icon).toBeTruthy();
  });

  it('should return FileCode for code type', () => {
    const Icon = getFileIcon('code');
    expect(Icon).toBeTruthy();
  });

  it('should return File for other types', () => {
    const Icon = getFileIcon('other');
    expect(Icon).toBeTruthy();
  });
});
