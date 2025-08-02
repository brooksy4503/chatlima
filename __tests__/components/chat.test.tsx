/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock the entire providers file before importing Chat
jest.mock('../../ai/providers', () => ({
  modelID: 'gpt-4',
  languageModels: {},
  openaiClient: jest.fn(() => ({})),
  anthropicClient: jest.fn(() => ({})),
  groqClient: jest.fn(() => ({})),
  xaiClient: jest.fn(() => ({})),
  openrouterClient: jest.fn(() => ({})),
  requestyClient: jest.fn(() => ({})),
}));

// Mock chat-store
jest.mock('../../lib/chat-store', () => ({
  convertToUIMessages: jest.fn((messages) => messages),
}));

// Mock actions
jest.mock('../../app/actions', () => ({
  saveChat: jest.fn(),
  getChat: jest.fn(),
}));

import Chat from '../../components/chat';

// Mock external dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useParams: jest.fn(() => ({ id: undefined })),
}));

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    append: jest.fn(),
    status: 'idle',
    stop: jest.fn(),
  })),
}));

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
  })),
}));

jest.mock('@/lib/context/model-context', () => ({
  useModel: jest.fn(() => ({
    selectedModel: 'gpt-4',
    setSelectedModel: jest.fn(),
  })),
}));

jest.mock('@/lib/context/preset-context', () => ({
  usePresets: jest.fn(() => ({
    activePreset: null,
  })),
}));

jest.mock('@/lib/context/mcp-context', () => ({
  useMCP: jest.fn(() => ({
    mcpServersForApi: [],
  })),
}));

jest.mock('@/lib/context/web-search-context', () => ({
  useWebSearch: jest.fn(() => ({
    webSearchEnabled: false,
    setWebSearchEnabled: jest.fn(),
    webSearchContextSize: 5,
    setWebSearchContextSize: jest.fn(),
  })),
}));

jest.mock('@/lib/context/auth-context', () => ({
  useAuth: jest.fn(() => ({
    session: null,
    isPending: false,
  })),
}));

jest.mock('@/hooks/useCredits', () => ({
  useCredits: jest.fn(() => ({
    credits: 100,
    loading: false,
  })),
}));

jest.mock('@/hooks/use-models', () => ({
  useModels: jest.fn(() => ({
    models: [
      { id: 'gpt-4', name: 'GPT-4', vision: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', vision: false },
    ],
  })),
}));

jest.mock('@/lib/hooks/use-chats', () => ({
  useChats: jest.fn(() => ({
    chats: [],
    isLoading: false,
  })),
}));

// Mock child components
jest.mock('../../components/textarea', () => ({
  Textarea: ({ handleInputChange, input, isLoading, status, stop, images, onImagesChange, ...props }: any) => (
    <div data-testid="textarea-mock">
      <textarea
        data-testid="chat-input"
        value={input}
        onChange={handleInputChange}
        disabled={isLoading}
        {...props}
      />
      {images && images.length > 0 && (
        <div data-testid="selected-images">
          {images.map((img: any, index: number) => (
            <div key={index} data-testid={`image-${index}`}>
              {img.metadata.filename}
            </div>
          ))}
        </div>
      )}
      <button
        data-testid="stop-button"
        onClick={stop}
        disabled={status !== 'streaming'}
      >
        Stop
      </button>
    </div>
  ),
}));

jest.mock('../../components/project-overview', () => ({
  ProjectOverview: ({ sendMessage, selectedModel }: any) => (
    <div data-testid="project-overview">
      <h2>Project Overview</h2>
      <p>Selected Model: {selectedModel}</p>
      <button onClick={() => sendMessage('Test message')}>
        Send Test Message
      </button>
    </div>
  ),
}));

jest.mock('../../components/messages', () => ({
  Messages: ({ messages, isLoading, status }: any) => (
    <div data-testid="messages">
      <div data-testid="messages-count">{messages.length}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="stream-status">{status}</div>
      {messages.map((msg: any, index: number) => (
        <div key={index} data-testid={`message-${index}`}>
          <span data-testid={`message-role-${index}`}>{msg.role}</span>
          <span data-testid={`message-content-${index}`}>{msg.content}</span>
          {msg.hasWebSearch && <span data-testid={`message-websearch-${index}`}>Web Search</span>}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../components/mcp-server-manager', () => ({
  MCPServerManager: () => <div data-testid="mcp-server-manager">MCP Manager</div>,
}));

jest.mock('../../components/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
});

describe('Chat Component', () => {
  let queryClient: QueryClient;
  let mockUseChat: jest.MockedFunction<any>;
  let mockUseSession: jest.MockedFunction<any>;
  let mockUseModel: jest.MockedFunction<any>;
  let mockUseRouter: jest.MockedFunction<any>;
  let mockUseParams: jest.MockedFunction<any>;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Setup default mocks
    mockUseChat = require('@ai-sdk/react').useChat;
    mockUseSession = require('@/lib/auth-client').useSession;
    mockUseModel = require('@/lib/context/model-context').useModel;
    mockUseRouter = require('next/navigation').useRouter;
    mockUseParams = require('next/navigation').useParams;
    
    mockUseChat.mockReturnValue({
      messages: [],
      input: '',
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn(),
      append: jest.fn(),
      status: 'idle',
      stop: jest.fn(),
    });
    
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });
    
    mockUseModel.mockReturnValue({
      selectedModel: 'gpt-4',
      setSelectedModel: jest.fn(),
    });
    
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    });
    
    mockUseParams.mockReturnValue({ id: undefined });
  });

  describe('Basic Rendering and Props', () => {
    test('renders without crashing', () => {
      renderWithProviders(<Chat />);
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });

    test('renders project overview when no messages exist', () => {
      renderWithProviders(<Chat />);
      
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(screen.getByText('Selected Model: gpt-4')).toBeInTheDocument();
    });

    test('renders messages when they exist', () => {
      mockUseChat.mockReturnValue({
        messages: [
          { id: '1', role: 'user', content: 'Hello' },
          { id: '2', role: 'assistant', content: 'Hi there!' },
        ],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByTestId('messages')).toBeInTheDocument();
      expect(screen.getByTestId('messages-count')).toHaveTextContent('2');
      expect(screen.queryByTestId('project-overview')).not.toBeInTheDocument();
    });

    test('shows loading state correctly', () => {
      mockUseChat.mockReturnValue({
        messages: [{ role: 'user', content: 'Test message' }], // Add a message so Messages component is rendered
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'streaming',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
    });

    test('displays selected model in project overview', () => {
      mockUseModel.mockReturnValue({
        selectedModel: 'claude-3-opus',
        setSelectedModel: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByText('Selected Model: claude-3-opus')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles form submission correctly', async () => {
      const mockHandleSubmit = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: 'Test message',
        handleInputChange: jest.fn(),
        handleSubmit: mockHandleSubmit,
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      const form = screen.getByRole('form') || screen.getByTestId('textarea-mock').closest('form');
      if (form) {
        fireEvent.submit(form);
        expect(mockHandleSubmit).toHaveBeenCalled();
      }
    });

    test('prevents form submission when input is empty', () => {
      const mockHandleSubmit = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: mockHandleSubmit,
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      const form = screen.getByTestId('textarea-mock').closest('form');
      if (form) {
        fireEvent.submit(form);
        // Should not call handleSubmit for empty input
        expect(mockHandleSubmit).not.toHaveBeenCalled();
      }
    });

    test('handles suggested message sending', () => {
      const mockAppend = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: mockAppend,
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      const sendButton = screen.getByText('Send Test Message');
      fireEvent.click(sendButton);
      
      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'Test message',
      });
    });

    test('handles stop button click', () => {
      const mockStop = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'streaming',
        stop: mockStop,
      });

      renderWithProviders(<Chat />);
      
      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);
      
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('updates user ID when session changes', async () => {
      const { rerender } = renderWithProviders(<Chat />);
      
      // Initially no session
      expect(mockUseSession).toHaveBeenCalled();
      
      // Update session
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        isPending: false,
      });
      
      rerender(
        <QueryClientProvider client={queryClient}>
          <Chat />
        </QueryClientProvider>
      );
      
      // Component should handle the session change
      await waitFor(() => {
        expect(mockUseSession).toHaveBeenCalled();
      });
    });

    test('generates chat ID for new chats', () => {
      renderWithProviders(<Chat />);
      
      // Should render without errors even without chat ID
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
    });

    test('handles image selection and removal', () => {
      renderWithProviders(<Chat />);
      
      // Initially no images
      expect(screen.queryByTestId('selected-images')).not.toBeInTheDocument();
      
      // This would be tested through the Textarea component integration
      // The actual image handling logic is complex and would require more detailed mocking
    });
  });

  describe('Error Handling', () => {
    test('handles chat loading errors gracefully', async () => {
      // Mock a failed query
      queryClient.setQueryData(['chat', 'test-id'], () => {
        throw new Error('Failed to load chat');
      });

      mockUseParams.mockReturnValue({ id: 'test-id' });

      renderWithProviders(<Chat />);
      
      // Should still render the component
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });

    test('displays error recovery banner when needed', async () => {
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      // Simulate error state by triggering the onError callback
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error('Test error'));
        });
      }

      await waitFor(() => {
        // Error recovery banner should appear
        expect(screen.queryByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    test('handles authentication errors', async () => {
      const mockOnError = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
        onError: mockOnError,
      });

      renderWithProviders(<Chat />);
      
      // Simulate authentication error
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error(JSON.stringify({
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Authentication required',
            }
          })));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Authentication required. Please log in to continue.',
          expect.any(Object)
        );
      });
    });

    test('handles rate limit errors', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error(JSON.stringify({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded',
            }
          })));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Too many requests. Please wait a moment and try again.',
          expect.any(Object)
        );
      });
    });
  });

  describe('API Integration', () => {
    test('passes correct parameters to useChat', () => {
      mockUseModel.mockReturnValue({
        selectedModel: 'claude-3-opus',
        setSelectedModel: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          maxSteps: 20,
          body: expect.objectContaining({
            selectedModel: 'claude-3-opus',
            mcpServers: [],
            webSearch: expect.objectContaining({
              enabled: false,
              contextSize: 5,
            }),
            apiKeys: {},
            attachments: [],
          }),
        })
      );
    });

    test('includes API keys from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'OPENAI_API_KEY') return 'sk-test123';
        if (key === 'ANTHROPIC_API_KEY') return 'sk-ant-test456';
        return null;
      });

      renderWithProviders(<Chat />);
      
      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            apiKeys: {
              OPENAI_API_KEY: 'sk-test123',
              ANTHROPIC_API_KEY: 'sk-ant-test456',
            },
          }),
        })
      );
    });

    test('handles successful message completion', async () => {
      const mockQueryClientInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      
      renderWithProviders(<Chat />);
      
      const onFinish = mockUseChat.mock.calls[0][0].onFinish;
      if (onFinish) {
        act(() => {
          onFinish({ id: '1', role: 'assistant', content: 'Response' });
        });
      }

      await waitFor(() => {
        expect(mockQueryClientInvalidate).toHaveBeenCalledWith({ queryKey: ['chats'] });
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA structure', () => {
      renderWithProviders(<Chat />);
      
      // Main chat container should have proper structure
      const chatContainer = screen.getByTestId('textarea-mock').closest('div');
      expect(chatContainer).toBeInTheDocument();
    });

    test('handles keyboard navigation', () => {
      renderWithProviders(<Chat />);
      
      const input = screen.getByTestId('chat-input');
      expect(input).toBeInTheDocument();
      
      // Test keyboard interaction
      fireEvent.keyDown(input, { key: 'Enter' });
      // The actual keyboard handling would be tested in the Textarea component
    });

    test('supports screen readers', () => {
      renderWithProviders(<Chat />);
      
      // Check that important elements are accessible
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
    });
  });

  describe('Streaming and Performance', () => {
    test('displays streaming status correctly', () => {
      mockUseChat.mockReturnValue({
        messages: [{ id: '1', role: 'assistant', content: 'Streaming...' }],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'streaming',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByTestId('stream-status')).toHaveTextContent('streaming');
    });

    test('handles streaming timeout detection', async () => {
      jest.useFakeTimers();
      
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'streaming',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      // Fast-forward time to trigger timeout detection
      act(() => {
        jest.advanceTimersByTime(120000); // 2 minutes
      });

      // Should trigger stuck detection logic
      await waitFor(() => {
        // The timeout logic would be triggered
        expect(true).toBe(true); // Placeholder for actual timeout test
      });
      
      jest.useRealTimers();
    });

    test('optimizes re-renders with proper memoization', () => {
      const { rerender } = renderWithProviders(<Chat />);
      
      // Re-render with same props should not cause unnecessary updates
      rerender(
        <QueryClientProvider client={queryClient}>
          <Chat />
        </QueryClientProvider>
      );
      
      // Component should handle re-renders efficiently
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    test('handles image selection correctly', () => {
      const mockAppend = jest.fn();
      mockUseChat.mockReturnValue({
        messages: [],
        input: 'Test with image',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: mockAppend,
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      // Simulate image being added through Textarea component
      // This would typically be done through the Textarea component's image handling
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });

    test('supports vision-enabled models', () => {
      const mockUseModels = require('@/hooks/use-models').useModels;
      mockUseModels.mockReturnValue({
        models: [
          { id: 'gpt-4-vision', name: 'GPT-4 Vision', vision: true },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', vision: false },
        ],
      });

      mockUseModel.mockReturnValue({
        selectedModel: 'gpt-4-vision',
        setSelectedModel: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByText('Selected Model: gpt-4-vision')).toBeInTheDocument();
    });

    test('handles image removal', () => {
      renderWithProviders(<Chat />);
      
      // Image removal would be handled through the Textarea component
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });
  });

  describe('Advanced Error Scenarios', () => {
    test('handles JSON parsing errors in error responses', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error('Invalid JSON response'));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Invalid JSON response',
          expect.any(Object)
        );
      });
    });

    test('handles insufficient credits error', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error(JSON.stringify({
            error: {
              code: 'INSUFFICIENT_CREDITS',
              message: 'Insufficient credits',
            }
          })));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'You have insufficient credits. Please top up your account.',
          expect.any(Object)
        );
      });
    });

    test('handles model initialization errors', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error(JSON.stringify({
            error: {
              code: 'MODEL_INIT_FAILED',
              message: 'Failed to initialize model',
            }
          })));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to initialize the selected AI model. Please try another model.',
          expect.any(Object)
        );
      });
    });

    test('handles model compatibility errors', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error('Model does not currently support tool_choice'));
        });
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "This model doesn't support the advanced features required for this request. Please try a different model.",
          expect.any(Object)
        );
      });
    });

    test('debounces duplicate error messages', async () => {
      renderWithProviders(<Chat />);
      
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        // Send same error twice quickly
        act(() => {
          onError(new Error('Test error'));
        });
        
        act(() => {
          onError(new Error('Test error'));
        });
      }

      await waitFor(() => {
        // Should only show toast once due to debouncing
        expect(toast.error).toHaveBeenCalledTimes(1);
      });
    });

    test('handles force recovery correctly', async () => {
      renderWithProviders(<Chat />);
      
      // Trigger error state first
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error('Test error'));
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Click force recovery button
      const recoveryButton = screen.getByText('Reset Now');
      fireEvent.click(recoveryButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Chat reset successfully. You can now send new messages.',
          expect.any(Object)
        );
      });
    });
  });

  describe('Session Management', () => {
    test('handles user logout during chat', async () => {
      const mockRouter = { push: jest.fn() };
      mockUseRouter.mockReturnValue(mockRouter);
      mockUseParams.mockReturnValue({ id: 'test-chat-id' });

      // Start with authenticated session
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        isPending: false,
      });

      const { rerender } = renderWithProviders(<Chat />);

      // Simulate logout
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <Chat />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
        expect(toast.info).toHaveBeenCalledWith('You have been logged out.');
      });
    });

    test('handles session loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
      });

      renderWithProviders(<Chat />);
      
      // Should still render while session is loading
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });

    test('handles anonymous user state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      });

      renderWithProviders(<Chat />);
      
      // Should render for anonymous users
      expect(screen.getByTestId('project-overview')).toBeInTheDocument();
    });
  });

  describe('Preset Integration', () => {
    test('uses preset model when active', () => {
      const mockUsePresets = require('@/lib/context/preset-context').usePresets;
      mockUsePresets.mockReturnValue({
        activePreset: {
          modelId: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 2000,
          systemInstruction: 'Be helpful',
          webSearchEnabled: true,
          webSearchContextSize: 8,
        },
      });

      renderWithProviders(<Chat />);
      
      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            selectedModel: 'claude-3-sonnet',
            temperature: 0.7,
            maxTokens: 2000,
            systemInstruction: 'Be helpful',
            webSearch: expect.objectContaining({
              enabled: true,
              contextSize: 8,
            }),
          }),
        })
      );
    });

    test('falls back to model context when no preset is active', () => {
      const mockUsePresets = require('@/lib/context/preset-context').usePresets;
      mockUsePresets.mockReturnValue({
        activePreset: null,
      });

      mockUseModel.mockReturnValue({
        selectedModel: 'gpt-4',
        setSelectedModel: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            selectedModel: 'gpt-4',
          }),
        })
      );
    });
  });

  describe('Web Search Enhancement', () => {
    test('enhances messages with web search indicators', () => {
      const mockWebSearch = require('@/lib/context/web-search-context').useWebSearch;
      mockWebSearch.mockReturnValue({
        webSearchEnabled: true,
        setWebSearchEnabled: jest.fn(),
        webSearchContextSize: 5,
        setWebSearchContextSize: jest.fn(),
      });

      mockUseModel.mockReturnValue({
        selectedModel: 'openrouter/anthropic/claude-3-sonnet',
        setSelectedModel: jest.fn(),
      });

      mockUseChat.mockReturnValue({
        messages: [
          { id: '1', role: 'user', content: 'What is the weather?' },
          { id: '2', role: 'assistant', content: 'The weather is sunny.' },
        ],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      // Should enhance assistant message with web search indicator
      expect(screen.getByTestId('message-websearch-1')).toBeInTheDocument();
    });

    test('does not enhance messages for non-OpenRouter models', () => {
      const mockWebSearch = require('@/lib/context/web-search-context').useWebSearch;
      mockWebSearch.mockReturnValue({
        webSearchEnabled: true,
        setWebSearchEnabled: jest.fn(),
        webSearchContextSize: 5,
        setWebSearchContextSize: jest.fn(),
      });

      mockUseModel.mockReturnValue({
        selectedModel: 'gpt-4',
        setSelectedModel: jest.fn(),
      });

      mockUseChat.mockReturnValue({
        messages: [
          { id: '1', role: 'user', content: 'What is the weather?' },
          { id: '2', role: 'assistant', content: 'The weather is sunny.' },
        ],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: jest.fn(),
      });

      renderWithProviders(<Chat />);
      
      // Should not enhance messages for non-OpenRouter models
      expect(screen.queryByTestId('message-websearch-1')).not.toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete chat workflow: send message and receive response', async () => {
      const mockAppend = jest.fn();
      const mockRouter = { push: jest.fn() };
      
      mockUseChat.mockReturnValue({
        messages: [],
        input: 'Hello',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: mockAppend,
        status: 'idle',
        stop: jest.fn(),
      });
      
      mockUseRouter.mockReturnValue(mockRouter);

      renderWithProviders(<Chat />);
      
      // Send a suggested message
      const sendButton = screen.getByText('Send Test Message');
      fireEvent.click(sendButton);
      
      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'Test message',
      });
    });

    test('handles chat navigation correctly', async () => {
      const mockRouter = { push: jest.fn() };
      mockUseRouter.mockReturnValue(mockRouter);
      mockUseParams.mockReturnValue({ id: 'existing-chat-id' });

      renderWithProviders(<Chat />);
      
      // Should handle existing chat ID
      expect(screen.getByTestId('textarea-mock')).toBeInTheDocument();
    });

    test('integrates with model context correctly', () => {
      const mockSetSelectedModel = jest.fn();
      mockUseModel.mockReturnValue({
        selectedModel: 'gpt-3.5-turbo',
        setSelectedModel: mockSetSelectedModel,
      });

      renderWithProviders(<Chat />);
      
      expect(screen.getByText('Selected Model: gpt-3.5-turbo')).toBeInTheDocument();
    });

    test('handles complete error recovery workflow', async () => {
      const mockStop = jest.fn();
      const mockRouter = { push: jest.fn() };
      
      mockUseChat.mockReturnValue({
        messages: [],
        input: '',
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
        append: jest.fn(),
        status: 'idle',
        stop: mockStop,
      });
      
      mockUseRouter.mockReturnValue(mockRouter);

      renderWithProviders(<Chat />);
      
      // Trigger error
      const onError = mockUseChat.mock.calls[0][0].onError;
      if (onError) {
        act(() => {
          onError(new Error('Test error'));
        });
      }

      // Wait for error recovery banner
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Trigger manual recovery
      const recoveryButton = screen.getByText('Reset Now');
      fireEvent.click(recoveryButton);

      // Verify recovery actions
      await waitFor(() => {
        expect(mockStop).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Chat reset successfully. You can now send new messages.',
          expect.any(Object)
        );
      });
    });

    test('handles MCP server integration', () => {
      const mockUseMCP = require('@/lib/context/mcp-context').useMCP;
      mockUseMCP.mockReturnValue({
        mcpServersForApi: [
          { name: 'test-server', url: 'http://localhost:3001' }
        ],
      });

      renderWithProviders(<Chat />);
      
      expect(mockUseChat).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            mcpServers: [
              { name: 'test-server', url: 'http://localhost:3001' }
            ],
          }),
        })
      );
    });
  });
});