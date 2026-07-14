import { renderHook } from '@testing-library/react';
import { useMessageMetrics } from '@/hooks/useMessageMetrics';

describe('useMessageMetrics', () => {
  it('uses modelDisplayName from breakdown when provided', () => {
    const { result } = renderHook(() =>
      useMessageMetrics(
        {
          breakdownByMessage: [
            {
              messageId: 'asst-1',
              modelId: 'openrouter/gpt-4',
              modelDisplayName: 'GPT-4',
              provider: 'openrouter',
              inputTokens: 10,
              outputTokens: 20,
              totalTokens: 30,
              estimatedCost: 0,
              actualCost: 0,
              createdAt: new Date(),
            },
          ],
        },
        []
      )
    );

    expect(result.current['asst-1']?.modelDisplayName).toBe('GPT-4');
  });

  it('maps per-message timing metrics from breakdown', () => {
    const { result } = renderHook(() =>
      useMessageMetrics(
        {
          breakdownByMessage: [
            {
              messageId: 'asst-2',
              modelId: 'openrouter/gpt-4',
              modelDisplayName: 'GPT-4',
              provider: 'openrouter',
              inputTokens: 100,
              outputTokens: 200,
              totalTokens: 300,
              estimatedCost: 0.01,
              actualCost: 0.01,
              createdAt: new Date(),
              timeToFirstTokenMs: 1200,
              tokensPerSecond: 45.5,
              processingTimeMs: 4300,
            },
          ],
        },
        []
      )
    );

    expect(result.current['asst-2']).toMatchObject({
      totalTokens: 300,
      timeToFirstToken: 1200,
      tokensPerSecond: 45.5,
      totalDuration: 4300,
    });
  });

  it('falls back to message snapshot when breakdown is missing', () => {
    const { result } = renderHook(() =>
      useMessageMetrics(null, [
        {
          id: 'asst-2',
          role: 'assistant',
          modelDisplayName: 'Claude Sonnet',
          modelId: 'anthropic/claude-sonnet',
        },
      ])
    );

    expect(result.current['asst-2']?.modelDisplayName).toBe('Claude Sonnet');
  });
});
