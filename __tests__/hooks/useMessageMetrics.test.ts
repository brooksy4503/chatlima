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
