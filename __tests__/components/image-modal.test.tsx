/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ImageModal } from '../../components/image-modal';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock UI components exactly like in api-key-manager.test.tsx
jest.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => <div className={className} data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children, className }: any) => <p className={className} data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children, className }: any) => <div className={className} data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children, className }: any) => <div className={className} data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className} data-testid="dialog-title">{children}</h2>,
  DialogOverlay: ({ className }: any) => <div className={className} data-testid="dialog-overlay" />,
  DialogPortal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-size={size}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Download: ({ className }: any) => <div className={className} data-testid="download-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
}));

// Mock utility functions
jest.mock('../../lib/image-utils', () => ({
  formatFileSize: (size: number) => `${(size / 1024).toFixed(1)} KB`,
}));

jest.mock('../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.join(' '),
}));

// Add missing mock for Radix Dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Content: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  Title: ({ children, asChild }: any) => 
    asChild ? children : <h3 data-testid="dialog-title">{children}</h3>,
  Close: ({ children, asChild }: any) => 
    asChild ? children : <button data-testid="dialog-close">{children}</button>,
}));

describe('ImageModal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    imageUrl: 'https://example.com/test-image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document methods for download functionality
    document.createElement = jest.fn().mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders modal when isOpen is true', () => {
      render(<ImageModal {...defaultProps} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false', () => {
      render(<ImageModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    test('renders image with correct src and alt attributes', () => {
      render(<ImageModal {...defaultProps} filename="test-image.jpg" />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'test-image.jpg');
    });

    test('displays filename in header when provided', () => {
      render(<ImageModal {...defaultProps} filename="custom-image.png" />);
      
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('custom-image.png');
    });

    test('displays metadata filename when filename prop is not provided', () => {
      const metadata = { filename: 'metadata-image.jpg' };
      render(<ImageModal {...defaultProps} metadata={metadata} />);
      
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('metadata-image.jpg');
    });

    test('displays default filename when neither filename nor metadata filename is provided', () => {
      render(<ImageModal {...defaultProps} />);
      
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Uploaded image');
    });

    test('displays file size when provided in metadata', () => {
      const metadata = { size: 2048, filename: 'test.jpg' };
      render(<ImageModal {...defaultProps} metadata={metadata} />);
      
      expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    });

    test('displays image dimensions when provided in metadata', () => {
      const metadata = { width: 800, height: 600, filename: 'test.jpg' };
      render(<ImageModal {...defaultProps} metadata={metadata} />);
      
      expect(screen.getByText(/800×600/)).toBeInTheDocument();
    });

    test('displays quality detail when provided and not auto', () => {
      const metadata = { filename: 'test.jpg' };
      render(<ImageModal {...defaultProps} metadata={metadata} detail="high" />);
      
      expect(screen.getByText(/high quality/)).toBeInTheDocument();
    });

    test('does not display quality detail when detail is auto', () => {
      const metadata = { filename: 'test.jpg' };
      render(<ImageModal {...defaultProps} metadata={metadata} detail="auto" />);
      
      expect(screen.queryByText(/auto quality/)).not.toBeInTheDocument();
    });

    test('displays complete metadata information', () => {
      const metadata = {
        filename: 'complete-test.jpg',
        size: 4096,
        width: 1200,
        height: 800
      };
      render(<ImageModal {...defaultProps} metadata={metadata} detail="high" />);
      
      expect(screen.getByText('4.0 KB')).toBeInTheDocument();
      expect(screen.getByText(/1200×800/)).toBeInTheDocument();
      expect(screen.getByText(/high quality/)).toBeInTheDocument();
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('calls onClose when dialog close button is clicked', () => {
      render(<ImageModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('button-ghost');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('handles download functionality when download button is clicked', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);

      render(<ImageModal {...defaultProps} filename="download-test.jpg" />);
      
      const downloadButton = screen.getByTestId('button-outline');
      fireEvent.click(downloadButton);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('https://example.com/test-image.jpg');
      expect(mockLink.download).toBe('download-test.jpg');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    test('uses metadata filename for download when filename prop is not provided', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);
      const metadata = { filename: 'metadata-download.png' };

      render(<ImageModal {...defaultProps} metadata={metadata} />);
      
      const downloadButton = screen.getByTestId('button-outline');
      fireEvent.click(downloadButton);
      
      expect(mockLink.download).toBe('metadata-download.png');
    });

    test('uses default filename for download when no filename is available', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);

      render(<ImageModal {...defaultProps} />);
      
      const downloadButton = screen.getByTestId('button-outline');
      fireEvent.click(downloadButton);
      
      expect(mockLink.download).toBe('image');
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('has proper ARIA attributes on dialog content', () => {
      render(<ImageModal {...defaultProps} filename="accessible-image.jpg" />);
      
      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveAttribute('aria-describedby', 'image-modal-description');
    });

    test('has proper aria-label on download button', () => {
      render(<ImageModal {...defaultProps} filename="download-image.jpg" />);
      
      const downloadButton = screen.getByTestId('button-outline');
      expect(downloadButton).toHaveAttribute('aria-label', 'Download download-image.jpg');
    });

    test('has proper aria-label on close button', () => {
      render(<ImageModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('button-ghost');
      expect(closeButton).toHaveAttribute('aria-label', 'Close image viewer');
    });

    test('image has proper alt text matching displayed filename', () => {
      render(<ImageModal {...defaultProps} filename="alt-text-test.jpg" />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'alt-text-test.jpg');
    });

    test('has proper title attribute for filename truncation', () => {
      const longFilename = 'very-long-filename-that-might-get-truncated-in-the-ui.jpg';
      render(<ImageModal {...defaultProps} filename={longFilename} />);
      
      const titleElement = screen.getByTestId('dialog-title');
      expect(titleElement).toHaveAttribute('title', longFilename);
    });
  });

  // Tests for Responsive Design and CSS Classes
  describe('Responsive Design and CSS Classes', () => {
    test('applies correct CSS classes to dialog content', () => {
      render(<ImageModal {...defaultProps} />);
      
      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveClass(
        'bg-background',
        'fixed',
        'top-[50%]',
        'left-[50%]',
        'z-50',
        'max-w-[95vw]',
        'max-h-[95vh]'
      );
    });

    test('applies correct CSS classes to image', () => {
      render(<ImageModal {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveClass(
        'max-w-full',
        'max-h-full',
        'object-contain',
        'rounded-lg',
        'border',
        'border-border',
        'shadow-lg'
      );
    });

    test('applies loading lazy attribute to image', () => {
      render(<ImageModal {...defaultProps} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  // Tests for Button Variants and Icons
  describe('Button Variants and Icons', () => {
    test('renders download button with correct variant and icon', () => {
      render(<ImageModal {...defaultProps} />);
      
      const downloadButton = screen.getByTestId('button-outline');
      expect(downloadButton).toHaveAttribute('data-variant', 'outline');
      expect(downloadButton).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    test('renders close button with correct variant and icon', () => {
      render(<ImageModal {...defaultProps} />);
      
      const closeButton = screen.getByTestId('button-ghost');
      expect(closeButton).toHaveAttribute('data-variant', 'ghost');
      expect(closeButton).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    test('hides download button text on small screens', () => {
      render(<ImageModal {...defaultProps} />);
      
      const downloadText = screen.getByText('Download');
      expect(downloadText).toHaveClass('hidden', 'sm:inline');
    });
  });

  // Tests for Error Handling
  describe('Error Handling', () => {
    test('handles missing imageUrl gracefully', () => {
      render(<ImageModal {...defaultProps} imageUrl="" />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '');
      expect(image).toBeInTheDocument();
    });

    test('handles undefined metadata gracefully', () => {
      render(<ImageModal {...defaultProps} metadata={undefined} />);
      
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Uploaded image');
      expect(screen.queryByText('KB')).not.toBeInTheDocument();
    });

    test('handles empty metadata object gracefully', () => {
      render(<ImageModal {...defaultProps} metadata={{}} />);
      
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Uploaded image');
      expect(screen.queryByText('KB')).not.toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete workflow: open modal, view image, download, and close', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);

      const metadata = {
        filename: 'workflow-test.jpg',
        size: 1024,
        width: 600,
        height: 400
      };

      render(
        <ImageModal 
          {...defaultProps} 
          filename="workflow-test.jpg"
          metadata={metadata}
          detail="high"
        />
      );

      // Verify modal renders with all information
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('workflow-test.jpg');
      expect(screen.getByText('1.0 KB')).toBeInTheDocument();
      expect(screen.getByText(/600×400/)).toBeInTheDocument();
      expect(screen.getByText(/high quality/)).toBeInTheDocument();

      // Verify image is displayed
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'workflow-test.jpg');

      // Test download functionality
      const downloadButton = screen.getByTestId('button-outline');
      fireEvent.click(downloadButton);

      expect(mockLink.href).toBe('https://example.com/test-image.jpg');
      expect(mockLink.download).toBe('workflow-test.jpg');
      expect(mockLink.click).toHaveBeenCalled();

      // Test close functionality
      const closeButton = screen.getByTestId('button-ghost');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('handles partial metadata display correctly', () => {
      const partialMetadata = {
        filename: 'partial-test.jpg',
        size: 2048,
        // Missing width and height
      };

      render(
        <ImageModal 
          {...defaultProps} 
          metadata={partialMetadata}
          detail="medium"
        />
      );

      // Should display available metadata
      expect(screen.getByText('2.0 KB')).toBeInTheDocument();
      expect(screen.getByText(/medium quality/)).toBeInTheDocument();
      
      // Should not display dimensions
      expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    });

    test('prioritizes filename prop over metadata filename', () => {
      const metadata = {
        filename: 'metadata-filename.jpg',
        size: 1024
      };

      render(
        <ImageModal 
          {...defaultProps} 
          filename="prop-filename.jpg"
          metadata={metadata}
        />
      );

      // Should use filename prop, not metadata filename
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('prop-filename.jpg');
      
      // But still display other metadata
      expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    });
  });
});