import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Message } from '@/components/message';
import type { WebSearchCitation } from '@/lib/types';

// Mock the Citations component
jest.mock('@/components/citations', () => ({
  Citations: ({ citations, source }: { citations: WebSearchCitation[]; source?: string }) => (
    <div data-testid="citations">
      <span>{citations.length} citations</span>
      {source && <span>{source}</span>}
    </div>
  )
}));

// Mock the Markdown component
jest.mock('@/components/markdown', () => ({
  Markdown: ({ children }: { children: string }) => <div>{children}</div>
}));

// Mock the WebSearchSuggestion component to avoid context issues
jest.mock('@/components/web-search-suggestion', () => ({
  WebSearchSuggestion: () => null
}));

describe('Message Component with Citations', () => {
  const mockCitations: WebSearchCitation[] = [
    {
      url: 'https://example.com/article1',
      title: 'Example Article 1',
      content: 'Article content',
      startIndex: 0,
      endIndex: 10,
      source: 'openrouter'
    }
  ];

  it('renders citations when present in text part', () => {
    const message = {
      id: 'test-message',
      role: 'assistant' as const,
      content: 'This is a test message with citations.',
      parts: [
        {
          type: 'text' as const,
          text: 'This is a test message with citations.',
          citations: mockCitations
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    expect(screen.getByTestId('citations')).toBeInTheDocument();
    expect(screen.getByText('1 citations')).toBeInTheDocument();
    expect(screen.getByText('openrouter')).toBeInTheDocument();
  });

  it('does not render citations when not present', () => {
    const message = {
      id: 'test-message',
      role: 'assistant' as const,
      content: 'This is a test message without citations.',
      parts: [
        {
          type: 'text' as const,
          text: 'This is a test message without citations.'
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    expect(screen.queryByTestId('citations')).not.toBeInTheDocument();
  });

  it('does not render citations for empty citations array', () => {
    const message = {
      id: 'test-message',
      role: 'assistant' as const,
      content: 'This is a test message with empty citations.',
      parts: [
        {
          type: 'text' as const,
          text: 'This is a test message with empty citations.',
          citations: []
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    expect(screen.queryByTestId('citations')).not.toBeInTheDocument();
  });

  it('renders citations for user messages when present', () => {
    const message = {
      id: 'test-message',
      role: 'user' as const,
      content: 'User message with citations.',
      parts: [
        {
          type: 'text' as const,
          text: 'User message with citations.',
          citations: mockCitations
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    expect(screen.getByTestId('citations')).toBeInTheDocument();
  });

  it('handles multiple text parts with different citation sources', () => {
    const openaiCitations: WebSearchCitation[] = [
      {
        url: 'https://example.com/openai-article',
        title: 'OpenAI Article',
        content: 'OpenAI content',
        startIndex: 0,
        endIndex: 10,
        source: 'openai'
      }
    ];

    const message = {
      id: 'test-message',
      role: 'assistant' as const,
      content: 'Message with multiple parts.',
      parts: [
        {
          type: 'text' as const,
          text: 'First part with OpenRouter citations.',
          citations: mockCitations
        },
        {
          type: 'text' as const,
          text: 'Second part with OpenAI citations.',
          citations: openaiCitations
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    const citationsElements = screen.getAllByTestId('citations');
    expect(citationsElements).toHaveLength(2);
    expect(screen.getByText('openrouter')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
  });

  it('handles non-text parts without citations', () => {
    const message = {
      id: 'test-message',
      role: 'assistant' as const,
      content: 'Message with mixed parts.',
      parts: [
        {
          type: 'text' as const,
          text: 'Text part with citations.',
          citations: mockCitations
        },
        {
          type: 'tool-invocation' as const,
          toolInvocation: {
            toolName: 'web_search',
            state: 'result' as const,
            args: {},
            result: 'Search completed'
          }
        }
      ]
    };

    render(<Message message={message} isLoading={false} status="ready" isLatestMessage={false} />);

    expect(screen.getByTestId('citations')).toBeInTheDocument();
  });
});
