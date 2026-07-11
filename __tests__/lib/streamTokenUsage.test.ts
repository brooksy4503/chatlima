import {
  resolveStreamTokenUsage,
  type ResolveStreamTokenUsageParams,
} from '@/lib/chat/streamTokenUsage';

jest.mock('@/lib/utils/performantLogging', () => ({
  logDiagnostic: jest.fn(),
}));

const baseParams = (): ResolveStreamTokenUsageParams => ({
  event: {},
  response: { messages: [] },
  modelMessagesFinal: [],
  effectiveSystemInstruction: '',
  requestId: 'req-test',
});

describe('resolveStreamTokenUsage', () => {
  it('prefers event.totalUsage over step sums', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {
        totalUsage: {
          inputTokens: 300,
          outputTokens: 120,
          totalTokens: 420,
        },
        steps: [
          { usage: { inputTokens: 100, outputTokens: 40 } },
          { usage: { inputTokens: 200, outputTokens: 80 } },
        ],
      },
    });

    expect(result).toEqual({
      inputTokens: 300,
      outputTokens: 120,
      totalTokens: 420,
      source: 'ai_sdk',
    });
  });

  it('uses event.usage when totalUsage is absent', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {
        usage: {
          inputTokens: 150,
          outputTokens: 75,
        },
      },
    });

    expect(result).toEqual({
      inputTokens: 150,
      outputTokens: 75,
      totalTokens: 225,
      source: 'ai_sdk',
    });
  });

  it('falls back to response.usage when event usage is missing', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {},
      response: {
        usage: {
          promptTokens: 80,
          completionTokens: 20,
        },
        messages: [],
      },
    });

    expect(result).toEqual({
      inputTokens: 80,
      outputTokens: 20,
      totalTokens: 100,
      source: 'ai_sdk',
    });
  });

  it('sums step usage when SDK totals are unavailable', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {
        steps: [
          { usage: { inputTokens: 50, outputTokens: 10 } },
          { usage: { inputTokens: 30, outputTokens: 15 } },
        ],
      },
    });

    expect(result).toEqual({
      inputTokens: 80,
      outputTokens: 25,
      totalTokens: 105,
      source: 'steps',
    });
  });

  it('estimates tokens when no usage is available', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {},
      response: {
        messages: [
          {
            role: 'assistant',
            content: 'This is a forty character assistant reply!!!!',
          },
        ],
      },
      modelMessagesFinal: [
        {
          id: 'user-1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello there user' }],
        },
      ],
      effectiveSystemInstruction: 'You are helpful.',
    });

    expect(result.source).toBe('estimated');
    expect(result.inputTokens).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
    expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens);
  });

  it('uses event.text for output estimation when response messages are empty', () => {
    const result = resolveStreamTokenUsage({
      ...baseParams(),
      event: {
        text: 'Fallback text content here',
      },
      response: {
        messages: [],
      },
    });

    expect(result.source).toBe('estimated');
    expect(result.outputTokens).toBe(Math.ceil('Fallback text content here'.length / 4));
  });
});
