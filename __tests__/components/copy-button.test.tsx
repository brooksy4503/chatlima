/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from '../../components/copy-button';

// Mock the useCopy hook
const mockCopy = jest.fn();
const mockCopied = jest.fn();

jest.mock('../../lib/hooks/use-copy', () => ({
  useCopy: () => ({
    copied: mockCopied(),
    copy: mockCopy,
  }),
}));

// Mock the Button component
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, title, ...props }: any) => (
    <button 
      type="button"
      onClick={onClick} 
      className={className}
      title={title}
      data-variant={variant}
      data-size={size}
      data-testid="copy-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CheckIcon: ({ className }: any) => (
    <div data-testid="check-icon" className={className}>✓</div>
  ),
  CopyIcon: ({ className }: any) => (
    <div data-testid="copy-icon" className={className}>📋</div>
  ),
}));

// Mock the cn utility
jest.mock('../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('CopyButton Component', () => {
  const defaultProps = {
    text: 'Hello, World!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCopied.mockReturnValue(false);
    mockCopy.mockImplementation(() => Promise.resolve(true));
  });

  describe('Basic Rendering and Props', () => {
    test('renders copy button with default state', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Copy to clipboard');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    test('renders with copy icon and text when not copied', () => {
      render(<CopyButton {...defaultProps} />);
      
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });

    test('renders with check icon and text when copied', () => {
      mockCopied.mockReturnValue(true);
      
      render(<CopyButton {...defaultProps} />);
      
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      expect(screen.queryByTestId('copy-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    });

    test('applies custom className when provided', () => {
      const customClass = 'custom-copy-button';
      render(<CopyButton {...defaultProps} className={customClass} />);
      
      const button = screen.getByTestId('copy-button');
      expect(button).toHaveClass(customClass);
    });

    test('applies default CSS classes for responsive behavior', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      const expectedClasses = [
        'transition-opacity',
        'opacity-0',
        'group-hover/message:opacity-100',
        'gap-1.5',
        'sm:opacity-0',
        'sm:group-hover/message:opacity-100',
        'opacity-100'
      ];
      
      expectedClasses.forEach(className => {
        expect(button).toHaveClass(className);
      });
    });
  });

  describe('User Interactions', () => {
    test('calls copy function with correct text when clicked', () => {
      const testText = 'Test content to copy';
      render(<CopyButton text={testText} />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledTimes(1);
      expect(mockCopy).toHaveBeenCalledWith(testText);
    });

    test('handles multiple clicks correctly', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledTimes(3);
      expect(mockCopy).toHaveBeenCalledWith(defaultProps.text);
    });

    test('works with empty text', () => {
      render(<CopyButton text="" />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledWith('');
    });

    test('works with multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<CopyButton text={multilineText} />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledWith(multilineText);
    });

    test('works with special characters', () => {
      const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./ 🚀 emoji';
      render(<CopyButton text={specialText} />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledWith(specialText);
    });
  });

  describe('State Management', () => {
    test('displays correct state based on copied prop', () => {
      const { rerender } = render(<CopyButton {...defaultProps} />);
      
      // Initial state - not copied
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      
      // Change to copied state
      mockCopied.mockReturnValue(true);
      rerender(<CopyButton {...defaultProps} />);
      
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      
      // Change back to not copied
      mockCopied.mockReturnValue(false);
      rerender(<CopyButton {...defaultProps} />);
      
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    test('updates text prop correctly', () => {
      const { rerender } = render(<CopyButton text="Original text" />);
      
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      expect(mockCopy).toHaveBeenCalledWith('Original text');
      
      rerender(<CopyButton text="Updated text" />);
      fireEvent.click(button);
      expect(mockCopy).toHaveBeenCalledWith('Updated text');
    });
  });

  describe('Error Handling', () => {
    test('handles copy function errors gracefully', async () => {
      // Mock copy to return false on error (as per the real useCopy implementation)
      mockCopy.mockImplementation(() => Promise.resolve(false));
      
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      
      // Should not throw an error when copy fails
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
      
      expect(mockCopy).toHaveBeenCalledWith(defaultProps.text);
    });

    test('continues to work after copy failures', async () => {
      mockCopy
        .mockImplementationOnce(() => Promise.resolve(false)) // First failure
        .mockImplementationOnce(() => Promise.resolve(true)); // Second success
      
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      
      // First click fails
      fireEvent.click(button);
      expect(mockCopy).toHaveBeenCalledTimes(1);
      
      // Second click succeeds
      fireEvent.click(button);
      expect(mockCopy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    test('has proper title attribute for screen readers', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      expect(button).toHaveAttribute('title', 'Copy to clipboard');
    });

    test('button is keyboard accessible', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      
      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Button should have proper attributes for accessibility
      expect(button).toHaveAttribute('type', 'button');
    });

    test('supports keyboard navigation', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      
      // Button should be focusable and tabbable
      expect(button).not.toHaveAttribute('tabindex', '-1');
      
      // Button should be a proper button element
      expect(button.tagName).toBe('BUTTON');
    });

    test('has appropriate role as button', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    test('copy icon has correct className', () => {
      render(<CopyButton {...defaultProps} />);
      
      const copyIcon = screen.getByTestId('copy-icon');
      expect(copyIcon).toHaveClass('h-4', 'w-4');
    });

    test('check icon has correct className when copied', () => {
      mockCopied.mockReturnValue(true);
      render(<CopyButton {...defaultProps} />);
      
      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveClass('h-4', 'w-4');
    });
  });

  describe('Integration Tests', () => {
    test('complete copy workflow works end-to-end', async () => {
      let copiedState = false;
      mockCopied.mockImplementation(() => copiedState);
      mockCopy.mockImplementation((text: string) => {
        copiedState = true;
        return Promise.resolve(true);
      });
      
      const { rerender } = render(<CopyButton {...defaultProps} />);
      
      // Initial state
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      
      // Click to copy
      const button = screen.getByTestId('copy-button');
      fireEvent.click(button);
      
      // Simulate state change
      rerender(<CopyButton {...defaultProps} />);
      
      // Should show copied state
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      
      expect(mockCopy).toHaveBeenCalledWith(defaultProps.text);
    });

    test('handles rapid successive clicks correctly', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByTestId('copy-button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockCopy).toHaveBeenCalledTimes(3);
      expect(mockCopy).toHaveBeenCalledWith(defaultProps.text);
    });
  });
});