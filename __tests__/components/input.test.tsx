/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Input } from '../../components/input';
import type { ImageAttachment } from '@/lib/types';
import type { modelID } from '@/ai/providers';

// Mock external dependencies
jest.mock('lucide-react', () => ({
  ArrowUp: ({ className }: any) => <div className={className} data-testid="arrow-up-icon" />,
  ImageIcon: ({ className }: any) => <div className={className} data-testid="image-icon" />,
}));

jest.mock('../../components/ui/input', () => ({
  Input: ({ className, value, onChange, placeholder, autoFocus, ...props }: any) => (
    <input
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...(autoFocus ? { autoFocus: true } : {})}
      data-testid="text-input"
      {...props}
    />
  ),
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, className, type, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/image-upload', () => ({
  ImageUpload: ({ onImageSelect, maxFiles, disabled, showDetailSelector }: any) => (
    <div 
      data-testid="image-upload"
      data-max-files={maxFiles}
      data-disabled={disabled}
      data-show-detail-selector={showDetailSelector}
    >
      <button 
        onClick={() => onImageSelect([mockImageAttachment])}
        disabled={disabled}
        data-testid="upload-button"
      >
        Upload Image
      </button>
    </div>
  ),
}));

jest.mock('../../components/image-preview', () => ({
  ImagePreview: ({ images, onRemove, maxWidth, maxHeight, className }: any) => (
    <div 
      className={className}
      data-testid="image-preview"
      data-max-width={maxWidth}
      data-max-height={maxHeight}
    >
      {images.map((image: any, index: number) => (
        <div key={index} data-testid={`preview-image-${index}`}>
          <button 
            onClick={() => onRemove(index)}
            data-testid={`remove-image-${index}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock useModels hook
const mockUseModels = jest.fn();
jest.mock('@/hooks/use-models', () => ({
  useModels: () => mockUseModels(),
}));

// Mock data
const mockImageAttachment: ImageAttachment = {
  dataUrl: 'data:image/jpeg;base64,test-data',
  metadata: {
    filename: 'test.jpg',
    size: 1024,
    mimeType: 'image/jpeg',
    width: 100,
    height: 100,
  },
  detail: 'auto',
};

const mockModelWithVision = {
  id: 'gpt-4-vision',
  name: 'GPT-4 Vision',
  vision: true,
  provider: 'OpenAI',
  premium: false,
  capabilities: ['vision'],
  status: 'available',
  lastChecked: new Date(),
};

const mockModelWithoutVision = {
  id: 'gpt-3.5-turbo',
  name: 'GPT-3.5 Turbo',
  vision: false,
  provider: 'OpenAI',
  premium: false,
  capabilities: ['text'],
  status: 'available',
  lastChecked: new Date(),
};

describe('Input Component', () => {
  const mockHandleInputChange = jest.fn();
  const mockStop = jest.fn();
  const mockOnImagesChange = jest.fn();

  const defaultProps = {
    input: '',
    handleInputChange: mockHandleInputChange,
    isLoading: false,
    status: 'idle',
    stop: mockStop,
    selectedModel: 'gpt-4-vision' as modelID,
    images: [],
    onImagesChange: mockOnImagesChange,
    maxImages: 5,
    enableImageUpload: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModels.mockReturnValue({
      models: [mockModelWithVision, mockModelWithoutVision],
      isLoading: false,
      error: null,
    });
  });

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders text input with correct placeholder when no images', () => {
      render(<Input {...defaultProps} />);
      
      const textInput = screen.getByTestId('text-input');
      expect(textInput).toBeInTheDocument();
      expect(textInput).toHaveAttribute('placeholder', 'Say something...');
      expect(textInput).toHaveValue('');
    });

    test('renders text input with images placeholder when images present', () => {
      render(<Input {...defaultProps} images={[mockImageAttachment]} />);
      
      const textInput = screen.getByTestId('text-input');
      expect(textInput).toHaveAttribute('placeholder', 'Describe these images or ask questions...');
    });

    test('renders with custom input value', () => {
      render(<Input {...defaultProps} input="Hello world" />);
      
      const textInput = screen.getByTestId('text-input');
      expect(textInput).toHaveValue('Hello world');
    });

    test('text input is present and functional', () => {
      render(<Input {...defaultProps} />);
      
      const textInput = screen.getByTestId('text-input');
      expect(textInput).toBeInTheDocument();
      expect(textInput).toHaveAttribute('placeholder', 'Say something...');
    });

    test('renders submit button when not loading', () => {
      render(<Input {...defaultProps} input="test" />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();
    });

    test('renders stop button when loading', () => {
      render(<Input {...defaultProps} status="streaming" />);
      
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find(button => button.getAttribute('type') === 'button' && button.querySelector('svg'));
      expect(stopButton).toHaveAttribute('type', 'button');
      // Stop button contains SVG spinner, not the ArrowUp icon
      expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument();
    });
  });

  // Tests for Vision Support Detection
  describe('Vision Support Detection', () => {
    test('shows image upload button when model supports vision', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon');
      expect(imageButton).toBeInTheDocument();
    });

    test('hides image upload button when model does not support vision', () => {
      render(<Input {...defaultProps} selectedModel="gpt-3.5-turbo" />);
      
      const imageButton = screen.queryByTestId('image-icon');
      expect(imageButton).not.toBeInTheDocument();
    });

    test('hides image upload button when enableImageUpload is false', () => {
      render(<Input {...defaultProps} enableImageUpload={false} />);
      
      const imageButton = screen.queryByTestId('image-icon');
      expect(imageButton).not.toBeInTheDocument();
    });

    test('handles missing model gracefully', () => {
      mockUseModels.mockReturnValue({
        models: [],
        isLoading: false,
        error: null,
      });

      render(<Input {...defaultProps} selectedModel="unknown-model" />);
      
      const imageButton = screen.queryByTestId('image-icon');
      expect(imageButton).not.toBeInTheDocument();
    });
  });

  // Tests for Image Upload Functionality
  describe('Image Upload Functionality', () => {
    test('shows image upload interface when image button is clicked', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    test('hides image upload interface when clicking image button again', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      fireEvent.click(imageButton!);
      
      expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
    });

    test('passes correct maxFiles to ImageUpload component', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" maxImages={3} images={[mockImageAttachment]} />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      const imageUpload = screen.getByTestId('image-upload');
      expect(imageUpload).toHaveAttribute('data-max-files', '2'); // maxImages - current images
    });

    test('disables image upload button when max images reached', () => {
      const maxImages = 2;
      const images = [mockImageAttachment, mockImageAttachment];
      
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" maxImages={maxImages} images={images} />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      expect(imageButton).toBeDisabled();
    });

    test('handles image selection from upload component', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      const uploadButton = screen.getByTestId('upload-button');
      fireEvent.click(uploadButton);
      
      expect(mockOnImagesChange).toHaveBeenCalledWith([mockImageAttachment]);
    });

    test('appends new images to existing images array', () => {
      const existingImages = [mockImageAttachment];
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" images={existingImages} />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      const uploadButton = screen.getByTestId('upload-button');
      fireEvent.click(uploadButton);
      
      expect(mockOnImagesChange).toHaveBeenCalledWith([mockImageAttachment, mockImageAttachment]);
    });

    test('hides upload interface after image selection', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      const uploadButton = screen.getByTestId('upload-button');
      fireEvent.click(uploadButton);
      
      expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
    });
  });

  // Tests for Image Preview Functionality
  describe('Image Preview Functionality', () => {
    test('shows image preview when images are present', () => {
      render(<Input {...defaultProps} images={[mockImageAttachment]} />);
      
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      expect(screen.getByTestId('preview-image-0')).toBeInTheDocument();
    });

    test('displays correct image count', () => {
      const images = [mockImageAttachment, mockImageAttachment];
      render(<Input {...defaultProps} images={images} maxImages={5} />);
      
      expect(screen.getByText('2/5 images • Click images to remove')).toBeInTheDocument();
    });

    test('passes correct props to ImagePreview component', () => {
      render(<Input {...defaultProps} images={[mockImageAttachment]} />);
      
      const imagePreview = screen.getByTestId('image-preview');
      expect(imagePreview).toHaveAttribute('data-max-width', '120');
      expect(imagePreview).toHaveAttribute('data-max-height', '120');
    });

    test('handles image removal', () => {
      const images = [mockImageAttachment, mockImageAttachment];
      render(<Input {...defaultProps} images={images} />);
      
      const removeButton = screen.getByTestId('remove-image-1');
      fireEvent.click(removeButton);
      
      expect(mockOnImagesChange).toHaveBeenCalledWith([mockImageAttachment]);
    });

    test('hides image preview when no images', () => {
      render(<Input {...defaultProps} images={[]} />);
      
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('calls handleInputChange when text input changes', () => {
      render(<Input {...defaultProps} />);
      
      const textInput = screen.getByTestId('text-input');
      fireEvent.change(textInput, { target: { value: 'Hello' } });
      
      expect(mockHandleInputChange).toHaveBeenCalled();
      expect(mockHandleInputChange).toHaveBeenCalledTimes(1);
    });

    test('calls stop function when stop button is clicked', () => {
      render(<Input {...defaultProps} status="streaming" />);
      
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find(button => button.getAttribute('type') === 'button' && button.querySelector('svg'));
      fireEvent.click(stopButton!);
      
      expect(mockStop).toHaveBeenCalled();
    });

    test('submit button is enabled when input has text', () => {
      render(<Input {...defaultProps} input="test" />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).not.toBeDisabled();
    });

    test('submit button is enabled when images are present', () => {
      render(<Input {...defaultProps} input="" images={[mockImageAttachment]} />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).not.toBeDisabled();
    });

    test('submit button is disabled when no input and no images', () => {
      render(<Input {...defaultProps} input="" images={[]} />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toBeDisabled();
    });

    test('submit button is disabled when loading', () => {
      render(<Input {...defaultProps} input="test" isLoading={true} />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toBeDisabled();
    });
  });

  // Tests for Loading States
  describe('Loading States', () => {
    test('shows stop button with spinner when status is streaming', () => {
      render(<Input {...defaultProps} status="streaming" />);
      
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find(button => button.getAttribute('type') === 'button' && button.querySelector('svg'));
      
      expect(stopButton).toBeInTheDocument();
      expect(stopButton).toHaveAttribute('type', 'button');
      
      // Should contain spinner SVG
      const svg = stopButton!.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('shows stop button with spinner when status is submitted', () => {
      render(<Input {...defaultProps} status="submitted" />);
      
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find(button => button.getAttribute('type') === 'button' && button.querySelector('svg'));
      
      expect(stopButton).toBeInTheDocument();
      expect(stopButton).toHaveAttribute('type', 'button');
    });

    test('disables image upload when loading', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" isLoading={true} />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      expect(imageButton).toBeDisabled();
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('submit button has proper type attribute', () => {
      render(<Input {...defaultProps} input="test" />);
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('stop button has proper type attribute', () => {
      render(<Input {...defaultProps} status="streaming" />);
      
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find(button => button.getAttribute('type') === 'button' && button.querySelector('svg'));
      expect(stopButton).toHaveAttribute('type', 'button');
    });

    test('image upload button has proper type attribute', () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      expect(imageButton).toHaveAttribute('type', 'button');
    });

    test('text input is properly configured', () => {
      render(<Input {...defaultProps} />);
      
      const textInput = screen.getByTestId('text-input');
      expect(textInput).toBeInTheDocument();
      expect(textInput.tagName.toLowerCase()).toBe('input');
    });
  });

  // Tests for Edge Cases and Error Handling
  describe('Edge Cases and Error Handling', () => {
    test('handles undefined onImagesChange gracefully', () => {
      render(<Input {...defaultProps} onImagesChange={undefined} selectedModel="gpt-4-vision" />);
      
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      const uploadButton = screen.getByTestId('upload-button');
      expect(() => fireEvent.click(uploadButton)).not.toThrow();
    });

    test('handles image removal with undefined onImagesChange', () => {
      render(<Input {...defaultProps} onImagesChange={undefined} images={[mockImageAttachment]} />);
      
      const removeButton = screen.getByTestId('remove-image-0');
      expect(() => fireEvent.click(removeButton)).not.toThrow();
    });

    test('handles useModels hook returning empty models array', () => {
      mockUseModels.mockReturnValue({
        models: [],
        isLoading: false,
        error: null,
      });

      render(<Input {...defaultProps} selectedModel="unknown-model" />);
      
      expect(screen.queryByTestId('image-icon')).not.toBeInTheDocument();
    });

    test('handles useModels hook error state', () => {
      mockUseModels.mockReturnValue({
        models: [],
        isLoading: false,
        error: new Error('Failed to load models'),
      });

      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      expect(screen.queryByTestId('image-icon')).not.toBeInTheDocument();
    });

    test('handles loading state from useModels', () => {
      mockUseModels.mockReturnValue({
        models: [],
        isLoading: true,
        error: null,
      });

      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      // Component should render without crashing during loading
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete image workflow: upload, preview, and remove', async () => {
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      // Open image upload
      const imageButton = screen.getByTestId('image-icon').closest('button');
      fireEvent.click(imageButton!);
      
      // Upload image
      const uploadButton = screen.getByTestId('upload-button');
      fireEvent.click(uploadButton);
      
      expect(mockOnImagesChange).toHaveBeenCalledWith([mockImageAttachment]);
      
      // Simulate image being added to props
      render(<Input {...defaultProps} selectedModel="gpt-4-vision" images={[mockImageAttachment]} />);
      
      // Verify preview appears
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
      expect(screen.getByText('1/5 images • Click images to remove')).toBeInTheDocument();
      
      // Remove image
      const removeButton = screen.getByTestId('remove-image-0');
      fireEvent.click(removeButton);
      
      expect(mockOnImagesChange).toHaveBeenLastCalledWith([]);
    });

    test('model switching affects image upload availability', () => {
      const { rerender } = render(<Input {...defaultProps} selectedModel="gpt-4-vision" />);
      
      // Should show image button for vision model
      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
      
      // Switch to non-vision model
      rerender(<Input {...defaultProps} selectedModel="gpt-3.5-turbo" />);
      
      // Should hide image button
      expect(screen.queryByTestId('image-icon')).not.toBeInTheDocument();
    });

    test('submit behavior changes based on content', () => {
      const { rerender } = render(<Input {...defaultProps} input="" />);
      
      // Initially disabled
      let buttons = screen.getAllByRole('button');
      let submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toBeDisabled();
      
      // Add text
      rerender(<Input {...defaultProps} input="Hello" />);
      buttons = screen.getAllByRole('button');
      submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).not.toBeDisabled();
      
      // Remove text, add image
      rerender(<Input {...defaultProps} input="" images={[mockImageAttachment]} />);
      buttons = screen.getAllByRole('button');
      submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).not.toBeDisabled();
      
      // Enter loading state
      rerender(<Input {...defaultProps} input="Hello" isLoading={true} />);
      buttons = screen.getAllByRole('button');
      submitButton = buttons.find(button => button.getAttribute('type') === 'submit');
      expect(submitButton).toBeDisabled();
    });
  });
});