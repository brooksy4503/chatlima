/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview, ImagePreviewLoading, ImagePreviewError } from '../../components/image-preview';
import type { ImageAttachment } from '../../lib/types';

// Mock formatFileSize utility
jest.mock('../../lib/image-utils', () => ({
  formatFileSize: jest.fn((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }),
}));

// Mock UI components
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, 'aria-label': ariaLabel, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
}));

describe('ImagePreview', () => {
  const createMockImage = (overrides: Partial<ImageAttachment> = {}): ImageAttachment => ({
    dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ',
    metadata: {
      filename: 'test-image.jpg',
      size: 1024000, // 1MB
      mimeType: 'image/jpeg',
      width: 800,
      height: 600,
    },
    detail: 'auto',
    ...overrides,
  });

  const mockOnRemove = jest.fn();
  const mockOnReorder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders nothing when images array is empty', () => {
      const { container } = render(
        <ImagePreview images={[]} onRemove={mockOnRemove} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('renders single image with default props', () => {
      const images = [createMockImage()];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByAltText('test-image.jpg')).toBeInTheDocument();
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      expect(screen.getByText('1000 KB • 800×600')).toBeInTheDocument();
    });

    test('renders multiple images', () => {
      const images = [
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'image1.jpg' } }),
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'image2.png' } }),
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'image3.webp' } }),
      ];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByAltText('image1.jpg')).toBeInTheDocument();
      expect(screen.getByAltText('image2.png')).toBeInTheDocument();
      expect(screen.getByAltText('image3.webp')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const images = [createMockImage()];
      
      const { container } = render(
        <ImagePreview 
          images={images} 
          onRemove={mockOnRemove} 
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('image-preview-grid', 'custom-class');
    });

    test('applies custom maxWidth and maxHeight styles', () => {
      const images = [createMockImage()];
      
      render(
        <ImagePreview 
          images={images} 
          onRemove={mockOnRemove} 
          maxWidth={150}
          maxHeight={150}
        />
      );
      
      const img = screen.getByAltText('test-image.jpg');
      expect(img).toHaveStyle({
        maxWidth: '150px',
        maxHeight: '150px',
      });
    });
  });

  // Tests for Image Display and Metadata
  describe('Image Display and Metadata', () => {
    test('displays image with correct src and alt attributes', () => {
      const images = [createMockImage({
        dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        metadata: {
          filename: 'pixel.png',
          size: 100,
          mimeType: 'image/png',
          width: 1,
          height: 1,
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const img = screen.getByAltText('pixel.png');
      expect(img).toHaveAttribute('src', images[0].dataUrl);
      expect(img).toHaveClass('w-full', 'h-auto', 'rounded', 'border', 'border-border', 'object-cover');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    test('displays filename with truncation and title attribute', () => {
      const images = [createMockImage({
        metadata: {
          ...createMockImage().metadata,
          filename: 'very-long-filename-that-should-be-truncated.jpg'
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const filenameElement = screen.getByText('very-long-filename-that-should-be-truncated.jpg');
      expect(filenameElement).toHaveAttribute('title', 'very-long-filename-that-should-be-truncated.jpg');
      expect(filenameElement).toHaveClass('truncate');
    });

    test('displays file size and dimensions correctly', () => {
      const images = [createMockImage({
        metadata: {
          filename: 'test.jpg',
          size: 2048000, // 2MB
          mimeType: 'image/jpeg',
          width: 1920,
          height: 1080,
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      // Use more flexible text matching since the text might be split across elements
      expect(screen.getByText(/1\.95 MB/)).toBeInTheDocument();
      expect(screen.getByText(/1920×1080/)).toBeInTheDocument();
    });

    test('displays only file size when dimensions are zero', () => {
      const images = [createMockImage({
        metadata: {
          filename: 'test.jpg',
          size: 500000,
          mimeType: 'image/jpeg',
          width: 0,
          height: 0,
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('488.28 KB')).toBeInTheDocument();
      expect(screen.queryByText('•')).not.toBeInTheDocument();
    });

    test('displays only file size when dimensions are negative', () => {
      const images = [createMockImage({
        metadata: {
          filename: 'test.jpg',
          size: 750000,
          mimeType: 'image/jpeg',
          width: -1,
          height: -1,
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('732.42 KB')).toBeInTheDocument();
      expect(screen.queryByText('•')).not.toBeInTheDocument();
    });
  });

  // Tests for Detail Level Indicator
  describe('Detail Level Indicator', () => {
    test('shows detail indicator when detail is "low"', () => {
      const images = [createMockImage({ detail: 'low' })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('low')).toHaveClass(
        'absolute', 'bottom-1', 'left-1', 'px-1.5', 'py-0.5', 
        'bg-background/80', 'border', 'border-border', 'rounded', 'text-xs'
      );
    });

    test('shows detail indicator when detail is "high"', () => {
      const images = [createMockImage({ detail: 'high' })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    test('does not show detail indicator when detail is "auto"', () => {
      const images = [createMockImage({ detail: 'auto' })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.queryByText('auto')).not.toBeInTheDocument();
    });

    test('does not show detail indicator when detail is undefined', () => {
      const images = [createMockImage({ detail: undefined })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const detailIndicators = screen.queryByText(/^(low|high|auto)$/);
      expect(detailIndicators).not.toBeInTheDocument();
    });
  });

  // Tests for Remove Button Functionality
  describe('Remove Button Functionality', () => {
    test('renders remove button with correct aria-label', () => {
      const images = [createMockImage()];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const removeButton = screen.getByLabelText('Remove test-image.jpg');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveClass('image-preview-remove');
      expect(removeButton).toHaveAttribute('data-variant', 'destructive');
      expect(removeButton).toHaveAttribute('data-size', 'sm');
    });

    test('calls onRemove with correct index when remove button is clicked', () => {
      const images = [
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'image1.jpg' } }),
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'image2.jpg' } }),
      ];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const firstRemoveButton = screen.getByLabelText('Remove image1.jpg');
      const secondRemoveButton = screen.getByLabelText('Remove image2.jpg');
      
      fireEvent.click(firstRemoveButton);
      expect(mockOnRemove).toHaveBeenCalledWith(0);
      
      fireEvent.click(secondRemoveButton);
      expect(mockOnRemove).toHaveBeenCalledWith(1);
      
      expect(mockOnRemove).toHaveBeenCalledTimes(2);
    });

    test('remove button contains X icon', () => {
      const images = [createMockImage()];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const removeButton = screen.getByLabelText('Remove test-image.jpg');
      expect(removeButton.querySelector('[data-testid="x-icon"]')).toBeInTheDocument();
    });
  });

  // Tests for Edge Cases and Error Handling
  describe('Edge Cases and Error Handling', () => {
    test('handles images with special characters in filename', () => {
      const images = [createMockImage({
        metadata: {
          ...createMockImage().metadata,
          filename: 'image with spaces & special-chars (1).jpg'
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByAltText('image with spaces & special-chars (1).jpg')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove image with spaces & special-chars (1).jpg')).toBeInTheDocument();
    });

    test('handles very large file sizes', () => {
      const images = [createMockImage({
        metadata: {
          ...createMockImage().metadata,
          size: 1073741824 // 1GB
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('1 GB • 800×600')).toBeInTheDocument();
    });

    test('handles zero file size', () => {
      const images = [createMockImage({
        metadata: {
          ...createMockImage().metadata,
          size: 0
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByText('0 Bytes • 800×600')).toBeInTheDocument();
    });

    test('handles empty filename', () => {
      const images = [createMockImage({
        metadata: {
          ...createMockImage().metadata,
          filename: ''
        }
      })];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByAltText('')).toBeInTheDocument();
      // The aria-label will be "Remove " (with trailing space)
      expect(screen.getByRole('button', { name: /Remove\s*$/ })).toBeInTheDocument();
    });

    test('generates correct keys for images with same filename', () => {
      const images = [
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'duplicate.jpg' } }),
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'duplicate.jpg' } }),
      ];
      
      const { container } = render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const imageItems = container.querySelectorAll('.image-preview-item');
      expect(imageItems).toHaveLength(2);
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('remove buttons are keyboard accessible', () => {
      const images = [createMockImage()];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const removeButton = screen.getByLabelText('Remove test-image.jpg');
      
      // Button should be focusable
      removeButton.focus();
      expect(document.activeElement).toBe(removeButton);
      
      // Should be clickable via keyboard
      fireEvent.keyDown(removeButton, { key: 'Enter' });
      // Note: Button onClick should be triggered by Enter key in real browser
    });

    test('images have proper alt text for screen readers', () => {
      const images = [
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'screenshot.png' } }),
        createMockImage({ metadata: { ...createMockImage().metadata, filename: 'photo.jpg' } }),
      ];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      expect(screen.getByAltText('screenshot.png')).toBeInTheDocument();
      expect(screen.getByAltText('photo.jpg')).toBeInTheDocument();
    });

    test('file info is properly structured for screen readers', () => {
      const images = [createMockImage()];
      
      render(<ImagePreview images={images} onRemove={mockOnRemove} />);
      
      const filenameElement = screen.getByText('test-image.jpg');
      const sizeElement = screen.getByText('1000 KB • 800×600');
      
      expect(filenameElement).toHaveClass('text-xs', 'font-medium');
      expect(sizeElement).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });
});

describe('ImagePreviewLoading', () => {
  test('renders single loading placeholder by default', () => {
    const { container } = render(<ImagePreviewLoading />);
    
    expect(container.firstChild).toHaveClass('image-preview-grid');
    
    const loadingItems = container.querySelectorAll('.image-preview-item');
    expect(loadingItems).toHaveLength(1);
    
    const animatedElement = container.querySelector('.animate-pulse');
    expect(animatedElement).toBeInTheDocument();
  });

  test('renders multiple loading placeholders when count is specified', () => {
    const { container } = render(<ImagePreviewLoading count={3} />);
    
    const loadingItems = container.querySelectorAll('.image-preview-item');
    expect(loadingItems).toHaveLength(3);
  });

  test('applies correct CSS classes for loading animation', () => {
    const { container } = render(<ImagePreviewLoading />);
    
    expect(container.firstChild).toHaveClass('image-preview-grid');
    
    const animatedElement = container.querySelector('.animate-pulse');
    expect(animatedElement).toBeInTheDocument();
  });

  test('renders loading placeholders with correct structure', () => {
    const { container } = render(<ImagePreviewLoading count={2} />);
    
    const loadingItems = container.querySelectorAll('.image-preview-item');
    expect(loadingItems).toHaveLength(2);
    
    // Check for skeleton elements
    const imageSkeletons = container.querySelectorAll('.w-full.h-24.bg-muted.rounded.border.border-border');
    const textSkeletons = container.querySelectorAll('.h-3.bg-muted.rounded, .h-2.bg-muted.rounded');
    
    expect(imageSkeletons).toHaveLength(2);
    expect(textSkeletons.length).toBeGreaterThan(0);
  });
});

describe('ImagePreviewError', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error message', () => {
    render(<ImagePreviewError error="Failed to load image" />);
    
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  test('applies correct error styling', () => {
    const { container } = render(<ImagePreviewError error="Test error" />);
    
    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass(
      'p-3', 'border', 'border-destructive/20', 'bg-destructive/5', 'rounded-md'
    );
    
    const errorText = screen.getByText('Test error');
    expect(errorText).toHaveClass('text-sm', 'text-destructive');
  });

  test('renders retry button when onRetry is provided', () => {
    render(<ImagePreviewError error="Network error" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('data-variant', 'outline');
    expect(retryButton).toHaveAttribute('data-size', 'sm');
  });

  test('does not render retry button when onRetry is not provided', () => {
    render(<ImagePreviewError error="Permanent error" />);
    
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    render(<ImagePreviewError error="Temporary error" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  test('handles long error messages', () => {
    const longError = 'This is a very long error message that should be displayed properly without breaking the layout or causing any visual issues in the error component.';
    
    render(<ImagePreviewError error={longError} onRetry={mockOnRetry} />);
    
    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  test('error component is keyboard accessible', () => {
    render(<ImagePreviewError error="Test error" onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    
    retryButton.focus();
    expect(document.activeElement).toBe(retryButton);
  });
});