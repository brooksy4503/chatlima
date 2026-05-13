/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { ProjectOverview } from '../../components/project-overview';
import { STORAGE_KEYS } from '../../lib/constants';

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
  const dismissOnboarding = () => {
    window.localStorage.setItem('chatlimaOnboarding', JSON.stringify({ dismissedWelcome: true }));
    window.localStorage.setItem(STORAGE_KEYS.SHOW_WELCOME_SCREEN, JSON.stringify(false));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  describe('Basic Rendering and Props', () => {
    test('renders welcome text without sendMessage prop', () => {
      render(<ProjectOverview />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
    });

    test('renders welcome text with sendMessage prop', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
    });

    test('renders welcome text with both sendMessage and selectedModel props', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="gpt-4" />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    test('does not render SuggestedPrompts when sendMessage is not provided', () => {
      render(<ProjectOverview />);
      
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('renders SuggestedPrompts when sendMessage is provided', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      expect(screen.getByTestId('suggested-prompts')).toBeInTheDocument();
    });

    test('renders SuggestedPrompts when sendMessage is provided with selectedModel', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="claude-3" />);
      
      expect(screen.getByTestId('suggested-prompts')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    test('passes correct props to SuggestedPrompts with sendMessage only', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-send-message', 'true');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', 'not-provided');
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });

    test('passes correct props to SuggestedPrompts with both sendMessage and selectedModel', () => {
      dismissOnboarding();
      const selectedModel = 'gpt-4-turbo';
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={selectedModel} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-send-message', 'true');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', selectedModel);
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });

    test('passes correct default values to SuggestedPrompts', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-max-suggestions', '4');
      expect(suggestedPrompts).toHaveAttribute('data-show-categories', 'true');
    });
  });

  describe('Layout and Styling', () => {
    test('applies correct CSS classes to main container', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} />);

      const description = screen.getByText(/start with one of the three cards below/i);
      const mainContainer = description.closest('div')?.parentElement;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'space-y-6', 'p-4');
    });

    test('applies correct styling to description text', () => {
      render(<ProjectOverview />);

      const description = screen.getByText(/start with one of the three cards below/i);
      expect(description).toHaveClass('text-base', 'sm:text-lg', 'text-muted-foreground');
    });

    test('applies responsive layout classes when SuggestedPrompts is rendered', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} />);
      
      const suggestedPromptsContainer = screen.getByTestId('suggested-prompts').parentElement;
      expect(suggestedPromptsContainer).toHaveClass('w-full', 'max-w-4xl', 'mx-auto');
    });
  });

  describe('Accessibility', () => {
    test('provides descriptive text for screen readers', () => {
      render(<ProjectOverview />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      expect(screen.getByText(/start with one of the three cards below/i)).toBeInTheDocument();
    });

    test('maintains semantic structure without prompt suggestions when sendMessage is not provided', () => {
      render(<ProjectOverview />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add api key/i })).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined sendMessage prop gracefully', () => {
      render(<ProjectOverview sendMessage={undefined} />);
      
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('handles empty string selectedModel', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="" />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', '');
    });

    test('handles null selectedModel', () => {
      dismissOnboarding();
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={undefined} />);
      
      const suggestedPrompts = screen.getByTestId('suggested-prompts');
      expect(suggestedPrompts).toHaveAttribute('data-selected-model', 'not-provided');
    });
  });

  describe('Onboarding v1 setup cards', () => {
    test('uses SSR-safe onboarding defaults even when localStorage has dismissed onboarding', () => {
      dismissOnboarding();

      const html = renderToString(<ProjectOverview sendMessage={mockSendMessage} selectedModel="gpt-4" />);

      expect(html).toContain('Start with one of the three cards below');
      expect(html).not.toContain('Ask anything. Pick a prompt idea below');
      expect(html).not.toContain('Mocked SuggestedPrompts');
    });

    test('renders three getting-started cards for chat, API keys, and MCP tools', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="openrouter/google/gemini-2.5-flash" />);

      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      expect(screen.getByText(/start chatting/i)).toBeInTheDocument();
      expect(screen.getByText(/bring your own api key/i)).toBeInTheDocument();
      expect(screen.getByText(/connect tools/i)).toBeInTheDocument();
      expect(screen.getByText(/recommended model/i)).toBeInTheDocument();
    });

    test('hides suggested prompts while onboarding cards are visible', () => {
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="gpt-4" />);

      expect(screen.getByText(/quick setup/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('can hide onboarding while keeping suggested prompts visible', () => {
      render(
        <ProjectOverview
          sendMessage={mockSendMessage}
          selectedModel="gpt-4"
          showWelcomeOnboarding={false}
          showSuggestedPrompts={true}
        />
      );

      expect(screen.queryByText(/quick setup/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('suggested-prompts')).toBeInTheDocument();
    });

    test('can show onboarding while hiding suggested prompts', async () => {
      dismissOnboarding();
      // Match user turning welcome back on in settings while onboarding was dismissed
      window.localStorage.setItem(STORAGE_KEYS.SHOW_WELCOME_SCREEN, JSON.stringify(true));
      render(
        <ProjectOverview
          sendMessage={mockSendMessage}
          selectedModel="gpt-4"
          showWelcomeOnboarding={true}
          showSuggestedPrompts={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/quick setup/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/start with one of the three cards below/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });

    test('dispatches setup events and records completed onboarding actions', () => {
      const eventListener = jest.fn();
      window.addEventListener('chatlima:onboarding-action', eventListener);

      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel="gpt-4" />);

      fireEvent.click(screen.getByRole('button', { name: /add api key/i }));
      fireEvent.click(screen.getByRole('button', { name: /connect mcp server/i }));

      expect(eventListener).toHaveBeenCalledTimes(2);
      expect(eventListener.mock.calls[0][0].detail).toEqual({ action: 'api-keys' });
      expect(eventListener.mock.calls[1][0].detail).toEqual({ action: 'mcp-servers' });

      const stored = JSON.parse(window.localStorage.getItem('chatlimaOnboarding') || '{}');
      expect(stored.clickedApiKeysSetup).toBe(true);
      expect(stored.clickedMcpSetup).toBe(true);

      window.removeEventListener('chatlima:onboarding-action', eventListener);
    });

    test('can hide the getting-started panel permanently', () => {
      const onShowWelcomeOnboardingChange = jest.fn();

      render(
        <ProjectOverview
          sendMessage={mockSendMessage}
          onShowWelcomeOnboardingChange={onShowWelcomeOnboardingChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /hide setup/i }));

      expect(screen.queryByText(/quick setup/i)).not.toBeInTheDocument();
      expect(onShowWelcomeOnboardingChange).toHaveBeenCalledWith(false);
      const stored = JSON.parse(window.localStorage.getItem('chatlimaOnboarding') || '{}');
      expect(stored.dismissedWelcome).toBe(true);
    });

    test('turning welcome onboarding back on restores the getting-started cards after dismissal', async () => {
      dismissOnboarding();
      const { rerender } = render(
        <ProjectOverview
          sendMessage={mockSendMessage}
          selectedModel="gpt-4"
          showWelcomeOnboarding={false}
          showSuggestedPrompts={true}
        />
      );

      expect(screen.queryByText(/quick setup/i)).not.toBeInTheDocument();

      rerender(
        <ProjectOverview
          sendMessage={mockSendMessage}
          selectedModel="gpt-4"
          showWelcomeOnboarding={true}
          showSuggestedPrompts={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/quick setup/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/start with one of the three cards below/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
      const stored = JSON.parse(window.localStorage.getItem('chatlimaOnboarding') || '{}');
      expect(stored.dismissedWelcome).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('complete component renders with all features when fully configured', () => {
      dismissOnboarding();
      const selectedModel = 'claude-3-opus';
      render(<ProjectOverview sendMessage={mockSendMessage} selectedModel={selectedModel} />);
      
      // Verify welcome text is present
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      
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
      expect(screen.getByText(/get started with chatlima/i)).toBeInTheDocument();
      expect(screen.queryByTestId('suggested-prompts')).not.toBeInTheDocument();
    });
  });
});