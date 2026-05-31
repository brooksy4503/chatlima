import type { UIMessage } from 'ai';
import {
  createSyntheticImageGenerationToolPart,
  createSyntheticWebSearchToolPart,
  extractGeneratedImageUrlsFromStreamEvent,
  getGeneratedImageUrlFromToolResult,
  getReasoningPartText,
  getUIMessageText,
  hasWebSearchToolPart,
  injectSyntheticImageGenerationToolParts,
  injectSyntheticWebSearchToolPart,
  isWebSearchToolName,
  isWebSearchToolPart,
  mapV6ToolStateToLegacy,
  messageHasAssistantText,
  shouldShowLiveWebSearchIndicator,
  shouldShowSyntheticCompletedWebSearch,
  userMessageRequestsImageCreation,
} from '@/lib/message-utils';

describe('message-utils', () => {
  describe('getUIMessageText', () => {
    it('joins text parts with blank lines', () => {
      const message = {
        id: '1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Hello' },
          { type: 'text', text: 'World' },
        ],
      } as UIMessage;

      expect(getUIMessageText(message)).toBe('Hello\n\nWorld');
    });

    it('returns empty string when there are no text parts', () => {
      const message = {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'reasoning', text: 'thinking' }],
      } as UIMessage;

      expect(getUIMessageText(message)).toBe('');
    });
  });

  describe('getReasoningPartText', () => {
    it('prefers direct text on reasoning parts', () => {
      expect(getReasoningPartText({ type: 'reasoning', text: 'Step one' })).toBe('Step one');
    });

    it('falls back to details and legacy reasoning fields', () => {
      expect(
        getReasoningPartText({
          details: [{ type: 'text', text: 'Detail A' }, { type: 'text', text: 'Detail B' }],
        })
      ).toBe('Detail A\n\nDetail B');

      expect(getReasoningPartText({ reasoning: 'Legacy reasoning' })).toBe('Legacy reasoning');
    });
  });

  describe('web search tool detection', () => {
    it('matches known web search tool names', () => {
      expect(isWebSearchToolName('web_search')).toBe(true);
      expect(isWebSearchToolName('openrouter:web_search')).toBe(true);
      expect(isWebSearchToolName('openrouter.web_search')).toBe(true);
      expect(isWebSearchToolName('other_tool')).toBe(false);
    });

    it('detects v5 tool-invocation and v6 tool parts', () => {
      expect(
        isWebSearchToolPart({
          type: 'tool-invocation',
          toolInvocation: { toolName: 'openrouter:web_search' },
        } as unknown as UIMessage['parts'][number])
      ).toBe(true);

      expect(
        isWebSearchToolPart({
          type: 'tool-web_search',
          toolCallId: 'call-1',
          state: 'output-available',
        } as unknown as UIMessage['parts'][number])
      ).toBe(true);
    });

    it('reports whether parts already include web search', () => {
      const parts = [
        { type: 'text', text: 'Answer' },
        {
          type: 'tool-web_search',
          toolCallId: 'call-1',
          state: 'output-available',
        },
      ] as UIMessage['parts'];

      expect(hasWebSearchToolPart(parts)).toBe(true);
      expect(hasWebSearchToolPart([{ type: 'text', text: 'Answer' }])).toBe(false);
    });
  });

  describe('messageHasAssistantText', () => {
    it('returns true only for non-empty text parts', () => {
      expect(messageHasAssistantText([{ type: 'text', text: '  hi  ' }])).toBe(true);
      expect(messageHasAssistantText([{ type: 'text', text: '   ' }])).toBe(false);
      expect(messageHasAssistantText(undefined)).toBe(false);
    });
  });

  describe('mapV6ToolStateToLegacy', () => {
    it('maps output-available to result and everything else to call', () => {
      expect(mapV6ToolStateToLegacy('output-available')).toBe('result');
      expect(mapV6ToolStateToLegacy('input-streaming')).toBe('call');
      expect(mapV6ToolStateToLegacy(undefined)).toBe('call');
    });
  });

  describe('web search UI helpers', () => {
    const baseParams = {
      webSearchEnabled: true,
      status: 'streaming',
      isLatestMessage: true,
      role: 'assistant',
      parts: [{ type: 'reasoning', text: 'thinking' }] as UIMessage['parts'],
    };

    it('shows live indicator only while streaming with no tool or text yet', () => {
      expect(shouldShowLiveWebSearchIndicator(baseParams)).toBe(true);
      expect(
        shouldShowLiveWebSearchIndicator({
          ...baseParams,
          parts: [{ type: 'text', text: 'Partial answer' }],
        })
      ).toBe(false);
    });

    it('shows synthetic completed card when results exist without tool part', () => {
      expect(
        shouldShowSyntheticCompletedWebSearch({
          role: 'assistant',
          status: 'ready',
          hasWebSearchResults: true,
          parts: [{ type: 'text', text: 'Answer with citations' }],
        })
      ).toBe(true);

      expect(
        shouldShowSyntheticCompletedWebSearch({
          role: 'assistant',
          status: 'streaming',
          hasWebSearchResults: true,
          parts: [{ type: 'text', text: 'Answer with citations' }],
        })
      ).toBe(false);
    });
  });

  describe('synthetic web search tool parts', () => {
    it('creates a provider-executed web search tool part', () => {
      const part = createSyntheticWebSearchToolPart(3);

      expect(part).toMatchObject({
        type: 'tool-web_search',
        state: 'output-available',
        output: { searchCount: 3, provider: 'openrouter' },
        providerExecuted: true,
      });
    });

    it('injects synthetic tool part before the first text part', () => {
      const parts = [
        { type: 'text', text: 'Answer' },
      ] as UIMessage['parts'];

      const updated = injectSyntheticWebSearchToolPart(parts, 2);

      expect(updated).toHaveLength(2);
      expect(updated[0]).toMatchObject({ type: 'tool-web_search' });
      expect(updated[1]).toMatchObject({ type: 'text', text: 'Answer' });
    });

    it('does not duplicate an existing web search tool part', () => {
      const parts = [
        {
          type: 'tool-web_search',
          toolCallId: 'existing',
          state: 'output-available',
        },
        { type: 'text', text: 'Answer' },
      ] as UIMessage['parts'];

      expect(injectSyntheticWebSearchToolPart(parts)).toBe(parts);
    });
  });

  describe('userMessageRequestsImageCreation', () => {
    it('detects explicit image creation prompts', () => {
      expect(
        userMessageRequestsImageCreation(
          'Create an image of a crowd of people at the horse races'
        )
      ).toBe(true);
    });

    it('returns false for unrelated prompts', () => {
      expect(userMessageRequestsImageCreation('What is the weather today?')).toBe(false);
    });
  });

  describe('image generation stream extraction', () => {
    it('extracts image URLs from tool results and response messages', () => {
      const urls = extractGeneratedImageUrlsFromStreamEvent(
        {
          toolResults: [{ imageUrl: 'https://cdn.example.com/generated.png' }],
        },
        {
          messages: [
            {
              role: 'assistant',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: 'https://cdn.example.com/inline.png' },
                },
              ],
            },
          ],
        }
      );

      expect(urls).toEqual([
        'https://cdn.example.com/generated.png',
        'https://cdn.example.com/inline.png',
      ]);
    });

    it('extracts image URLs from AI SDK tool-result wrappers', () => {
      const urls = extractGeneratedImageUrlsFromStreamEvent({
        toolResults: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'image_generation',
            output: { status: 'ok', imageUrl: 'https://cdn.example.com/from-output.png' },
          },
        ],
        steps: [
          {
            content: [
              {
                type: 'tool-result',
                toolCallId: 'call-2',
                toolName: 'image_generation',
                output: { status: 'ok', imageUrl: 'https://cdn.example.com/from-step-content.png' },
              },
            ],
          },
        ],
      });

      expect(urls).toEqual([
        'https://cdn.example.com/from-output.png',
        'https://cdn.example.com/from-step-content.png',
      ]);
    });

    it('reads nested output from getGeneratedImageUrlFromToolResult', () => {
      expect(
        getGeneratedImageUrlFromToolResult({
          type: 'tool-result',
          toolName: 'image_generation',
          output: { status: 'ok', imageUrl: 'https://cdn.example.com/nested.png' },
        })
      ).toBe('https://cdn.example.com/nested.png');
    });
  });

  describe('synthetic image generation tool parts', () => {
    it('injects synthetic image tool parts before text when missing', () => {
      const parts = [{ type: 'text', text: 'Here is your image.' }] as UIMessage['parts'];

      const updated = injectSyntheticImageGenerationToolParts(parts, [
        'https://cdn.example.com/generated.png',
      ]);

      expect(updated).toHaveLength(2);
      expect(updated[0]).toMatchObject({
        type: 'tool-image_generation',
        output: { imageUrl: 'https://cdn.example.com/generated.png' },
      });
    });

    it('creates provider-executed synthetic image tool parts', () => {
      const part = createSyntheticImageGenerationToolPart('https://cdn.example.com/a.png');

      expect(part).toMatchObject({
        type: 'tool-image_generation',
        providerExecuted: true,
        output: { imageUrl: 'https://cdn.example.com/a.png' },
      });
    });
  });
});
