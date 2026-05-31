/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from '@testing-library/react';
import { PreferencesTab } from '../../../components/settings/preferences-tab';

jest.mock('../../../components/ui/switch', () => ({
  Switch: ({ id, checked, onCheckedChange }: any) => (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

describe('PreferencesTab', () => {
  const defaultProps = {
    showWelcomeScreen: true,
    onShowWelcomeScreenChange: jest.fn(),
    showSuggestedPrompts: true,
    onShowSuggestedPromptsChange: jest.fn(),
    webSearchEnabled: false,
    webSearchContextSize: 'low' as const,
    onWebSearchContextSizeChange: jest.fn(),
    imageGenerationEnabled: false,
    imageGenerationQuality: 'medium' as const,
    onImageGenerationQualityChange: jest.fn(),
    imageGenerationAspectRatio: '1:1',
    onImageGenerationAspectRatioChange: jest.fn(),
    imageGenerationOutputFormat: 'png' as const,
    onImageGenerationOutputFormatChange: jest.fn(),
    imageGenerationModel: 'openai/gpt-5-image',
    onImageGenerationModelChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders separate toggles for onboarding and suggested prompts', () => {
    render(<PreferencesTab {...defaultProps} />);

    expect(screen.getByText(/show welcome\/onboarding/i)).toBeInTheDocument();
    expect(screen.getByText(/display the welcome and onboarding setup cards/i)).toBeInTheDocument();
    expect(screen.getByText(/show suggested prompts/i)).toBeInTheDocument();
    expect(screen.getByText(/display prompt ideas on new empty chats/i)).toBeInTheDocument();
  });

  test('calls separate change handlers for onboarding and suggested prompt toggles', () => {
    render(<PreferencesTab {...defaultProps} />);

    fireEvent.click(screen.getByRole('switch', { name: /show welcome\/onboarding/i }));
    fireEvent.click(screen.getByRole('switch', { name: /show suggested prompts/i }));

    expect(defaultProps.onShowWelcomeScreenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onShowSuggestedPromptsChange).toHaveBeenCalledWith(false);
  });

  test('renders locked image generation model selector with selected cost', () => {
    render(<PreferencesTab {...defaultProps} />);

    expect(screen.getByLabelText(/image model/i)).toBeInTheDocument();
    expect(screen.getAllByText(/25 credits per image/i).length).toBeGreaterThan(0);
    expect(screen.getByText('GPT-5 Image')).toBeInTheDocument();
  });
});
