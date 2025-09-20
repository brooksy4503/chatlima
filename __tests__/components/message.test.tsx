/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Message, ReasoningMessagePart } from '../../components/message';
import type { Message as TMessage } from 'ai';

// Mock external dependencies
jest.mock('../../components/markdown', () => ({
  Markdown: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

jest.mock('../../components/copy-button', () => ({
  CopyButton: ({ text, className, ...props }: any) => (
    <button 
      data-testid="copy-button" 
      className={className}
      data-text={text}
      {...props}
    >
      Copy
    </button>
  ),
}));

jest.mock('../../components/citation', () => ({
  Citations: ({ citations }: any) => (
    <div data-testid="citations">
      {citations.map((citation: any, i: number) => (
        <span key={i} data-testid={`citation-${i}`}>
          {citation.title}
        </span>
      ))}
    </div>
  ),
}));

jest.mock('../../components/tool-invocation', () => ({
  ToolInvocation: ({ toolName, state, args, result, isLatestMessage, status }: any) => (
    <div 
      data-testid="tool-invocation"
      data-tool-name={toolName}
      data-state={state}
      data-is-latest={isLatestMessage}
      data-status={status}
    >
      Tool: {toolName} ({state})
    </div>
  ),
}));

jest.mock('../../components/web-search-suggestion', () => ({
  WebSearchSuggestion: ({ messageId, hasWebSearchResults }: any) => (
    <div 
      data-testid="web-search-suggestion"
      data-message-id={messageId}
      data-has-results={hasWebSearchResults}
    >
      Web Search Suggestion
    </div>
  ),
}));

jest.mock('../../components/image-modal', () => ({
  ImageModal: ({ isOpen, onClose, imageUrl, metadata, detail }: any) => (
    <div 
      data-testid="image-modal"
      data-is-open={isOpen}
      data-image-url={imageUrl}
      onClick={onClose}
    >
      Image Modal
      {metadata && <div data-testid="modal-metadata">{metadata.filename}</div>}
      {detail && <div data-testid="modal-detail">{detail}</div>}
    </div>
  ),
}));

jest.mock('../../components/icons', () => ({
  SpinnerIcon: () => <div data-testid="spinner-icon">Spinner</div>,
}));

jest.mock('../../components/token-metrics/MessageTokenMetrics', () => ({
  CompactMessageTokenMetrics: ({ messageId, isLatestMessage }: any) => (
    <div data-testid="compact-token-metrics" data-message-id={messageId} data-is-latest={isLatestMessage}>
      Compact Token Metrics
    </div>
  ),
  StreamingTokenMetrics: ({ messageId, isLatestMessage, isStreaming }: any) => (
    <div data-testid="streaming-token-metrics" data-message-id={messageId} data-is-latest={isLatestMessage} data-is-streaming={isStreaming}>
      Streaming Token Metrics
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className }: any) => <div className={className} data-testid="chevron-down">↓</div>,
  ChevronUpIcon: ({ className }: any) => <div className={className} data-testid="chevron-up">↑</div>,
  LightbulbIcon: ({ className }: any) => <div className={className} data-testid="lightbulb">💡</div>,
  BrainIcon: ({ className }: any) => <div className={className} data-testid="brain">🧠</div>,
}));

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, initial, animate, exit, transition, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/image-utils', () => ({
  formatFileSize: (size: number) => `${(size / 1024).toFixed(1)}KB`,
}));

describe('Message', () => {
  // Test data
  const baseMessage: TMessage = {
    id: 'test-message-1',
    role: 'assistant',
    content: 'Test message content',
    createdAt: new Date(),
  };

  const textPart = {
    type: 'text' as const,
    text: 'Hello world',
  };

  const textPartWithCitations = {
    type: 'text' as const,
    text: 'Hello with citations',
    citations: [
      { title: 'Source 1', url: 'https://example.com/1', startIndex: 0, endIndex: 10 },
      { title: 'Source 2', url: 'https://example.com/2', startIndex: 11, endIndex: 20 },
    ],
  };

  const toolInvocationPart = {
    type: 'tool-invocation' as const,
    toolInvocation: {
      toolCallId: 'test-tool-call-1',
      toolName: 'web_search',
      state: 'result' as const,
      args: { query: 'test query' },
      result: { results: [] },
    },
  };

  const imagePart = {
    type: 'file' as const,
    data: 'data:image/png;base64,test-image-data',
    mimeType: 'image/png',
    metadata: {
      filename: 'test-image.png',
      size: 2048,
      width: 100,
      height: 100,
    },
  };

  const reasoningPart = {
    type: 'reasoning' as const,
    reasoning: 'Combined reasoning text',
    details: [
      { type: 'text' as const, text: 'First thought process' },
      { type: 'text' as const, text: 'Second thought process' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering and Props', () => {
    test('renders assistant message with text content', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByTestId('markdown')).toHaveTextContent('Hello world');
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    test('renders user message with different styling', () => {
      const message = {
        ...baseMessage,
        role: 'user' as const,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const messageElement = screen.getByTestId('markdown').closest('[data-role="user"]');
      expect(messageElement).toBeInTheDocument();
    });

    test('renders without parts array', () => {
      const message = {
        ...baseMessage,
        parts: undefined,
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });

    test('renders with empty parts array', () => {
      const message = {
        ...baseMessage,
        parts: [],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });

    test('handles different message statuses', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      const { rerender } = render(
        <Message 
          message={message}
          isLoading={false}
          status="streaming"
          isLatestMessage={true}
        />
      );

      // Copy button should not show when streaming latest message
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();

      rerender(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={true}
        />
      );

      // Copy button should show when ready
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });
  });

  describe('Message Parts Rendering', () => {
    test('renders text parts with citations', () => {
      const message = {
        ...baseMessage,
        parts: [textPartWithCitations],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('markdown')).toHaveTextContent('Hello with citations');
      expect(screen.getByTestId('citations')).toBeInTheDocument();
      expect(screen.getByTestId('citation-0')).toHaveTextContent('Source 1');
      expect(screen.getByTestId('citation-1')).toHaveTextContent('Source 2');
    });

    test('renders tool invocation parts', () => {
      const message = {
        ...baseMessage,
        parts: [toolInvocationPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const toolInvocation = screen.getByTestId('tool-invocation');
      expect(toolInvocation).toBeInTheDocument();
      expect(toolInvocation).toHaveAttribute('data-tool-name', 'web_search');
      expect(toolInvocation).toHaveAttribute('data-state', 'result');
      expect(toolInvocation).toHaveTextContent('Tool: web_search (result)');
    });

    test('renders image parts with metadata', () => {
      const message = {
        ...baseMessage,
        parts: [imagePart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'data:image/png;base64,test-image-data');
      expect(image).toHaveAttribute('alt', 'test-image.png');

      // Check metadata display - target the specific metadata div
      const metadataElement = screen.getByText((content, element) => {
        return element?.classList?.contains('text-xs') && 
               element?.textContent?.includes('test-image.png') || false;
      });
      expect(metadataElement).toBeInTheDocument();
      expect(metadataElement.textContent).toContain('test-image.png');
      expect(metadataElement.textContent).toContain('2.0KB');
      expect(metadataElement.textContent).toContain('100×100');
      expect(metadataElement.textContent).toContain('high quality');
    });

    test('renders reasoning parts when not actively reasoning', () => {
      const message = {
        ...baseMessage,
        parts: [reasoningPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByRole('button', { name: /reasoning/i })).toBeInTheDocument();
      expect(screen.getByText(/click to view/i)).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    });

    test('renders multiple parts in correct order', () => {
      const message = {
        ...baseMessage,
        parts: [textPart, toolInvocationPart, reasoningPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByTestId('tool-invocation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reasoning/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('copy button copies message text', () => {
      const message = {
        ...baseMessage,
        parts: [textPart, { type: 'text' as const, text: 'Second part' }],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toHaveAttribute('data-text', 'Hello world\n\nSecond part');
    });

    test('image click opens modal', () => {
      const message = {
        ...baseMessage,
        parts: [imagePart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const image = screen.getByRole('img');
      fireEvent.click(image);

      const modal = screen.getByTestId('image-modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('data-is-open', 'true');
      expect(modal).toHaveAttribute('data-image-url', 'data:image/png;base64,test-image-data');
      expect(screen.getByTestId('modal-metadata')).toHaveTextContent('test-image.png');
      expect(screen.getByTestId('modal-detail')).toHaveTextContent('high');
    });

    test('image modal can be closed', () => {
      const message = {
        ...baseMessage,
        parts: [imagePart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      // Open modal
      fireEvent.click(screen.getByRole('img'));
      expect(screen.getByTestId('image-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('image-modal'));
      expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument();
    });

    test('copy button appears in correct position for user messages', () => {
      const message = {
        ...baseMessage,
        role: 'user' as const,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveClass('ml-auto');
    });
  });

  describe('Web Search Integration', () => {
    test('displays web search suggestion when message has web search results', () => {
      const message = {
        ...baseMessage,
        hasWebSearch: true,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const webSearchSuggestion = screen.getByTestId('web-search-suggestion');
      expect(webSearchSuggestion).toBeInTheDocument();
      expect(webSearchSuggestion).toHaveAttribute('data-message-id', 'test-message-1');
      expect(webSearchSuggestion).toHaveAttribute('data-has-results', 'true');
    });

    test('detects web search results from tool invocation', () => {
      const message = {
        ...baseMessage,
        parts: [toolInvocationPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('web-search-suggestion')).toBeInTheDocument();
    });

    test('detects web search results from citations', () => {
      const message = {
        ...baseMessage,
        parts: [textPartWithCitations],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('web-search-suggestion')).toBeInTheDocument();
    });

    test('does not show web search suggestion when streaming', () => {
      const message = {
        ...baseMessage,
        hasWebSearch: true,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="streaming"
          isLatestMessage={true}
        />
      );

      expect(screen.queryByTestId('web-search-suggestion')).not.toBeInTheDocument();
    });

    test('does not show web search suggestion for user messages', () => {
      const message = {
        ...baseMessage,
        role: 'user' as const,
        hasWebSearch: true,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.queryByTestId('web-search-suggestion')).not.toBeInTheDocument();
    });
  });

  describe('Copy Button Visibility Logic', () => {
    test('shows copy button for assistant messages when not streaming', () => {
      const message = {
        ...baseMessage,
        role: 'assistant' as const,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    test('shows copy button for user messages when not streaming', () => {
      const message = {
        ...baseMessage,
        role: 'user' as const,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    test('hides copy button when streaming latest message', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="streaming"
          isLatestMessage={true}
        />
      );

      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
    });

    test('shows copy button when streaming non-latest message', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="streaming"
          isLatestMessage={false}
        />
      );

      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing image metadata gracefully', () => {
      const imagePartWithoutMetadata = {
        type: 'file' as const,
        data: 'data:image/png;base64,test-image-data',
        mimeType: 'image/png',
      };

      const message = {
        ...baseMessage,
        parts: [imagePartWithoutMetadata],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Uploaded image');
    });

    test('handles unknown part types gracefully', () => {
      const unknownPart = {
        type: 'unknown' as any,
        data: 'some data',
      };

      const message = {
        ...baseMessage,
        parts: [textPart, unknownPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      // Should still render the text part
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      // Unknown part should not cause crashes
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    test('handles empty text in getMessageText', () => {
      const message = {
        ...baseMessage,
        parts: [toolInvocationPart], // No text parts
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toHaveAttribute('data-text', '');
    });
  });

  describe('Accessibility', () => {
    test('has proper alt text for images', () => {
      const message = {
        ...baseMessage,
        parts: [imagePart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'test-image.png');
    });

    test('provides fallback alt text for images without filename', () => {
      const imagePartNoFilename = {
        ...imagePart,
        metadata: undefined,
      };

      const message = {
        ...baseMessage,
        parts: [imagePartNoFilename],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Uploaded image');
    });

    test('reasoning button has accessible text', () => {
      const message = {
        ...baseMessage,
        parts: [reasoningPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const reasoningButton = screen.getByRole('button', { name: /reasoning/i });
      expect(reasoningButton).toBeInTheDocument();
      expect(reasoningButton).toHaveTextContent('click to view');
    });

    test('copy button is accessible', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy');
    });
  });

  describe('Integration Tests', () => {
    test('complete message with all part types renders correctly', () => {
      const message = {
        ...baseMessage,
        hasWebSearch: true,
        parts: [textPartWithCitations, toolInvocationPart, imagePart, reasoningPart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      // All parts should be rendered
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByTestId('citations')).toBeInTheDocument();
      expect(screen.getByTestId('tool-invocation')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reasoning/i })).toBeInTheDocument();

      // Web search suggestion should be shown
      expect(screen.getByTestId('web-search-suggestion')).toBeInTheDocument();

      // Copy button should be present
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    test('user workflow: view image, open modal, close modal', () => {
      const message = {
        ...baseMessage,
        parts: [imagePart],
      };

      render(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={false}
        />
      );

      // Initial state - no modal
      expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument();

      // Click image to open modal
      fireEvent.click(screen.getByRole('img'));
      expect(screen.getByTestId('image-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('image-modal'));
      expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument();
    });

    test('message state changes from streaming to ready', () => {
      const message = {
        ...baseMessage,
        parts: [textPart],
      };

      const { rerender } = render(
        <Message 
          message={message}
          isLoading={true}
          status="streaming"
          isLatestMessage={true}
        />
      );

      // No copy button when streaming
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();

      rerender(
        <Message 
          message={message}
          isLoading={false}
          status="ready"
          isLatestMessage={true}
        />
      );

      // Copy button appears when ready
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });
  });
});

describe('ReasoningMessagePart', () => {
  const reasoningPart = {
    type: 'reasoning' as const,
    reasoning: 'Combined reasoning text',
    details: [
      { type: 'text' as const, text: 'First reasoning step' },
      { type: 'text' as const, text: 'Second reasoning step' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders in thinking state when isReasoning is true', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={true} />);

      expect(screen.getByText('Thinking...')).toBeInTheDocument();
      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('renders as expandable button when isReasoning is false', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      expect(screen.getByRole('button', { name: /reasoning/i })).toBeInTheDocument();
      expect(screen.getByTestId('lightbulb')).toBeInTheDocument();
      expect(screen.getByText(/click to view/i)).toBeInTheDocument();
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('toggles expanded state when button is clicked', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      
      // Initially collapsed
      expect(screen.getByText(/click to view/i)).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();

      // Click to expand
      fireEvent.click(button);
      expect(screen.getByText(/click to hide/i)).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(button);
      expect(screen.getByText(/click to view/i)).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    });

    test('expands when transitioning from thinking to complete', () => {
      const { rerender } = render(
        <ReasoningMessagePart part={reasoningPart} isReasoning={true} />
      );

      // Initially in thinking state
      expect(screen.getByText('Thinking...')).toBeInTheDocument();

      // Transition to complete state
      rerender(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      // Should show expanded content
      expect(screen.getByRole('button', { name: /reasoning/i })).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    test('renders reasoning details when expanded', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      fireEvent.click(button);

      expect(screen.getByText("The assistant's thought process:")).toBeInTheDocument();
      
      const markdownElements = screen.getAllByTestId('markdown');
      expect(markdownElements).toHaveLength(2);
      expect(markdownElements[0]).toHaveTextContent('First reasoning step');
      expect(markdownElements[1]).toHaveTextContent('Second reasoning step');
    });

    test('handles empty details array', () => {
      const emptyReasoningPart = {
        type: 'reasoning' as const,
        reasoning: 'Empty reasoning',
        details: [],
      };

      render(<ReasoningMessagePart part={emptyReasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      fireEvent.click(button);

      expect(screen.getByText("The assistant's thought process:")).toBeInTheDocument();
      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });

    test('handles non-text detail types', () => {
      const mixedReasoningPart = {
        type: 'reasoning' as const,
        reasoning: 'Mixed reasoning content',
        details: [
          { type: 'text' as const, text: 'Text detail' },
          { type: 'other' as any, data: 'some data' },
        ],
      };

      render(<ReasoningMessagePart part={mixedReasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      fireEvent.click(button);

      expect(screen.getByTestId('markdown')).toHaveTextContent('Text detail');
      expect(screen.getByText('<redacted>')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('button has proper accessibility attributes', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Reasoning');
      expect(button).toHaveTextContent('click to view');
    });

    test('thinking state has proper visual indicators', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={true} />);

      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });

    test('expanded content is properly structured', () => {
      render(<ReasoningMessagePart part={reasoningPart} isReasoning={false} />);

      const button = screen.getByRole('button', { name: /reasoning/i });
      fireEvent.click(button);

      const thoughtProcessLabel = screen.getByText("The assistant's thought process:");
      expect(thoughtProcessLabel).toBeInTheDocument();
      
      const markdownElements = screen.getAllByTestId('markdown');
      markdownElements.forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});