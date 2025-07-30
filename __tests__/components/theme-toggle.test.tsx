/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle } from '../../components/theme-toggle';

// Mock next-themes
const mockSetTheme = jest.fn();
const mockUseTheme = {
  setTheme: mockSetTheme,
  theme: 'dark',
  resolvedTheme: 'dark',
};

jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme,
}));

// Mock UI components
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

jest.mock('../../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onSelect, className }: any) => (
    <div 
      data-testid="dropdown-item" 
      className={className}
      onClick={onSelect}
      role="menuitem"
    >
      {children}
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  CircleDashed: ({ className }: any) => <div className={className} data-testid="circle-dashed-icon" />,
  Flame: ({ className }: any) => <div className={className} data-testid="flame-icon" />,
  Sun: ({ className }: any) => <div className={className} data-testid="sun-icon" />,
  TerminalSquare: ({ className }: any) => <div className={className} data-testid="terminal-square-icon" />,
  CassetteTape: ({ className }: any) => <div className={className} data-testid="cassette-tape-icon" />,
  Leaf: ({ className }: any) => <div className={className} data-testid="leaf-icon" />,
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.theme = 'dark';
    mockUseTheme.resolvedTheme = 'dark';
  });

  describe('Basic Rendering and Props', () => {
    test('renders with default props', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('button-ghost')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<ThemeToggle className="custom-class" />);
      
      const button = screen.getByTestId('button-ghost');
      expect(button).toHaveClass('custom-class');
    });

    test('renders with custom trigger', () => {
      const customTrigger = <button data-testid="custom-trigger">Custom</button>;
      render(<ThemeToggle trigger={customTrigger} />);
      
      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    test('renders with showLabel and labelText', () => {
      render(<ThemeToggle showLabel={true} labelText="Theme" />);
      
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    test('renders with showLabel and custom labelText element', () => {
      render(<ThemeToggle showLabel={true} labelText={<span data-testid="custom-label">Custom Label</span>} />);
      
      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    test('has screen reader text for accessibility', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByText('Toggle theme')).toBeInTheDocument();
      expect(screen.getByText('Toggle theme')).toHaveClass('sr-only');
    });
  });

  describe('Theme Icon Display', () => {
    test('displays flame icon for dark theme in trigger', () => {
      mockUseTheme.theme = 'dark';
      mockUseTheme.resolvedTheme = 'dark';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });

    test('displays sun icon for light theme in trigger', () => {
      mockUseTheme.theme = 'light';
      mockUseTheme.resolvedTheme = 'light';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="sun-icon"]')).toBeInTheDocument();
    });

    test('displays circle-dashed icon for black theme in trigger', () => {
      mockUseTheme.theme = 'black';
      mockUseTheme.resolvedTheme = 'black';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="circle-dashed-icon"]')).toBeInTheDocument();
    });

    test('displays sun icon for sunset theme in trigger', () => {
      mockUseTheme.theme = 'sunset';
      mockUseTheme.resolvedTheme = 'sunset';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="sun-icon"]')).toBeInTheDocument();
    });

    test('displays terminal-square icon for cyberpunk theme in trigger', () => {
      mockUseTheme.theme = 'cyberpunk';
      mockUseTheme.resolvedTheme = 'cyberpunk';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="terminal-square-icon"]')).toBeInTheDocument();
    });

    test('displays cassette-tape icon for retro theme in trigger', () => {
      mockUseTheme.theme = 'retro';
      mockUseTheme.resolvedTheme = 'retro';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="cassette-tape-icon"]')).toBeInTheDocument();
    });

    test('displays leaf icon for nature theme in trigger', () => {
      mockUseTheme.theme = 'nature';
      mockUseTheme.resolvedTheme = 'nature';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="leaf-icon"]')).toBeInTheDocument();
    });

    test('displays flame icon as fallback for unknown theme in trigger', () => {
      mockUseTheme.theme = 'unknown';
      mockUseTheme.resolvedTheme = 'unknown';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });
  });

  describe('Theme Logic with System Theme', () => {
    test('uses resolvedTheme when theme is system', () => {
      mockUseTheme.theme = 'system';
      mockUseTheme.resolvedTheme = 'light';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="sun-icon"]')).toBeInTheDocument();
    });

    test('uses resolvedTheme when theme is undefined', () => {
      mockUseTheme.theme = undefined;
      mockUseTheme.resolvedTheme = 'dark';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });

    test('prioritizes explicit theme over resolvedTheme', () => {
      mockUseTheme.theme = 'light';
      mockUseTheme.resolvedTheme = 'dark';
      
      render(<ThemeToggle />);
      
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="sun-icon"]')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls setTheme with dark when dark option is selected', () => {
      render(<ThemeToggle />);
      
      const darkOption = screen.getAllByTestId('dropdown-item')[0];
      fireEvent.click(darkOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    test('calls setTheme with light when light option is selected', () => {
      render(<ThemeToggle />);
      
      const lightOption = screen.getAllByTestId('dropdown-item')[1];
      fireEvent.click(lightOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    test('calls setTheme with black when black option is selected', () => {
      render(<ThemeToggle />);
      
      const blackOption = screen.getAllByTestId('dropdown-item')[2];
      fireEvent.click(blackOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('black');
    });

    test('calls setTheme with sunset when sunset option is selected', () => {
      render(<ThemeToggle />);
      
      const sunsetOption = screen.getAllByTestId('dropdown-item')[3];
      fireEvent.click(sunsetOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('sunset');
    });

    test('calls setTheme with cyberpunk when cyberpunk option is selected', () => {
      render(<ThemeToggle />);
      
      const cyberpunkOption = screen.getAllByTestId('dropdown-item')[4];
      fireEvent.click(cyberpunkOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('cyberpunk');
    });

    test('calls setTheme with retro when retro option is selected', () => {
      render(<ThemeToggle />);
      
      const retroOption = screen.getAllByTestId('dropdown-item')[5];
      fireEvent.click(retroOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('retro');
    });

    test('calls setTheme with nature when nature option is selected', () => {
      render(<ThemeToggle />);
      
      const natureOption = screen.getAllByTestId('dropdown-item')[6];
      fireEvent.click(natureOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('nature');
    });

    test('handles multiple theme changes', () => {
      render(<ThemeToggle />);
      
      const lightOption = screen.getAllByTestId('dropdown-item')[1];
      const darkOption = screen.getAllByTestId('dropdown-item')[0];
      
      fireEvent.click(lightOption);
      fireEvent.click(darkOption);
      
      expect(mockSetTheme).toHaveBeenCalledTimes(2);
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'light');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'dark');
    });
  });

  describe('Dropdown Menu Content', () => {
    test('displays all theme options with correct labels', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Black')).toBeInTheDocument();
      expect(screen.getByText('Sunset')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk')).toBeInTheDocument();
      expect(screen.getByText('Retro')).toBeInTheDocument();
      expect(screen.getByText('Nature')).toBeInTheDocument();
    });

    test('displays all theme options with correct icons', () => {
      render(<ThemeToggle />);
      
      // Check that each theme option has its icon in the dropdown menu
      const dropdownContent = screen.getByTestId('dropdown-content');
      
      // Verify each theme option icon exists in dropdown
      expect(dropdownContent.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument(); // Dark theme
      expect(dropdownContent.querySelectorAll('[data-testid="sun-icon"]')).toHaveLength(2); // Light and Sunset themes
      expect(dropdownContent.querySelector('[data-testid="circle-dashed-icon"]')).toBeInTheDocument(); // Black theme
      expect(dropdownContent.querySelector('[data-testid="terminal-square-icon"]')).toBeInTheDocument(); // Cyberpunk theme
      expect(dropdownContent.querySelector('[data-testid="cassette-tape-icon"]')).toBeInTheDocument(); // Retro theme
      expect(dropdownContent.querySelector('[data-testid="leaf-icon"]')).toBeInTheDocument(); // Nature theme
    });

    test('dropdown content has correct alignment', () => {
      render(<ThemeToggle />);
      
      const dropdownContent = screen.getByTestId('dropdown-content');
      expect(dropdownContent).toHaveAttribute('data-align', 'end');
    });
  });

  describe('Accessibility', () => {
    test('dropdown items have proper role', () => {
      render(<ThemeToggle />);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(7); // 7 theme options
    });

    test('has accessible screen reader text', () => {
      render(<ThemeToggle />);
      
      const srText = screen.getByText('Toggle theme');
      expect(srText).toHaveClass('sr-only');
    });

    test('button has proper attributes when using default trigger', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByTestId('button-ghost');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'icon');
    });

    test('maintains accessibility with custom trigger', () => {
      const customTrigger = (
        <button aria-label="Select theme" data-testid="custom-trigger">
          Theme
        </button>
      );
      render(<ThemeToggle trigger={customTrigger} />);
      
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Select theme');
    });
  });

  describe('Edge Cases', () => {
    test('handles null resolvedTheme gracefully', () => {
      mockUseTheme.theme = 'system';
      mockUseTheme.resolvedTheme = null;
      
      render(<ThemeToggle />);
      
      // Should fallback to flame icon
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });

    test('handles undefined theme and resolvedTheme gracefully', () => {
      mockUseTheme.theme = undefined;
      mockUseTheme.resolvedTheme = undefined;
      
      render(<ThemeToggle />);
      
      // Should fallback to flame icon
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });

    test('handles empty string theme gracefully', () => {
      mockUseTheme.theme = '';
      mockUseTheme.resolvedTheme = '';
      
      render(<ThemeToggle />);
      
      // Should fallback to flame icon
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });

    test('forwards additional props to button', () => {
      render(<ThemeToggle data-custom="test" id="theme-toggle" />);
      
      const button = screen.getByTestId('button-ghost');
      expect(button).toHaveAttribute('data-custom', 'test');
      expect(button).toHaveAttribute('id', 'theme-toggle');
    });
  });

  describe('Component Variants', () => {
    test('renders correctly with showLabel but no labelText', () => {
      render(<ThemeToggle showLabel={true} />);
      
      // Should render default button since labelText is not provided
      expect(screen.getByTestId('button-ghost')).toBeInTheDocument();
    });

    test('renders correctly with labelText but showLabel false', () => {
      render(<ThemeToggle showLabel={false} labelText="Theme" />);
      
      // Should render default button since showLabel is false
      expect(screen.getByTestId('button-ghost')).toBeInTheDocument();
      expect(screen.queryByText('Theme')).not.toBeInTheDocument();
    });

    test('renders with showLabel and labelText and applies custom className', () => {
      render(<ThemeToggle showLabel={true} labelText="Theme" className="custom-class" />);
      
      // When showLabel and labelText are provided, the component should render the text
      expect(screen.getByText('Theme')).toBeInTheDocument();
      
      // Should not render the default button when using showLabel and labelText
      expect(screen.queryByTestId('button-ghost')).not.toBeInTheDocument();
      
      // The component should still render the dropdown functionality
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      
      // Should include an icon alongside the label in the trigger area
      const dropdownTrigger = screen.getByTestId('dropdown-trigger');
      expect(dropdownTrigger.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete theme change workflow', async () => {
      // Start with dark theme
      mockUseTheme.theme = 'dark';
      mockUseTheme.resolvedTheme = 'dark';
      
      const { rerender } = render(<ThemeToggle />);
      
      // Verify initial state - flame icon in trigger
      const triggerButton = screen.getByTestId('button-ghost');
      expect(triggerButton.querySelector('[data-testid="flame-icon"]')).toBeInTheDocument();
      
      // Change to light theme
      const lightOption = screen.getAllByTestId('dropdown-item')[1];
      fireEvent.click(lightOption);
      
      expect(mockSetTheme).toHaveBeenCalledWith('light');
      
      // Test that the theme would change by simulating theme update
      mockUseTheme.theme = 'light';
      mockUseTheme.resolvedTheme = 'light';
      
      // Re-render to see the change (in real app, this would happen automatically)
      rerender(<ThemeToggle />);
      
      const updatedTriggerButton = screen.getByTestId('button-ghost');
      expect(updatedTriggerButton.querySelector('[data-testid="sun-icon"]')).toBeInTheDocument();
    });

    test('works with all theme options in sequence', () => {
      render(<ThemeToggle />);
      
      const themes = ['dark', 'light', 'black', 'sunset', 'cyberpunk', 'retro', 'nature'];
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      
      themes.forEach((theme, index) => {
        fireEvent.click(dropdownItems[index]);
        expect(mockSetTheme).toHaveBeenCalledWith(theme);
      });
      
      expect(mockSetTheme).toHaveBeenCalledTimes(7);
    });
  });
});