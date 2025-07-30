/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteToggle } from '../../components/favorite-toggle';

// Mock the model context
const mockToggleFavorite = jest.fn();
jest.mock('../../lib/context/model-context', () => ({
  useModel: () => ({
    toggleFavorite: mockToggleFavorite,
  }),
}));

// Mock UI components
jest.mock('../../components/ui/tooltip', () => ({
  TooltipProvider: ({ children, delayDuration }: any) => (
    <div data-testid="tooltip-provider" data-delay={delayDuration}>{children}</div>
  ),
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => 
    asChild ? children : <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children, side, className }: any) => (
    <div data-testid="tooltip-content" data-side={side} className={className}>
      {children}
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Star: ({ className, ...props }: any) => (
    <div data-testid="star-icon" className={className} {...props} />
  ),
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('FavoriteToggle', () => {
  const mockProps = {
    modelId: 'test-model-1',
    isFavorite: false,
    onToggle: jest.fn(),
    disabled: false,
    size: 'md' as const,
    className: 'test-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToggleFavorite.mockResolvedValue(true);
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders with default props', () => {
      render(<FavoriteToggle modelId="test-model" isFavorite={false} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    });

    test('renders with all props provided', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('test-class');
      expect(button).not.toBeDisabled();
    });

    test('applies correct size classes for small size', () => {
      render(<FavoriteToggle {...mockProps} size="sm" />);
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('h-3 w-3');
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-0.5');
    });

    test('applies correct size classes for medium size', () => {
      render(<FavoriteToggle {...mockProps} size="md" />);
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('h-4 w-4');
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1');
    });

    test('applies correct size classes for large size', () => {
      render(<FavoriteToggle {...mockProps} size="lg" />);
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('h-5 w-5');
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1.5');
    });

    test('shows unfavorited state correctly', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add to favorites');
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('text-muted-foreground hover:text-yellow-500');
      expect(starIcon).not.toHaveClass('fill-yellow-400 text-yellow-500');
    });

    test('shows favorited state correctly', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('fill-yellow-400 text-yellow-500 drop-shadow-sm');
    });

    test('renders disabled state correctly', () => {
      render(<FavoriteToggle {...mockProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed hover:bg-transparent');
    });

    test('applies custom className', () => {
      render(<FavoriteToggle {...mockProps} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('calls toggleFavorite when clicked', async () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledWith('test-model-1');
      });
    });

    test('calls onToggle callback when toggle succeeds', async () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockProps.onToggle).toHaveBeenCalledWith('test-model-1', true);
      });
    });

    test('does not call onToggle when toggle fails', async () => {
      mockToggleFavorite.mockResolvedValue(false);
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
      
      expect(mockProps.onToggle).not.toHaveBeenCalled();
    });

    test('does not call toggleFavorite when disabled', () => {
      render(<FavoriteToggle {...mockProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockToggleFavorite).not.toHaveBeenCalled();
      expect(mockProps.onToggle).not.toHaveBeenCalled();
    });

    test('prevents event propagation and default behavior', () => {
      const mockPreventDefault = jest.fn();
      const mockStopPropagation = jest.fn();
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      
      // Create a proper event object
      const mockEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      mockEvent.preventDefault = mockPreventDefault;
      mockEvent.stopPropagation = mockStopPropagation;
      
      fireEvent(button, mockEvent);
      
      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();
    });

    test('handles rapid clicks gracefully', async () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      
      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should only call toggleFavorite once due to isToggling state
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Tests for Loading States
  describe('Loading States', () => {
    test('shows loading state during toggle operation', async () => {
      let resolveToggle: (value: boolean) => void;
      const togglePromise = new Promise<boolean>((resolve) => {
        resolveToggle = resolve;
      });
      mockToggleFavorite.mockReturnValue(togglePromise);
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Button should be disabled during toggle
      expect(button).toBeDisabled();
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('animate-pulse');
      
      // Resolve the promise
      resolveToggle!(true);
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(starIcon).not.toHaveClass('animate-pulse');
      });
    });

    test('prevents multiple simultaneous toggle operations', async () => {
      let resolveToggle: (value: boolean) => void;
      const togglePromise = new Promise<boolean>((resolve) => {
        resolveToggle = resolve;
      });
      mockToggleFavorite.mockReturnValue(togglePromise);
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      
      // First click
      fireEvent.click(button);
      expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
      
      // Second click while first is still pending
      fireEvent.click(button);
      expect(mockToggleFavorite).toHaveBeenCalledTimes(1); // Should not increase
      
      // Resolve the promise
      resolveToggle!(true);
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    test('resets loading state after successful toggle', async () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(screen.getByTestId('star-icon')).not.toHaveClass('animate-pulse');
      });
    });

    test('resets loading state after failed toggle', async () => {
      mockToggleFavorite.mockRejectedValue(new Error('Toggle failed'));
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(screen.getByTestId('star-icon')).not.toHaveClass('animate-pulse');
      });
    });
  });

  // Tests for Error Handling
  describe('Error Handling', () => {
    test('handles toggle error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockToggleFavorite.mockRejectedValue(new Error('Network error'));
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error));
      });
      
      // Component should still be functional after error
      expect(button).not.toBeDisabled();
      expect(mockProps.onToggle).not.toHaveBeenCalled();
    });

    test('handles missing toggleFavorite function', async () => {
      // Temporarily mock useModel to return undefined toggleFavorite
      const originalUseModel = require('../../lib/context/model-context').useModel;
      require('../../lib/context/model-context').useModel = jest.fn().mockReturnValue({
        toggleFavorite: undefined,
      });
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not crash and should not call onToggle
      expect(mockProps.onToggle).not.toHaveBeenCalled();
      
      // Restore original mock
      require('../../lib/context/model-context').useModel = originalUseModel;
    });

    test('handles null toggleFavorite response', async () => {
      mockToggleFavorite.mockResolvedValue(null);
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
      
      // Should not call onToggle for falsy response
      expect(mockProps.onToggle).not.toHaveBeenCalled();
    });

    test('works without onToggle callback', async () => {
      render(<FavoriteToggle modelId="test-model" isFavorite={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
      
      // Should not crash when onToggle is not provided
      expect(button).not.toBeDisabled();
    });
  });

  // Tests for Tooltip Functionality
  describe('Tooltip Functionality', () => {
    test('renders tooltip with correct delay', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const tooltipProvider = screen.getByTestId('tooltip-provider');
      expect(tooltipProvider).toHaveAttribute('data-delay', '300');
    });

    test('shows correct tooltip content for unfavorited state', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={false} />);
      
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Add to favorites');
    });

    test('shows correct tooltip content for favorited state', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={true} />);
      
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Remove from favorites');
    });

    test('shows loading tooltip content during toggle', async () => {
      let resolveToggle: (value: boolean) => void;
      const togglePromise = new Promise<boolean>((resolve) => {
        resolveToggle = resolve;
      });
      mockToggleFavorite.mockReturnValue(togglePromise);
      
      render(<FavoriteToggle {...mockProps} isFavorite={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Adding to favorites...');
      
      resolveToggle!(true);
      
      await waitFor(() => {
        expect(tooltipContent).toHaveTextContent('Add to favorites');
      });
    });

    test('shows correct loading tooltip for removing favorite', async () => {
      let resolveToggle: (value: boolean) => void;
      const togglePromise = new Promise<boolean>((resolve) => {
        resolveToggle = resolve;
      });
      mockToggleFavorite.mockReturnValue(togglePromise);
      
      render(<FavoriteToggle {...mockProps} isFavorite={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveTextContent('Removing from favorites...');
      
      resolveToggle!(true);
      
      await waitFor(() => {
        expect(tooltipContent).toHaveTextContent('Remove from favorites');
      });
    });

    test('tooltip content positioned correctly', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const tooltipContent = screen.getByTestId('tooltip-content');
      expect(tooltipContent).toHaveAttribute('data-side', 'top');
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('has proper ARIA label for unfavorited state', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add to favorites');
    });

    test('has proper ARIA label for favorited state', () => {
      render(<FavoriteToggle {...mockProps} isFavorite={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
    });

    test('is keyboard accessible', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Button should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    test('has proper button type', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    test('supports keyboard activation', async () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
    });

    test('has proper focus styles', () => {
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1');
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete toggle workflow: unfavorited to favorited', async () => {
      const onToggle = jest.fn();
      render(<FavoriteToggle {...mockProps} isFavorite={false} onToggle={onToggle} />);
      
      // Initial state
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add to favorites');
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('text-muted-foreground hover:text-yellow-500');
      
      // Click to toggle
      fireEvent.click(button);
      
      // During toggle - loading state
      expect(button).toBeDisabled();
      expect(starIcon).toHaveClass('animate-pulse');
      
      // After toggle completes
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledWith('test-model-1');
        expect(onToggle).toHaveBeenCalledWith('test-model-1', true);
        expect(button).not.toBeDisabled();
        expect(starIcon).not.toHaveClass('animate-pulse');
      });
    });

    test('complete toggle workflow: favorited to unfavorited', async () => {
      const onToggle = jest.fn();
      render(<FavoriteToggle {...mockProps} isFavorite={true} onToggle={onToggle} />);
      
      // Initial state
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('fill-yellow-400 text-yellow-500 drop-shadow-sm');
      
      // Click to toggle
      fireEvent.click(button);
      
      // After toggle completes
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledWith('test-model-1');
        expect(onToggle).toHaveBeenCalledWith('test-model-1', false);
      });
    });

    test('handles error recovery workflow', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockToggleFavorite.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FavoriteToggle {...mockProps} />);
      
      const button = screen.getByRole('button');
      
      // First click fails
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
        expect(button).not.toBeDisabled();
      });
      
      // Second click should work normally
      mockToggleFavorite.mockResolvedValueOnce(true);
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledTimes(2);
        expect(mockProps.onToggle).toHaveBeenCalledWith('test-model-1', true);
      });
    });

    test('maintains state consistency across prop changes', () => {
      const { rerender } = render(<FavoriteToggle {...mockProps} isFavorite={false} />);
      
      // Initial state
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Add to favorites');
      
      // Update props
      rerender(<FavoriteToggle {...mockProps} isFavorite={true} />);
      
      // Updated state
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove from favorites');
      
      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toHaveClass('fill-yellow-400 text-yellow-500 drop-shadow-sm');
    });

    test('handles disabled state transitions', async () => {
      const { rerender } = render(<FavoriteToggle {...mockProps} disabled={false} />);
      
      const button = screen.getByRole('button');
      
      // Initially enabled - should work
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
      
      jest.clearAllMocks();
      
      // Disable component
      rerender(<FavoriteToggle {...mockProps} disabled={true} />);
      
      // Should not work when disabled
      fireEvent.click(button);
      expect(mockToggleFavorite).not.toHaveBeenCalled();
      
      // Re-enable component
      rerender(<FavoriteToggle {...mockProps} disabled={false} />);
      
      // Should work again
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled();
      });
    });
  });
});