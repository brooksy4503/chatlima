/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiKeyManager } from '../../components/api-key-manager';

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

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock UI components
jest.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => <div className={className} data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children, className }: any) => <p className={className} data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children, className }: any) => <div className={className} data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children, className }: any) => <div className={className} data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className} data-testid="dialog-title">{children}</h2>,
}));

jest.mock('../../components/ui/button', () => ({
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

jest.mock('../../components/ui/input', () => ({
  Input: ({ id, type, value, onChange, placeholder, className, ...props }: any) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid={`input-${id}`}
      {...props}
    />
  ),
}));

jest.mock('../../components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Key: ({ className }: any) => <div className={className} data-testid="key-icon" />,
  Eye: ({ className }: any) => <div className={className} data-testid="eye-icon" />,
  EyeOff: ({ className }: any) => <div className={className} data-testid="eyeoff-icon" />,
}));

import { toast } from 'sonner';

describe('ApiKeyManager Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all localStorage mocks to default behavior
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    localStorageMock.clear.mockImplementation(() => {});
  });

  // Tests for Dialog Rendering and Props
  describe('Dialog Rendering and Props', () => {
    test('renders dialog when open is true', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('API Key Settings');
    });

    test('does not render dialog when open is false', () => {
      render(<ApiKeyManager open={false} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    test('renders dialog description correctly', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const description = screen.getByTestId('dialog-description');
      expect(description).toHaveTextContent(
        "Enter your own API keys for different AI providers. Keys are stored securely in your browser's local storage."
      );
    });

    test('renders key icon in header', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.getByTestId('key-icon')).toBeInTheDocument();
    });
  });

  // Tests for API Key Configuration
  describe('API Key Configuration', () => {
    test('renders all API key inputs with correct labels and placeholders', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Check OpenAI
      expect(screen.getByTestId('label-openai')).toHaveTextContent('OpenAI API Key');
      expect(screen.getByTestId('input-openai')).toHaveAttribute('placeholder', 'sk-...');
      
      // Check Anthropic
      expect(screen.getByTestId('label-anthropic')).toHaveTextContent('Anthropic API Key');
      expect(screen.getByTestId('input-anthropic')).toHaveAttribute('placeholder', 'sk-ant-...');
      
      // Check Groq
      expect(screen.getByTestId('label-groq')).toHaveTextContent('Groq API Key');
      expect(screen.getByTestId('input-groq')).toHaveAttribute('placeholder', 'gsk_...');
      
      // Check XAI
      expect(screen.getByTestId('label-xai')).toHaveTextContent('XAI API Key');
      expect(screen.getByTestId('input-xai')).toHaveAttribute('placeholder', 'xai-...');
      
      // Check Openrouter
      expect(screen.getByTestId('label-openrouter')).toHaveTextContent('Openrouter API Key');
      expect(screen.getByTestId('input-openrouter')).toHaveAttribute('placeholder', 'sk-or-...');
      
      // Check Requesty
      expect(screen.getByTestId('label-requesty')).toHaveTextContent('Requesty API Key');
      expect(screen.getByTestId('input-requesty')).toHaveAttribute('placeholder', 'req-...');
    });

    test('inputs are initially of type password', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.getByTestId('input-openai')).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('input-anthropic')).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('input-groq')).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('input-xai')).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('input-openrouter')).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('input-requesty')).toHaveAttribute('type', 'password');
    });

    test('renders visibility toggle buttons for each input', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Should render Eye icons by default (password hidden, click to show)
      const eyeIcons = screen.getAllByTestId('eye-icon');
      expect(eyeIcons).toHaveLength(6); // One for each API key
    });
  });

  // Tests for localStorage Integration
  describe('localStorage Integration', () => {
    test('loads existing API keys from localStorage on mount', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'OPENAI_API_KEY': return 'sk-test-openai';
          case 'ANTHROPIC_API_KEY': return 'sk-ant-test';
          default: return null;
        }
      });

      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);

      await waitFor(() => {
        expect(screen.getByTestId('input-openai')).toHaveValue('sk-test-openai');
        expect(screen.getByTestId('input-anthropic')).toHaveValue('sk-ant-test');
        expect(screen.getByTestId('input-groq')).toHaveValue('');
      });
    });

    test('calls localStorage.getItem for all API key storage keys', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('OPENAI_API_KEY');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ANTHROPIC_API_KEY');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('GROQ_API_KEY');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('XAI_API_KEY');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('OPENROUTER_API_KEY');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('REQUESTY_API_KEY');
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('updates input value when user types', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const openaiInput = screen.getByTestId('input-openai');
      fireEvent.change(openaiInput, { target: { value: 'sk-new-key' } });
      
      expect(openaiInput).toHaveValue('sk-new-key');
    });

    test('toggles password visibility when eye button is clicked', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const openaiInput = screen.getByTestId('input-openai');
      const toggleButtons = screen.getAllByRole('button');
      const eyeToggleButton = toggleButtons.find(button => 
        button.querySelector('[data-testid="eye-icon"]')
      );
      
      expect(openaiInput).toHaveAttribute('type', 'password');
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(6);
      
      fireEvent.click(eyeToggleButton!);
      
      expect(openaiInput).toHaveAttribute('type', 'text');
      expect(screen.getAllByTestId('eyeoff-icon')).toHaveLength(1);
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(5);
    });

    test('saves API keys to localStorage when save button is clicked', async () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Input some keys
      fireEvent.change(screen.getByTestId('input-openai'), { target: { value: 'sk-test-key' } });
      fireEvent.change(screen.getByTestId('input-anthropic'), { target: { value: 'sk-ant-test' } });
      
      // Click save
      const saveButton = screen.getByText('Save Keys');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('OPENAI_API_KEY', 'sk-test-key');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('ANTHROPIC_API_KEY', 'sk-ant-test');
        expect(toast.success).toHaveBeenCalledWith('API keys saved successfully');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    test('removes empty API keys from localStorage when saving', async () => {
      localStorageMock.getItem.mockReturnValue('existing-key');
      
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Clear the input
      fireEvent.change(screen.getByTestId('input-openai'), { target: { value: '' } });
      
      // Click save
      const saveButton = screen.getByText('Save Keys');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('OPENAI_API_KEY');
      });
    });

    test('trims whitespace when saving API keys', async () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      fireEvent.change(screen.getByTestId('input-openai'), { target: { value: '  sk-test-key  ' } });
      
      const saveButton = screen.getByText('Save Keys');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('OPENAI_API_KEY', 'sk-test-key');
      });
    });

    test('clears all API keys when clear button is clicked', async () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const clearButton = screen.getByText('Clear All Keys');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('OPENAI_API_KEY');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('ANTHROPIC_API_KEY');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('GROQ_API_KEY');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('XAI_API_KEY');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('OPENROUTER_API_KEY');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('REQUESTY_API_KEY');
        expect(toast.success).toHaveBeenCalledWith('All API keys cleared');
      });
    });

    test('closes dialog when cancel button is clicked', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // Tests for Error Handling
  describe('Error Handling', () => {
    test('handles localStorage errors when saving', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      fireEvent.change(screen.getByTestId('input-openai'), { target: { value: 'sk-test' } });
      
      const saveButton = screen.getByText('Save Keys');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save API keys');
      });
    });

    test('handles localStorage errors when clearing', async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const clearButton = screen.getByText('Clear All Keys');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to clear API keys');
      });
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('form inputs have proper labels', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.getByTestId('label-openai')).toHaveAttribute('for', 'openai');
      expect(screen.getByTestId('input-openai')).toHaveAttribute('id', 'openai');
      
      expect(screen.getByTestId('label-anthropic')).toHaveAttribute('for', 'anthropic');
      expect(screen.getByTestId('input-anthropic')).toHaveAttribute('id', 'anthropic');
    });

    test('buttons have proper types', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const toggleButtons = screen.getAllByRole('button');
      const eyeToggleButtons = toggleButtons.filter(button => 
        button.querySelector('[data-testid="eyeoff-icon"]') || 
        button.querySelector('[data-testid="eye-icon"]')
      );
      
      eyeToggleButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('renders proper button variants', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      expect(screen.getByTestId('button-destructive')).toBeInTheDocument(); // Clear All Keys
      expect(screen.getByTestId('button-outline')).toBeInTheDocument(); // Cancel
      expect(screen.getByTestId('button-default')).toBeInTheDocument(); // Save Keys
    });
  });

  // Tests for Responsive Design
  describe('Responsive Design', () => {
    test('applies responsive classes to dialog content', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toHaveClass('max-w-[95vw]', 'sm:max-w-md', 'lg:max-w-[500px]');
    });

    test('applies responsive spacing classes', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const dialogHeader = screen.getByTestId('dialog-header');
      expect(dialogHeader).toHaveClass('space-y-2', 'sm:space-y-3');
      
      const dialogFooter = screen.getByTestId('dialog-footer');
      expect(dialogFooter).toHaveClass('flex-col-reverse', 'sm:flex-row');
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete workflow: load, edit, save API keys', async () => {
      // Setup existing key and reset mocks
      localStorageMock.setItem.mockClear();
      localStorageMock.getItem.mockImplementation((key) => 
        key === 'OPENAI_API_KEY' ? 'sk-existing' : null
      );
      
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Verify existing key loads
      await waitFor(() => {
        expect(screen.getByTestId('input-openai')).toHaveValue('sk-existing');
      });
      
      // Edit key
      fireEvent.change(screen.getByTestId('input-openai'), { target: { value: 'sk-updated' } });
      fireEvent.change(screen.getByTestId('input-anthropic'), { target: { value: 'sk-ant-new' } });
      
      // Save
      const saveButton = screen.getByRole('button', { name: /save keys/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('API keys saved successfully');
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
      
      // Check that both keys were saved
      expect(localStorageMock.setItem).toHaveBeenCalledWith('OPENAI_API_KEY', 'sk-updated');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('ANTHROPIC_API_KEY', 'sk-ant-new');
    });

    test('complete workflow: clear all keys', async () => {
      // Setup existing keys and reset mocks
      localStorageMock.removeItem.mockClear();
      localStorageMock.getItem.mockReturnValue('sk-existing');
      
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Wait for keys to load
      await waitFor(() => {
        expect(screen.getByTestId('input-openai')).toHaveValue('sk-existing');
      });
      
      // Clear all keys
      const clearButton = screen.getByRole('button', { name: /clear all keys/i });
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('All API keys cleared');
      });
      
      // Verify all localStorage keys were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('OPENAI_API_KEY');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ANTHROPIC_API_KEY');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('GROQ_API_KEY');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('XAI_API_KEY');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('OPENROUTER_API_KEY');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('REQUESTY_API_KEY');
      
      // Verify inputs are cleared in state
      expect(screen.getByTestId('input-openai')).toHaveValue('');
      expect(screen.getByTestId('input-anthropic')).toHaveValue('');
    });

    test('visibility toggle works for multiple inputs independently', () => {
      render(<ApiKeyManager open={true} onOpenChange={mockOnOpenChange} />);
      
      const inputs = [
        screen.getByTestId('input-openai'),
        screen.getByTestId('input-anthropic')
      ];
      
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('[data-testid="eye-icon"]')
      );
      
      // Initially all should be password type
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'password');
      });
      
      // Toggle first input
      fireEvent.click(toggleButtons[0]);
      expect(inputs[0]).toHaveAttribute('type', 'text');
      expect(inputs[1]).toHaveAttribute('type', 'password'); // Should remain password
      
      // Toggle second input
      fireEvent.click(toggleButtons[1]);
      expect(inputs[0]).toHaveAttribute('type', 'text');
      expect(inputs[1]).toHaveAttribute('type', 'text');
    });
  });
});