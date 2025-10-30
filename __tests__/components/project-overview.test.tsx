/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { ProjectOverview } from '../../components/project-overview';

// Mock the SuggestedPrompts component
jest.mock('../../components/suggested-prompts', () => ({
  SuggestedPrompts: ({ sendMessage, selectedModel, maxSuggestions, showCategories }: any) => (
    <div 
      data-testid="suggested-prompts"
      data-send-message={!!sendMessage}
      data-selected-model={selectedModel !== undefined ? selectedModel : 'not-provided'}
      data-max-suggestions={maxSuggestions}
      data-show-categories={showCategories}
    >
      Mocked SuggestedPrompts
    </div>
  ),
}));

// Mock Next.js Link component  
jest.mock('next/link', () => {
  return ({ children, href, target, className }: any) => (
    <a href={href} target={target} className={className}>
      {children}
    </a>
  );
});

describe('ProjectOverview', () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering and Props', () => {
    test('renders welcome text without sendMessage prop', () => {
      render(<ProjectOverview />);
      
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
    });

    test('renders welcome text with sendMessage prop', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
    });

    test('renders welcome text with both sendMessage and selectedModel props', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="gpt-4" />);
      
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    test('does not render SuggestedPrompts when sendMessage is not provided', () => {
      render(<ProjectOverview />);
      
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('renders SuggestedPrompts when sendMessage is provided', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      expect(screen.getByTestId('suggested-prompts')).toBeInTheDocument();
    });

    test('renders SuggestedPrompts when sendMessage is provided with selectedModel', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="claude-3" />);
      
      expect(screen.getByTestId('suggested-prompts')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    test('passes correct props to SuggestedPrompts with sendMessage only', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-send-message', 'true');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', 'not-provided');
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });

    test('passes correct props to SuggestedPrompts with both sendMessage and selectedModel', () => {
      const selectedModel = 'gpt-4-turbo';
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={selectedModel} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-send-message', 'true');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', selectedModel);
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });

    test('passes correct default values to SuggestedPrompts', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });
  });

  describe('Layout and Styling', () => {
    test('applies correct CSS classes to main container', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const description = screen.getByText(/your ai-powered chat assistant/i);
      const mainContainer = description.closest('div')?.parentElement;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'space-y-6', 'p-4');
    });

    test('applies correct styling to description text', () => {
      render(<ProjectOverview />);
      
      const description = screen.getByText(/your ai-powered chat assistant/i);
      expect(description).toHaveClass('text-base', 'sm:text-lg', 'text-muted-foreground');
    });

    test('applies responsive layout classes when SuggestedPrompts is rendered', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPromptsContainer = screen.getByTestId('suggested-prompts').parentElement;
      expect(suggestedPromptsContainer).toHaveClass('w-full', 'max-w-4xl', 'mx-auto');
    });
  });

  describe('Accessibility', () => {
    test('provides descriptive text for screen readers', () => {
      render(<ProjectOverview />);
      
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/choose a suggestion below or start typing/i)).toBeInTheDocument();
    });

    test('maintains semantic structure without interactive elements when sendMessage is not provided', () => {
      render(<ProjectOverview />);
      
      // Should only have text, no interactive elements
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined sendMessage prop gracefully', () => {
      render(<ProjectOverview sendMessage={undefined} />);
      
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('handles empty string selectedModel', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="" />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', '');
    });

    test('handles null selectedModel', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={undefined} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', 'not-provided');
    });
  });

  describe('Integration Tests', () => {
    test('complete component renders with all features when fully configured', () => {
      const selectedModel = 'claude-3-opus';
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={selectedModel} />);
      
      // Verify welcome text is present
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
      
      // Verify SuggestedPrompts is rendered with correct props
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toBeInTheDocument();
      expect(suggestedPrompts).toHaveAttribute('data-send-message', 'true');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', selectedModel);
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });

    test('minimal configuration renders appropriately', () => {
      render(<ProjectOverview />);
      
      // Should render basic welcome without interactive elements
      expect(screen.getByText(/your ai-powered chat assistant/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });
  });
});