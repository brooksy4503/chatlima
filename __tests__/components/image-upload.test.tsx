/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload, ImageUploadStatus } from '../../components/image-upload';
import type { ImageAttachment } from '../../lib/types';
import { validateImageFile, processImageFile } from '../../lib/image-utils';

// Mock image-utils functions
jest.mock('../../lib/image-utils', () => ({
  validateImageFile: jest.fn(),
  processImageFile: jest.fn(),
}));

const mockValidateImageFile = validateImageFile as jest.MockedFunction<typeof validateImageFile>;
const mockProcessImageFile = processImageFile as jest.MockedFunction<typeof processImageFile>;

// Mock UI components
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, className, type = 'button', ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-size={size}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

jest.mock('../../components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-container" data-value={value}>
      <button onClick={() => onValueChange?.('high')} data-testid="select-button">
        {value}
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className, id }: any) => (
    <div className={className} id={id} data-testid="select-trigger">
      {children}
    </div>
  ),
  SelectValue: () => <span data-testid="select-value">Auto</span>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ImageIcon: ({ className }: any) => <div className={className} data-testid="image-icon" />,
  Upload: ({ className }: any) => <div className={className} data-testid="upload-icon" />,
  Loader2: ({ className }: any) => <div className={className} data-testid="loader-icon" />,
}));

describe('ImageUpload Component', () => {
  const mockOnImageSelect = jest.fn();
  
  // Test data
  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  const mockImageAttachment: ImageAttachment = {
    file: mockFile,
    dataUrl: 'data:image/jpeg;base64,testdata',
    metadata: {
      filename: 'test.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
      width: 100,
      height: 100,
    },
    detail: 'auto',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock behaviors
    mockValidateImageFile.mockReturnValue({ valid: true });
    mockProcessImageFile.mockResolvedValue({
      dataUrl: 'data:image/jpeg;base64,testdata',
      metadata: mockImageAttachment.metadata,
    });
    
    // Mock console methods to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders with default props', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      expect(screen.getByText('Image Detail:')).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByText('Click or drag images to upload')).toBeInTheDocument();
      expect(screen.getByText('Choose Images')).toBeInTheDocument();
    });

    test('renders without detail selector when showDetailSelector is false', () => {
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          showDetailSelector={false} 
        />
      );
      
      expect(screen.queryByText('Image Detail:')).not.toBeInTheDocument();
      expect(screen.queryByTestId('select-container')).not.toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          className="custom-class" 
        />
      );
      
      const container = screen.getByText('Image Detail:').closest('.space-y-3');
      expect(container).toHaveClass('custom-class');
    });

    test('renders with custom file limits', () => {
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          maxFiles={3}
          maxSizePerFile={10 * 1024 * 1024} // 10MB
        />
      );
      
      expect(screen.getByText(/Max 3 files • 10MB per file/)).toBeInTheDocument();
    });

    test('renders with custom accepted types', () => {
      const customTypes = ['image/jpeg', 'image/png'];
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          acceptedTypes={customTypes}
        />
      );
      
      const fileInput = screen.getByDisplayValue('');
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png');
    });

    test('renders disabled state correctly', () => {
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          disabled={true} 
        />
      );
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('.image-upload-area');
      expect(uploadArea).toHaveClass('opacity-50', 'cursor-not-allowed');
      
      const chooseButton = screen.getByRole('button', { name: /choose images/i });
      expect(chooseButton).toBeDisabled();
    });
  });

  // Tests for Detail Level Selector
  describe('Detail Level Selector', () => {
    test('renders detail selector with default value', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      expect(screen.getByTestId('select-container')).toHaveAttribute('data-value', 'auto');
    });

    test('renders detail selector with custom default value', () => {
      render(
        <ImageUpload 
          onImageSelect={mockOnImageSelect} 
          defaultDetail="high" 
        />
      );
      
      expect(screen.getByTestId('select-container')).toHaveAttribute('data-value', 'high');
    });

    test('updates detail level when selector changes', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton);
      
      // The mock select component changes value to 'high' when clicked
      expect(screen.getByTestId('select-container')).toHaveAttribute('data-value', 'high');
    });

    test('renders help text for detail levels', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      expect(screen.getByText('Image Detail Levels:')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return Boolean(element && element.textContent === '• Auto: AI chooses optimal quality (recommended)');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return Boolean(element && element.textContent === '• Low: Faster processing, good for simple images');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return Boolean(element && element.textContent === '• High: Detailed analysis, better for complex images');
      })).toBeInTheDocument();
    });
  });

  // Tests for File Input and Upload Area
  describe('File Input and Upload Area', () => {
    test('renders upload area with proper styling', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('.image-upload-area');
      expect(uploadArea).toHaveClass('image-upload-area');
    });

    test('renders file input with correct attributes', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('');
      
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('multiple');
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
      expect(fileInput).toHaveClass('hidden');
    });

    test('triggers file input when upload area is clicked', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      fireEvent.click(uploadArea!);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    test('triggers file input when choose button is clicked', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});
      
      const chooseButton = screen.getByRole('button', { name: /choose images/i });
      fireEvent.click(chooseButton);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    test('does not trigger file input when disabled', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} disabled={true} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      fireEvent.click(uploadArea!);
      
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  // Tests for Drag and Drop Functionality
  describe('Drag and Drop Functionality', () => {
    test('updates drag active state on dragenter', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      fireEvent.dragEnter(uploadArea!, {
        dataTransfer: { files: [mockFile] }
      });
      
      expect(screen.getByText('Drop images here')).toBeInTheDocument();
    });

    test('updates drag active state on dragover', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      fireEvent.dragOver(uploadArea!, {
        dataTransfer: { files: [mockFile] }
      });
      
      expect(screen.getByText('Drop images here')).toBeInTheDocument();
    });

    test('resets drag active state on dragleave', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      // First activate drag
      fireEvent.dragEnter(uploadArea!);
      expect(screen.getByText('Drop images here')).toBeInTheDocument();
      
      // Then leave
      fireEvent.dragLeave(uploadArea!);
      expect(screen.getByText('Click or drag images to upload')).toBeInTheDocument();
    });

    test('processes files on drop', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      fireEvent.drop(uploadArea!, {
        dataTransfer: { files: [mockFile] }
      });
      
      expect(mockValidateImageFile).toHaveBeenCalledWith(mockFile, {
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      await waitFor(() => {
        expect(mockProcessImageFile).toHaveBeenCalledWith(mockFile);
      });
    });

    test('does not process files when disabled', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} disabled={true} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      fireEvent.drop(uploadArea!, {
        dataTransfer: { files: [mockFile] }
      });
      
      expect(mockValidateImageFile).not.toHaveBeenCalled();
      expect(mockProcessImageFile).not.toHaveBeenCalled();
    });
  });

  // Tests for File Processing
  describe('File Processing', () => {
    test('processes valid files successfully', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            file: mockFile,
            dataUrl: 'data:image/jpeg;base64,testdata',
            metadata: mockImageAttachment.metadata,
            detail: 'auto'
          })
        ]);
      });
    });

    test('shows loading state during processing', async () => {
      // Make processImageFile take some time to resolve
      mockProcessImageFile.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          dataUrl: 'data:image/jpeg;base64,testdata',
          metadata: mockImageAttachment.metadata,
        }), 100))
      );
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      // Should show loading state
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Processing images...')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument(); // Button text
      
      // Wait for processing to complete
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalled();
      });
    });

    test('handles file validation errors', async () => {
      mockValidateImageFile.mockReturnValue({
        valid: false,
        error: 'File too large'
      });
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg: File too large')).toBeInTheDocument();
      });
      
      expect(mockProcessImageFile).not.toHaveBeenCalled();
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    test('handles file processing errors', async () => {
      mockProcessImageFile.mockRejectedValue(new Error('Processing failed'));
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg: Failed to process image')).toBeInTheDocument();
      });
      
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });

    test('limits files to maxFiles', async () => {
      const files = [
        new File(['1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} maxFiles={2} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files } });
      
      await waitFor(() => {
        expect(screen.getByText(/Maximum 2 images allowed/)).toBeInTheDocument();
      });
      
      // Should only process first 2 files
      expect(mockProcessImageFile).toHaveBeenCalledTimes(2);
    });

    test('resets file input value after processing', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalled();
      });
      
      expect(fileInput.value).toBe('');
    });

    test('uses selected detail level for processed images', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} defaultDetail="high" />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            detail: 'high'
          })
        ]);
      });
    });
  });

  // Tests for Error Handling
  describe('Error Handling', () => {
    test('displays multiple error messages', async () => {
      const files = [
        new File(['1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      mockValidateImageFile
        .mockReturnValueOnce({ valid: false, error: 'Error 1' })
        .mockReturnValueOnce({ valid: false, error: 'Error 2' });
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files } });
      
      await waitFor(() => {
        expect(screen.getByText('test1.jpg: Error 1')).toBeInTheDocument();
        expect(screen.getByText('test2.jpg: Error 2')).toBeInTheDocument();
      });
    });

    test('clears errors on new upload attempt', async () => {
      // First upload with error
      mockValidateImageFile.mockReturnValueOnce({ valid: false, error: 'Error' });
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg: Error')).toBeInTheDocument();
      });
      
      // Second upload without error
      mockValidateImageFile.mockReturnValue({ valid: true });
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.queryByText('test.jpg: Error')).not.toBeInTheDocument();
      });
    });

    test('handles mixed success and error scenarios', async () => {
      const files = [
        new File(['1'], 'good.jpg', { type: 'image/jpeg' }),
        new File(['2'], 'bad.jpg', { type: 'image/jpeg' }),
      ];
      
      mockValidateImageFile
        .mockReturnValueOnce({ valid: true })
        .mockReturnValueOnce({ valid: false, error: 'Invalid file' });
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files } });
      
      await waitFor(() => {
        expect(screen.getByText('bad.jpg: Invalid file')).toBeInTheDocument();
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            file: files[0]
          })
        ]);
      });
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('has proper label association for detail selector', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const label = screen.getByTestId('label-detail-selector');
      expect(label).toHaveAttribute('for', 'detail-selector');
      
      const selectTrigger = screen.getByTestId('select-trigger');
      expect(selectTrigger).toHaveAttribute('id', 'detail-selector');
    });

    test('file input is properly hidden but accessible', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      expect(fileInput).toHaveClass('hidden');
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    test('buttons are properly typed', () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const chooseButton = screen.getByRole('button', { name: /choose images/i });
      expect(chooseButton).toHaveAttribute('type', 'button');
    });

    test('provides appropriate feedback for screen readers', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      // Loading state provides feedback
      expect(screen.getByText('Processing images...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalled();
      });
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete workflow: drag, process, and callback', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const uploadArea = screen.getByText('Click or drag images to upload').closest('div');
      
      // Drag enter
      fireEvent.dragEnter(uploadArea!);
      expect(screen.getByText('Drop images here')).toBeInTheDocument();
      
      // Drop files
      fireEvent.drop(uploadArea!, {
        dataTransfer: { files: [mockFile] }
      });
      
      // Should show loading
      expect(screen.getByText('Processing images...')).toBeInTheDocument();
      
      // Should process and callback
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            file: mockFile,
            dataUrl: 'data:image/jpeg;base64,testdata',
            detail: 'auto'
          })
        ]);
      });
      
      // Should reset drag state
      expect(screen.getByText('Click or drag images to upload')).toBeInTheDocument();
    });

    test('complete workflow: file input, process, and callback', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const chooseButton = screen.getByRole('button', { name: /choose images/i });
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});
      
      // Click button to trigger file input
      fireEvent.click(chooseButton);
      expect(clickSpy).toHaveBeenCalled();
      
      // Simulate file selection
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      // Should process files
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            file: mockFile,
            dataUrl: 'data:image/jpeg;base64,testdata'
          })
        ]);
      });
      
      // Should reset input
      expect(fileInput.value).toBe('');
    });

    test('detail level change affects processed images', async () => {
      render(<ImageUpload onImageSelect={mockOnImageSelect} defaultDetail="low" />);
      
      // Verify initial detail level
      expect(screen.getByTestId('select-container')).toHaveAttribute('data-value', 'low');
      
      // Change detail level
      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton); // Mock changes to 'high'
      
      // Process file
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({
            detail: 'high'
          })
        ]);
      });
    });

    test('handles multiple files with mixed results', async () => {
      const files = [
        new File(['1'], 'good1.jpg', { type: 'image/jpeg' }),
        new File(['2'], 'good2.jpg', { type: 'image/jpeg' }),
        new File(['3'], 'bad.jpg', { type: 'image/jpeg' }),
      ];
      
      mockValidateImageFile
        .mockReturnValueOnce({ valid: true })
        .mockReturnValueOnce({ valid: true })
        .mockReturnValueOnce({ valid: false, error: 'Invalid' });
      
      render(<ImageUpload onImageSelect={mockOnImageSelect} />);
      
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
      
      fireEvent.change(fileInput, { target: { files } });
      
      await waitFor(() => {
        // Should show error for invalid file
        expect(screen.getByText('bad.jpg: Invalid')).toBeInTheDocument();
        
        // Should callback with valid files only
        expect(mockOnImageSelect).toHaveBeenCalledWith([
          expect.objectContaining({ file: files[0] }),
          expect.objectContaining({ file: files[1] })
        ]);
      });
    });
  });
});

describe('ImageUploadStatus Component', () => {
  test('shows loading state', () => {
    render(
      <ImageUploadStatus 
        isUploading={true} 
        imageCount={0} 
        errors={[]} 
      />
    );
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Processing images...')).toBeInTheDocument();
  });

  test('shows error state', () => {
    render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={0} 
        errors={['Error 1', 'Error 2']} 
      />
    );
    
    expect(screen.getByText('2 errors occurred')).toBeInTheDocument();
  });

  test('shows single error state', () => {
    render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={0} 
        errors={['Error 1']} 
      />
    );
    
    expect(screen.getByText('1 error occurred')).toBeInTheDocument();
  });

  test('shows success state with single image', () => {
    render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={1} 
        errors={[]} 
      />
    );
    
    expect(screen.getByText('1 image ready to send')).toBeInTheDocument();
  });

  test('shows success state with multiple images', () => {
    render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={3} 
        errors={[]} 
      />
    );
    
    expect(screen.getByText('3 images ready to send')).toBeInTheDocument();
  });

  test('shows nothing when no state applies', () => {
    const { container } = render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={0} 
        errors={[]} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('prioritizes loading state over other states', () => {
    render(
      <ImageUploadStatus 
        isUploading={true} 
        imageCount={2} 
        errors={['Error']} 
      />
    );
    
    expect(screen.getByText('Processing images...')).toBeInTheDocument();
    expect(screen.queryByText('1 error occurred')).not.toBeInTheDocument();
    expect(screen.queryByText('2 images ready to send')).not.toBeInTheDocument();
  });

  test('prioritizes errors over success state', () => {
    render(
      <ImageUploadStatus 
        isUploading={false} 
        imageCount={2} 
        errors={['Error']} 
      />
    );
    
    expect(screen.getByText('1 error occurred')).toBeInTheDocument();
    expect(screen.queryByText('2 images ready to send')).not.toBeInTheDocument();
  });
});