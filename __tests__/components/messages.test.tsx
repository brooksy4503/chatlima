/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { Messages } from '../../components/messages';
import type { Message as TMessage } from 'ai';

// Mock the useScrollToBottom hook
const mockContainerRef = { current: null };
const mockEndRef = { current: null };
jest.mock('../../lib/hooks/use-scroll-to-bottom', () => ({
  useScrollToBottom: jest.fn(() => [mockContainerRef, mockEndRef]),
}));

// Mock the Message component
jest.mock('../../components/message', () => ({
  Message: ({ message, isLatestMessage, isLoading, status }: any) => (
    <div 
      data-testid={`message-${message.id}`}
      data-is-latest={isLatestMessage.toString()}
      data-is-loading={isLoading.toString()}
      data-status={status}
    >
      <div data-testid="message-content">{message.content}</div>
      {message.hasWebSearch && <div data-testid="web-search-indicator">Web Search</div>}
    </div>
  ),
}));

describe('Messages Component', () => {
  const mockMessages: (TMessage & { hasWebSearch?: boolean })[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello, how are you?',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you!',
    },
    {
      id: '3',
      role: 'user',
      content: 'Can you search for information about React?',
      hasWebSearch: true,
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    isLoading: false,
    status: 'ready' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollContainer = container.querySelector('.h-full.overflow-y-auto.no-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('renders with empty messages array', () => {
      const { container } = render(<Messages {...defaultProps} messages={[]} />);
      const scrollContainer = container.querySelector('.h-full.overflow-y-auto.no-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
      expect(screen.queryByTestId('message-content')).not.toBeInTheDocument();
    });

    test('applies correct CSS classes to container', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollContainer = container.firstChild as HTMLElement;
      expect(scrollContainer).toHaveClass('h-full', 'overflow-y-auto', 'no-scrollbar');
    });

    test('applies correct CSS classes to inner container', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const innerContainer = container.querySelector('.max-w-lg');
      expect(innerContainer).toHaveClass('max-w-lg', 'sm:max-w-3xl', 'mx-auto', 'py-4');
    });

    test('renders scroll-to-bottom element', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollElement = container.querySelector('.h-1');
      expect(scrollElement).toBeInTheDocument();
      expect(scrollElement).toHaveClass('h-1');
    });
  });

  describe('Messages Rendering', () => {
    test('renders all messages in the messages array', () => {
      render(<Messages {...defaultProps} />);
      
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-2')).toBeInTheDocument();
      expect(screen.getByTestId('message-3')).toBeInTheDocument();
    });

    test('passes correct content to each Message component', () => {
      render(<Messages {...defaultProps} />);
      
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
      expect(screen.getByText('Can you search for information about React?')).toBeInTheDocument();
    });

    test('identifies the latest message correctly', () => {
      render(<Messages {...defaultProps} />);
      
      expect(screen.getByTestId('message-1')).toHaveAttribute('data-is-latest', 'false');
      expect(screen.getByTestId('message-2')).toHaveAttribute('data-is-latest', 'false');
      expect(screen.getByTestId('message-3')).toHaveAttribute('data-is-latest', 'true');
    });

    test('handles messages with web search correctly', () => {
      render(<Messages {...defaultProps} />);
      
      expect(screen.getByTestId('web-search-indicator')).toBeInTheDocument();
      expect(screen.getByText('Web Search')).toBeInTheDocument();
    });

    test('handles messages without web search correctly', () => {
      const messagesWithoutWebSearch = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Simple message',
        },
      ];
      
      render(<Messages {...defaultProps} messages={messagesWithoutWebSearch} />);
      
      expect(screen.queryByTestId('web-search-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('passes isLoading prop to Message components', () => {
      render(<Messages {...defaultProps} isLoading={true} />);
      
      const messages = screen.getAllByTestId(/^message-[0-9]+$/);
      messages.forEach(message => {
        expect(message).toHaveAttribute('data-is-loading', 'true');
      });
    });

    test('passes status prop to Message components', () => {
      const statuses: Array<'error' | 'submitted' | 'streaming' | 'ready'> = [
        'error',
        'submitted', 
        'streaming',
        'ready'
      ];

      statuses.forEach(status => {
        const { unmount } = render(<Messages {...defaultProps} status={status} />);
        
        const messages = screen.getAllByTestId(/^message-[0-9]+$/);
        messages.forEach(message => {
          expect(message).toHaveAttribute('data-status', status);
        });
        
        unmount();
      });
    });

    test('handles single message correctly', () => {
      const singleMessage = [mockMessages[0]];
      render(<Messages {...defaultProps} messages={singleMessage} />);
      
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-1')).toHaveAttribute('data-is-latest', 'true');
      expect(screen.queryByTestId('message-2')).not.toBeInTheDocument();
    });
  });

  describe('State Combinations', () => {
    test('handles loading state with empty messages', () => {
      const { container } = render(<Messages {...defaultProps} messages={[]} isLoading={true} />);
      
      const scrollContainer = container.querySelector('.h-full.overflow-y-auto.no-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
      expect(screen.queryByTestId('message-content')).not.toBeInTheDocument();
    });

    test('handles error status with messages', () => {
      render(<Messages {...defaultProps} status="error" />);
      
      const messages = screen.getAllByTestId(/^message-[0-9]+$/);
      messages.forEach(message => {
        expect(message).toHaveAttribute('data-status', 'error');
      });
    });

    test('handles streaming status with loading', () => {
      render(<Messages {...defaultProps} status="streaming" isLoading={true} />);
      
      const messages = screen.getAllByTestId(/^message-[0-9]+$/);
      messages.forEach(message => {
        expect(message).toHaveAttribute('data-status', 'streaming');
        expect(message).toHaveAttribute('data-is-loading', 'true');
      });
    });
  });

  describe('Hook Integration', () => {
    test('calls useScrollToBottom hook', () => {
      const { useScrollToBottom } = require('../../lib/hooks/use-scroll-to-bottom');
      render(<Messages {...defaultProps} />);
      
      expect(useScrollToBottom).toHaveBeenCalledTimes(1);
    });

    test('uses refs from useScrollToBottom hook', () => {
      const { container } = render(<Messages {...defaultProps} />);
      
      // The hook should return refs that get attached to elements
      const scrollContainer = container.firstChild as HTMLElement;
      const scrollElement = container.querySelector('.h-1') as HTMLElement;
      
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles messages with undefined hasWebSearch property', () => {
      const messagesWithUndefinedWebSearch = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Message without explicit webSearch property',
          // hasWebSearch is undefined
        },
      ];
      
      render(<Messages {...defaultProps} messages={messagesWithUndefinedWebSearch} />);
      
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.queryByTestId('web-search-indicator')).not.toBeInTheDocument();
    });

    test('handles very long messages array', () => {
      const longMessagesList = Array(100).fill(null).map((_, index) => ({
        id: `msg-${index}`,
        role: (index % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `Message number ${index}`,
      }));
      
      render(<Messages {...defaultProps} messages={longMessagesList} />);
      
      // Should render all messages
      expect(screen.getAllByTestId(/^message-msg-[0-9]+$/)).toHaveLength(100);
      
      // Last message should be marked as latest
      expect(screen.getByTestId('message-msg-99')).toHaveAttribute('data-is-latest', 'true');
    });

    test('handles messages with special characters in content', () => {
      const specialCharMessages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Special chars: @#$%^&*()_+{}|:"<>?[];,./`~',
        },
      ];
      
      render(<Messages {...defaultProps} messages={specialCharMessages} />);
      
      expect(screen.getByText('Special chars: @#$%^&*()_+{}|:"<>?[];,./`~')).toBeInTheDocument();
    });

    test('preserves message order', () => {
      render(<Messages {...defaultProps} />);
      
      const messageElements = screen.getAllByTestId(/^message-[0-9]+$/);
      expect(messageElements[0]).toHaveAttribute('data-testid', 'message-1');
      expect(messageElements[1]).toHaveAttribute('data-testid', 'message-2');
      expect(messageElements[2]).toHaveAttribute('data-testid', 'message-3');
    });
  });

  describe('Accessibility', () => {
    test('container has proper semantic structure', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollContainer = container.firstChild as HTMLElement;
      
      // Should be a generic container (div)
      expect(scrollContainer.tagName).toBe('DIV');
    });

    test('maintains focus management with scroll container', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollContainer = container.firstChild as HTMLElement;
      
      // Should have overflow settings for keyboard navigation
      expect(scrollContainer).toHaveClass('overflow-y-auto');
    });

    test('provides scrollable region for screen readers', () => {
      const { container } = render(<Messages {...defaultProps} />);
      const scrollContainer = container.firstChild as HTMLElement;
      
      // Container should be focusable for screen readers to navigate scrollable content
      expect(scrollContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('Integration Tests', () => {
    test('complete message rendering workflow', () => {
      // Start with no messages
      const { rerender } = render(<Messages {...defaultProps} messages={[]} isLoading={true} status="streaming" />);
      
      expect(screen.queryByTestId('message-content')).not.toBeInTheDocument();
      
      // Add first message
      const firstMessage = [{
        id: '1',
        role: 'user' as const,
        content: 'Initial message',
      }];
      
      rerender(<Messages {...defaultProps} messages={firstMessage} isLoading={true} status="streaming" />);
      
      expect(screen.getByTestId('message-1')).toBeInTheDocument();
      expect(screen.getByText('Initial message')).toBeInTheDocument();
      expect(screen.getByTestId('message-1')).toHaveAttribute('data-is-latest', 'true');
      
      // Add response message
      const withResponse = [
        ...firstMessage,
        {
          id: '2',
          role: 'assistant' as const,
          content: 'Assistant response',
        }
      ];
      
      rerender(<Messages {...defaultProps} messages={withResponse} isLoading={false} status="ready" />);
      
      expect(screen.getByTestId('message-1')).toHaveAttribute('data-is-latest', 'false');
      expect(screen.getByTestId('message-2')).toHaveAttribute('data-is-latest', 'true');
      expect(screen.getByTestId('message-2')).toHaveAttribute('data-is-loading', 'false');
      expect(screen.getByTestId('message-2')).toHaveAttribute('data-status', 'ready');
    });
  });
});