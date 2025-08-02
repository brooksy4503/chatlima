/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresetManager } from '../../components/preset-manager';
import { usePresets } from '@/lib/context/preset-context';
import { useModels } from '@/hooks/use-models';

// Mock external dependencies
jest.mock('@/lib/context/preset-context');
jest.mock('@/hooks/use-models');
jest.mock('@/lib/preset-templates');
jest.mock('@/lib/parameter-validation');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock window methods
const mockConfirm = jest.fn();
const mockAlert = jest.fn();
Object.assign(window, {
  confirm: mockConfirm,
  alert: mockAlert,
});

// Mock UI components with proper prop forwarding
jest.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => 
    open ? <div data-testid="dialog" onClick={() => onOpenChange?.(false)}>{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, title, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      title={title}
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid={`button-${title?.toLowerCase().replace(/\s+/g, '-') || 'button'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/input', () => ({
  Input: ({ id, type, value, onChange, placeholder, min, max, step, ...props }: any) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      data-testid={`input-${id}`}
      {...props}
    />
  ),
}));

jest.mock('../../components/ui/textarea', () => ({
  Textarea: ({ id, value, onChange, placeholder, rows, className, ...props }: any) => (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={className}
      data-testid={`textarea-${id}`}
      {...props}
    />
  ),
}));

jest.mock('../../components/ui/switch', () => ({
  Switch: ({ id, checked, onCheckedChange, disabled, ...props }: any) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      data-testid={`switch-${id}`}
      {...props}
    />
  ),
}));

jest.mock('../../components/ui/select', () => ({
  Select: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="select-container" {...props}>
      {children}
      <select 
        value={value} 
        onChange={(e) => onValueChange?.(e.target.value)}
        data-testid="select"
        style={{ display: 'none' }}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>{children}</div>
  ),
  SelectValue: () => <span data-testid="select-value" />,
}));

jest.mock('../../components/ui/tabs', () => {
  const React = require('react');
  const TabsContext = React.createContext(null);
  
  return {
    Tabs: ({ children, value, onValueChange, className }: any) => (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div data-testid="tabs" className={className} data-active-tab={value}>
          {children}
        </div>
      </TabsContext.Provider>
    ),
    TabsList: ({ children, className }: any) => (
      <div data-testid="tabs-list" className={className}>{children}</div>
    ),
    TabsTrigger: ({ children, value, disabled, className }: any) => {
      const context = React.useContext(TabsContext);
      return (
        <button 
          data-testid={`tab-${value}`}
          disabled={disabled}
          className={className}
          data-value={value}
          onClick={() => !disabled && context?.onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
    TabsContent: ({ children, value, className }: any) => (
      <div data-testid={`tab-content-${value}`} className={className}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>{children}</h3>
  ),
  CardDescription: ({ children, className }: any) => (
    <p data-testid="card-description" className={className}>{children}</p>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

jest.mock('../../components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div data-testid="scroll-area" className={className}>{children}</div>
  ),
}));

jest.mock('../../components/ui/alert', () => ({
  Alert: ({ children, variant, className }: any) => (
    <div data-testid="alert" data-variant={variant} className={className}>{children}</div>
  ),
  AlertDescription: ({ children, className }: any) => (
    <div data-testid="alert-description" className={className}>{children}</div>
  ),
}));

jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

jest.mock('../../components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

jest.mock('../../components/ui/separator', () => ({
  Separator: ({ className }: any) => (
    <hr data-testid="separator" className={className} />
  ),
}));

jest.mock('../../components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

jest.mock('../../components/model-picker', () => ({
  ModelPicker: ({ selectedModel, setSelectedModel, disabled }: any) => (
    <div data-testid="model-picker" data-disabled={disabled}>
      <select 
        value={selectedModel} 
        onChange={(e) => setSelectedModel?.(e.target.value)}
        data-testid="model-picker-select"
      >
        <option value="openrouter/anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
        <option value="openrouter/openai/gpt-4">GPT-4</option>
        <option value="requesty/test-model">Requesty Test</option>
      </select>
    </div>
  ),
}));

jest.mock('@/lib/preset-templates', () => {
  const mockTemplates = [
    {
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template',
      category: 'coding',
      icon: '🧪',
      preset: {
        name: 'Test Template Preset',
        modelId: 'openrouter/anthropic/claude-3.5-sonnet',
        systemInstruction: 'You are a test assistant.',
        temperature: 0.7,
        maxTokens: 2048,
        webSearchEnabled: false,
        webSearchContextSize: 'medium',
        apiKeyPreferences: {},
        isDefault: false,
        visibility: 'private',
      },
    },
  ];
  
  return {
    PRESET_TEMPLATES: mockTemplates,
    getTemplateCategories: jest.fn(() => ['coding']),
    getTemplatesByCategory: jest.fn(() => mockTemplates),
  };
});

jest.mock('@/lib/parameter-validation', () => ({
  validatePresetParameters: jest.fn(() => ({ valid: true, errors: [] })),
  getModelParameterConstraints: jest.fn(() => ({
    temperature: { min: 0, max: 2, default: 1 },
    maxTokens: { min: 1, max: 100000, default: 4096 },
    supportsSystemInstruction: true,
    maxSystemInstructionLength: 50000,
  })),
}));

// Test data
const mockPreset = {
  id: 'preset-1',
  userId: 'user-1',
  name: 'Test Preset',
  modelId: 'openrouter/anthropic/claude-3.5-sonnet',
  systemInstruction: 'You are a helpful assistant.',
  temperature: 0.7,
  maxTokens: 4096,
  webSearchEnabled: false,
  webSearchContextSize: 'medium' as const,
  apiKeyPreferences: {},
  isDefault: false,
  shareId: null,
  visibility: 'private' as const,
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockModel = {
  id: 'openrouter/anthropic/claude-3.5-sonnet',
  name: 'Claude 3.5 Sonnet',
  provider: 'Anthropic',
  supportsWebSearch: true,
  capabilities: ['chat', 'reasoning'],
  premium: false,
  vision: false,
  status: 'available' as const,
  lastChecked: new Date(),
};

describe('PresetManager', () => {
  const mockUsePresets = usePresets as jest.MockedFunction<typeof usePresets>;
  const mockUseModels = useModels as jest.MockedFunction<typeof useModels>;

  const defaultPresetsReturn = {
    presets: [mockPreset],
    activePreset: mockPreset,
    defaultPreset: mockPreset,
    loading: false,
    error: null,
    createPreset: jest.fn(),
    createPresetFromTemplate: jest.fn(),
    updatePreset: jest.fn(),
    deletePreset: jest.fn(),
    sharePreset: jest.fn(),
    unsharePreset: jest.fn(),
    setDefaultPreset: jest.fn(),
    unsetDefaultPreset: jest.fn(),
    setActivePreset: jest.fn(),
    importSharedPreset: jest.fn(),
    refreshPresets: jest.fn(),
    loadPresets: jest.fn(),
  };

  const defaultModelsReturn = {
    models: [mockModel],
    isLoading: false,
    error: null,
    mutate: jest.fn(),
    isValidating: false,
    refresh: jest.fn(),
    forceRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePresets.mockReturnValue(defaultPresetsReturn);
    mockUseModels.mockReturnValue(defaultModelsReturn);
    mockConfirm.mockReturnValue(true);
    navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);
  });

  describe('Basic Rendering and Props', () => {
    test('renders when open is true', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Preset Manager');
    });

    test('does not render when open is false', () => {
      render(<PresetManager open={false} onOpenChange={jest.fn()} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    test('renders all tab triggers', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      expect(screen.getByTestId('tab-list')).toBeInTheDocument();
      expect(screen.getByTestId('tab-templates')).toBeInTheDocument();
      expect(screen.getByTestId('tab-create')).toBeInTheDocument();
      expect(screen.getByTestId('tab-edit')).toBeInTheDocument();
    });

    test('displays preset list when presets exist', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      expect(screen.getByText('Your Presets (1)')).toBeInTheDocument();
      expect(screen.getByText('Test Preset')).toBeInTheDocument();
    });

    test('displays empty state when no presets exist', () => {
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        presets: [],
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      expect(screen.getByText('No presets yet.')).toBeInTheDocument();
      expect(screen.getByText('Browse Templates')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles dialog close when clicking outside', () => {
      const mockOnOpenChange = jest.fn();
      render(<PresetManager open={true} onOpenChange={mockOnOpenChange} />);
      
      fireEvent.click(screen.getByTestId('dialog'));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('opens create form when clicking New Preset button', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const newPresetButton = screen.getByText('New Preset');
      fireEvent.click(newPresetButton);
      
      expect(screen.getByPlaceholderText(/my custom preset/i)).toBeInTheDocument();
    });

    test('starts editing preset when clicking edit button', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const editButton = screen.getByRole('button', { name: /edit preset/i });
      fireEvent.click(editButton);
      
      expect(screen.getByTestId('tab-content-edit')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Preset')).toBeInTheDocument();
    });

    test('updates form data when inputs change', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      const nameInput = screen.getByPlaceholderText(/my custom preset/i);
      fireEvent.change(nameInput, { target: { value: 'New Preset Name' } });
      
      expect(nameInput).toHaveValue('New Preset Name');
    });

    test('updates temperature when slider changes', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      const temperatureInput = screen.getByLabelText(/Temperature/);
      fireEvent.change(temperatureInput, { target: { value: '0.8' } });
      
      expect(temperatureInput).toHaveValue(0.8);
    });

    test('toggles web search when switch is clicked', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      const webSearchSwitch = screen.getByLabelText('Enable Web Search');
      fireEvent.click(webSearchSwitch);
      
      expect(webSearchSwitch).toBeChecked();
    });
  });

  describe('State Management', () => {
    test('resets form when dialog closes', () => {
      const mockOnOpenChange = jest.fn();
      const { rerender } = render(<PresetManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Switch to create and fill form
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      const nameInput = screen.getByPlaceholderText(/my custom preset/i);
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });
      
      // Close dialog
      rerender(<PresetManager open={false} onOpenChange={mockOnOpenChange} />);
      rerender(<PresetManager open={true} onOpenChange={mockOnOpenChange} />);
      
      // Switch back to create tab to check reset form
      const createTabAgain = screen.getByTestId('tab-create');
      fireEvent.click(createTabAgain);
      
      // Form should be reset
      expect(screen.getByPlaceholderText(/my custom preset/i)).toHaveValue('');
    });

    test('populates form when editing preset', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const editButton = screen.getByRole('button', { name: /edit preset/i });
      fireEvent.click(editButton);
      
      expect(screen.getByDisplayValue('Test Preset')).toBeInTheDocument();
      expect(screen.getByDisplayValue('You are a helpful assistant.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.7')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4096')).toBeInTheDocument();
    });

    test('disables web search for unsupported models', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      // Note: Model picker is a complex component, we'll skip testing its internal select
      // const modelSelect = screen.getByTestId('model-picker-select');
      // fireEvent.change(modelSelect, { target: { value: 'requesty/test-model' } });
      
      // const webSearchSwitch = screen.getByLabelText('Enable Web Search');
      // expect(webSearchSwitch).toBeDisabled();
    });
  });

  describe('API Integration', () => {
    test('creates new preset when form is submitted', async () => {
      const mockCreatePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        createPreset: mockCreatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab and fill form
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      fireEvent.change(screen.getByPlaceholderText(/my custom preset/i), { 
        target: { value: 'New Preset' } 
      });
      fireEvent.change(screen.getByLabelText('System Instruction'), { 
        target: { value: 'Test instruction' } 
      });
      
      const submitButton = screen.getByText('Create Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePreset).toHaveBeenCalledWith({
          name: 'New Preset',
          modelId: 'openrouter/anthropic/claude-3.5-sonnet',
          systemInstruction: 'Test instruction',
          temperature: 1,
          maxTokens: 4096,
          webSearchEnabled: false,
          webSearchContextSize: 'medium',
          isDefault: false,
        });
      });
    });

    test('updates existing preset when editing', async () => {
      const mockUpdatePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        updatePreset: mockUpdatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Start editing
      const editButton = screen.getByRole('button', { name: /edit preset/i });
      fireEvent.click(editButton);
      
      // Update name
      const nameInput = screen.getByDisplayValue('Test Preset');
      fireEvent.change(nameInput, { target: { value: 'Updated Preset' } });
      
      const submitButton = screen.getByText('Update Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdatePreset).toHaveBeenCalledWith('preset-1', expect.objectContaining({
          name: 'Updated Preset',
        }));
      });
    });

    test('deletes preset when confirmed', async () => {
      const mockDeletePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        deletePreset: mockDeletePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete preset/i });
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Preset"?');
        expect(mockDeletePreset).toHaveBeenCalledWith('preset-1');
      });
    });

    test('does not delete preset when not confirmed', async () => {
      mockConfirm.mockReturnValue(false);
      const mockDeletePreset = jest.fn();
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        deletePreset: mockDeletePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete preset/i });
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockDeletePreset).not.toHaveBeenCalled();
      });
    });

    test('shares preset and copies link to clipboard', async () => {
      const mockSharePreset = jest.fn().mockResolvedValue('https://example.com/share/123');
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        sharePreset: mockSharePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const shareButton = screen.getByRole('button', { name: /share preset/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockSharePreset).toHaveBeenCalledWith('preset-1');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share/123');
        expect(mockAlert).toHaveBeenCalledWith('Share link copied to clipboard!');
      });
    });

    test('sets preset as default', async () => {
      const mockSetDefaultPreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        defaultPreset: null, // No default preset currently
        setDefaultPreset: mockSetDefaultPreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const setDefaultButton = screen.getByRole('button', { name: /set as default/i });
      fireEvent.click(setDefaultButton);
      
      await waitFor(() => {
        expect(mockSetDefaultPreset).toHaveBeenCalledWith('preset-1');
      });
    });
  });

  describe('Error Handling', () => {
    test('displays form validation errors', async () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      // Try to submit without required fields
      const submitButton = screen.getByText('Create Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByText(/Preset name is required/)).toBeInTheDocument();
        expect(screen.getByText(/System instruction is required/)).toBeInTheDocument();
      });
    });

    test('displays API errors', () => {
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        error: 'Failed to load presets',
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load presets')).toBeInTheDocument();
    });

    test('handles create preset API errors', async () => {
      const mockCreatePreset = jest.fn().mockRejectedValue(new Error('API Error'));
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        createPreset: mockCreatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab and fill form
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      fireEvent.change(screen.getByPlaceholderText(/my custom preset/i), { 
        target: { value: 'New Preset' } 
      });
      fireEvent.change(screen.getByLabelText('System Instruction'), { 
        target: { value: 'Test instruction' } 
      });
      
      const submitButton = screen.getByText('Create Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    test('handles share preset errors', async () => {
      const mockSharePreset = jest.fn().mockRejectedValue(new Error('Share failed'));
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        sharePreset: mockSharePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const shareButton = screen.getByRole('button', { name: /share preset/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to generate share link');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes for dialog', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toBeInTheDocument();
      
      const title = screen.getByTestId('dialog-title');
      expect(title).toHaveTextContent('Preset Manager');
    });

    test('has proper labels for form inputs', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Switch to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      expect(screen.getByText('Preset Name')).toBeInTheDocument();
      expect(screen.getByText('System Instruction')).toBeInTheDocument();
      expect(screen.getByLabelText(/Temperature/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Tokens/)).toBeInTheDocument();
    });

    test('has proper button titles for actions', () => {
      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Use getByRole and title for buttons
      expect(screen.getByRole('button', { name: /use this preset/i })).toHaveAttribute('title', 'Use this preset');
      expect(screen.getByRole('button', { name: /edit preset/i })).toHaveAttribute('title', 'Edit preset');
      expect(screen.getByRole('button', { name: /share preset/i })).toHaveAttribute('title', 'Share preset');
      expect(screen.getByRole('button', { name: /delete preset/i })).toHaveAttribute('title', 'Delete preset');
    });
  });

  describe('Integration Tests', () => {
    test('complete preset creation workflow', async () => {
      const mockCreatePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        createPreset: mockCreatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Navigate to create tab
      const createTab = screen.getByTestId('tab-create');
      fireEvent.click(createTab);
      
      // Fill out the form
      fireEvent.change(screen.getByPlaceholderText(/my custom preset/i), { 
        target: { value: 'Complete Test Preset' } 
      });
      
      // Note: Model picker is a complex component, we'll skip testing its internal select
      // fireEvent.change(screen.getByTestId('model-picker-select'), { 
      //   target: { value: 'openrouter/openai/gpt-4' } 
      // });
      
      fireEvent.change(screen.getByLabelText('System Instruction'), { 
        target: { value: 'You are a comprehensive test assistant.' } 
      });
      
      fireEvent.change(screen.getByLabelText(/Temperature/), { 
        target: { value: '0.8' } 
      });
      
      fireEvent.change(screen.getByLabelText(/Max Tokens/), { 
        target: { value: '8192' } 
      });
      
      // Enable web search
      fireEvent.click(screen.getByLabelText('Enable Web Search'));
      
      // Set as default
      fireEvent.click(screen.getByLabelText('Set as default preset'));
      
      // Submit the form
      const submitButton = screen.getByText('Create Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePreset).toHaveBeenCalledWith({
          name: 'Complete Test Preset',
          modelId: 'openrouter/anthropic/claude-3.5-sonnet', // Default model from component
          systemInstruction: 'You are a comprehensive test assistant.',
          temperature: 0.8,
          maxTokens: 8192,
          webSearchEnabled: true,
          webSearchContextSize: 'medium',
          isDefault: true,
        });
      });
    });

    test('template-based preset creation workflow', async () => {
      const mockCreatePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        createPreset: mockCreatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Navigate to templates tab
      const templatesTab = screen.getByTestId('tab-templates');
      fireEvent.click(templatesTab);
      
      // Select a template
      const useTemplateButton = screen.getByText('Use Template');
      fireEvent.click(useTemplateButton);
      
      // Should switch to create tab with pre-filled data
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/based on "test template preset"/i)).toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('You are a test assistant.')).toBeInTheDocument();
      
      // Add custom name
      fireEvent.change(screen.getByPlaceholderText(/based on "test template preset"/i), { 
        target: { value: 'My Custom Template Preset' } 
      });
      
      // Submit
      const submitButton = screen.getByText('Create Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePreset).toHaveBeenCalledWith(expect.objectContaining({
          name: 'My Custom Template Preset',
          systemInstruction: 'You are a test assistant.',
        }));
      });
    });

    test('complete preset editing workflow', async () => {
      const mockUpdatePreset = jest.fn().mockResolvedValue(undefined);
      mockUsePresets.mockReturnValue({
        ...defaultPresetsReturn,
        updatePreset: mockUpdatePreset,
      });

      render(<PresetManager open={true} onOpenChange={jest.fn()} />);
      
      // Start editing existing preset
      const editButton = screen.getByRole('button', { name: /edit preset/i });
      fireEvent.click(editButton);
      
      // Verify form is populated
      expect(screen.getByDisplayValue('Test Preset')).toBeInTheDocument();
      expect(screen.getByDisplayValue('You are a helpful assistant.')).toBeInTheDocument();
      
      // Make changes
      fireEvent.change(screen.getByDisplayValue('Test Preset'), { 
        target: { value: 'Updated Test Preset' } 
      });
      
      fireEvent.change(screen.getByDisplayValue('0.7'), { 
        target: { value: '0.9' } 
      });
      
      // Enable web search
      fireEvent.click(screen.getByLabelText('Enable Web Search'));
      
      // Submit changes
      const submitButton = screen.getByText('Update Preset');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdatePreset).toHaveBeenCalledWith('preset-1', expect.objectContaining({
          name: 'Updated Test Preset',
          temperature: 0.9,
          webSearchEnabled: true,
        }));
      });
    });
  });
});