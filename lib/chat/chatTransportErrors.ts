import { toast } from 'sonner';
import type { MutableRefObject } from 'react';

export type ChatAccessGateReason =
  | 'PAYWALL_SUBSCRIPTION_REQUIRED'
  | 'PAYWALL_BYOK_REQUIRED';

export type HandleChatTransportErrorParams = {
  error: Error;
  activePresetModelId?: string;
  selectedModel: string;
  lastSubmittedDraftRef: MutableRefObject<string | null>;
  setInput: (value: string) => void;
  setHideImagesInUI: (value: boolean) => void;
  setIsErrorRecoveryNeeded: (value: boolean) => void;
  setLastErrorTime: (value: number | null) => void;
  lastToastId: string | null;
  setLastToastId: (value: string | null) => void;
  lastErrorMessage: string;
  setLastErrorMessage: (value: string) => void;
  lastToastTimestamp: number;
  setLastToastTimestamp: (value: number) => void;
  openAccessGateDialog: (reason: ChatAccessGateReason, modelId: string) => void;
};

export function handleChatTransportError(params: HandleChatTransportErrorParams): void {
  const {
    error,
    activePresetModelId,
    selectedModel,
    lastSubmittedDraftRef,
    setInput,
    setHideImagesInUI,
    setIsErrorRecoveryNeeded,
    setLastErrorTime,
    lastToastId,
    setLastToastId,
    lastErrorMessage,
    setLastErrorMessage,
    lastToastTimestamp,
    setLastToastTimestamp,
    openAccessGateDialog,
  } = params;

  let errorMessage = 'An error occurred, please try again later.';
  let errorCode = 'UNKNOWN_ERROR';
  let errorDetails: unknown = 'No additional details available.';

  try {
    const parsedBody = JSON.parse(error.message);

    if (parsedBody.error && typeof parsedBody.error === 'object' && parsedBody.error.code) {
      const apiErrorObject = parsedBody.error;
      errorMessage = apiErrorObject.message || errorMessage;
      errorCode = apiErrorObject.code || errorCode;
      errorDetails = apiErrorObject.details || errorDetails;
    } else if (typeof parsedBody.error === 'string' && parsedBody.message) {
      errorMessage = parsedBody.message;
      if (parsedBody.error === 'Message limit reached') {
        errorCode = 'MESSAGE_LIMIT_REACHED';
        const details: Record<string, unknown> = {};
        if (typeof parsedBody.limit !== 'undefined') details.limit = parsedBody.limit;
        if (typeof parsedBody.remaining !== 'undefined') details.remaining = parsedBody.remaining;
        if (Object.keys(details).length > 0) errorDetails = JSON.stringify(details);
      }
    } else if (parsedBody.message) {
      errorMessage = parsedBody.message;
    } else if (
      error.message &&
      error.message.length > 0 &&
      errorMessage === 'An error occurred, please try again later.'
    ) {
      errorMessage = error.message;
    }
  } catch {
    if (error.message && error.message.length > 0) {
      errorMessage = error.message;
    }
  }

  const isPaywallError =
    errorCode === 'PAYWALL_SUBSCRIPTION_REQUIRED' || errorCode === 'PAYWALL_BYOK_REQUIRED';

  if (isPaywallError) {
    const paywallReason: ChatAccessGateReason =
      errorCode === 'PAYWALL_SUBSCRIPTION_REQUIRED'
        ? 'PAYWALL_SUBSCRIPTION_REQUIRED'
        : 'PAYWALL_BYOK_REQUIRED';
    setHideImagesInUI(false);
    if (lastSubmittedDraftRef.current !== null) {
      setInput(lastSubmittedDraftRef.current);
      lastSubmittedDraftRef.current = null;
    }
    openAccessGateDialog(paywallReason, activePresetModelId || selectedModel);
    return;
  }

  setHideImagesInUI(false);
  if (lastSubmittedDraftRef.current !== null) {
    setInput(lastSubmittedDraftRef.current);
    lastSubmittedDraftRef.current = null;
  }

  setIsErrorRecoveryNeeded(true);
  setLastErrorTime(Date.now());

  console.error(`Chat Error [Code: ${errorCode}]: ${errorMessage}`, {
    details: errorDetails,
    originalError: error,
  });

  let toastMessage = errorMessage;
  switch (errorCode) {
    case 'AUTHENTICATION_REQUIRED':
      toastMessage = 'Authentication required. Please log in to continue.';
      break;
    case 'INSUFFICIENT_CREDITS':
      toastMessage = 'You have insufficient credits. Please top up your account.';
      break;
    case 'RATE_LIMIT_EXCEEDED':
      toastMessage = 'Too many requests. Please wait a moment and try again.';
      break;
    case 'LLM_PROVIDER_ERROR':
      toastMessage =
        'The AI model provider is experiencing issues. Please try a different model or try again later.';
      break;
    case 'MODEL_INIT_FAILED':
      toastMessage = 'Failed to initialize the selected AI model. Please try another model.';
      break;
    case 'STREAM_ERROR':
      if (
        typeof errorDetails === 'object' &&
        errorDetails !== null &&
        ('rawMessage' in errorDetails || 'cause' in errorDetails)
      ) {
        const detailMsg =
          (errorDetails as { rawMessage?: string; cause?: string }).rawMessage ||
          (errorDetails as { rawMessage?: string; cause?: string }).cause;
        toastMessage = `Error: ${detailMsg}`;
      } else if (errorMessage && errorMessage !== 'An error occurred while processing your request.') {
        toastMessage = errorMessage;
      } else {
        toastMessage = 'A problem occurred while getting the response. Please try again.';
      }
      break;
    default:
      if (
        errorMessage.includes('does not currently support') &&
        (errorMessage.includes('tool_choice') || errorMessage.includes('tools'))
      ) {
        toastMessage =
          "This model doesn't support the advanced features required for this request. Please try a different model.";
      } else if (!errorMessage || errorMessage === 'An error occurred, please try again later.') {
        toastMessage = 'An unexpected issue occurred. Please try again.';
      }
      break;
  }

  const now = Date.now();
  const timeSinceLastToast = now - lastToastTimestamp;
  const isSameMessage = toastMessage === lastErrorMessage;
  const tooSoon = timeSinceLastToast < (isSameMessage ? 5000 : 2000);

  if (tooSoon) return;

  if (lastToastId) {
    toast.dismiss(lastToastId);
  }

  const toastId = toast.error(toastMessage, {
    position: 'top-center',
    richColors: true,
    description:
      errorCode !== 'UNKNOWN_ERROR' && errorMessage !== toastMessage ? errorMessage : undefined,
    duration: 8000,
  });

  setLastToastId(String(toastId));
  setLastErrorMessage(toastMessage);
  setLastToastTimestamp(now);
}
