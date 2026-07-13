import {
  buildEditResubmitMessages,
  buildRegenerateMessages,
} from '@/lib/chat/branchOperations';

describe('branchOperations', () => {
  const activePath = [
    { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hello' }], parentMessageId: null },
    { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Hi' }], parentMessageId: 'u1' },
    { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Next' }], parentMessageId: 'a1' },
    { id: 'a2', role: 'assistant', parts: [{ type: 'text', text: 'Sure' }], parentMessageId: 'u2' },
  ];

  it('builds regenerate branch from assistant message', () => {
    const rebuilt = buildRegenerateMessages({
      activePath,
      assistantMessageId: 'a2',
      attemptId: 'attempt-1',
    });

    expect(rebuilt?.anchorUserMessageId).toBe('u2');
    expect(rebuilt?.messages.at(-1)?.role).toBe('assistant');
    expect(rebuilt?.messages.at(-1)?.id).toBe('asst-attempt-1');
    expect(rebuilt?.messages).toHaveLength(4);
  });

  it('builds edit-resubmit branch from user message', () => {
    const rebuilt = buildEditResubmitMessages({
      activePath,
      userMessageId: 'u1',
      content: 'Edited hello',
      attemptId: 'attempt-2',
    });

    expect(rebuilt?.messages).toHaveLength(2);
    expect(rebuilt?.messages[0].id).toBe('user-attempt-2');
    expect(rebuilt?.messages[1].id).toBe('asst-attempt-2');
    expect(rebuilt?.messages[0].parts?.[0]).toEqual({ type: 'text', text: 'Edited hello' });
  });
});
