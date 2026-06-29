import { buildModelHistory, groupMessagesByComparisonTurn } from '@/lib/chat/compareHistory';
import { canSubmitCompare, MIN_COMPARE_MODELS, MAX_COMPARE_MODELS } from '@/lib/compare/comparePolicy';

describe('compareHistory', () => {
  it('excludes sibling assistant responses from the same comparison turn', () => {
    const turnId = 'turn-1';
    const all = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }], comparisonTurnId: turnId },
      { id: 'a1', role: 'assistant' as const, parts: [{ type: 'text', text: 'A' }], comparisonTurnId: turnId, modelId: 'openrouter/model-a' },
      { id: 'a2', role: 'assistant' as const, parts: [{ type: 'text', text: 'B' }], comparisonTurnId: turnId, modelId: 'openrouter/model-b' },
    ];

    const historyForA = buildModelHistory(all, 'openrouter/model-a', turnId);
    expect(historyForA).toHaveLength(2);
    expect(historyForA[1].parts[0]).toEqual({ type: 'text', text: 'A' });

    const historyForB = buildModelHistory(all, 'openrouter/model-b', turnId);
    expect(historyForB[1].parts[0]).toEqual({ type: 'text', text: 'B' });
  });

  it('groups messages by comparison turn id', () => {
    const messages = [
      { id: '1', role: 'user' as const, parts: [{ type: 'text', text: 'x' }], comparisonTurnId: 't1' },
      { id: '2', role: 'assistant' as const, parts: [{ type: 'text', text: 'y' }], comparisonTurnId: 't1', modelId: 'm1' },
      { id: '3', role: 'user' as const, parts: [{ type: 'text', text: 'z' }] },
    ];
    const groups = groupMessagesByComparisonTurn(messages);
    expect(groups[0].turnId).not.toBeNull();
    expect(groups[0].messages).toHaveLength(2);
  });
});

describe('comparePolicy', () => {
  it('requires minimum models and non-empty input', () => {
    expect(
      canSubmitCompare({
        input: '',
        compareModels: ['a'],
        hasEnoughCredits: () => true,
        estimatedCreditCost: 2,
      }).allowed
    ).toBe(false);

    expect(
      canSubmitCompare({
        input: 'hello',
        compareModels: ['a', 'b'],
        hasEnoughCredits: () => true,
        estimatedCreditCost: 2,
      }).allowed
    ).toBe(true);
  });

  it('exports compare model limits', () => {
    expect(MIN_COMPARE_MODELS).toBe(2);
    expect(MAX_COMPARE_MODELS).toBe(3);
  });
});
