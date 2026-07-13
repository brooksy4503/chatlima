import { toast } from 'sonner';
import { handleChatTransportError } from '@/lib/chat/chatTransportErrors';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(() => 'toast-id'),
    dismiss: jest.fn(),
  },
}));

describe('handleChatTransportError', () => {
  const baseParams = () => {
    const lastSubmittedDraftRef = { current: 'draft text' };
    return {
      error: new Error(JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Slow down' } })),
      selectedModel: 'openrouter/test',
      lastSubmittedDraftRef,
      setInput: jest.fn(),
      setHideImagesInUI: jest.fn(),
      setIsErrorRecoveryNeeded: jest.fn(),
      setLastErrorTime: jest.fn(),
      lastToastId: null,
      setLastToastId: jest.fn(),
      lastErrorMessage: '',
      setLastErrorMessage: jest.fn(),
      lastToastTimestamp: 0,
      setLastToastTimestamp: jest.fn(),
      openAccessGateDialog: jest.fn(),
    };
  };

  it('opens access gate for paywall errors without recovery state', () => {
    const params = baseParams();
    params.error = new Error(
      JSON.stringify({ error: { code: 'PAYWALL_SUBSCRIPTION_REQUIRED', message: 'Subscribe' } })
    );

    handleChatTransportError(params);

    expect(params.openAccessGateDialog).toHaveBeenCalledWith(
      'PAYWALL_SUBSCRIPTION_REQUIRED',
      'openrouter/test'
    );
    expect(params.setIsErrorRecoveryNeeded).not.toHaveBeenCalled();
    expect(params.setInput).toHaveBeenCalledWith('draft text');
  });

  it('sets recovery state and shows toast for generic errors', () => {
    const params = baseParams();

    handleChatTransportError(params);

    expect(params.setIsErrorRecoveryNeeded).toHaveBeenCalledWith(true);
    expect(toast.error).toHaveBeenCalled();
  });
});
