import { mergeContinuePath } from '@/lib/chat/mergeContinuePath';

describe('mergeContinuePath', () => {
  const serverPath = [
    { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
    { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
  ];

  it('accepts a valid extension from the client', () => {
    const clientPath = [
      ...serverPath,
      { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Next' }] },
    ];

    const merged = mergeContinuePath(serverPath, clientPath);

    expect(merged.messages.map((message) => message.id)).toEqual(['u1', 'a1', 'u2']);
    expect(merged.activeLeafMessageId).toBe('a1');
  });

  it('rejects a divergent client branch and keeps the server path', () => {
    const clientPath = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
      { id: 'a1b', role: 'assistant', parts: [{ type: 'text', text: 'Other branch' }] },
    ];

    const merged = mergeContinuePath(serverPath, clientPath);

    expect(merged.messages.map((message) => message.id)).toEqual(['u1', 'a1']);
    expect(merged.activeLeafMessageId).toBe('a1');
  });
});
