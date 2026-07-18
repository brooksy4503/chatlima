import { parseOpenRouterModels } from '@/lib/models/provider-configs';

describe('parseOpenRouterModels', () => {
  it('sets Kimi K3 output limits when OpenRouter omits max_completion_tokens', () => {
    const models = parseOpenRouterModels({
      data: [
        {
          id: 'moonshotai/kimi-k3',
          name: 'MoonshotAI: Kimi K3',
          context_length: 1048576,
          top_provider: {
            context_length: 1048576,
            max_completion_tokens: null,
          },
          architecture: { modality: 'text+image->text' },
          supported_parameters: ['reasoning', 'include_reasoning', 'max_tokens', 'tools'],
        },
      ],
    });

    expect(models).toHaveLength(1);
    expect(models[0]).toMatchObject({
      id: 'openrouter/moonshotai/kimi-k3',
      contextMax: 1048576,
      maxTokensRange: {
        min: 1,
        max: 131072,
        default: 32768,
      },
    });
  });

  it('sets large-context Kimi fallback when max_completion_tokens is missing', () => {
    const models = parseOpenRouterModels({
      data: [
        {
          id: 'moonshotai/kimi-k2.6',
          name: 'MoonshotAI: Kimi K2.6',
          context_length: 262144,
          top_provider: {
            context_length: 262144,
            max_completion_tokens: null,
          },
          architecture: { modality: 'text->text' },
        },
      ],
    });

    expect(models[0].maxTokensRange).toEqual({
      min: 1,
      max: 100352,
      default: 16384,
    });
  });
});
