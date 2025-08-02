/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { ChatSidebar } from '../../components/chat-sidebar';
import { useSession } from '@/lib/auth-client';
import { useChats } from '@/lib/hooks/use-chats';
import { useMCP } from '@/lib/context/mcp-context';
import { useWebSearch } from '@/lib/context/web-search-context';
import { useClientMount } from '@/lib/hooks/use-client-mount';
import { useSidebar } from '@/components/ui/sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/auth-context';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@/lib/hooks/use-chats', () => ({
  useChats: jest.fn(),
}));

jest.mock('@/lib/context/mcp-context', () => ({
  useMCP: jest.fn(),
}));

jest.mock('@/lib/context/web-search-context', () => ({
  useWebSearch: jest.fn(),
}));

jest.mock('@/lib/hooks/use-client-mount', () => ({
  useClientMount: jest.fn(),
}));

jest.mock('@/lib/context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, className, collapsible }: any) => (
    <div data-testid="sidebar" className={className} data-collapsible={collapsible}>
      {children}
    </div>
  ),
  SidebarContent: ({ children, className }: any) => (
    <div data-testid="sidebar-content" className={className}>
      {children}
    </div>
  ),
  SidebarFooter: ({ children, className }: any) => (
    <div data-testid="sidebar-footer" className={className}>
      {children}
    </div>
  ),
  SidebarHeader: ({ children, className }: any) => (
    <div data-testid="sidebar-header" className={className}>
      {children}
    </div>
  ),
  SidebarGroup: ({ children, className }: any) => (
    <div data-testid="sidebar-group" className={className}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children, className }: any) => (
    <div data-testid="sidebar-group-content" className={className}>
      {children}
    </div>
  ),
  SidebarGroupLabel: ({ children, className }: any) => (
    <div data-testid="sidebar-group-label" className={className}>
      {children}
    </div>
  ),
  SidebarMenu: ({ children }: any) => (
    <div data-testid="sidebar-menu">
      {children}
    </div>
  ),
  SidebarMenuItem: ({ children, className }: any) => (
    <div data-testid="sidebar-menu-item" className={className}>
      {children}
    </div>
  ),
  SidebarMenuButton: ({ children, onClick, className, tooltip }: any) => (
    <button 
      data-testid="sidebar-menu-button" 
      onClick={onClick} 
      className={className}
      title={tooltip}
    >
      {children}
    </button>
  ),
  SidebarMenuBadge: ({ children, className }: any) => (
    <span data-testid="sidebar-menu-badge" className={className}>
      {children}
    </span>
  ),
  useSidebar: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock UI components
jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) => (
    <div data-testid="separator" className={className} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span 
      data-testid="badge" 
      data-variant={variant}
      className={className}
    >
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align, side, sideOffset, className }: any) => (
    <div 
      data-testid="dropdown-menu-content" 
      data-align={align}
      data-side={side}
      data-side-offset={sideOffset}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuGroup: ({ children }: any) => <div data-testid="dropdown-menu-group">{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div 
      data-testid="dropdown-menu-item" 
      onClick={onClick}
      className={className}
      role="menuitem"
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children, className }: any) => (
    <div data-testid="dropdown-menu-label" className={className}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-menu-separator" />,
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-menu-trigger">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({ children, className }: any) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children, side, sideOffset }: any) => (
    <div data-testid="tooltip-content" data-side={side} data-side-offset={sideOffset}>
      {children}
    </div>
  ),
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger">
      {children}
    </div>
  ),
}));

// Mock child components
jest.mock('../../components/mcp-server-manager', () => ({
  MCPServerManager: ({ open, onOpenChange, servers, onServersChange, selectedServers, onSelectedServersChange }: any) => (
    <div 
      data-testid="mcp-server-manager" 
      data-open={open}
    >
      MCP Server Manager
    </div>
  ),
}));

jest.mock('../../components/api-key-manager', () => ({
  ApiKeyManager: ({ open, onOpenChange }: any) => (
    <div 
      data-testid="api-key-manager" 
      data-open={open}
    >
      API Key Manager
    </div>
  ),
}));

jest.mock('../../components/theme-toggle', () => ({
  ThemeToggle: ({ className, showLabel }: any) => (
    <button 
      data-testid="theme-toggle" 
      className={className}
      data-show-label={showLabel}
    >
      Theme Toggle
    </button>
  ),
}));

jest.mock('../../components/provider-health-dashboard', () => ({
  ProviderHealthDashboard: ({ dialogMode, compact, showRefreshButton }: any) => (
    <div 
      data-testid="provider-health-dashboard"
      data-dialog-mode={dialogMode}
      data-compact={compact}
      data-show-refresh-button={showRefreshButton}
    >
      Provider Health Dashboard
    </div>
  ),
}));

jest.mock('../../components/auth/SignInButton', () => ({
  SignInButton: ({ isCollapsed }: any) => (
    <button 
      data-testid="sign-in-button"
      data-collapsed={isCollapsed}
    >
      Sign In
    </button>
  ),
}));

jest.mock('../../components/auth/UserAccountMenu', () => ({
  UserAccountMenu: () => (
    <div data-testid="user-account-menu">
      User Account Menu
    </div>
  ),
}));

jest.mock('../../components/chat-list', () => ({
  ChatList: ({ chats, isLoading, isCollapsed, isUpdatingChatTitle, onNewChat, onDeleteChat, onUpdateChatTitle, onNavigateToChat }: any) => (
    <div 
      data-testid="chat-list"
      data-loading={isLoading}
      data-collapsed={isCollapsed}
      data-updating-title={isUpdatingChatTitle}
    >
      <button data-testid="new-chat-button" onClick={onNewChat}>New Chat</button>
      {chats.map((chat: any) => (
        <div key={chat.id} data-testid={`chat-item-${chat.id}`}>
          <span>{chat.title}</span>
          <button 
            data-testid={`delete-chat-${chat.id}`}
            onClick={(e) => onDeleteChat(chat.id, e)}
          >
            Delete
          </button>
          <button 
            data-testid={`navigate-chat-${chat.id}`}
            onClick={() => onNavigateToChat(chat.id)}
          >
            Navigate
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }: any) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        className={className}
        data-testid="next-image"
      />
    );
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children, className, target, rel }: any) {
    return (
      <a 
        href={href} 
        className={className}
        target={target}
        rel={rel}
        data-testid="next-link"
      >
        {children}
      </a>
    );
  };
});

describe('ChatSidebar', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockQueryClient = {
    invalidateQueries: jest.fn(),
  };

  const defaultMocks = {
    useRouter: mockRouter,
    usePathname: '/',
    useSession: {
      data: null,
      isPending: false,
    },
    useAuth: {
      session: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          isAnonymous: true,
        },
      },
      isPending: false,
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: true,
        hasSubscription: false,
        messageLimit: 20,
        messageRemaining: 15,
        credits: 100,
        hasCredits: true,
        usedCredits: false,
      },
      status: 'anonymous',
      usageData: {
        limit: 20,
        used: 5,
        remaining: 15,
        credits: 100,
        hasCredits: true,
        usedCredits: false,
        lastFetched: Date.now(),
      },
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refetchUsage: jest.fn(),
      refreshMessageUsage: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
      isAnonymous: true,
    },
    useChats: {
      chats: [],
      isLoading: false,
      deleteChat: jest.fn(),
      refreshChats: jest.fn(),
      updateChatTitle: jest.fn(),
      isUpdatingChatTitle: false,
    },
    useMCP: {
      mcpServers: [],
      setMcpServers: jest.fn(),
      selectedMcpServers: [],
      setSelectedMcpServers: jest.fn(),
    },
    useWebSearch: {
      webSearchContextSize: 'medium',
      setWebSearchContextSize: jest.fn(),
      webSearchEnabled: true,
    },
    useClientMount: true,
    useSidebar: {
      state: 'expanded',
      setOpen: jest.fn(),
      openMobile: false,
      setOpenMobile: jest.fn(),
      isMobile: false,
    },
    useQueryClient: mockQueryClient,
  };

  // Mock window.location once before all tests
  const mockLocation = {
    href: 'http://localhost/',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };

  beforeAll(() => {
    // Mock window.location once
    delete (window as any).location;
    (window as any).location = mockLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset location href
    mockLocation.href = 'http://localhost/';
    mockLocation.assign.mockClear();
    mockLocation.replace.mockClear();
    mockLocation.reload.mockClear();
    
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue(defaultMocks.useRouter);
    (usePathname as jest.Mock).mockReturnValue(defaultMocks.usePathname);
    (useSession as jest.Mock).mockReturnValue(defaultMocks.useSession);
    (useAuth as jest.Mock).mockReturnValue(defaultMocks.useAuth);
    (useChats as jest.Mock).mockReturnValue(defaultMocks.useChats);
    (useMCP as jest.Mock).mockReturnValue(defaultMocks.useMCP);
    (useWebSearch as jest.Mock).mockReturnValue(defaultMocks.useWebSearch);
    (useClientMount as jest.Mock).mockReturnValue(defaultMocks.useClientMount);
    (useSidebar as jest.Mock).mockReturnValue(defaultMocks.useSidebar);
    (useQueryClient as jest.Mock).mockReturnValue(defaultMocks.useQueryClient);
  });

  describe('Basic Rendering and Loading States', () => {
    test('renders loading skeleton when not mounted', () => {
      (useClientMount as jest.Mock).mockReturnValue(false);
      
      render(<ChatSidebar />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0); // Multiple skeletons for loading state
    });

    test('renders loading skeleton when session is loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: null,
        isPending: true,
        user: null,
        status: 'loading',
        isAuthenticated: false,
        isAnonymous: false,
      });
      
      render(<ChatSidebar />);
      
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    test('renders loading skeleton when chats are loading', () => {
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        isLoading: true,
      });
      
      render(<ChatSidebar />);
      
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    test('renders main sidebar when fully loaded', () => {
      render(<ChatSidebar />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    test('displays ChatLima logo and title', () => {
      render(<ChatSidebar />);
      
      const logo = screen.getByTestId('next-image');
      expect(logo).toHaveAttribute('src', '/logo.png');
      expect(logo).toHaveAttribute('alt', 'ChatLima logo');
      
      expect(screen.getByText('ChatLima')).toBeInTheDocument();
    });
  });

  describe('Authentication States', () => {
    test('displays sign-in button for anonymous users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'anon-123',
            isAnonymous: true,
          },
        },
        isPending: false,
        user: {
          id: 'anon-123',
          isAnonymous: true,
          hasSubscription: false,
          messageLimit: 10,
          messageRemaining: 5,
          credits: 0,
          hasCredits: false,
          usedCredits: false,
        },
        status: 'anonymous',
        isAuthenticated: false,
        isAnonymous: true,
      });
      
      render(<ChatSidebar />);
      
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      expect(screen.queryByTestId('user-account-menu')).not.toBeInTheDocument();
    });

    test('displays user account menu for authenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            isAnonymous: false,
          },
        },
        isPending: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          isAnonymous: false,
          hasSubscription: false,
          messageLimit: 20,
          messageRemaining: 15,
          credits: 100,
          hasCredits: true,
          usedCredits: false,
        },
        status: 'authenticated',
        isAuthenticated: true,
        isAnonymous: false,
      });
      
      render(<ChatSidebar />);
      
      expect(screen.getByTestId('user-account-menu')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument();
    });

    test('displays loading skeleton for authentication state', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: null,
        isPending: true,
        user: null,
        status: 'loading',
        isAuthenticated: false,
        isAnonymous: false,
      });
      
      render(<ChatSidebar />);
      
      const footerSkeletons = screen.getAllByTestId('skeleton');
      expect(footerSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Chat List Integration', () => {
    test('passes correct props to ChatList component', () => {
      const mockChats = [
        { id: '1', title: 'Chat 1' },
        { id: '2', title: 'Chat 2' },
      ];
      
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: mockChats,
        isLoading: false,
        isUpdatingChatTitle: true,
      });
      
      render(<ChatSidebar />);
      
      const chatList = screen.getByTestId('chat-list');
      expect(chatList).toHaveAttribute('data-loading', 'false');
      expect(chatList).toHaveAttribute('data-collapsed', 'false');
      expect(chatList).toHaveAttribute('data-updating-title', 'true');
      
      expect(screen.getByTestId('chat-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('chat-item-2')).toBeInTheDocument();
    });

    test('handles new chat creation', () => {
      render(<ChatSidebar />);
      
      const newChatButton = screen.getByTestId('new-chat-button');
      fireEvent.click(newChatButton);
      
      expect(window.location.href).toBe('http://localhost/');
    });

    test('handles chat deletion and navigation', () => {
      const mockDeleteChat = jest.fn();
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: [{ id: '1', title: 'Chat 1' }],
        deleteChat: mockDeleteChat,
      });
      
      (usePathname as jest.Mock).mockReturnValue('/chat/1');
      
      render(<ChatSidebar />);
      
      const deleteButton = screen.getByTestId('delete-chat-1');
      fireEvent.click(deleteButton);
      
      expect(mockDeleteChat).toHaveBeenCalledWith('1');
      expect(window.location.href).toBe('http://localhost/');
    });

    test('closes mobile sidebar when navigating to chat', () => {
      const mockSetOpenMobile = jest.fn();
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        openMobile: true,
        setOpenMobile: mockSetOpenMobile,
      });
      
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: [{ id: '1', title: 'Chat 1' }],
      });
      
      render(<ChatSidebar />);
      
      const navigateButton = screen.getByTestId('navigate-chat-1');
      fireEvent.click(navigateButton);
      
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
    });
  });

  describe('Settings Dropdown', () => {
    test('renders settings dropdown with correct options', () => {
      render(<ChatSidebar />);
      
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      
      // Check for settings options
      expect(screen.getByText('MCP Servers')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText('Provider Health')).toBeInTheDocument();
    });

    test('opens MCP server manager when clicked', () => {
      render(<ChatSidebar />);
      
      const mcpOption = screen.getByText('MCP Servers');
      fireEvent.click(mcpOption);
      
      const mcpManager = screen.getByTestId('mcp-server-manager');
      expect(mcpManager).toHaveAttribute('data-open', 'true');
    });

    test('opens API key manager when clicked', () => {
      render(<ChatSidebar />);
      
      const apiKeyOption = screen.getByText('API Keys');
      fireEvent.click(apiKeyOption);
      
      const apiKeyManager = screen.getByTestId('api-key-manager');
      expect(apiKeyManager).toHaveAttribute('data-open', 'true');
    });

    test('opens provider health dialog when clicked', () => {
      render(<ChatSidebar />);
      
      const providerHealthOption = screen.getByText('Provider Health');
      fireEvent.click(providerHealthOption);
      
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('provider-health-dashboard')).toBeInTheDocument();
    });

    test('displays MCP servers badge when servers are active', () => {
      (useMCP as jest.Mock).mockReturnValue({
        ...defaultMocks.useMCP,
        selectedMcpServers: ['server1', 'server2'],
      });
      
      render(<ChatSidebar />);
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('2');
    });
  });

  describe('Web Search Settings', () => {
    test('displays web search options when enabled', () => {
      render(<ChatSidebar />);
      
      expect(screen.getByText('Web Search')).toBeInTheDocument();
      expect(screen.getByText('Context: Low')).toBeInTheDocument();
      expect(screen.getByText('Context: Medium')).toBeInTheDocument();
      expect(screen.getByText('Context: High')).toBeInTheDocument();
    });

    test('does not display web search options when disabled', () => {
      (useWebSearch as jest.Mock).mockReturnValue({
        ...defaultMocks.useWebSearch,
        webSearchEnabled: false,
      });
      
      render(<ChatSidebar />);
      
      expect(screen.queryByText('Web Search')).not.toBeInTheDocument();
    });

    test('shows current web search context selection', () => {
      (useWebSearch as jest.Mock).mockReturnValue({
        ...defaultMocks.useWebSearch,
        webSearchContextSize: 'high',
      });
      
      render(<ChatSidebar />);
      
      const highOption = screen.getByText('Context: High').closest('[data-testid="dropdown-menu-item"]');
      expect(highOption).toHaveTextContent('✓');
    });

    test('updates web search context when option is clicked', () => {
      const mockSetWebSearchContextSize = jest.fn();
      (useWebSearch as jest.Mock).mockReturnValue({
        ...defaultMocks.useWebSearch,
        setWebSearchContextSize: mockSetWebSearchContextSize,
      });
      
      render(<ChatSidebar />);
      
      const lowOption = screen.getByText('Context: Low');
      fireEvent.click(lowOption);
      
      expect(mockSetWebSearchContextSize).toHaveBeenCalledWith('low');
    });
  });

  describe('Responsive Behavior', () => {
    test('applies collapsed layout when sidebar is collapsed', () => {
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        state: 'collapsed',
        isMobile: false,
      });
      
      render(<ChatSidebar />);
      
      const chatList = screen.getByTestId('chat-list');
      expect(chatList).toHaveAttribute('data-collapsed', 'true');
      
      // ChatLima title should not be visible when collapsed
      expect(screen.queryByText('ChatLima')).not.toBeInTheDocument();
    });

    test('shows expanded layout on mobile even when collapsed', () => {
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        state: 'collapsed',
        isMobile: true,
      });
      
      render(<ChatSidebar />);
      
      const chatList = screen.getByTestId('chat-list');
      expect(chatList).toHaveAttribute('data-collapsed', 'false');
      
      // ChatLima title should be visible on mobile
      expect(screen.getByText('ChatLima')).toBeInTheDocument();
    });

    test('closes mobile sidebar when creating new chat', () => {
      const mockSetOpenMobile = jest.fn();
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        openMobile: true,
        setOpenMobile: mockSetOpenMobile,
      });
      
      render(<ChatSidebar />);
      
      const newChatButton = screen.getByTestId('new-chat-button');
      fireEvent.click(newChatButton);
      
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
    });
  });

  describe('Footer Links and Actions', () => {
    test('renders documentation link with correct attributes', () => {
      render(<ChatSidebar />);
      
      const links = screen.getAllByRole('link');
      const docLink = links.find(link => 
        link.getAttribute('href') === 'https://chatlima-docs.netlify.app/'
      );
      
      expect(docLink).toBeInTheDocument();
      expect(docLink).toHaveAttribute('target', '_blank');
      expect(docLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('renders GitHub link with correct attributes', () => {
      render(<ChatSidebar />);
      
      const links = screen.getAllByRole('link');
      const githubLink = links.find(link => 
        link.getAttribute('href') === 'https://github.com/brooksy4503/chatlima'
      );
      
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('renders theme toggle component', () => {
      render(<ChatSidebar />);
      
      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toBeInTheDocument();
      expect(themeToggle).toHaveAttribute('data-show-label', 'false');
    });
  });

  describe('Session Management Effects', () => {
    test('invalidates queries when user logs in', async () => {
      // Start with no user (anonymous/unauthenticated state)
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: null,
        isPending: false,
        user: null,
        status: 'unauthenticated',
        isAuthenticated: false,
        isAnonymous: false,
      });
      
      const { rerender } = render(<ChatSidebar />);
      
      // Simulate user login
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            isAnonymous: false,
          },
        },
        isPending: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          isAnonymous: false,
          hasSubscription: false,
          messageLimit: 20,
          messageRemaining: 15,
          credits: 100,
          hasCredits: true,
          usedCredits: false,
        },
        status: 'authenticated',
        isAuthenticated: true,
        isAnonymous: false,
      });
      
      rerender(<ChatSidebar />);
      
      await waitFor(() => {
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['chats'] });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['chat'] });
      });
    });

    test('redirects to home when user logs out', async () => {
      // Start with authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            isAnonymous: false,
          },
        },
        isPending: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          isAnonymous: false,
          hasSubscription: false,
          messageLimit: 20,
          messageRemaining: 15,
          credits: 100,
          hasCredits: true,
          usedCredits: false,
        },
        status: 'authenticated',
        isAuthenticated: true,
        isAnonymous: false,
      });
      
      const { rerender } = render(<ChatSidebar />);
      
      // Simulate user logout
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: null,
        isPending: false,
        user: null,
        status: 'unauthenticated',
        isAuthenticated: false,
        isAnonymous: false,
      });
      
      rerender(<ChatSidebar />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['chats'] });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['chat'] });
      });
    });
  });

  describe('Accessibility Features', () => {
    test('has proper ARIA attributes for settings dropdown', () => {
      render(<ChatSidebar />);
      
      const settingsButton = screen.getByTestId('sidebar-menu-button');
      expect(settingsButton).toBeInTheDocument();
      
      const mcpMenuItem = screen.getByText('MCP Servers').closest('[role="menuitem"]');
      expect(mcpMenuItem).toHaveAttribute('role', 'menuitem');
    });

    test('provides tooltip for collapsed settings button', () => {
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        state: 'collapsed',
        isMobile: false,
      });
      
      render(<ChatSidebar />);
      
      const settingsButton = screen.getByTestId('sidebar-menu-button');
      expect(settingsButton).toHaveAttribute('title', 'Settings');
    });

    test('has proper tooltip content for footer links', () => {
      render(<ChatSidebar />);
      
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('ChatLima on GitHub')).toBeInTheDocument();
    });

    test('sign-in button receives collapsed state for accessibility', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'anon-123',
            isAnonymous: true,
          },
        },
        isPending: false,
        user: {
          id: 'anon-123',
          isAnonymous: true,
          hasSubscription: false,
          messageLimit: 10,
          messageRemaining: 5,
          credits: 0,
          hasCredits: false,
          usedCredits: false,
        },
        status: 'anonymous',
        isAuthenticated: false,
        isAnonymous: true,
      });
      
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        state: 'collapsed',
        isMobile: false,
      });
      
      render(<ChatSidebar />);
      
      const signInButton = screen.getByTestId('sign-in-button');
      expect(signInButton).toHaveAttribute('data-collapsed', 'true');
    });
  });

  describe('Error Handling', () => {
    test('handles missing chat data gracefully', () => {
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: null,
      });
      
      render(<ChatSidebar />);
      
      const chatList = screen.getByTestId('chat-list');
      expect(chatList).toBeInTheDocument();
      // Should not crash when chats is null
    });

    test('handles undefined session data', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: undefined,
        isPending: false,
        user: null,
        status: 'unauthenticated',
        isAuthenticated: false,
        isAnonymous: false,
      });
      
      render(<ChatSidebar />);
      
      // Should render without crashing - undefined session is treated as no session
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    test('handles MCP server errors gracefully', () => {
      (useMCP as jest.Mock).mockReturnValue({
        ...defaultMocks.useMCP,
        mcpServers: null,
        selectedMcpServers: [],
      });
      
      render(<ChatSidebar />);
      
      // Should not crash with null MCP data
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete user workflow: login, navigate chat, open settings', async () => {
      // Start as anonymous user
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'anon-123',
            isAnonymous: true,
          },
        },
        isPending: false,
        user: {
          id: 'anon-123',
          isAnonymous: true,
          hasSubscription: false,
          messageLimit: 10,
          messageRemaining: 5,
          credits: 0,
          hasCredits: false,
          usedCredits: false,
        },
        status: 'anonymous',
        isAuthenticated: false,
        isAnonymous: true,
      });
      
      const { rerender } = render(<ChatSidebar />);
      
      // Should show sign-in button
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      
      // Simulate user login
      (useAuth as jest.Mock).mockReturnValue({
        ...defaultMocks.useAuth,
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            isAnonymous: false,
          },
        },
        isPending: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          isAnonymous: false,
          hasSubscription: false,
          messageLimit: 20,
          messageRemaining: 15,
          credits: 100,
          hasCredits: true,
          usedCredits: false,
        },
        status: 'authenticated',
        isAuthenticated: true,
        isAnonymous: false,
      });
      
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: [
          { id: '1', title: 'My Chat' },
          { id: '2', title: 'Another Chat' },
        ],
      });
      
      rerender(<ChatSidebar />);
      
      // Should show user account menu
      expect(screen.getByTestId('user-account-menu')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument();
      
      // Should show chats
      expect(screen.getByTestId('chat-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('chat-item-2')).toBeInTheDocument();
      
      // Navigate to a chat
      const navigateButton = screen.getByTestId('navigate-chat-1');
      fireEvent.click(navigateButton);
      
      // Open settings
      const mcpOption = screen.getByText('MCP Servers');
      fireEvent.click(mcpOption);
      
      const mcpManager = screen.getByTestId('mcp-server-manager');
      expect(mcpManager).toHaveAttribute('data-open', 'true');
      
      // Open API keys
      const apiKeyOption = screen.getByText('API Keys');
      fireEvent.click(apiKeyOption);
      
      const apiKeyManager = screen.getByTestId('api-key-manager');
      expect(apiKeyManager).toHaveAttribute('data-open', 'true');
    });

    test('mobile sidebar workflow: open, navigate, close', () => {
      const mockSetOpenMobile = jest.fn();
      (useSidebar as jest.Mock).mockReturnValue({
        ...defaultMocks.useSidebar,
        isMobile: true,
        openMobile: true,
        setOpenMobile: mockSetOpenMobile,
      });
      
      (useChats as jest.Mock).mockReturnValue({
        ...defaultMocks.useChats,
        chats: [{ id: '1', title: 'Mobile Chat' }],
      });
      
      render(<ChatSidebar />);
      
      // Should show chat in mobile layout
      expect(screen.getByTestId('chat-item-1')).toBeInTheDocument();
      
      // Navigate to chat should close mobile sidebar
      const navigateButton = screen.getByTestId('navigate-chat-1');
      fireEvent.click(navigateButton);
      
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
      
      // Create new chat should also close mobile sidebar
      const newChatButton = screen.getByTestId('new-chat-button');
      fireEvent.click(newChatButton);
      
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
    });
  });
});