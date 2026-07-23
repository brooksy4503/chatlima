import {
  buildModelHistory,
  expandComparisonTurnsInPath,
  groupMessagesByComparisonTurn,
  isLocalComparePromotionAheadOfDb,
  stripOrphanComparisonTurnIds,
} from '@/lib/chat/compareHistory';
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
    expect(groups[1].turnId).toBeNull();
    expect(groups[1].messages).toHaveLength(1);
  });

  it('expands branch active path with all compare assistant siblings', () => {
    const turnId = 'turn-1';
    const all = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }], comparisonTurnId: turnId },
      { id: 'a1', role: 'assistant' as const, parts: [{ type: 'text', text: 'A' }], comparisonTurnId: turnId, modelId: 'openrouter/model-a', parentMessageId: 'u1' },
      { id: 'a2', role: 'assistant' as const, parts: [{ type: 'text', text: 'B' }], comparisonTurnId: turnId, modelId: 'openrouter/model-b', parentMessageId: 'u1' },
      { id: 'a3', role: 'assistant' as const, parts: [{ type: 'text', text: 'C' }], comparisonTurnId: turnId, modelId: 'openrouter/model-c', parentMessageId: 'u1' },
    ];

    const activePath = [all[0], all[1]];
    const expanded = expandComparisonTurnsInPath(activePath, all);

    expect(expanded.map((message) => message.id)).toEqual(['u1', 'a1', 'a2', 'a3']);
  });

  it('does not expand promoted compare turns without comparison metadata', () => {
    const all = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }] },
      { id: 'a1', role: 'assistant' as const, parts: [{ type: 'text', text: 'A' }], modelId: 'openrouter/model-a' },
    ];

    expect(expandComparisonTurnsInPath(all, all)).toEqual(all);
  });

  it('strips orphan comparisonTurnIds left by partial promotes', () => {
    const turnId = 'turn-1';
    const messages = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }] },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        modelId: 'openrouter/model-a',
      },
      {
        id: 'a2',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'B' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-b',
        parentMessageId: 'u1',
      },
    ];

    const stripped = stripOrphanComparisonTurnIds(messages);
    expect(stripped[2].comparisonTurnId).toBeNull();
    expect(stripped[0].comparisonTurnId).toBeUndefined();
  });

  it('keeps comparisonTurnIds for complete compare turns', () => {
    const turnId = 'turn-1';
    const messages = [
      {
        id: 'u1',
        role: 'user' as const,
        parts: [{ type: 'text', text: 'Hi' }],
        comparisonTurnId: turnId,
      },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-a',
      },
    ];

    expect(stripOrphanComparisonTurnIds(messages)).toEqual(messages);
  });

  it('detects local compare promotion ahead of expanded DB hydration', () => {
    const turnId = 'turn-1';
    const promoted = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }] },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        modelId: 'openrouter/model-a',
      },
    ];
    const expandedDb = [
      { id: 'u1', role: 'user' as const, parts: [{ type: 'text', text: 'Hi' }], comparisonTurnId: turnId },
      {
        id: 'a1',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'A' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-a',
      },
      {
        id: 'a2',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'B' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-b',
      },
      {
        id: 'a3',
        role: 'assistant' as const,
        parts: [{ type: 'text', text: 'C' }],
        comparisonTurnId: turnId,
        modelId: 'openrouter/model-c',
      },
    ];

    expect(isLocalComparePromotionAheadOfDb(promoted, expandedDb)).toBe(true);
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
