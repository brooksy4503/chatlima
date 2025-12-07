/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../components/theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children }) => (
    <div data-testid="next-themes-provider">
      {children}
    </div>
  )),
}));

// Get the mocked function for testing
const { ThemeProvider: MockedNextThemesProvider } = jest.requireMock('next-themes');

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering and Props', () => {
    test('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-component">Test Child</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('renders with multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    test('renders without children', () => {
      render(<ThemeProvider />);
      
      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('passes all props to NextThemesProvider', () => {
      const testProps = {
        attribute: 'class' as const,
        defaultTheme: 'system',
        enableSystem: true,
        storageKey: 'custom-theme',
        themes: ['light', 'dark', 'system'],
        value: { light: 'light-theme', dark: 'dark-theme' },
      };

      render(
        <ThemeProvider {...(testProps as any)}>
          <div>Test Child</div>
        </ThemeProvider>
      );

      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall).toMatchObject(testProps);
      expect(mockCall.children).toBeDefined();
    });

    test('passes custom theme configuration', () => {
      const customConfig = {
        attribute: 'data-theme' as const,
        defaultTheme: 'dark',
        enableSystem: false,
        disableTransitionOnChange: true,
      };

      render(
        <ThemeProvider {...(customConfig as any)}>
          <div>Test Child</div>
        </ThemeProvider>
      );

      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall).toMatchObject(customConfig);
      expect(mockCall.children).toBeDefined();
    });

    test('handles empty props object', () => {
      render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      );

      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall.children).toBeDefined();
      expect(MockedNextThemesProvider).toHaveBeenCalledTimes(1);
    });
  });

  describe('Provider Integration', () => {
    test('wraps children with NextThemesProvider', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div data-testid="nested-child">Nested Content</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('next-themes-provider');
      const child = screen.getByTestId('nested-child');
      
      expect(provider).toBeInTheDocument();
      expect(child).toBeInTheDocument();
      expect(provider).toContainElement(child);
    });

    test('maintains provider hierarchy with nested providers', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <div data-testid="outer-content">
            <ThemeProvider defaultTheme="dark">
              <div data-testid="inner-content">Inner Content</div>
            </ThemeProvider>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('outer-content')).toBeInTheDocument();
      expect(screen.getByTestId('inner-content')).toBeInTheDocument();
      expect(MockedNextThemesProvider).toHaveBeenCalledTimes(2);
    });
  });

  describe('Theme Configuration', () => {
    test('handles standard theme options', () => {
      const themeConfig = {
        themes: ['light', 'dark', 'auto'],
        defaultTheme: 'auto',
        enableSystem: true,
        attribute: 'class' as const,
      };

      render(
        <ThemeProvider {...(themeConfig as any)}>
          <div>Theme Consumer</div>
        </ThemeProvider>
      );

      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall).toMatchObject(themeConfig);
      expect(mockCall.children).toBeDefined();
    });

    test('handles custom theme values mapping', () => {
      const customThemes = {
        themes: ['light', 'dark', 'cyberpunk'],
        value: {
          light: 'theme-light',
          dark: 'theme-dark', 
          cyberpunk: 'theme-cyberpunk',
        },
      };

      render(
        <ThemeProvider {...customThemes}>
          <div>Custom Theme Consumer</div>
        </ThemeProvider>
      );

      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall).toMatchObject(customThemes);
      expect(mockCall.children).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles undefined children gracefully', () => {
      render(<ThemeProvider>{undefined}</ThemeProvider>);
      
      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall.children).toBeUndefined();
    });

    test('handles null children gracefully', () => {
      render(<ThemeProvider>{null}</ThemeProvider>);
      
      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall.children).toBeNull();
    });

    test('handles boolean children gracefully', () => {
      render(
        <ThemeProvider>
          {true && <div data-testid="conditional-child">Conditional</div>}
          {false && <div data-testid="hidden-child">Hidden</div>}
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('conditional-child')).toBeInTheDocument();
      expect(screen.queryByTestId('hidden-child')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('does not interfere with child accessibility attributes', () => {
      render(
        <ThemeProvider>
          <button 
            aria-label="Theme toggle button"
            data-testid="accessible-button"
          >
            Toggle Theme
          </button>
        </ThemeProvider>
      );

      const button = screen.getByTestId('accessible-button');
      expect(button).toHaveAttribute('aria-label', 'Theme toggle button');
      expect(button).toHaveAccessibleName('Theme toggle button');
    });

    test('preserves child component roles and semantics', () => {
      render(
        <ThemeProvider>
          <main role="main" data-testid="main-content">
            <h1>Page Title</h1>
            <nav role="navigation" data-testid="navigation">
              <ul role="list">
                <li role="listitem">Nav Item</li>
              </ul>
            </nav>
          </main>
        </ThemeProvider>
      );

      expect(screen.getByRole('main')).toHaveAttribute('role', 'main');
      expect(screen.getByRole('navigation')).toHaveAttribute('role', 'navigation');
      expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
      expect(screen.getByRole('listitem')).toHaveAttribute('role', 'listitem');
    });
  });

  describe('Integration Tests', () => {
    test('provides theme context to deeply nested components', () => {
      const DeepChild = () => (
        <div data-testid="deep-child">Deep nested component</div>
      );

      const MiddleComponent = () => (
        <div data-testid="middle-component">
          <DeepChild />
        </div>
      );

      render(
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          <div data-testid="top-level">
            <MiddleComponent />
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('top-level')).toBeInTheDocument();
      expect(screen.getByTestId('middle-component')).toBeInTheDocument();
      expect(screen.getByTestId('deep-child')).toBeInTheDocument();
      
      const mockCall = MockedNextThemesProvider.mock.calls[0][0];
      expect(mockCall.defaultTheme).toBe('dark');
      expect(mockCall.enableSystem).toBe(false);
      expect(mockCall.children).toBeDefined();
    });

    test('works with React fragments and conditional rendering', () => {
      const showContent = true;
      
      render(
        <ThemeProvider themes={['light', 'dark']}>
          <>
            {showContent && (
              <div data-testid="fragment-content">
                Fragment Content
              </div>
            )}
            <div data-testid="always-visible">Always Visible</div>
          </>
        </ThemeProvider>
      );

      expect(screen.getByTestId('fragment-content')).toBeInTheDocument();
      expect(screen.getByTestId('always-visible')).toBeInTheDocument();
    });
  });
});