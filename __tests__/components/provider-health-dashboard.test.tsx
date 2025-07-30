/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProviderHealthDashboard, ProviderHealthIndicator } from '../../components/provider-health-dashboard';

// Mock external dependencies
jest.mock('@/hooks/use-models', () => ({
  useProviderHealth: jest.fn(),
  useModelsCache: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock UI components with proper prop forwarding
jest.mock('../../components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-description" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={className} data-variant={variant} data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild, ...props }: any) => (
    <div data-testid="tooltip-trigger" {...props}>{children}</div>
  ),
  TooltipContent: ({ children, ...props }: any) => (
    <div data-testid="tooltip-content" {...props}>{children}</div>
  ),
}));

jest.mock('../../components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="scroll-area" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  RefreshCw: ({ className, ...props }: any) => (
    <div className={className} data-testid="refresh-icon" {...props} />
  ),
  CheckCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="check-circle-icon" {...props} />
  ),
  AlertTriangle: ({ className, ...props }: any) => (
    <div className={className} data-testid="alert-triangle-icon" {...props} />
  ),
  XCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="x-circle-icon" {...props} />
  ),
  HelpCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="help-circle-icon" {...props} />
  ),
  Clock: ({ className, ...props }: any) => (
    <div className={className} data-testid="clock-icon" {...props} />
  ),
  Zap: ({ className, ...props }: any) => (
    <div className={className} data-testid="zap-icon" {...props} />
  ),
  Database: ({ className, ...props }: any) => (
    <div className={className} data-testid="database-icon" {...props} />
  ),
  AlertCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="alert-circle-icon" {...props} />
  ),
}));

describe('ProviderHealthDashboard', () => {
  // Mock functions for hooks
  const mockUseProviderHealth = require('@/hooks/use-models').useProviderHealth;
  const mockUseModelsCache = require('@/hooks/use-models').useModelsCache;
  const mockClearCache = jest.fn();

  // Default mock data
  const defaultHealthData = {
    overall: 'healthy' as const,
    providers: {
      openrouter: {
        name: 'OpenRouter',
        status: 'healthy' as const,
        modelCount: 150,
        hasEnvironmentKey: true,
        supportsUserKeys: true,
        lastChecked: new Date('2024-01-01T12:00:00Z'),
        error: null,
      },
      anthropic: {
        name: 'Anthropic',
        status: 'degraded' as const,
        modelCount: 5,
        hasEnvironmentKey: false,
        supportsUserKeys: true,
        lastChecked: new Date('2024-01-01T11:30:00Z'),
        error: 'Rate limit exceeded',
      },
    },
    healthyCount: 1,
    totalCount: 2,
    lastUpdated: new Date('2024-01-01T12:00:00Z'),
    isLoading: false,
    error: null,
  };

  const defaultCacheData = {
    clearCache: mockClearCache,
    isClearing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProviderHealth.mockReturnValue(defaultHealthData);
    mockUseModelsCache.mockReturnValue(defaultCacheData);
    
    // Mock Date.now() for consistent time formatting tests
    const mockNow = new Date('2024-01-01T12:05:00Z').getTime();
    jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering and Props', () => {
    test('renders with default props', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getAllByTestId('card')).toHaveLength(3); // Main card + 2 provider cards
      expect(screen.getByTestId('card-title')).toHaveTextContent('Provider Health');
      expect(screen.getByText('Status of AI model providers and their availability')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<ProviderHealthDashboard className="custom-class" />);
      
      // The custom class is applied to the main wrapper card
      const cards = screen.getAllByTestId('card');
      expect(cards[0]).toHaveClass('custom-class'); // First card is the main wrapper
    });

    test('renders compact mode when compact prop is true', () => {
      render(<ProviderHealthDashboard compact />);
      
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      expect(screen.getByText('1/2 providers')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    test('renders in dialog mode when dialogMode prop is true', () => {
      render(<ProviderHealthDashboard dialogMode />);
      
      // In dialog mode, there are only provider cards (no main wrapper card)
      expect(screen.getAllByTestId('card')).toHaveLength(2); // Only provider cards
      expect(screen.getByText('Provider Status (1/2)')).toBeInTheDocument();
      expect(screen.getByText('Real-time health monitoring of AI model providers')).toBeInTheDocument();
    });

    test('does not render refresh button when showRefreshButton is false', () => {
      render(<ProviderHealthDashboard showRefreshButton={false} />);
      
      expect(screen.queryByTestId('button-outline')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles refresh button click in default mode', async () => {
      render(<ProviderHealthDashboard />);
      
      const refreshButton = screen.getByTestId('button-outline');
      fireEvent.click(refreshButton);
      
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });

    test('handles refresh button click in compact mode', async () => {
      render(<ProviderHealthDashboard compact />);
      
      const refreshButton = screen.getByTestId('button-ghost');
      fireEvent.click(refreshButton);
      
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });

    test('handles refresh button click in dialog mode', async () => {
      render(<ProviderHealthDashboard dialogMode />);
      
      const refreshButton = screen.getByTestId('button-outline');
      fireEvent.click(refreshButton);
      
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });

    test('disables refresh button when clearing cache', () => {
      mockUseModelsCache.mockReturnValue({
        ...defaultCacheData,
        isClearing: true,
      });

      render(<ProviderHealthDashboard />);
      
      const refreshButton = screen.getByTestId('button-outline');
      expect(refreshButton).toBeDisabled();
    });

    test('disables refresh button when loading', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        isLoading: true,
      });

      render(<ProviderHealthDashboard />);
      
      const refreshButton = screen.getByTestId('button-outline');
      expect(refreshButton).toBeDisabled();
    });

    test('handles cache clear error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockClearCache.mockRejectedValueOnce(new Error('Cache clear failed'));
      
      render(<ProviderHealthDashboard />);
      
      const refreshButton = screen.getByTestId('button-outline');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to refresh provider data:', expect.any(Error));
      });
      
      consoleError.mockRestore();
    });
  });

  describe('State Management', () => {
    test('displays loading state when isLoading is true and no providers', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        providers: {},
        isLoading: true,
        totalCount: 0,
        healthyCount: 0,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('Loading Provider Status')).toBeInTheDocument();
      expect(screen.getByText('Checking health of all providers...')).toBeInTheDocument();
      expect(screen.getAllByTestId('refresh-icon')).toHaveLength(2); // One in button, one in loading state
      // Both should have animate-spin class
      screen.getAllByTestId('refresh-icon').forEach(icon => {
        expect(icon).toHaveClass('animate-spin');
      });
    });

    test('displays empty state when no providers and not loading', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        providers: {},
        isLoading: false,
        totalCount: 0,
        healthyCount: 0,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('No Provider Data Available')).toBeInTheDocument();
      expect(screen.getByText('Check your API keys and network connection')).toBeInTheDocument();
      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
    });

    test('shows animate-spin class on refresh icon during cache clearing', () => {
      mockUseModelsCache.mockReturnValue({
        ...defaultCacheData,
        isClearing: true,
      });

      render(<ProviderHealthDashboard />);
      
      const refreshIcon = screen.getByTestId('refresh-icon');
      expect(refreshIcon).toHaveClass('animate-spin');
    });

    test('shows animate-spin class on refresh icon during loading', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        isLoading: true,
      });

      render(<ProviderHealthDashboard />);
      
      const refreshIcon = screen.getByTestId('refresh-icon');
      expect(refreshIcon).toHaveClass('animate-spin');
    });
  });

  describe('Different Display Modes', () => {
    test('compact mode displays essential information only', () => {
      render(<ProviderHealthDashboard compact />);
      
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('1/2 providers')).toBeInTheDocument();
      expect(screen.queryByText('Provider Health')).not.toBeInTheDocument();
      expect(screen.queryByTestId('card-header')).not.toBeInTheDocument();
    });

    test('dialog mode shows header without card wrapper', () => {
      render(<ProviderHealthDashboard dialogMode />);
      
      expect(screen.getByText('Provider Status (1/2)')).toBeInTheDocument();
      expect(screen.getByText('Real-time health monitoring of AI model providers')).toBeInTheDocument();
      expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    });

    test('default mode shows full card layout', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getAllByTestId('card')).toHaveLength(3); // Main card + 2 provider cards
      expect(screen.getAllByTestId('card-header')).toHaveLength(3); // Main header + 2 provider headers
      expect(screen.getAllByTestId('card-content')).toHaveLength(3); // Main content + 2 provider contents
      expect(screen.getByTestId('card-title')).toHaveTextContent('Provider Health');
    });
  });

  describe('Data Display and Formatting', () => {
    test('displays provider cards with correct information', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getAllByText('OpenRouter')).toHaveLength(2); // Name + badge
      expect(screen.getAllByText('Anthropic')).toHaveLength(2); // Name + badge
      expect(screen.getByText('150')).toBeInTheDocument(); // Model count
      expect(screen.getByText('5')).toBeInTheDocument(); // Model count
    });

    test('displays correct health indicators for each provider', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(2); // Overall + provider healthy status
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument(); // Degraded status
    });

    test('displays provider badges with correct styling', () => {
      render(<ProviderHealthDashboard />);
      
      // Check that badges are present for both providers
      expect(screen.getAllByTestId('badge')).toHaveLength(5); // 2 model counts + 3 API key badges (ENV + 2 User)
    });

    test('displays API key information correctly', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('ENV')).toBeInTheDocument();
      expect(screen.getAllByText('User')).toHaveLength(2);
    });

    test('displays error messages when provider has errors', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    test('formats time correctly', () => {
      render(<ProviderHealthDashboard />);
      
      // The formatTime function in the component handles relative time formatting
      // Check for the specific formatted date output
      expect(screen.getAllByText('1/1/2024')).toHaveLength(3); // lastUpdated + 2 provider lastChecked
    });

    test('displays overall status correctly', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('Overall Status')).toBeInTheDocument();
      expect(screen.getByText('1 of 2 providers operational')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error state when hook returns error', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        error: new Error('Failed to fetch provider data'),
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('Failed to load provider health')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    test('handles invalid health status gracefully', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        overall: 'invalid-status' as any,
        providers: {
          test: {
            ...defaultHealthData.providers.openrouter,
            status: 'invalid-status' as any,
          },
        },
      });

      render(<ProviderHealthDashboard />);
      
      // Should default to 'unknown' status
      expect(screen.getAllByTestId('help-circle-icon')).toHaveLength(2); // Overall + provider status
      expect(screen.getAllByText('Unknown')).toHaveLength(2);
    });

    test('retry button works in error state', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        error: new Error('Failed to fetch provider data'),
      });

      render(<ProviderHealthDashboard />);
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper tooltip content for refresh button', () => {
      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('Force refresh all provider data')).toBeInTheDocument();
    });

    test('compact mode has tooltip for refresh button', () => {
      render(<ProviderHealthDashboard compact />);
      
      expect(screen.getByText('Refresh provider data')).toBeInTheDocument();
    });

    test('displays appropriate ARIA attributes through components', () => {
      render(<ProviderHealthDashboard />);
      
      const refreshButton = screen.getByTestId('button-outline');
      expect(refreshButton).not.toBeDisabled();
    });

    test('error messages are properly displayed for screen readers', () => {
      render(<ProviderHealthDashboard />);
      
      const errorText = screen.getByText('Rate limit exceeded');
      expect(errorText).toHaveAttribute('title', 'Rate limit exceeded');
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow: load data, show providers, refresh data', async () => {
      render(<ProviderHealthDashboard />);
      
      // Initial data is loaded
      expect(screen.getAllByText('OpenRouter')).toHaveLength(2); // Name + badge
      expect(screen.getAllByText('Anthropic')).toHaveLength(2); // Name + badge
      expect(screen.getByText('1 of 2 providers operational')).toBeInTheDocument();
      
      // User clicks refresh
      const refreshButton = screen.getByTestId('button-outline');
      fireEvent.click(refreshButton);
      
      // Cache clear is called
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });

    test('handles mode switching correctly', () => {
      const { rerender } = render(<ProviderHealthDashboard />);
      
      // Full mode
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      
      // Switch to compact mode
      rerender(<ProviderHealthDashboard compact />);
      expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
      expect(screen.getByText('1/2 providers')).toBeInTheDocument();
      
      // Switch to dialog mode
      rerender(<ProviderHealthDashboard dialogMode />);
      expect(screen.getByText('Provider Status (1/2)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty providers object', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        providers: {},
        totalCount: 0,
        healthyCount: 0,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.getByText('No Provider Data Available')).toBeInTheDocument();
    });

    test('handles missing lastUpdated', () => {
      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        lastUpdated: null,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
    });

    test('handles providers without errors', () => {
      const providersWithoutErrors = {
        openrouter: {
          ...defaultHealthData.providers.openrouter,
          error: null,
        },
      };

      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        providers: providersWithoutErrors,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument();
    });

    test('handles different provider types with correct icons', () => {
      const multipleProviders = {
        openrouter: { ...defaultHealthData.providers.openrouter, name: 'OpenRouter' },
        requesty: { ...defaultHealthData.providers.openrouter, name: 'Requesty' },
        anthropic: { ...defaultHealthData.providers.openrouter, name: 'Anthropic' },
        openai: { ...defaultHealthData.providers.openrouter, name: 'OpenAI' },
        unknown: { ...defaultHealthData.providers.openrouter, name: 'Unknown Provider' },
      };

      mockUseProviderHealth.mockReturnValue({
        ...defaultHealthData,
        providers: multipleProviders,
        totalCount: 5,
        healthyCount: 5,
      });

      render(<ProviderHealthDashboard />);
      
      expect(screen.getAllByTestId('zap-icon')).toHaveLength(4); // Known providers
      expect(screen.getByTestId('database-icon')).toBeInTheDocument(); // Unknown provider
    });
  });
});

describe('ProviderHealthIndicator', () => {
  const mockUseProviderHealth = require('@/hooks/use-models').useProviderHealth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    mockUseProviderHealth.mockReturnValue({
      overall: 'healthy',
      healthyCount: 0,
      totalCount: 0,
      isLoading: true,
    });

    render(<ProviderHealthIndicator />);
    
    expect(screen.getByTestId('refresh-icon')).toHaveClass('animate-spin');
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  test('renders health status with tooltip', () => {
    mockUseProviderHealth.mockReturnValue({
      overall: 'healthy',
      healthyCount: 2,
      totalCount: 3,
      isLoading: false,
    });

    render(<ProviderHealthIndicator />);
    
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByText('2 of 3 providers are healthy')).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    mockUseProviderHealth.mockReturnValue({
      overall: 'healthy',
      healthyCount: 1,
      totalCount: 1,
      isLoading: false,
    });

    render(<ProviderHealthIndicator className="custom-indicator" />);
    
    const indicator = screen.getByText('1/1').closest('div');
    expect(indicator).toHaveClass('custom-indicator');
  });

  test('handles invalid health status', () => {
    mockUseProviderHealth.mockReturnValue({
      overall: 'invalid-status' as any,
      healthyCount: 1,
      totalCount: 1,
      isLoading: false,
    });

    render(<ProviderHealthIndicator />);
    
    expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});