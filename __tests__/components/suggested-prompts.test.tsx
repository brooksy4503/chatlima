/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { SuggestedPrompts, SuggestedAction } from '../../components/suggested-prompts';

// Mock the motion components
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock UI components with proper prop forwarding
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, onKeyDown, variant, size, className, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      onKeyDown={onKeyDown} 
      className={className}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span 
      className={className} 
      data-variant={variant}
      data-testid="category-badge"
      {...props}
    >
      {children}
    </span>
  ),
}));

jest.mock('../../components/ui/input', () => ({
  Input: ({ type, placeholder, value, onChange, className, ...props }: any) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
      {...props}
    />
  ),
}));

// Mock the utility functions
jest.mock('../../lib/suggested-prompts-utils', () => ({
  getContextualSuggestions: jest.fn(),
  getCategoryColor: jest.fn(() => 'bg-blue-100 text-blue-800'),
}));

describe('SuggestedPrompts Component', () => {
  const mockSendMessage = jest.fn();
  const mockGetContextualSuggestions = require('../../lib/suggested-prompts-utils').getContextualSuggestions as jest.MockedFunction<any>;
  const mockGetCategoryColor = require('../../lib/suggested-prompts-utils').getCategoryColor as jest.MockedFunction<any>;
  
  const customSuggestions: SuggestedAction[] = [
    {
      title: "Debug code",
      label: "and explain the issue",
      action: "Debug this code and explain what's wrong",
      category: "coding",
      icon: <div>Code Icon</div>
    },
    {
      title: "Write tests",
      label: "for this function",
      action: "Write comprehensive tests for this function",
      category: "testing",
      icon: <div>Test Icon</div>
    },
    {
      title: "Explain concept",
      label: "in simple terms",
      action: "Explain this concept in simple terms",
      category: "learning",
      icon: <div>Learn Icon</div>
    },
    {
      title: "Optimize performance",
      label: "of this code",
      action: "Optimize the performance of this code",
      category: "optimization",
      icon: <div>Speed Icon</div>
    },
    {
      title: "Create documentation",
      label: "with examples",
      action: "Create documentation with examples",
      category: "documentation",
      icon: <div>Doc Icon</div>
    },
    {
      title: "Brainstorm ideas",
      label: "for new features",
      action: "Brainstorm ideas for new features",
      category: "creative",
      icon: <div>Creative Icon</div>
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContextualSuggestions.mockReturnValue(customSuggestions);
    mockGetCategoryColor.mockReturnValue('bg-blue-100 text-blue-800');
  });

  afterEach(() => {
    cleanup();
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders with default suggestions when no suggestions provided', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} />);
      
      // When no selectedModel is provided, component uses getContextualSuggestions with undefined model
      expect(mockGetContextualSuggestions).toHaveBeenCalledWith(undefined);
      expect(screen.getByTestId('suggested-actions')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('renders with custom suggestions when provided', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.getByText('and explain the issue')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.getByText('for this function')).toBeInTheDocument();
    });

    test('limits suggestions based on maxSuggestions prop', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={2} 
        />
      );
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      expect(buttons).toHaveLength(2);
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.queryByText('Explain concept')).not.toBeInTheDocument();
    });

    test('uses default maxSuggestions of 4 when not provided', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      expect(buttons).toHaveLength(4);
    });

    test('renders with contextual suggestions based on selectedModel', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          selectedModel="gpt-4" 
        />
      );
      
      expect(mockGetContextualSuggestions).toHaveBeenCalledWith('gpt-4');
    });

    test('shows model context hint when selectedModel is provided', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          selectedModel="claude-3-opus" 
        />
      );
      
      expect(screen.getByRole('button', { name: /Why these\?/i })).toBeInTheDocument();
    });
  });

  // Tests for Search Functionality  
  describe('Search Functionality', () => {
    test('renders search input with proper attributes', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder', 'Search prompt ideas');
    });

    test('filters suggestions based on search query', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'debug' } });
      
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
      expect(screen.queryByText('Explain concept')).not.toBeInTheDocument();
    });

    test('shows clear search button when search query is present', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeInTheDocument();
    });

    test('clears search when clear button is clicked', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    test('shows empty state when no suggestions match search', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText(/No suggestions found matching your criteria/i)).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search or selecting a different category/i)).toBeInTheDocument();
    });

    test('searches across title, label, action, and category fields', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      
      // Search by category
      fireEvent.change(searchInput, { target: { value: 'coding' } });
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      
      // Search by label
      fireEvent.change(searchInput, { target: { value: 'performance' } });
      expect(screen.getByText('Optimize performance')).toBeInTheDocument();
      
      // Search by action text
      fireEvent.change(searchInput, { target: { value: 'comprehensive' } });
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  // Tests for Category Filtering
  describe('Category Filtering', () => {
    test('renders category filter buttons when showCategories is true', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} showCategories={true} />);
      
      expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /coding/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /testing/i })).toBeInTheDocument();
    });

    test('does not render category filters when showCategories is false', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} showCategories={false} />);
      
      expect(screen.queryByRole('button', { name: /All/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /coding/i })).not.toBeInTheDocument();
    });

    test('filters suggestions by selected category', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const codingButton = screen.getByRole('button', { name: /coding/i });
      fireEvent.click(codingButton);
      
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
      expect(screen.queryByText('Explain concept')).not.toBeInTheDocument();
    });

    test('shows all suggestions when "All" category is selected', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      // First select a specific category
      const codingButton = screen.getByRole('button', { name: /coding/i });
      fireEvent.click(codingButton);
      
      // Then click "All" to show all suggestions
      const allButton = screen.getByRole('button', { name: /All/i });
      fireEvent.click(allButton);
      
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(screen.getByText('Explain concept')).toBeInTheDocument();
    });

    test('renders category badges when showCategories is true', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} showCategories={true} />);
      
      const badges = screen.getAllByTestId('category-badge');
      expect(badges.length).toBeGreaterThan(0);
      expect(mockGetCategoryColor).toHaveBeenCalled();
    });
  });

  // Tests for Show More/Show Less Functionality
  describe('Show More/Show Less Functionality', () => {
    test('shows "Show More" button when there are more suggestions than maxSuggestions', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={3} 
        />
      );
      
      expect(screen.getByRole('button', { name: /Show 3 more suggestions/i })).toBeInTheDocument();
    });

    test('does not show "Show More" button when suggestions are within limit', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions.slice(0, 2)} 
          maxSuggestions={4} 
        />
      );
      
      expect(screen.queryByRole('button', { name: /Show More/i })).not.toBeInTheDocument();
    });

    test('expands suggestions when "Show More" is clicked', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={3} 
        />
      );
      
      const showMoreButton = screen.getByRole('button', { name: /Show More/i });
      fireEvent.click(showMoreButton);
      
      const suggestionButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      expect(suggestionButtons).toHaveLength(6); // Shows double the maxSuggestions
    });

    test('changes to "Show Less" after expanding', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={3} 
        />
      );
      
      const showMoreButton = screen.getByRole('button', { name: /Show More/i });
      fireEvent.click(showMoreButton);
      
      expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();
    });

    test('hides "Show More" button when search is active', () => {
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={3} 
        />
      );
      
      // First confirm the button exists
      expect(screen.getByRole('button', { name: /Show More/i })).toBeInTheDocument();
      
      // Search for something
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'debug' } });
      
      // Show More button should be hidden
      expect(screen.queryByRole('button', { name: /Show More/i })).not.toBeInTheDocument();
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('calls sendMessage when suggestion button is clicked', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const debugButton = screen.getByRole('button', { name: /Send message: Debug this code and explain what's wrong/i });
      fireEvent.click(debugButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith("Debug this code and explain what's wrong");
    });

    test('handles keyboard navigation with Enter key', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const firstButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      )!;
      
      fireEvent.keyDown(firstButton, { key: 'Enter' });
      expect(mockSendMessage).toHaveBeenCalledWith("Debug this code and explain what's wrong");
    });

    test('handles keyboard navigation with Space key', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const firstButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      )!;
      
      fireEvent.keyDown(firstButton, { key: ' ' });
      expect(mockSendMessage).toHaveBeenCalledWith("Debug this code and explain what's wrong");
    });

    test('disables buttons during animation state', async () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const firstButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      )!;
      
      fireEvent.click(firstButton);
      
      // Button should be disabled during animation
      expect(firstButton).toBeDisabled();
      
      // Wait for animation to complete
      await waitFor(() => {
        expect(firstButton).not.toBeDisabled();
      }, { timeout: 500 });
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('has proper ARIA attributes on container', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const container = screen.getByTestId('suggested-actions');
      expect(container).toHaveAttribute('role', 'group');
      expect(container).toHaveAttribute('aria-label', 'Suggested prompts');
    });

    test('suggestion buttons have proper ARIA labels', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      
      expect(buttons[0]).toHaveAttribute('aria-label', 'Send message: Debug this code and explain what\'s wrong');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Send message: Write comprehensive tests for this function');
    });

    test('buttons have proper role and tabindex attributes', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('role', 'button');
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    test('clear search button has proper accessibility label', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  // Tests for Error Handling
  describe('Error Handling', () => {
    test('handles empty suggestions array gracefully', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={[]} />);
      
      expect(screen.getByText(/No suggestions found matching your criteria/i)).toBeInTheDocument();
    });

    test('handles missing icon gracefully', () => {
      const suggestionsWithoutIcon = [
        {
          title: "Test suggestion",
          label: "without icon",
          action: "Test action",
          category: "test"
        }
      ];
      
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={suggestionsWithoutIcon} />);
      
      expect(screen.getByText('Test suggestion')).toBeInTheDocument();
    });

    test('handles missing category gracefully', () => {
      const suggestionsWithoutCategory = [
        {
          title: "Test suggestion",
          label: "without category",
          action: "Test action"
        }
      ];
      
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={suggestionsWithoutCategory} />);
      
      expect(screen.getByText('Test suggestion')).toBeInTheDocument();
    });
  });

  // Tests for Performance
  describe('Performance', () => {
    test('efficiently handles large datasets', () => {
      const largeSuggestions = Array(100).fill(null).map((_, i) => ({
        title: `Title ${i}`,
        label: `Label ${i}`,
        action: `Action ${i}`,
        category: 'test'
      }));
      
      render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={largeSuggestions} 
          maxSuggestions={5} 
        />
      );
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Send message:')
      );
      expect(buttons).toHaveLength(5);
    });

    test('component memoization prevents unnecessary re-renders', () => {
      const { rerender } = render(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={4} 
        />
      );
      
      // Re-render with same props should not cause issues
      rerender(
        <SuggestedPrompts 
          sendMessage={mockSendMessage} 
          suggestions={customSuggestions} 
          maxSuggestions={4} 
        />
      );
      
      expect(screen.getByText('Debug code')).toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete user workflow: search, filter, and select suggestion', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      // 1. User searches for a suggestion
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'debug' } });
      
      // 2. Verify filtered results
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
      
      // 3. User clicks on a suggestion
      const debugButton = screen.getByRole('button', { name: /Send message: Debug this code and explain what's wrong/i });
      fireEvent.click(debugButton);
      
      // 4. Verify sendMessage was called
      expect(mockSendMessage).toHaveBeenCalledWith("Debug this code and explain what's wrong");
    });

    test('complete category filtering workflow', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      // 1. Select coding category
      const codingButton = screen.getByRole('button', { name: /coding/i });
      fireEvent.click(codingButton);
      
      // 2. Verify only coding suggestions are shown
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
      
      // 3. Reset to all categories
      const allButton = screen.getByRole('button', { name: /All/i });
      fireEvent.click(allButton);
      
      // 4. Verify all suggestions are shown again
      expect(screen.getByText('Debug code')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    test('renders with proper responsive grid classes', () => {
      render(<SuggestedPrompts sendMessage={mockSendMessage} suggestions={customSuggestions} />);
      
      const container = screen.getByTestId('suggested-actions');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-2.5', 'w-full');
    });
  });
});