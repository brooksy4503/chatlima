import type { UIMessage } from 'ai';
import type { ImageGenerationOptions } from '@/lib/services/chatImageGenerationService';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio' | 'streamable-http';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
  useOAuth?: boolean;
  id?: string;
  oauthTokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  };
}

export interface WebSearchOptions {
  enabled: boolean;
  contextSize: 'low' | 'medium' | 'high';
}

export interface ImageGenerationRequestOptions {
  enabled: boolean;
  quality?: ImageGenerationOptions['quality'];
  aspectRatio?: string;
  outputFormat?: ImageGenerationOptions['outputFormat'];
  model?: string;
}

export type ChatOperationType = 'continue' | 'regenerate' | 'edit-resubmit' | 'select-leaf' | 'fork';

export type ChatOperation =
  | { type: 'continue' }
  | { type: 'regenerate'; assistantMessageId: string; attemptId: string }
  | { type: 'edit-resubmit'; userMessageId: string; content: string; attemptId: string }
  | { type: 'select-leaf'; leafMessageId: string }
  | { type: 'fork'; forkThroughMessageId: string };

export interface ChatRequestBody {
  action?: string;
  operation?: ChatOperation;
  messages: UIMessage[];
  chatId?: string;
  selectedModel: string;
  mcpServers: MCPServerConfig[];
  webSearch: WebSearchOptions;
  imageGeneration: ImageGenerationRequestOptions;
  apiKeys: Record<string, string>;
  attachments: Array<{
    name: string;
    contentType: string;
    url: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

const DEFAULT_IMAGE_GENERATION: ImageGenerationRequestOptions = {
  enabled: false,
  quality: 'medium',
  aspectRatio: '1:1',
  outputFormat: 'png',
  model: 'openai/gpt-5-image',
};

const DEFAULT_OPERATION: ChatOperation = { type: 'continue' };

function parseChatOperation(raw: unknown): ChatOperation {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_OPERATION;
  }

  const op = raw as Record<string, unknown>;
  const type = op.type;

  if (type === 'regenerate' && typeof op.assistantMessageId === 'string' && typeof op.attemptId === 'string') {
    return {
      type: 'regenerate',
      assistantMessageId: op.assistantMessageId,
      attemptId: op.attemptId,
    };
  }

  if (
    type === 'edit-resubmit' &&
    typeof op.userMessageId === 'string' &&
    typeof op.content === 'string' &&
    typeof op.attemptId === 'string'
  ) {
    return {
      type: 'edit-resubmit',
      userMessageId: op.userMessageId,
      content: op.content,
      attemptId: op.attemptId,
    };
  }

  if (type === 'select-leaf' && typeof op.leafMessageId === 'string') {
    return { type: 'select-leaf', leafMessageId: op.leafMessageId };
  }

  if (type === 'fork' && typeof op.forkThroughMessageId === 'string') {
    return { type: 'fork', forkThroughMessageId: op.forkThroughMessageId };
  }

  return DEFAULT_OPERATION;
}

export function parseChatRequestBody(body: unknown): ChatRequestBody {
  const raw = (body ?? {}) as Record<string, unknown>;

  return {
    action: typeof raw.action === 'string' ? raw.action : undefined,
    operation: parseChatOperation(raw.operation),
    messages: (raw.messages as UIMessage[]) ?? [],
    chatId: typeof raw.chatId === 'string' ? raw.chatId : undefined,
    selectedModel: String(raw.selectedModel ?? ''),
    mcpServers: (raw.mcpServers as MCPServerConfig[]) ?? [],
    webSearch: (raw.webSearch as WebSearchOptions) ?? {
      enabled: false,
      contextSize: 'medium',
    },
    imageGeneration: {
      ...DEFAULT_IMAGE_GENERATION,
      ...((raw.imageGeneration as ImageGenerationRequestOptions) ?? {}),
    },
    apiKeys: (raw.apiKeys as Record<string, string>) ?? {},
    attachments:
      (raw.attachments as ChatRequestBody['attachments']) ?? [],
    temperature:
      typeof raw.temperature === 'number' ? raw.temperature : undefined,
    maxTokens: typeof raw.maxTokens === 'number' ? raw.maxTokens : undefined,
    systemInstruction:
      typeof raw.systemInstruction === 'string'
        ? raw.systemInstruction
        : undefined,
  };
}
