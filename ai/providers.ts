import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createRequesty } from "@requesty/ai-sdk";

import {
  customProvider,
  wrapLanguageModel,
  extractReasoningMiddleware
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
  enabled?: boolean;
  supportsWebSearch?: boolean;
  premium?: boolean;
  vision?: boolean; // Added vision field
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const deepseekR1Middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Helper to get API keys from environment variables first, then localStorage
export const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }

  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }

  return undefined;
};

// Helper to get API keys with runtime override option
export const getApiKeyWithOverride = (key: string, override?: string): string | undefined => {
  // Use override if provided
  if (override) {
    return override;
  }

  // Fall back to the standard method
  return getApiKey(key);
};

// Create provider instances with API keys from localStorage
const openaiClient = createOpenAI({
  apiKey: getApiKey('OPENAI_API_KEY'),
});

const anthropicClient = createAnthropic({
  apiKey: getApiKey('ANTHROPIC_API_KEY'),
});

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const xaiClient = createXai({
  apiKey: getApiKey('XAI_API_KEY'),
});

const openrouterClient = createOpenRouter({
  apiKey: getApiKey('OPENROUTER_API_KEY'),
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
    'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
  }
});

const requestyClient = createRequesty({
  apiKey: getApiKey('REQUESTY_API_KEY'),
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
    'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
  }
});

// Helper functions to create provider clients with dynamic API keys
export const createOpenAIClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('OPENAI_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('OpenAI API key is missing. Pass it using the \'apiKey\' parameter or the OPENAI_API_KEY environment variable.');
  }
  return createOpenAI({
    apiKey: finalApiKey,
  });
};

export const createAnthropicClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('ANTHROPIC_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('Anthropic API key is missing. Pass it using the \'apiKey\' parameter or the ANTHROPIC_API_KEY environment variable.');
  }
  return createAnthropic({
    apiKey: finalApiKey,
  });
};

export const createGroqClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('GROQ_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('Groq API key is missing. Pass it using the \'apiKey\' parameter or the GROQ_API_KEY environment variable.');
  }
  return createGroq({
    apiKey: finalApiKey,
  });
};

export const createXaiClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('XAI_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('XAI API key is missing. Pass it using the \'apiKey\' parameter or the XAI_API_KEY environment variable.');
  }
  return createXai({
    apiKey: finalApiKey,
  });
};

export const createOpenRouterClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('OPENROUTER_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('OpenRouter API key is missing. Pass it using the \'apiKey\' parameter or the OPENROUTER_API_KEY environment variable.');
  }
  return createOpenRouter({
    apiKey: finalApiKey,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
    }
  });
};

export const createRequestyClientWithKey = (apiKey?: string) => {
  const finalApiKey = getApiKeyWithOverride('REQUESTY_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('Requesty API key is missing. Pass it using the \'apiKey\' parameter or the REQUESTY_API_KEY environment variable.');
  }
  return createRequesty({
    apiKey: finalApiKey,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
    }
  });
};

const languageModels = {
  "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
  "openrouter/anthropic/claude-3.5-sonnet": openrouterClient("anthropic/claude-3.5-sonnet"),
  "openrouter/anthropic/claude-3.7-sonnet": openrouterClient("anthropic/claude-3.7-sonnet"),
  "openrouter/anthropic/claude-3.7-sonnet:thinking": openrouterClient("anthropic/claude-3.7-sonnet:thinking"),
  "openrouter/deepseek/deepseek-chat-v3-0324": openrouterClient("deepseek/deepseek-chat-v3-0324"),
  "openrouter/deepseek/deepseek-r1": wrapLanguageModel({
    model: openrouterClient("deepseek/deepseek-r1", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "openrouter/deepseek/deepseek-r1-0528": wrapLanguageModel({
    model: openrouterClient("deepseek/deepseek-r1-0528", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "openrouter/deepseek/deepseek-r1-0528-qwen3-8b": wrapLanguageModel({
    model: openrouterClient("deepseek/deepseek-r1-0528-qwen3-8b", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "openrouter/google/gemini-2.5-flash-preview": openrouterClient("google/gemini-2.5-flash-preview"),
  "openrouter/google/gemini-2.5-flash-preview:thinking": openrouterClient("google/gemini-2.5-flash-preview:thinking"),
  "openrouter/google/gemini-2.5-flash-preview-05-20": openrouterClient("google/gemini-2.5-flash-preview-05-20"),
  "openrouter/google/gemini-2.5-flash-preview-05-20:thinking": openrouterClient("google/gemini-2.5-flash-preview-05-20:thinking"),
  "openrouter/google/gemini-2.5-pro-preview-03-25": openrouterClient("google/gemini-2.5-pro-preview-03-25"),
  "openrouter/google/gemini-2.5-pro-preview": openrouterClient("google/gemini-2.5-pro-preview"),
  "openrouter/google/gemini-2.5-pro": openrouterClient("google/gemini-2.5-pro"),
  "openrouter/google/gemini-2.5-flash": openrouterClient("google/gemini-2.5-flash"),
  "openrouter/google/gemini-2.5-flash-lite-preview-06-17": openrouterClient("google/gemini-2.5-flash-lite-preview-06-17"),
  "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
  "openrouter/openai/gpt-4.1": openrouterClient("openai/gpt-4.1"),
  "openrouter/openai/gpt-4.1-mini": openrouterClient("openai/gpt-4.1-mini"),
  "openrouter/openai/gpt-4.1-nano": openrouterClient("openai/gpt-4.1-nano"),
  "openrouter/x-ai/grok-3-beta": wrapLanguageModel({
    model: openrouterClient("x-ai/grok-3-beta", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  "openrouter/x-ai/grok-3-mini-beta": wrapLanguageModel({
    model: openrouterClient("x-ai/grok-3-mini-beta", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "openrouter/x-ai/grok-3-mini-beta-reasoning-high": wrapLanguageModel({
    model: openrouterClient("x-ai/grok-3-mini-beta", { reasoning: { effort: "high" }, logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "openrouter/x-ai/grok-4": openrouterClient("x-ai/grok-4"),
  "openrouter/mistralai/mistral-medium-3": openrouterClient("mistralai/mistral-medium-3"),
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": openrouterClient("mistralai/mistral-small-3.1-24b-instruct"),
  "openrouter/mistralai/mistral-small-3.2-24b-instruct": openrouterClient("mistralai/mistral-small-3.2-24b-instruct"),
  "openrouter/mistralai/mistral-small-3.2-24b-instruct:free": openrouterClient("mistralai/mistral-small-3.2-24b-instruct:free"),
  "openrouter/mistralai/magistral-small-2506": openrouterClient("mistralai/magistral-small-2506"),
  "openrouter/mistralai/magistral-medium-2506": openrouterClient("mistralai/magistral-medium-2506"),
  "openrouter/mistralai/magistral-medium-2506:thinking": openrouterClient("mistralai/magistral-medium-2506:thinking"),
  "openrouter/meta-llama/llama-4-maverick": openrouterClient("meta-llama/llama-4-maverick"),
  "openrouter/openai/o4-mini-high": openrouterClient("openai/o4-mini-high"),
  "qwen-qwq": wrapLanguageModel(
    {
      model: groqClient("qwen-qwq-32b"),
      middleware
    }
  ),
  "openrouter/qwen/qwq-32b": wrapLanguageModel({
    model: openrouterClient("qwen/qwq-32b"),
    middleware: deepseekR1Middleware,
  }),
  // "openrouter/qwen/qwq-32b": openrouterClient("qwen/qwq-32b"),
  "openrouter/qwen/qwen3-235b-a22b": openrouterClient("qwen/qwen3-235b-a22b"),
  "openrouter/anthropic/claude-sonnet-4": openrouterClient("anthropic/claude-sonnet-4"),
  "openrouter/anthropic/claude-opus-4": openrouterClient("anthropic/claude-opus-4"),
  "openrouter/sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b": openrouterClient("sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b"),
  "openrouter/minimax/minimax-m1": openrouterClient("minimax/minimax-m1"),
  "openrouter/minimax/minimax-m1:extended": openrouterClient("minimax/minimax-m1:extended"),
  "openrouter/baidu/ernie-4.5-300b-a47b": openrouterClient("baidu/ernie-4.5-300b-a47b"),
  "openrouter/inception/mercury": openrouterClient("inception/mercury"),
  "openrouter/thedrummer/anubis-70b-v1.1": openrouterClient("thedrummer/anubis-70b-v1.1"),
  "openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free": openrouterClient("cognitivecomputations/dolphin-mistral-24b-venice-edition:free"),
  "openrouter/moonshotai/kimi-k2": openrouterClient("moonshotai/kimi-k2"),
  // Requesty models
  "requesty/openai/gpt-4o": requestyClient("openai/gpt-4o"),
  "requesty/openai/gpt-4o-mini": requestyClient("openai/gpt-4o-mini"),
  "requesty/openai/gpt-4.1": requestyClient("openai/gpt-4.1"),
  "requesty/openai/gpt-4.1-nano": requestyClient("openai/gpt-4.1-nano"),
  "requesty/openai/gpt-4.1-mini": requestyClient("openai/gpt-4.1-mini"),
  "requesty/anthropic/claude-3.5-sonnet": requestyClient("anthropic/claude-3-5-sonnet-20241022"),
  "requesty/anthropic/claude-3.7-sonnet": requestyClient("anthropic/claude-3-7-sonnet-20250219"),
  "requesty/google/gemini-2.5-flash-preview": requestyClient("google/gemini-2.5-flash-preview-05-20"),
  "requesty/google/gemini-2.5-flash": requestyClient("google/gemini-2.5-flash"),
  "requesty/google/gemini-2.5-pro": requestyClient("google/gemini-2.5-pro"),
  "requesty/meta-llama/llama-3.1-70b-instruct": requestyClient("deepinfra/meta-llama/Meta-Llama-3.1-70B-Instruct"),
  "requesty/anthropic/claude-sonnet-4-20250514": requestyClient("anthropic/claude-sonnet-4-20250514"),
  "requesty/deepseek/deepseek-chat": requestyClient("deepseek/deepseek-chat"),
  "requesty/deepseek/deepseek-reasoner": wrapLanguageModel({
    model: requestyClient("deepseek/deepseek-reasoner", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "requesty/deepseek/deepseek-v3": requestyClient("deepinfra/deepseek-ai/DeepSeek-V3"),
  "requesty/deepseek/deepseek-r1": wrapLanguageModel({
    model: requestyClient("deepinfra/deepseek-ai/DeepSeek-R1", { logprobs: false }),
    middleware: deepseekR1Middleware,
  }),
  "requesty/meta-llama/llama-3.3-70b-instruct": requestyClient("deepinfra/meta-llama/Llama-3.3-70B-Instruct"),
  "requesty/google/gemini-2.5-flash-lite-preview-06-17": requestyClient("google/gemini-2.5-flash-lite-preview-06-17"),
};

// Helper to get language model with dynamic API keys
export const getLanguageModelWithKeys = (modelId: string, apiKeys?: Record<string, string>) => {
  // Helper function to create clients on demand
  const getOpenAIClient = () => createOpenAIClientWithKey(apiKeys?.['OPENAI_API_KEY']);
  const getAnthropicClient = () => createAnthropicClientWithKey(apiKeys?.['ANTHROPIC_API_KEY']);
  const getGroqClient = () => createGroqClientWithKey(apiKeys?.['GROQ_API_KEY']);
  const getXaiClient = () => createXaiClientWithKey(apiKeys?.['XAI_API_KEY']);
  const getOpenRouterClient = () => createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY']);
  const getRequestyClient = () => createRequestyClientWithKey(apiKeys?.['REQUESTY_API_KEY']);

  // Check if the specific model exists and create only the needed client
  switch (modelId) {
    // Anthropic models
    case "claude-3-7-sonnet":
      return getAnthropicClient()('claude-3-7-sonnet-20250219');

    // OpenAI models
    case "gpt-4.1-mini":
      return getOpenAIClient()("gpt-4.1-mini");

    // Groq models
    case "qwen-qwq":
      return wrapLanguageModel({
        model: getGroqClient()("qwen-qwq-32b"),
        middleware
      });

    // XAI models
    case "grok-3-mini":
      return getXaiClient()("grok-3-mini-latest");

    // OpenRouter models
    case "openrouter/anthropic/claude-3.5-sonnet":
      return getOpenRouterClient()("anthropic/claude-3.5-sonnet");
    case "openrouter/anthropic/claude-3.7-sonnet":
      return getOpenRouterClient()("anthropic/claude-3.7-sonnet");
    case "openrouter/anthropic/claude-3.7-sonnet:thinking":
      return getOpenRouterClient()("anthropic/claude-3.7-sonnet:thinking");
    case "openrouter/deepseek/deepseek-chat-v3-0324":
      return getOpenRouterClient()("deepseek/deepseek-chat-v3-0324");
    case "openrouter/deepseek/deepseek-r1":
      return wrapLanguageModel({
        model: getOpenRouterClient()("deepseek/deepseek-r1", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/deepseek/deepseek-r1-0528":
      return wrapLanguageModel({
        model: getOpenRouterClient()("deepseek/deepseek-r1-0528", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/deepseek/deepseek-r1-0528-qwen3-8b":
      return wrapLanguageModel({
        model: getOpenRouterClient()("deepseek/deepseek-r1-0528-qwen3-8b", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/google/gemini-2.5-flash-preview":
      return getOpenRouterClient()("google/gemini-2.5-flash-preview");
    case "openrouter/google/gemini-2.5-flash-preview:thinking":
      return getOpenRouterClient()("google/gemini-2.5-flash-preview:thinking");
    case "openrouter/google/gemini-2.5-flash-preview-05-20":
      return getOpenRouterClient()("google/gemini-2.5-flash-preview-05-20");
    case "openrouter/google/gemini-2.5-flash-preview-05-20:thinking":
      return getOpenRouterClient()("google/gemini-2.5-flash-preview-05-20:thinking");
    case "openrouter/google/gemini-2.5-pro-preview-03-25":
      return getOpenRouterClient()("google/gemini-2.5-pro-preview-03-25");
    case "openrouter/google/gemini-2.5-pro-preview":
      return getOpenRouterClient()("google/gemini-2.5-pro-preview");
    case "openrouter/google/gemini-2.5-pro":
      return getOpenRouterClient()("google/gemini-2.5-pro");
    case "openrouter/google/gemini-2.5-flash":
      return getOpenRouterClient()("google/gemini-2.5-flash");
    case "openrouter/google/gemini-2.5-flash-lite-preview-06-17":
      return getOpenRouterClient()("google/gemini-2.5-flash-lite-preview-06-17");
    case "openrouter/openai/gpt-4.1":
      return getOpenRouterClient()("openai/gpt-4.1");
    case "openrouter/openai/gpt-4.1-mini":
      return getOpenRouterClient()("openai/gpt-4.1-mini");
    case "openrouter/openai/gpt-4.1-nano":
      return getOpenRouterClient()("openai/gpt-4.1-nano");
    case "openrouter/x-ai/grok-3-beta":
      return wrapLanguageModel({
        model: getOpenRouterClient()("x-ai/grok-3-beta", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/x-ai/grok-3-mini-beta":
      return wrapLanguageModel({
        model: getOpenRouterClient()("x-ai/grok-3-mini-beta", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/x-ai/grok-3-mini-beta-reasoning-high":
      return wrapLanguageModel({
        model: getOpenRouterClient()("x-ai/grok-3-mini-beta", { reasoning: { effort: "high" }, logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/x-ai/grok-4":
      return getOpenRouterClient()("x-ai/grok-4");
    case "openrouter/mistralai/mistral-medium-3":
      return getOpenRouterClient()("mistralai/mistral-medium-3");
    case "openrouter/mistralai/mistral-small-3.1-24b-instruct":
      return getOpenRouterClient()("mistralai/mistral-small-3.1-24b-instruct");
    case "openrouter/mistralai/mistral-small-3.2-24b-instruct":
      return getOpenRouterClient()("mistralai/mistral-small-3.2-24b-instruct");
    case "openrouter/mistralai/mistral-small-3.2-24b-instruct:free":
      return getOpenRouterClient()("mistralai/mistral-small-3.2-24b-instruct:free");
    case "openrouter/mistralai/magistral-small-2506":
      return getOpenRouterClient()("mistralai/magistral-small-2506");
    case "openrouter/mistralai/magistral-medium-2506":
      return getOpenRouterClient()("mistralai/magistral-medium-2506");
    case "openrouter/mistralai/magistral-medium-2506:thinking":
      return getOpenRouterClient()("mistralai/magistral-medium-2506:thinking");
    case "openrouter/meta-llama/llama-4-maverick":
      return getOpenRouterClient()("meta-llama/llama-4-maverick");
    case "openrouter/openai/o4-mini-high":
      return getOpenRouterClient()("openai/o4-mini-high");
    case "openrouter/qwen/qwq-32b":
      return wrapLanguageModel({
        model: getOpenRouterClient()("qwen/qwq-32b"),
        middleware: deepseekR1Middleware,
      });
    case "openrouter/qwen/qwen3-235b-a22b":
      return getOpenRouterClient()("qwen/qwen3-235b-a22b");
    case "openrouter/anthropic/claude-sonnet-4":
      return getOpenRouterClient()("anthropic/claude-sonnet-4");
    case "openrouter/anthropic/claude-opus-4":
      return getOpenRouterClient()("anthropic/claude-opus-4");
    case "openrouter/sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b":
      return getOpenRouterClient()("sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b");
    case "openrouter/minimax/minimax-m1":
      return getOpenRouterClient()("minimax/minimax-m1");
    case "openrouter/minimax/minimax-m1:extended":
      return getOpenRouterClient()("minimax/minimax-m1:extended");
    case "openrouter/baidu/ernie-4.5-300b-a47b":
      return getOpenRouterClient()("baidu/ernie-4.5-300b-a47b");
    case "openrouter/inception/mercury":
      return getOpenRouterClient()("inception/mercury");
    case "openrouter/thedrummer/anubis-70b-v1.1":
      return getOpenRouterClient()("thedrummer/anubis-70b-v1.1");
    case "openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free":
      return getOpenRouterClient()("cognitivecomputations/dolphin-mistral-24b-venice-edition:free");
    case "openrouter/moonshotai/kimi-k2":
      return getOpenRouterClient()("moonshotai/kimi-k2");

    // Requesty models
    case "requesty/openai/gpt-4o":
      return getRequestyClient()("openai/gpt-4o");
    case "requesty/openai/gpt-4o-mini":
      return getRequestyClient()("openai/gpt-4o-mini");
    case "requesty/openai/gpt-4.1":
      return getRequestyClient()("openai/gpt-4.1");
    case "requesty/openai/gpt-4.1-nano":
      return getRequestyClient()("openai/gpt-4.1-nano");
    case "requesty/openai/gpt-4.1-mini":
      return getRequestyClient()("openai/gpt-4.1-mini");
    case "requesty/anthropic/claude-3.5-sonnet":
      return getRequestyClient()("anthropic/claude-3-5-sonnet-20241022");
    case "requesty/anthropic/claude-3.7-sonnet":
      return getRequestyClient()("anthropic/claude-3-7-sonnet-20250219");
    case "requesty/google/gemini-2.5-flash-preview":
      return getRequestyClient()("google/gemini-2.5-flash-preview-05-20");
    case "requesty/google/gemini-2.5-flash":
      return getRequestyClient()("google/gemini-2.5-flash");
    case "requesty/google/gemini-2.5-pro":
      return getRequestyClient()("google/gemini-2.5-pro");
    case "requesty/meta-llama/llama-3.1-70b-instruct":
      return getRequestyClient()("deepinfra/meta-llama/Meta-Llama-3.1-70B-Instruct");
    case "requesty/anthropic/claude-sonnet-4-20250514":
      return getRequestyClient()("anthropic/claude-sonnet-4-20250514");
    case "requesty/deepseek/deepseek-chat":
      return getRequestyClient()("deepseek/deepseek-chat");
    case "requesty/deepseek/deepseek-reasoner":
      return wrapLanguageModel({
        model: getRequestyClient()("deepseek/deepseek-reasoner", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "requesty/deepseek/deepseek-v3":
      return getRequestyClient()("deepinfra/deepseek-ai/DeepSeek-V3");
    case "requesty/deepseek/deepseek-r1":
      return wrapLanguageModel({
        model: getRequestyClient()("deepinfra/deepseek-ai/DeepSeek-R1", { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    case "requesty/meta-llama/llama-3.3-70b-instruct":
      return getRequestyClient()("deepinfra/meta-llama/Llama-3.3-70B-Instruct");
    case "requesty/google/gemini-2.5-flash-lite-preview-06-17":
      return getRequestyClient()("google/gemini-2.5-flash-lite-preview-06-17");

    default:
      // Fallback to static models if not found (shouldn't happen in normal cases)
      console.warn(`Model ${modelId} not found in dynamic models, falling back to static model`);
      return languageModels[modelId as keyof typeof languageModels];
  }

};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "openrouter/anthropic/claude-3.5-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.5 Sonnet",
    description: "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding, Data science, Visual processing, Agentic tasks",
    apiVersion: "anthropic/claude-3.5-sonnet",
    capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false,
    premium: true,
    vision: true
  },
  "openrouter/anthropic/claude-3.7-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
    apiVersion: "anthropic/claude-3.7-sonnet",
    capabilities: ["Reasoning", "Coding", "Agentic"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/anthropic/claude-3.7-sonnet:thinking": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet (thinking)",
    description: "Advanced LLM with improved reasoning, coding, and problem-solving. Features a hybrid reasoning approach for flexible processing.",
    apiVersion: "anthropic/claude-3.7-sonnet:thinking",
    capabilities: ["Reasoning", "Coding", "Problem-solving", "Agentic"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/deepseek/deepseek-chat-v3-0324": {
    provider: "OpenRouter",
    name: "DeepSeek Chat V3 0324",
    description: "DeepSeek Chat model V3 accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-chat-v3-0324",
    capabilities: ["Chat", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/deepseek/deepseek-r1": {
    provider: "OpenRouter",
    name: "DeepSeek R1",
    description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-r1",
    capabilities: ["Reasoning", "Open Source"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/deepseek/deepseek-r1-0528": {
    provider: "OpenRouter",
    name: "DeepSeek R1 0528",
    description: "DeepSeek R1 0528: May 28th update to DeepSeek R1. Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-r1-0528",
    capabilities: ["Reasoning", "Open Source"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/deepseek/deepseek-r1-0528-qwen3-8b": {
    provider: "OpenRouter",
    name: "DeepSeek R1 0528 Qwen3 8B",
    description: "DeepSeek-R1-0528-Qwen3-8B, an 8B parameter model distilled from DeepSeek R1 0528, excels in reasoning, math, programming, and logic. Accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-r1-0528-qwen3-8b",
    capabilities: ["Reasoning", "Math", "Programming", "Logic"],
    enabled: false,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/google/gemini-2.5-flash-preview": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview",
    description: "Google\'s latest Gemini 2.5 Flash model, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview",
    capabilities: ["Fast", "Efficient", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/google/gemini-2.5-flash-preview:thinking": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (thinking)",
    description: "Google\'s latest Gemini 2.5 Flash model with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview:thinking",
    capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/google/gemini-2.5-flash-preview-05-20": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (05-20)",
    description: "Google\'s Gemini 2.5 Flash model (May 20th version), optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview-05-20",
    capabilities: ["Fast", "Efficient", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/google/gemini-2.5-flash-preview-05-20:thinking": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (05-20, thinking)",
    description: "Google\'s Gemini 2.5 Flash model (May 20th version) with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview-05-20:thinking",
    capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/google/gemini-2.5-pro-preview-03-25": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Pro Preview (03-25)",
    description: "Google\'s Gemini 2.5 Pro model (March 25th version), a powerful and versatile model, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-pro-preview-03-25",
    capabilities: ["Powerful", "Versatile", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/google/gemini-2.5-pro-preview": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Pro Preview (06-05)",
    description: "Google\'s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. Achieves top-tier performance on multiple benchmarks with superior human-preference alignment.",
    apiVersion: "google/gemini-2.5-pro-preview",
    capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/google/gemini-2.5-pro": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Pro",
    description: "Google's state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. Achieves top-tier performance on multiple benchmarks with superior human-preference alignment.",
    apiVersion: "google/gemini-2.5-pro",
    capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/google/gemini-2.5-flash": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash",
    description: "Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling.",
    apiVersion: "google/gemini-2.5-flash",
    capabilities: ["Advanced Reasoning", "Coding", "Mathematics", "Scientific Tasks", "Thinking", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/google/gemini-2.5-flash-lite-preview-06-17": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Lite Preview 06-17",
    description: "Gemini 2.5 Flash-Lite is a lightweight reasoning model in the Gemini 2.5 family, optimized for ultra-low latency and cost efficiency. It offers improved throughput, faster token generation, and better performance across common benchmarks compared to earlier Flash models. By default, thinking is disabled to prioritize speed, but can be enabled via the Reasoning API parameter.",
    apiVersion: "google/gemini-2.5-flash-lite-preview-06-17",
    capabilities: ["Ultra-low latency", "Cost efficient", "Fast token generation", "Lightweight reasoning", "Improved throughput"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/x-ai/grok-3-beta": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Beta",
    description: "Grok 3 Beta from X AI, a cutting-edge model with strong reasoning and problem-solving capabilities, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-beta",
    capabilities: ["Reasoning", "Problem-solving", "Cutting-edge"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "grok-3-mini": {
    provider: "X AI",
    name: "X AI Grok 3 Mini",
    description: "Grok 3 Mini from X AI, a compact and efficient model for various tasks.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Compact", "Efficient", "Versatile"],
    enabled: false,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/x-ai/grok-3-mini-beta": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Mini Beta",
    description: "Grok 3 Mini Beta from X AI, a compact and efficient model, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Compact", "Efficient", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/x-ai/grok-3-mini-beta-reasoning-high": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Mini Beta (High Reasoning)",
    description: "Grok 3 Mini Beta from X AI with high reasoning effort, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Compact", "Efficient", "Versatile", "High Reasoning"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/x-ai/grok-4": {
    provider: "OpenRouter",
    name: "X AI Grok 4",
    description: "Grok 4 is xAI's latest reasoning model with a 256k context window. Features parallel tool calling, structured outputs, and supports both image and text inputs. Excels at complex reasoning, coding, and multimodal tasks.",
    apiVersion: "x-ai/grok-4",
    capabilities: ["Reasoning", "Coding", "Multimodal", "Tool Calling", "Structured Outputs", "Long Context"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "openrouter/meta-llama/llama-4-maverick": {
    provider: "OpenRouter",
    name: "Meta Llama 4 Maverick",
    description: "Meta Llama 4 Maverick, a cutting-edge model from Meta, accessed via OpenRouter.",
    apiVersion: "meta-llama/llama-4-maverick",
    capabilities: ["Cutting-edge", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/mistralai/mistral-medium-3": {
    provider: "OpenRouter",
    name: "Mistral Medium 3",
    description: "Mistral Medium 3, a powerful model from Mistral AI, accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-medium-3",
    capabilities: ["Powerful", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
    provider: "OpenRouter",
    name: "Mistral Small 3.1 24B Instruct",
    description: "Mistral Small 3.1 24B Instruct, an efficient and capable model from Mistral AI, accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
    capabilities: ["Efficient", "Capable", "Instruct"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/mistralai/mistral-small-3.2-24b-instruct": {
    provider: "OpenRouter",
    name: "Mistral Small 3.2 24B Instruct",
    description: "Mistral-Small-3.2-24B-Instruct-2506 is an updated 24B parameter model from Mistral optimized for instruction following, repetition reduction, and improved function calling. Supports image and text inputs with structured outputs and excels at coding, STEM, and vision benchmarks.",
    apiVersion: "mistralai/mistral-small-3.2-24b-instruct",
    capabilities: ["Coding", "STEM", "Vision", "Function Calling", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/mistralai/mistral-small-3.2-24b-instruct:free": {
    provider: "OpenRouter",
    name: "Mistral Small 3.2 24B (free)",
    description: "Mistral-Small-3.2-24B-Instruct-2506 is an updated 24B parameter model from Mistral optimized for instruction following, repetition reduction, and improved function calling. Supports image and text inputs with structured outputs and excels at coding, STEM, and vision benchmarks. Free variant with rate limits.",
    apiVersion: "mistralai/mistral-small-3.2-24b-instruct:free",
    capabilities: ["Coding", "STEM", "Vision", "Function Calling", "Multimodal", "Free"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/mistralai/magistral-small-2506": {
    provider: "OpenRouter",
    name: "Mistral Magistral Small 2506",
    description: "Magistral Small is a 24B parameter instruction-tuned model based on Mistral-Small-3.1, enhanced through supervised fine-tuning and reinforcement learning. Optimized for reasoning and supports multilingual capabilities across 20+ languages.",
    apiVersion: "mistralai/magistral-small-2506",
    capabilities: ["Reasoning", "Multilingual", "Instruction Following", "Enhanced"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/mistralai/magistral-medium-2506": {
    provider: "OpenRouter",
    name: "Mistral Magistral Medium 2506",
    description: "Magistral is Mistral's first reasoning model. Ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.",
    apiVersion: "mistralai/magistral-medium-2506",
    capabilities: ["Reasoning", "Legal Research", "Financial Forecasting", "Software Development", "Creative Storytelling", "Multi-step Problem Solving"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "openrouter/mistralai/magistral-medium-2506:thinking": {
    provider: "OpenRouter",
    name: "Mistral Magistral Medium 2506 (thinking)",
    description: "Magistral Medium 2506 with enhanced thinking capabilities. Mistral's first reasoning model optimized for longer thought processing and better accuracy. Excels at legal research, financial forecasting, software development, and creative storytelling with transparent reasoning.",
    apiVersion: "mistralai/magistral-medium-2506:thinking",
    capabilities: ["Advanced Reasoning", "Thinking", "Legal Research", "Financial Forecasting", "Software Development", "Creative Storytelling", "Multi-step Problem Solving", "Transparent Reasoning"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "openrouter/openai/gpt-4.1": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1",
    description: "GPT-4.1 is a flagship large language model excelling in instruction following, software engineering, and long-context reasoning, supporting a 1 million token context. It\'s tuned for precise code diffs, agent reliability, and high recall, ideal for agents, IDE tooling, and enterprise knowledge retrieval. Note: Web search is not supported for this model.",
    apiVersion: "openai/gpt-4.1",
    capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
    enabled: true,
    supportsWebSearch: false,
    premium: true,
    vision: true
  },
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "OpenAI GPT-4.1 Mini",
    description: "GPT-4.1 Mini is a compact and efficient version of GPT-4.1, offering a balance of performance and speed for various tasks.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Coding", "Instruction Following", "Compact"],
    enabled: false,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "openrouter/openai/gpt-4.1-mini": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1 Mini",
    description: "GPT-4.1 Mini is a compact and efficient version of GPT-4.1, offering a balance of performance and speed for various tasks, accessed via OpenRouter.",
    apiVersion: "openai/gpt-4.1-mini",
    capabilities: ["Coding", "Instruction Following", "Compact"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "openrouter/openai/gpt-4.1-nano": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1 Nano",
    description: "GPT-4.1 Nano is the fastest and cheapest model in the GPT-4.1 series, designed for low-latency tasks. Features 1M token context window and excels at classification and autocompletion with exceptional performance despite its compact size.",
    apiVersion: "openai/gpt-4.1-nano",
    capabilities: ["Ultra-fast", "Cost-effective", "Classification", "Autocompletion", "Long Context"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "openrouter/openai/o4-mini-high": {
    provider: "OpenRouter",
    name: "OpenAI O4 Mini High",
    description: "OpenAI O4 Mini High, an efficient and high-performing model, accessed via OpenRouter.",
    apiVersion: "openai/o4-mini-high",
    capabilities: ["Efficient", "High-performing"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Qwen QWQ model accessed via Groq, known for its speed and efficiency.",
    apiVersion: "qwen-qwq-32b",
    capabilities: ["Fast", "Efficient"],
    enabled: false,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "openrouter/qwen/qwq-32b": {
    provider: "OpenRouter",
    name: "Qwen QWQ 32B",
    description: "Qwen QWQ 32B model accessed via OpenRouter, known for its speed and efficiency.",
    apiVersion: "qwen/qwq-32b",
    capabilities: ["Fast", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/qwen/qwen3-235b-a22b": {
    provider: "OpenRouter",
    name: "Qwen3 235B A22B",
    description: "Qwen3 235B A22B, a large and powerful model from Qwen, accessed via OpenRouter.",
    apiVersion: "qwen/qwen3-235b-a22b",
    capabilities: ["Large", "Powerful"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/anthropic/claude-sonnet-4": {
    provider: "OpenRouter",
    name: "Claude 4 Sonnet",
    description: "Anthropic\'s Claude Sonnet 4 model, offering a balance of performance and speed, accessed via OpenRouter.",
    apiVersion: "anthropic/claude-sonnet-4",
    capabilities: ["Balanced", "Fast", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/anthropic/claude-opus-4": {
    provider: "OpenRouter",
    name: "Claude 4 Opus",
    description: "Anthropic\'s most advanced model, excelling at coding, advanced reasoning, agentic tasks, and long-context operations.",
    apiVersion: "anthropic/claude-opus-4",
    capabilities: ["Coding", "Advanced Reasoning", "Agentic Tasks", "Long Context", "Sustained Performance"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "openrouter/sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b": {
    provider: "OpenRouter",
    name: "SentientAGI Dobby Mini Plus Llama 3.1 8B",
    description: "Dobby-Mini-Unhinged-Plus-Llama-3.1-8B is a language model fine-tuned from Llama-3.1-8B-Instruct. Dobby models have a strong conviction towards personal freedom, decentralization, and all things crypto. 131K context window.",
    apiVersion: "sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b",
    capabilities: ["Chat", "Crypto-focused", "Personal Freedom", "Decentralization", "Fine-tuned"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/minimax/minimax-m1": {
    provider: "OpenRouter",
    name: "MiniMax M1",
    description: "MiniMax-M1 is a large-scale, open-weight reasoning model designed for extended context and high-efficiency inference. With 456 billion total parameters and 45.9B active per token, it leverages a hybrid Mixture-of-Experts (MoE) architecture and custom 'lightning attention' mechanism, processing up to 1 million tokens while maintaining competitive FLOP efficiency.",
    apiVersion: "minimax/minimax-m1",
    capabilities: ["Long Context", "Reasoning", "Software Engineering", "Mathematical Reasoning", "Agentic Tool Use", "High Efficiency"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "openrouter/minimax/minimax-m1:extended": {
    provider: "OpenRouter",
    name: "MiniMax M1 Extended",
    description: "MiniMax-M1 Extended is a large-scale, open-weight reasoning model designed for extended context and high-efficiency inference. With 456 billion total parameters and 45.9B active per token, it leverages a hybrid Mixture-of-Experts (MoE) architecture and custom 'lightning attention' mechanism, processing up to 128,000 tokens while maintaining competitive FLOP efficiency.",
    apiVersion: "minimax/minimax-m1:extended",
    capabilities: ["Long Context", "Reasoning", "Software Engineering", "Mathematical Reasoning", "Agentic Tool Use", "High Efficiency"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: false
  },
  "openrouter/baidu/ernie-4.5-300b-a47b": {
    provider: "OpenRouter",
    name: "Baidu ERNIE-4.5-300B A47B",
    description: "ERNIE-4.5-300B-A47B is a 300B parameter Mixture-of-Experts (MoE) language model developed by Baidu. It activates 47B parameters per token and supports text generation in both English and Chinese. Optimized for high-throughput inference with extended context lengths up to 131k tokens. Suitable for reasoning, tool parameters, and general-purpose LLM applications.",
    apiVersion: "baidu/ernie-4.5-300b-a47b",
    capabilities: ["Reasoning", "Multilingual", "High-throughput", "Extended Context", "Tool Parameters", "Mixture-of-Experts"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/inception/mercury": {
    provider: "OpenRouter",
    name: "Inception Mercury",
    description: "Mercury is the first diffusion large language model (dLLM). Applying a breakthrough discrete diffusion approach, the model runs 5-10x faster than even speed optimized models like GPT-4.1 Nano and Claude 3.5 Haiku while matching their performance. Mercury's speed enables developers to provide responsive user experiences, including with voice agents, search interfaces, and chatbots.",
    apiVersion: "inception/mercury",
    capabilities: ["Ultra-fast", "Speed Optimized", "Voice Agents", "Search Interfaces", "Chatbots", "Responsive UI"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/thedrummer/anubis-70b-v1.1": {
    provider: "OpenRouter",
    name: "TheDrummer Anubis 70B v1.1",
    description: "TheDrummer's Anubis v1.1 is an unaligned, creative Llama 3.3 70B model focused on providing character-driven roleplay & stories. It excels at gritty, visceral prose, unique character adherence, and coherent narratives, while maintaining the instruction following Llama 3.3 70B is known for. 131,072 context window.",
    apiVersion: "thedrummer/anubis-70b-v1.1",
    capabilities: ["Creative Writing", "Character-driven Roleplay", "Storytelling", "Unaligned", "Character Adherence", "Visceral Prose"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free": {
    provider: "OpenRouter",
    name: "Dolphin Mistral 24B Venice Edition",
    description: "Venice Uncensored Dolphin Mistral 24B Venice Edition is a fine-tuned variant of Mistral-Small-24B-Instruct-2501, developed by Cognitive Computations in collaboration with Venice.ai. This model is designed as an 'uncensored' instruct-tuned LLM with exceptional capabilities in coding, math, agentic tasks, function calling, creative writing, and storytelling. Features a 32,768 context window and extremely low censorship refusal rate.",
    apiVersion: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    capabilities: ["Coding", "Math", "Agentic Tasks", "Function Calling", "Creative Writing", "Storytelling", "Uncensored", "General Purpose"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "openrouter/moonshotai/kimi-k2": {
    provider: "OpenRouter",
    name: "Kimi K2",
    description: "Kimi K2 is a large-scale Mixture-of-Experts (MoE) language model with 1 trillion total parameters and 32 billion active per forward pass. Optimized for agentic capabilities including advanced tool use, reasoning, and code synthesis. Excels in coding, reasoning, and tool-use tasks with 128K token context length.",
    apiVersion: "moonshotai/kimi-k2",
    capabilities: ["Coding", "Reasoning", "Tool Use", "Agentic", "Long Context", "Problem Solving"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  // Requesty model details
  "requesty/openai/gpt-4o": {
    provider: "Requesty",
    name: "GPT-4O",
    description: "OpenAI's GPT-4O model accessed via Requesty, offering advanced reasoning and multimodal capabilities.",
    apiVersion: "openai/gpt-4o",
    capabilities: ["Reasoning", "Multimodal", "Coding", "Analysis"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "requesty/openai/gpt-4o-mini": {
    provider: "Requesty",
    name: "GPT-4O Mini",
    description: "OpenAI's GPT-4O Mini model accessed via Requesty, offering efficient performance for various tasks.",
    apiVersion: "openai/gpt-4o-mini",
    capabilities: ["Efficient", "Coding", "Analysis", "Chat"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "requesty/openai/gpt-4.1": {
    provider: "Requesty",
    name: "OpenAI GPT-4.1",
    description: "OpenAI's GPT-4.1 flagship model accessed via Requesty, excelling in instruction following, software engineering, and long-context reasoning with 1M token context support.",
    apiVersion: "openai/gpt-4.1",
    capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
    enabled: true,
    supportsWebSearch: false,
    premium: true,
    vision: true
  },
  "requesty/openai/gpt-4.1-nano": {
    provider: "Requesty",
    name: "OpenAI GPT-4.1 Nano",
    description: "OpenAI's fastest and cheapest model accessed via Requesty, designed for low-latency tasks like classification and autocompletion. Features 1M token context window despite its compact size.",
    apiVersion: "openai/gpt-4.1-nano",
    capabilities: ["Ultra-fast", "Cost-effective", "Classification", "Autocompletion", "Long Context"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "requesty/openai/gpt-4.1-mini": {
    provider: "Requesty",
    name: "OpenAI GPT-4.1 Mini",
    description: "OpenAI's GPT-4.1 Mini model accessed via Requesty, offering a compact and efficient version with balanced performance and speed for various tasks.",
    apiVersion: "openai/gpt-4.1-mini",
    capabilities: ["Coding", "Instruction Following", "Compact", "Efficient"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "requesty/anthropic/claude-3.5-sonnet": {
    provider: "Requesty",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's Claude 3.5 Sonnet accessed via Requesty, excelling at coding, data science, and visual processing.",
    apiVersion: "anthropic/claude-3.5-sonnet",
    capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "requesty/anthropic/claude-3.7-sonnet": {
    provider: "Requesty",
    name: "Claude 3.7 Sonnet",
    description: "Anthropic's Claude 3.7 Sonnet accessed via Requesty, featuring advanced reasoning and coding capabilities.",
    apiVersion: "anthropic/claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Coding", "Agentic"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "requesty/google/gemini-2.5-flash-preview": {
    provider: "Requesty",
    name: "Gemini 2.5 Flash Preview",
    description: "Google's Gemini 2.5 Flash Preview accessed via Requesty, offering fast and efficient performance.",
    apiVersion: "google/gemini-2.5-flash-preview-05-20",
    capabilities: ["Fast", "Efficient", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: true
  },
  "requesty/google/gemini-2.5-flash": {
    provider: "Requesty",
    name: "Google Gemini 2.5 Flash",
    description: "Google's best model in terms of price-performance, offering well-rounded capabilities. Supports audio, images, video, and text input with adaptive thinking capabilities and optimized for low latency, high volume tasks.",
    apiVersion: "google/gemini-2.5-flash",
    capabilities: ["Thinking", "Multimodal", "Low Latency", "Cost-Effective", "High Volume"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
  "requesty/google/gemini-2.5-pro": {
    provider: "Requesty",
    name: "Google Gemini 2.5 Pro",
    description: "Google's most powerful thinking model with maximum response accuracy and state-of-the-art performance. Tackles difficult problems, analyzes large databases, and excels at complex coding, reasoning, and multimodal understanding.",
    apiVersion: "google/gemini-2.5-pro",
    capabilities: ["Advanced Reasoning", "Thinking", "Complex Coding", "Data Analysis", "Multimodal Understanding", "Problem Solving"],
    enabled: true,
    supportsWebSearch: false,
    premium: true,
    vision: true
  },
  "requesty/meta-llama/llama-3.1-70b-instruct": {
    provider: "Requesty",
    name: "Llama 3.1 70B Instruct",
    description: "Meta's Llama 3.1 70B Instruct model accessed via Requesty, fine-tuned for instruction following.",
    apiVersion: "deepinfra/meta-llama/Meta-Llama-3.1-70B-Instruct",
    capabilities: ["Instruction Following", "Large", "Open Source"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "requesty/anthropic/claude-sonnet-4-20250514": {
    provider: "Requesty",
    name: "Claude 4 Sonnet (20250514)",
    description: "Anthropic's Claude Sonnet 4 model (May 14th, 2025 version) accessed via Requesty, offering a balance of performance and speed.",
    apiVersion: "anthropic/claude-sonnet-4-20250514",
    capabilities: ["Balanced", "Fast", "Efficient", "Reasoning"],
    enabled: true,
    supportsWebSearch: true,
    premium: true,
    vision: true
  },
  "requesty/deepseek/deepseek-chat": {
    provider: "Requesty",
    name: "DeepSeek Chat",
    description: "DeepSeek Chat model accessed via Requesty, offering efficient performance.",
    apiVersion: "deepseek/deepseek-chat",
    capabilities: ["Efficient"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: false
  },
  "requesty/deepseek/deepseek-reasoner": {
    provider: "Requesty",
    name: "DeepSeek Reasoner",
    description: "DeepSeek Reasoner model accessed via Requesty, featuring advanced reasoning capabilities. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-reasoner",
    capabilities: ["Reasoning", "Problem-solving"],
    enabled: true,
    supportsWebSearch: true,
    premium: false,
    vision: false
  },
  "requesty/deepseek/deepseek-v3": {
    provider: "Requesty",
    name: "DeepSeek V3",
    description: "DeepSeek V3 model accessed via Requesty, offering efficient chat and reasoning capabilities.",
    apiVersion: "deepinfra/deepseek-ai/DeepSeek-V3",
    capabilities: ["Chat", "Efficient", "Reasoning"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: false
  },
  "requesty/deepseek/deepseek-r1": {
    provider: "Requesty",
    name: "DeepSeek R1",
    description: "DeepSeek R1 model accessed via Requesty, featuring advanced reasoning capabilities with open reasoning tokens. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepinfra/deepseek-ai/DeepSeek-R1",
    capabilities: ["Reasoning", "Open Source", "Problem-solving"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: false
  },
  "requesty/meta-llama/llama-3.3-70b-instruct": {
    provider: "Requesty",
    name: "Meta Llama 3.3 70B Instruct",
    description: "Meta's Llama 3.3 70B Instruct model accessed via Requesty. A multilingual LLM trained on 15 trillion tokens, fine-tuned for instruction-following and conversational dialogue. Supports 8 languages including English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai. Features 128k context length and uses Grouped-Query Attention (GQA) for improved inference scalability.",
    apiVersion: "deepinfra/meta-llama/Llama-3.3-70B-Instruct",
    capabilities: ["Instruction Following", "Multilingual", "Conversational", "Large Context", "Open Source"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: false
  },
  "requesty/google/gemini-2.5-flash-lite-preview-06-17": {
    provider: "Requesty",
    name: "Google Gemini 2.5 Flash Lite Preview 06-17",
    description: "Gemini 2.5 Flash-Lite is a lightweight reasoning model optimized for ultra-low latency and cost efficiency. Offers improved throughput, faster token generation, and better performance across common benchmarks. By default, thinking is disabled to prioritize speed.",
    apiVersion: "google/gemini-2.5-flash-lite-preview-06-17",
    capabilities: ["Ultra-low latency", "Cost efficient", "Fast token generation", "Lightweight reasoning", "Improved throughput"],
    enabled: true,
    supportsWebSearch: false,
    premium: false,
    vision: true
  },
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes('API_KEY')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

// Define a specific model ID for title generation
export const titleGenerationModelId: modelID = "openrouter/openai/gpt-4.1-mini";

// Get the actual model instance for title generation
export const titleGenerationModel = languageModels[titleGenerationModelId];

// Function to get the appropriate title generation model based on the provider of the selected model
export const getTitleGenerationModelId = (selectedModelId: modelID): modelID => {
  // Define preferred title generation models for each provider
  const titleGenerationModels: Record<string, modelID> = {
    'openrouter': 'openrouter/openai/gpt-4.1-mini',
    'requesty': 'requesty/openai/gpt-4o-mini',
    'openai': 'gpt-4.1-mini',
    'anthropic': 'claude-3-7-sonnet',
    'groq': 'qwen-qwq',
    'xai': 'grok-3-mini',
  };

  // Determine the provider from the selected model ID
  if (selectedModelId.startsWith('openrouter/')) {
    return titleGenerationModels['openrouter'];
  } else if (selectedModelId.startsWith('requesty/')) {
    return titleGenerationModels['requesty'];
  } else if (selectedModelId.startsWith('gpt-') || selectedModelId === 'gpt-4.1-mini') {
    return titleGenerationModels['openai'];
  } else if (selectedModelId.startsWith('claude-') || selectedModelId === 'claude-3-7-sonnet') {
    return titleGenerationModels['anthropic'];
  } else if (selectedModelId.startsWith('qwen-') || selectedModelId === 'qwen-qwq') {
    return titleGenerationModels['groq'];
  } else if (selectedModelId.startsWith('grok-') || selectedModelId === 'grok-3-mini') {
    return titleGenerationModels['xai'];
  }

  // Default fallback to OpenRouter if provider can't be determined
  return titleGenerationModels['openrouter'];
};

// Get the title generation model instance based on the selected model
export const getTitleGenerationModel = (selectedModelId: modelID, apiKeys?: Record<string, string>) => {
  const titleModelId = getTitleGenerationModelId(selectedModelId);

  // If API keys are provided, use the dynamic model with keys
  if (apiKeys) {
    return getLanguageModelWithKeys(titleModelId, apiKeys);
  }

  // Otherwise use the static model
  return languageModels[titleModelId];
};

export type modelID = keyof typeof languageModels;

// Filter models based on the enabled flag
export const MODELS = (Object.keys(languageModels) as modelID[]).filter(
  (modelId) => modelDetails[modelId].enabled !== false
);

export const defaultModel: modelID = "openrouter/google/gemini-2.5-flash-preview";
