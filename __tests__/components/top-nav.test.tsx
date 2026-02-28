/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopNav } from '../../components/top-nav';

// Mock Next.js navigation (pathname '/' = welcome view shows tagline)
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: undefined })),
  usePathname: jest.fn(() => '/'),
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  PlusCircle: ({ className }: { className?: string }) => (
    <svg data-testid="plus-circle-icon" className={className} />
  ),
  Menu: ({ className }: { className?: string }) => (
    <svg data-testid="menu-icon" className={className} />
  ),
  Share: ({ className }: { className?: string }) => (
    <svg data-testid="share-icon" className={className} />
  ),
}));

// Mock UI components with proper prop forwarding
jest.mock('../../components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    variant, 
    size, 
    className, 
    title, 
    'aria-label': ariaLabel,
    ...props 
  }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      title={title}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      data-testid="new-chat-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/sidebar', () => ({
  SidebarTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-trigger">
      {children}
    </div>
  ),
}));

// Mock ChatShareDialog component
jest.mock('../../components/chat-share-dialog', () => ({
  ChatShareDialog: ({ isOpen, onOpenChange, chatId, chatTitle }: any) => 
    isOpen ? (
      <div data-testid="chat-share-dialog">
        <div data-testid="dialog-chat-id">{chatId}</div>
        <div data-testid="dialog-chat-title">{chatTitle}</div>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.location (simplified since we're not testing navigation)
const originalLocation = window.location;

// Simplified mock that prevents JSDOM navigation errors
const mockLocation = {
  href: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  pathname: '/',
  search: '',
  hash: '',
  host: 'localhost',
  hostname: 'localhost',
  origin: 'http://localhost',
  port: '',
  protocol: 'http:',
};

// Set up location mock to prevent navigation errors
beforeAll(() => {
  delete (window as any).location;
  window.location = mockLocation as any;
});

// Restore original location after all tests
afterAll(() => {
  if (originalLocation) {
    delete (window as any).location;
    (window as any).location = originalLocation;
  }
});

describe('TopNav', () => {
  let queryClient: QueryClient;
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
    mockLocation.href = '';
    
    // Setup useParams mock
    mockUseParams = require('next/navigation').useParams;
    mockUseParams.mockReturnValue({ id: undefined });
    
    // Mock fetch to return a successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ title: 'Test Chat' }),
    });
  });

  describe('Basic Rendering and Props', () => {
    test('renders navigation bar with correct structure', () => {
      renderWithProviders(<TopNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('sticky', 'top-0', 'z-50');
    });

    test('renders tagline on welcome view (pathname /)', () => {
      renderWithProviders(<TopNav />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Start a conversation');
      expect(title).toHaveClass('text-3xl', 'font-semibold');
    });

    test('renders ChatLima title on chat view (pathname /chat/[id])', () => {
      const { usePathname } = require('next/navigation');
      (usePathname as jest.Mock).mockReturnValueOnce('/chat/abc123');
      renderWithProviders(<TopNav />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('ChatLima');
    });

    test('renders sidebar trigger with menu icon', () => {
      renderWithProviders(<TopNav />);
      
      const sidebarTrigger = screen.getByTestId('sidebar-trigger');
      expect(sidebarTrigger).toBeInTheDocument();
      
      const menuButton = screen.getByRole('button', { name: /open sidebar/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Open sidebar');
      
      const menuIcon = screen.getByTestId('menu-icon');
      expect(menuIcon).toBeInTheDocument();
      expect(menuIcon).toHaveClass('h-4', 'w-4');
    });

    test('renders new chat button with correct attributes', () => {
      renderWithProviders(<TopNav />);
      
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      expect(newChatButton).toBeInTheDocument();
      expect(newChatButton).toHaveAttribute('aria-label', 'Start new chat');
      expect(newChatButton).toHaveAttribute('title', 'New Chat');
      expect(newChatButton).toHaveAttribute('data-variant', 'ghost');
      expect(newChatButton).toHaveAttribute('data-size', 'icon');
      
      const plusIcon = screen.getByTestId('plus-circle-icon');
      expect(plusIcon).toBeInTheDocument();
      expect(plusIcon).toHaveClass('h-4', 'w-4');
    });

    test('applies correct CSS classes to navigation elements', () => {
      renderWithProviders(<TopNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass(
        'sticky',
        'top-0', 
        'z-50',
        'bg-background/95',
        'backdrop-blur-md',
        'border-b',
        'border-border/40',
        'px-4',
        'py-4',
        'h-[72px]',
        'flex',
        'items-center',
        'relative'
      );
    });
  });

  describe('User Interactions', () => {
    test('new chat button is clickable and does not crash', () => {
      renderWithProviders(<TopNav />);
      
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      
      // Should not crash when clicked (navigation is handled by window.location.href)
      expect(() => fireEvent.click(newChatButton)).not.toThrow();
    });

    test('handles multiple clicks on new chat button without crashing', () => {
      renderWithProviders(<TopNav />);
      
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      
      // Should handle multiple clicks without issues
      expect(() => {
        fireEvent.click(newChatButton);
        fireEvent.click(newChatButton);
        fireEvent.click(newChatButton);
      }).not.toThrow();
    });

    test('sidebar trigger button is clickable', () => {
      renderWithProviders(<TopNav />);
      
      const menuButton = screen.getByRole('button', { name: /open sidebar/i });
      
      // Should not throw error when clicked
      expect(() => fireEvent.click(menuButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes for navigation', () => {
      renderWithProviders(<TopNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('sidebar trigger has accessible name and role', () => {
      renderWithProviders(<TopNav />);
      
      const menuButton = screen.getByRole('button', { name: /open sidebar/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Open sidebar');
    });

    test('new chat button has accessible name and role', () => {
      renderWithProviders(<TopNav />);
      
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      expect(newChatButton).toHaveAttribute('aria-label', 'Start new chat');
      expect(newChatButton).toHaveAttribute('title', 'New Chat');
    });

    test('supports keyboard navigation', () => {
      renderWithProviders(<TopNav />);
      
      const menuButton = screen.getByRole('button', { name: /open sidebar/i });
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      
      // Both buttons should be focusable
      menuButton.focus();
      expect(menuButton).toHaveFocus();
      
      newChatButton.focus();
      expect(newChatButton).toHaveFocus();
    });

    test('has proper heading hierarchy', () => {
      renderWithProviders(<TopNav />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Start a conversation');
    });
  });

  describe('Component Structure', () => {
    test('maintains correct layout structure', () => {
      renderWithProviders(<TopNav />);
      
      const nav = screen.getByRole('navigation');
      const sidebarTrigger = screen.getByTestId('sidebar-trigger');
      const title = screen.getByRole('heading', { level: 1 });
      const newChatButton = screen.getByTestId('new-chat-button');
      
      // All main elements should be present
      expect(nav).toContainElement(sidebarTrigger);
      expect(nav).toContainElement(title);
      expect(nav).toContainElement(newChatButton);
    });

    test('renders icons with correct dimensions', () => {
      renderWithProviders(<TopNav />);
      
      const menuIcon = screen.getByTestId('menu-icon');
      const plusIcon = screen.getByTestId('plus-circle-icon');
      
      expect(menuIcon).toHaveClass('h-4', 'w-4');
      expect(plusIcon).toHaveClass('h-4', 'w-4');
    });
  });

  describe('Error Handling', () => {
    test('handles navigation errors gracefully', () => {
      renderWithProviders(<TopNav />);
      
      // Mock location.href to throw an error when set
      const originalHref = mockLocation.href;
      Object.defineProperty(mockLocation, 'href', {
        get: () => originalHref,
        set: () => {
          throw new Error('Navigation error');
        },
        configurable: true,
      });
      
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      
      // Should not crash the component when navigation fails
      expect(() => fireEvent.click(newChatButton)).not.toThrow();
      
      // Restore original behavior
      Object.defineProperty(mockLocation, 'href', {
        value: '',
        writable: true,
        configurable: true,
      });
    });
  });

  describe('Integration Tests', () => {
    test('complete navigation workflow', () => {
      renderWithProviders(<TopNav />);
      
      // User sees the navigation bar
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Start a conversation')).toBeInTheDocument();
      
      // User can interact with sidebar trigger
      const menuButton = screen.getByRole('button', { name: /open sidebar/i });
      expect(menuButton).toBeEnabled();
      
      // User can start a new chat (navigation is handled by window.location.href)
      const newChatButton = screen.getByRole('button', { name: /start new chat/i });
      expect(() => fireEvent.click(newChatButton)).not.toThrow();
      
      // All interactive elements are accessible and functional
      expect(menuButton).toBeInTheDocument();
      expect(newChatButton).toBeInTheDocument();
    });
  });
});