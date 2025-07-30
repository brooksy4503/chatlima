/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { WebSearchSuggestion } from '../../components/web-search-suggestion';

// Mock framer-motion components
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: ({ className, ...props }: any) => (
    <div data-testid="x-icon" className={className} {...props}>X</div>
  ),
  Lightbulb: ({ className, ...props }: any) => (
    <div data-testid="lightbulb-icon" className={className} {...props}>Lightbulb</div>
  ),
  Globe: ({ className, ...props }: any) => (
    <div data-testid="globe-icon" className={className} {...props}>Globe</div>
  ),
}));

// Mock web search context
const mockSetWebSearchEnabled = jest.fn();
jest.mock('@/lib/context/web-search-context', () => ({
  useWebSearch: jest.fn(() => ({
    webSearchEnabled: true,
    setWebSearchEnabled: mockSetWebSearchEnabled,
  })),
}));

// Mock token counter
jest.mock('@/lib/tokenCounter', () => ({
  WEB_SEARCH_COST: 25,
}));

// Mock client mount hook
jest.mock('@/lib/hooks/use-client-mount', () => ({
  useClientMount: jest.fn(() => true),
}));

describe('WebSearchSuggestion', () => {
  const defaultProps = {
    messageId: 'test-message-id',
    hasWebSearchResults: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useClientMount } = jest.requireMock('@/lib/hooks/use-client-mount');
    useClientMount.mockReturnValue(true);
    // Reset the mock to return default values
    const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
    useWebSearch.mockReturnValue({
      webSearchEnabled: true,
      setWebSearchEnabled: mockSetWebSearchEnabled,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering and Props', () => {
    test('renders suggestion when web search is enabled and has results', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
      expect(screen.getByText(/Follow-up questions about these results don't need web search/)).toBeInTheDocument();
      expect(screen.getByText(/save 25 credits per message/)).toBeInTheDocument();
    });

    test('does not render when component is not mounted', () => {
      const { useClientMount } = jest.requireMock('@/lib/hooks/use-client-mount');
      useClientMount.mockReturnValue(false);
      
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('does not render when web search is disabled', () => {
      const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
      useWebSearch.mockReturnValue({
        webSearchEnabled: false,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('does not render when hasWebSearchResults is false', () => {
      render(<WebSearchSuggestion {...defaultProps} hasWebSearchResults={false} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('does not render when hasWebSearchResults is undefined', () => {
      render(<WebSearchSuggestion messageId="test-id" />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('renders all required UI elements', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /disable web search/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /keep enabled/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss suggestion/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls setWebSearchEnabled(false) when disable web search button is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const disableButton = screen.getByRole('button', { name: /disable web search/i });
      fireEvent.click(disableButton);
      
      expect(mockSetWebSearchEnabled).toHaveBeenCalledWith(false);
    });

    test('hides suggestion after disable web search button is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const disableButton = screen.getByRole('button', { name: /disable web search/i });
      fireEvent.click(disableButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('hides suggestion when keep enabled button is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const keepEnabledButton = screen.getByRole('button', { name: /keep enabled/i });
      fireEvent.click(keepEnabledButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('hides suggestion when dismiss button (X) is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('does not call setWebSearchEnabled when keep enabled button is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const keepEnabledButton = screen.getByRole('button', { name: /keep enabled/i });
      fireEvent.click(keepEnabledButton);
      
      expect(mockSetWebSearchEnabled).not.toHaveBeenCalled();
    });

    test('does not call setWebSearchEnabled when dismiss button (X) is clicked', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(mockSetWebSearchEnabled).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('stays hidden after being dismissed even when props change', () => {
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      // Dismiss the suggestion
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
      
      // Re-render with different messageId
      rerender(<WebSearchSuggestion messageId="different-id" hasWebSearchResults={true} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('stays hidden with new messageId after being dismissed', () => {
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      // Dismiss the suggestion
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
      
      // Re-render with different messageId - should still be dismissed
      rerender(<WebSearchSuggestion messageId="different-id" hasWebSearchResults={true} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('resets dismissed state when web search is disabled and re-enabled', async () => {
      // Mock changing webSearchEnabled state
      const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
      
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      // Dismiss the suggestion
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
      
      // Simulate web search being disabled
      useWebSearch.mockReturnValue({
        webSearchEnabled: false,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      rerender(<WebSearchSuggestion {...defaultProps} />);
      
      // Simulate web search being re-enabled
      useWebSearch.mockReturnValue({
        webSearchEnabled: true,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      rerender(<WebSearchSuggestion {...defaultProps} />);
      
      // Suggestion should appear again
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    test('responds to webSearchEnabled context changes', () => {
      const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
      
      // Start with web search enabled
      useWebSearch.mockReturnValue({
        webSearchEnabled: true,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
      
      // Disable web search
      useWebSearch.mockReturnValue({
        webSearchEnabled: false,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      rerender(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('uses setWebSearchEnabled from context correctly', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const disableButton = screen.getByRole('button', { name: /disable web search/i });
      fireEvent.click(disableButton);
      
      expect(mockSetWebSearchEnabled).toHaveBeenCalledTimes(1);
      expect(mockSetWebSearchEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA label for dismiss button', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss suggestion');
    });

    test('all interactive elements are keyboard accessible', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      const disableButton = screen.getByRole('button', { name: /disable web search/i });
      const keepEnabledButton = screen.getByRole('button', { name: /keep enabled/i });
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      
      expect(disableButton).toBeInTheDocument();
      expect(keepEnabledButton).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
      
      // All buttons should be focusable
      disableButton.focus();
      expect(disableButton).toHaveFocus();
      
      keepEnabledButton.focus();
      expect(keepEnabledButton).toHaveFocus();
      
      dismissButton.focus();  
      expect(dismissButton).toHaveFocus();
    });

    test('has proper semantic structure', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      // Check for headings and structure
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
      expect(screen.getByText(/Follow-up questions about these results/)).toBeInTheDocument();
      
      // Check for icon elements
      expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });
  });

  describe('Web Search Cost Display', () => {
    test('displays correct web search cost', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByText(/save 25 credits per message/)).toBeInTheDocument();
    });

    test('updates cost display when WEB_SEARCH_COST changes', () => {
      // Mock different cost
      jest.mocked(require('@/lib/tokenCounter')).WEB_SEARCH_COST = 50;
      
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByText(/save 50 credits per message/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing messageId gracefully', () => {
      render(<WebSearchSuggestion messageId="" hasWebSearchResults={true} />);
      
      // Should still render if other conditions are met
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
    });

    test('handles context errors gracefully', () => {
      // Mock context throwing error
      const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
      useWebSearch.mockImplementation(() => {
        throw new Error('Context error');
      });
      
      expect(() => render(<WebSearchSuggestion {...defaultProps} />)).toThrow('Context error');
    });

    test('handles useClientMount returning false', () => {
      const { useClientMount } = jest.requireMock('@/lib/hooks/use-client-mount');
      useClientMount.mockReturnValue(false);
      
      render(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete user workflow: view suggestion, dismiss, and re-enable', async () => {
      const { useWebSearch } = jest.requireMock('@/lib/context/web-search-context');
      
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      // 1. User sees suggestion
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
      
      // 2. User dismisses suggestion
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
      
      // 3. Simulate web search being disabled (resets dismissed state)
      useWebSearch.mockReturnValue({
        webSearchEnabled: false,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      rerender(<WebSearchSuggestion {...defaultProps} />);
      
      // 4. Re-enable web search - suggestion should appear again
      useWebSearch.mockReturnValue({
        webSearchEnabled: true,
        setWebSearchEnabled: mockSetWebSearchEnabled,
      });
      
      rerender(<WebSearchSuggestion {...defaultProps} />);
      
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
    });

    test('complete user workflow: disable web search feature', () => {
      render(<WebSearchSuggestion {...defaultProps} />);
      
      // 1. User sees suggestion
      expect(screen.getByText('Save credits on follow-up questions')).toBeInTheDocument();
      
      // 2. User clicks disable web search
      const disableButton = screen.getByRole('button', { name: /disable web search/i });
      fireEvent.click(disableButton);
      
      // 3. Web search should be disabled and suggestion hidden
      expect(mockSetWebSearchEnabled).toHaveBeenCalledWith(false);
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });

    test('multiple message workflow: suggestion stays dismissed across messages', () => {
      const { rerender } = render(<WebSearchSuggestion {...defaultProps} />);
      
      // 1. Dismiss first message suggestion
      const dismissButton = screen.getByRole('button', { name: /dismiss suggestion/i });
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
      
      // 2. New message with different ID should still be dismissed
      rerender(<WebSearchSuggestion messageId="new-message-id" hasWebSearchResults={true} />);
      
      expect(screen.queryByText('Save credits on follow-up questions')).not.toBeInTheDocument();
    });
  });
});