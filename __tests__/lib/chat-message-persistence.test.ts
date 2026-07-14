import type { UIMessage } from 'ai';
import {
  buildAssistantMessageForPersistence,
  countPersistableDisplayParts,
  createStreamFinishGate,
  dbActivePathIsDifferentBranch,
  dbMessagesHaveRicherAssistantParts,
  getLatestAssistantMessage,
  markServerExecutedToolParts,
  processMessagesForPersistence,
} from '@/lib/chat-message-persistence';

describe('chat-message-persistence', () => {
  const userMessage: UIMessage = {
    id: 'user-1',
    role: 'user',
    parts: [{ type: 'text', text: 'Latest news?' }],
  };

  describe('getLatestAssistantMessage', () => {
    it('returns the last assistant in a forked-chat follow-up transcript', () => {
      const transcript = [
        { id: 'u1', role: 'user' },
        { id: 'a1', role: 'assistant' },
        { id: 'u2', role: 'user' },
        { id: 'a2', role: 'assistant' },
      ];

      expect(getLatestAssistantMessage(transcript)?.id).toBe('a2');
    });

    it('returns undefined when no assistant exists', () => {
      expect(getLatestAssistantMessage([{ id: 'u1', role: 'user' }])).toBeUndefined();
    });
  });

  describe('buildAssistantMessageForPersistence', () => {
    it('prefers ui stream message parts over streamText fallback', () => {
      const uiResponseMessage: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [
          { type: 'reasoning', text: 'Planning search', state: 'done' },
          {
            type: 'tool-web_search',
            toolCallId: 'call-1',
            state: 'output-available',
            input: {},
            output: { ok: true },
          } as UIMessage['parts'][number],
          { type: 'text', text: 'Summary here', state: 'done' },
        ],
      };

      const result = buildAssistantMessageForPersistence({
        clientMessages: [userMessage],
        uiResponseMessage,
        streamText: 'Summary here',
        reasoningText: 'Collapsed reasoning',
      });

      expect(result.parts).toHaveLength(3);
      expect(result.parts?.map((p) => p.type)).toEqual([
        'reasoning',
        'tool-web_search',
        'text',
      ]);
    });

    it('falls back to reasoning + text when ui stream message is missing', () => {
      const result = buildAssistantMessageForPersistence({
        clientMessages: [userMessage],
        uiResponseMessage: null,
        streamText: 'Answer',
        reasoningText: 'Thoughts',
      });

      expect(result.parts).toEqual([
        { type: 'reasoning', text: 'Thoughts', state: 'done' },
        { type: 'text', text: 'Answer', state: 'done' },
      ]);
    });

    it('falls back to streamText when ui stream only has step-start', () => {
      const uiResponseMessage: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [{ type: 'step-start' } as UIMessage['parts'][number]],
      };

      const result = buildAssistantMessageForPersistence({
        clientMessages: [userMessage],
        uiResponseMessage,
        streamText: 'Git LFS stores large files externally.',
        reasoningText: undefined,
      });

      expect(result.parts).toEqual([
        { type: 'step-start' },
        { type: 'text', text: 'Git LFS stores large files externally.', state: 'done' },
      ]);
    });
  });

  describe('processMessagesForPersistence', () => {
    it('injects synthetic web search tool part when search ran without a tool part', () => {
      const assistantMessage: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Done', state: 'done' }],
      };

      const processed = processMessagesForPersistence({
        historyMessages: [userMessage],
        assistantMessage,
        webSearch: {
          useAgenticServerTools: true,
          enabled: true,
          wasUsed: true,
          invocationCount: 2,
        },
      });

      const assistant = processed.find((m) => m.role === 'assistant');
      expect(assistant?.parts?.some((p) => p.type === 'tool-web_search')).toBe(true);
    });

    it('attaches citations to text parts from annotations', () => {
      const assistantMessage: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Cited answer', state: 'done' }],
      };

      const processed = processMessagesForPersistence({
        historyMessages: [userMessage],
        assistantMessage,
        annotations: [
          {
            type: 'url_citation',
            url_citation: {
              url: 'https://example.com',
              title: 'Example',
              start_index: 0,
              end_index: 10,
            },
          },
        ],
      });

      const textPart = processed
        .find((m) => m.role === 'assistant')
        ?.parts?.find((p) => p.type === 'text') as { citations?: unknown[] };

      expect(textPart.citations).toHaveLength(1);
      expect(textPart.citations?.[0]).toMatchObject({
        url: 'https://example.com',
        title: 'Example',
      });
    });

    it('does not overwrite citations on prior assistant messages in history', () => {
      const priorAssistant: UIMessage = {
        id: 'asst-old',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Older answer',
            state: 'done',
            citations: [
              {
                url: 'https://old.example.com',
                title: 'Old Source',
              },
            ],
          } as UIMessage['parts'][number],
        ],
      };

      const assistantMessage: UIMessage = {
        id: 'asst-new',
        role: 'assistant',
        parts: [{ type: 'text', text: 'New cited answer', state: 'done' }],
      };

      const processed = processMessagesForPersistence({
        historyMessages: [userMessage, priorAssistant],
        assistantMessage,
        annotations: [
          {
            type: 'url_citation',
            url_citation: {
              url: 'https://new.example.com',
              title: 'New Source',
              start_index: 0,
              end_index: 10,
            },
          },
        ],
      });

      const assistants = processed.filter((m) => m.role === 'assistant');
      expect(assistants).toHaveLength(2);

      const oldTextPart = assistants[0]?.parts?.find((p) => p.type === 'text') as {
        citations?: Array<{ url: string }>;
      };
      const newTextPart = assistants[1]?.parts?.find((p) => p.type === 'text') as {
        citations?: Array<{ url: string }>;
      };

      expect(oldTextPart.citations?.[0]?.url).toBe('https://old.example.com');
      expect(newTextPart.citations?.[0]?.url).toBe('https://new.example.com');
    });

    it('injects synthetic image generation tool parts when URLs exist without tool parts', () => {
      const assistantMessage: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Generated!', state: 'done' }],
      };

      const processed = processMessagesForPersistence({
        historyMessages: [userMessage],
        assistantMessage,
        imageGeneration: {
          enabled: true,
          wasUsed: true,
          imageUrls: ['https://cdn.example.com/generated.png'],
        },
      });

      const assistant = processed.find((m) => m.role === 'assistant');
      expect(assistant?.parts?.some((p) => p.type === 'tool-image_generation')).toBe(true);
    });
  });

  describe('dbMessagesHaveRicherAssistantParts', () => {
    it('returns true when DB assistant has more tool/reasoning parts', () => {
      const current: UIMessage[] = [
        userMessage,
        {
          id: 'asst-1',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Summary', state: 'done' }],
        },
      ];

      const fromDb: UIMessage[] = [
        userMessage,
        {
          id: 'asst-1',
          role: 'assistant',
          parts: [
            { type: 'reasoning', text: 'Thinking', state: 'done' },
            {
              type: 'tool-web_search',
              toolCallId: 'c1',
              state: 'output-available',
            } as unknown as UIMessage['parts'][number],
            { type: 'text', text: 'Summary', state: 'done' },
          ],
        },
      ];

      expect(dbMessagesHaveRicherAssistantParts(current, fromDb)).toBe(true);
    });

    it('returns false when local state already has the same richness', () => {
      const richAssistant: UIMessage = {
        id: 'asst-1',
        role: 'assistant',
        parts: [
          { type: 'reasoning', text: 'Thinking', state: 'done' },
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolName: 'web_search',
              state: 'result',
              args: {},
              result: {},
            },
          } as unknown as UIMessage['parts'][number],
          { type: 'text', text: 'Summary', state: 'done' },
        ],
      };

      expect(
        dbMessagesHaveRicherAssistantParts(
          [userMessage, richAssistant],
          [userMessage, richAssistant]
        )
      ).toBe(false);
    });

    it('returns false when DB path is a different branch (unmatched ids)', () => {
      const current: UIMessage[] = [
        { id: 'user-new', role: 'user', parts: [{ type: 'text', text: 'edited', state: 'done' }] },
        {
          id: 'asst-new',
          role: 'assistant',
          parts: [{ type: 'text', text: 'EDIT_OK', state: 'done' }],
        },
      ];
      const fromDb: UIMessage[] = [
        userMessage,
        {
          id: 'asst-old',
          role: 'assistant',
          parts: [
            { type: 'reasoning', text: 'Thinking', state: 'done' },
            { type: 'text', text: 'OLD_OK', state: 'done' },
          ],
        },
      ];

      expect(dbMessagesHaveRicherAssistantParts(current, fromDb)).toBe(false);
    });
  });

  describe('dbActivePathIsDifferentBranch', () => {
    it('returns true when DB leaf differs and path ends at that leaf', () => {
      expect(
        dbActivePathIsDifferentBranch(
          [{ id: 'u1' }, { id: 'a1' }],
          [{ id: 'u2' }, { id: 'a2' }],
          'a2'
        )
      ).toBe(true);
    });

    it('returns false when leaves match', () => {
      expect(
        dbActivePathIsDifferentBranch(
          [{ id: 'u1' }, { id: 'a1' }],
          [{ id: 'u1' }, { id: 'a1' }],
          'a1'
        )
      ).toBe(false);
    });

    it('returns false when DB path does not end at claimed leaf', () => {
      expect(
        dbActivePathIsDifferentBranch(
          [{ id: 'u1' }, { id: 'a1' }],
          [{ id: 'u2' }, { id: 'a2' }],
          'a-missing'
        )
      ).toBe(false);
    });
  });

  describe('markServerExecutedToolParts', () => {
    it('sets providerExecuted on tool parts missing the flag', () => {
      const parts = [
        {
          type: 'tool-web_search_exa',
          toolCallId: 'c1',
          state: 'output-available',
          input: {},
          output: {},
        },
      ] as UIMessage['parts'];

      const marked = markServerExecutedToolParts(parts);
      expect((marked[0] as { providerExecuted?: boolean }).providerExecuted).toBe(true);
    });
  });

  describe('createStreamFinishGate', () => {
    it('resolves when notify is called', async () => {
      const gate = createStreamFinishGate();
      const wait = gate.readyPromise;
      gate.notify({ text: 'hi' }, { messages: [] });
      await expect(wait).resolves.toEqual({ event: { text: 'hi' }, response: { messages: [] } });
    });
  });

  describe('countPersistableDisplayParts', () => {
    it('counts reasoning, legacy tool-invocation, and v6 tool-* parts', () => {
      const parts: UIMessage['parts'] = [
        { type: 'text', text: 'Hi' },
        { type: 'reasoning', text: 'Think' },
        {
          type: 'tool-invocation',
          toolInvocation: { toolName: 'x', state: 'call', args: {} },
        } as unknown as UIMessage['parts'][number],
        {
          type: 'tool-web_search',
          toolCallId: '1',
          state: 'output-available',
        } as unknown as UIMessage['parts'][number],
      ];

      expect(countPersistableDisplayParts(parts)).toBe(3);
    });
  });
});
