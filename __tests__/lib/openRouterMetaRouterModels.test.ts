import {
  getOpenRouterApiModelId,
  isOpenRouterMetaRouterModel,
} from '@/lib/chat/openRouterMetaRouterModels';

describe('openRouterMetaRouterModels', () => {
  describe('getOpenRouterApiModelId', () => {
    it('strips the ChatLima openrouter/ prefix once', () => {
      expect(getOpenRouterApiModelId('openrouter/openrouter/fusion')).toBe('openrouter/fusion');
      expect(getOpenRouterApiModelId('openrouter/google/gemini-2.5-flash')).toBe(
        'google/gemini-2.5-flash'
      );
    });

    it('returns null for non-OpenRouter models', () => {
      expect(getOpenRouterApiModelId('anthropic/claude-3-7-sonnet')).toBeNull();
    });
  });

  describe('isOpenRouterMetaRouterModel', () => {
    it('detects OpenRouter meta-router models (fusion, auto, free)', () => {
      expect(isOpenRouterMetaRouterModel('openrouter/openrouter/fusion')).toBe(true);
      expect(isOpenRouterMetaRouterModel('openrouter/openrouter/auto')).toBe(true);
      expect(isOpenRouterMetaRouterModel('openrouter/openrouter/free')).toBe(true);
    });

    it('returns false for standard routed provider models', () => {
      expect(isOpenRouterMetaRouterModel('openrouter/google/gemini-2.5-flash')).toBe(false);
      expect(isOpenRouterMetaRouterModel('openrouter/anthropic/claude-sonnet-4')).toBe(false);
      expect(isOpenRouterMetaRouterModel('gpt-5-nano')).toBe(false);
    });
  });
});
