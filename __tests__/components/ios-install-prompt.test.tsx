/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { IOSInstallPrompt } from '../../components/ios-install-prompt';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock UI components with proper prop forwarding
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-size={size}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Share: () => <span data-testid="share-icon">Share</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
}));

describe('IOSInstallPrompt', () => {
  const mockOnDismiss = jest.fn();
  
  // Test data
  const TEST_DATA = {
    userAgents: {
      iosSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      iosSafariIPad: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      androidChrome: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      desktopChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    },
    localStorage: {
      dismissed: 'true',
      permanent: 'permanent',
      null: null,
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mocks to default behavior
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Mock window.matchMedia for standalone mode detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Reset navigator.standalone
    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: false,
    });

    mockOnDismiss.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering and Props', () => {
    test('renders when all conditions are met (iOS, not standalone, not dismissed)', async () => {
      // Mock iOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);

      // Fast-forward past the 3-second delay
      act(() => {
        act(() => {
        jest.advanceTimersByTime(3000);
      });
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Add to Home Screen' })).toBeInTheDocument();
        expect(screen.getByText('Quick access to ChatLima')).toBeInTheDocument();
      });
    });

    test('does not render on non-iOS devices', async () => {
      // Mock Android user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.androidChrome
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      
      act(() => {
        act(() => {
        jest.advanceTimersByTime(3000);
      });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('does not render when in standalone mode', async () => {
      // Mock iOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      // Mock standalone mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      
      act(() => {
        act(() => {
        jest.advanceTimersByTime(3000);
      });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('does not render when previously dismissed', async () => {
      // Mock iOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      // Mock dismissed state in localStorage
      localStorageMock.getItem.mockReturnValue(TEST_DATA.localStorage.dismissed);

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      
      act(() => {
        act(() => {
        jest.advanceTimersByTime(3000);
      });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('renders without onDismiss prop', async () => {
      // Mock iOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt />);

      act(() => {
        act(() => {
        jest.advanceTimersByTime(3000);
      });
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });
  });

  describe('Device Detection', () => {
    test('detects iPhone devices correctly', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    test('detects iPad devices correctly', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafariIPad
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    test('detects standalone mode via navigator.standalone', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      // Mock navigator.standalone
      Object.defineProperty(window.navigator, 'standalone', {
        writable: true,
        value: true,
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('does not render on desktop browsers', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.desktopChrome
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Interaction', () => {
    test('checks localStorage for previous dismissal on mount', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed');
    });

    test('does not render when localStorage shows permanent dismissal', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      localStorageMock.getItem.mockReturnValue(TEST_DATA.localStorage.permanent);

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('saves temporary dismissal to localStorage when "Got it" is clicked', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const gotItButton = screen.getByRole('button', { name: /got it/i });
      fireEvent.click(gotItButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'true');
    });

    test('saves permanent dismissal to localStorage when "Don\'t show again" is clicked', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const neverShowButton = screen.getByRole('button', { name: /don't show again/i });
      fireEvent.click(neverShowButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'permanent');
    });
  });

  describe('Timer-based Visibility', () => {
    test('shows prompt after 3-second delay', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);

      // Should not be visible immediately
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();

      // Fast-forward 2 seconds - should still not be visible
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();

      // Fast-forward to 3 seconds - should now be visible
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    test('cleans up timer on unmount', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      const { unmount } = render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);

      // Unmount before timer completes
      unmount();

      // Fast-forward past the timer
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should not cause any issues or memory leaks
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    test('handles dismiss button click correctly', () => {
      const dismissButton = screen.getByTestId('button-ghost');
      fireEvent.click(dismissButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'true');
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    test('handles "Got it" button click correctly', () => {
      const gotItButton = screen.getByRole('button', { name: /got it/i });
      fireEvent.click(gotItButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'true');
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    test('handles "Don\'t show again" button click correctly', () => {
      const neverShowButton = screen.getByRole('button', { name: /don't show again/i });
      fireEvent.click(neverShowButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'permanent');
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    test('hides prompt when dismiss buttons are clicked', async () => {
      const gotItButton = screen.getByRole('button', { name: /got it/i });
      fireEvent.click(gotItButton);

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('does not call onDismiss when not provided', async () => {
      // Re-render without onDismiss prop
      cleanup();
      render(<IOSInstallPrompt />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const gotItButton = screen.getByRole('button', { name: /got it/i });
      fireEvent.click(gotItButton);

      // Should not throw error
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'true');
    });
  });

  describe('Error Handling', () => {
    test('throws error when localStorage.getItem fails during initialization', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Component should throw error during initialization
      expect(() => {
        render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      }).toThrow('localStorage error');
    });

    test('attempts to save to localStorage when dismiss buttons are clicked', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const gotItButton = screen.getByRole('button', { name: /got it/i });
      const neverShowButton = screen.getByRole('button', { name: /don't show again/i });
      
      // Test "Got it" button
      fireEvent.click(gotItButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'true');
      
      // Reset mock for next test
      localStorageMock.setItem.mockClear();
      
      // Re-render to test "Never show again" button
      cleanup();
      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const neverShowButtonSecond = screen.getByRole('button', { name: /don't show again/i });
      fireEvent.click(neverShowButtonSecond);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'permanent');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    test('has proper heading structure', () => {
      expect(screen.getByRole('heading', { name: 'Add to Home Screen' })).toBeInTheDocument();
      expect(screen.getByText('Quick access to ChatLima')).toBeInTheDocument();
    });

    test('has accessible buttons with proper labels', () => {
      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /don't show again/i })).toBeInTheDocument();
      
      // Dismiss button should be accessible (X icon)
      const dismissButton = screen.getByTestId('button-ghost');
      expect(dismissButton).toBeInTheDocument();
    });

    test('has proper visual hierarchy with icons', () => {
      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    test('provides clear instructions for users', () => {
      expect(screen.getByText(/tap the/i)).toBeInTheDocument();
      expect(screen.getByText(/share button below/i)).toBeInTheDocument();
      expect(screen.getByText(/select/i)).toBeInTheDocument();
      // Check for the instruction text specifically (inside the step 2 div)
      expect(screen.getAllByText(/add to home screen/i)).toHaveLength(2); // One in heading, one in instructions
    });
  });

  describe('Integration Tests', () => {
    test('complete user workflow: show prompt, interact, and dismiss', async () => {
      // Setup: iOS device, not standalone, not dismissed
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);

      // 1. Prompt should not be visible initially
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();

      // 2. Wait for delay - prompt should appear
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      // 3. User reads instructions
      expect(screen.getByRole('heading', { name: 'Add to Home Screen' })).toBeInTheDocument();
      expect(screen.getByText(/tap the/i)).toBeInTheDocument();

      // 4. User clicks "Don't show again"
      const neverShowButton = screen.getByRole('button', { name: /don't show again/i });
      fireEvent.click(neverShowButton);

      // 5. Verify complete workflow
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatlima-ios-install-dismissed', 'permanent');
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });

    test('respects user preference and does not show on subsequent visits', async () => {
      // First visit - user dismisses permanently
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: TEST_DATA.userAgents.iosSafari
      });

      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      const neverShowButton = screen.getByRole('button', { name: /don't show again/i });
      fireEvent.click(neverShowButton);

      cleanup();

      // Second visit - should not show prompt
      localStorageMock.getItem.mockReturnValue('permanent');
      render(<IOSInstallPrompt onDismiss={mockOnDismiss} />);
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
      });
    });
  });
});