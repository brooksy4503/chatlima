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

import { titleGenerationModelId } from '@/lib/constants';



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

export const createOpenRouterClientWithKey = (apiKey?: string, userId?: string) => {
  const finalApiKey = getApiKeyWithOverride('OPENROUTER_API_KEY', apiKey);
  if (!finalApiKey) {
    throw new Error('OpenRouter API key is missing. Pass it using the \'apiKey\' parameter or the OPENROUTER_API_KEY environment variable.');
  }
  return createOpenRouter({
    apiKey: finalApiKey,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
      // Add user tracking header for additional context (optional)
      ...(userId && { 'X-ChatLima-User-ID': userId })
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
    baseURL: 'https://router.requesty.ai/v1', // Correct API endpoint for requests
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
    }
  });
};

const languageModels = {
  "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
  "gpt-5-nano": openaiClient("gpt-5-nano"),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  "qwen-qwq": wrapLanguageModel(
    {
      model: groqClient("qwen-qwq-32b"),
      middleware
    }
  ),
  // Note: Requesty models are now handled dynamically via getLanguageModelWithKeys()
  // Only keeping essential non-Requesty models for fallback purposes
};

// Helper to get language model with dynamic API keys
export const getLanguageModelWithKeys = (modelId: string, apiKeys?: Record<string, string>, userId?: string) => {
  // Helper function to create clients on demand
  const getOpenAIClient = () => createOpenAIClientWithKey(apiKeys?.['OPENAI_API_KEY']);
  const getAnthropicClient = () => createAnthropicClientWithKey(apiKeys?.['ANTHROPIC_API_KEY']);
  const getGroqClient = () => createGroqClientWithKey(apiKeys?.['GROQ_API_KEY']);
  const getXaiClient = () => createXaiClientWithKey(apiKeys?.['XAI_API_KEY']);
  const getOpenRouterClient = () => createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY'], userId);
  const getRequestyClient = () => createRequestyClientWithKey(apiKeys?.['REQUESTY_API_KEY']);

  // Check if the specific model exists and create only the needed client

  // Handle dynamic Requesty models first (before static cases)
  if (modelId.startsWith('requesty/')) {
    const requestyModelId = modelId.replace('requesty/', '');
    console.log(`[getLanguageModelWithKeys] Creating dynamic Requesty client for: ${requestyModelId}`);

    // Check if this is a reasoning model that needs special middleware
    const isReasoningModel = (
      requestyModelId.includes('deepseek-r1') ||
      requestyModelId.includes('DeepSeek-R1') ||
      requestyModelId.includes('deepseek-reasoner') ||
      requestyModelId.includes('thinking') ||
      requestyModelId.includes('parasail-deepseek-r1')
    );

    if (isReasoningModel) {
      return wrapLanguageModel({
        model: getRequestyClient()(requestyModelId, { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    }

    // Regular model without special middleware
    return getRequestyClient()(requestyModelId);
  }

  // Handle dynamic OpenRouter models
  if (modelId.startsWith('openrouter/')) {
    const openrouterModelId = modelId.replace('openrouter/', '');
    console.log(`[getLanguageModelWithKeys] Creating dynamic OpenRouter client for: ${openrouterModelId}`);

    // Check if this is a reasoning model that needs special middleware
    const isReasoningModel = (
      openrouterModelId.includes('deepseek-r1') ||
      openrouterModelId.includes('deepseek-reasoner') ||
      openrouterModelId.includes('thinking') ||
      openrouterModelId.includes('qwq') ||
      openrouterModelId.includes('grok-3-beta') ||
      openrouterModelId.includes('grok-3-mini-beta')
    );

    if (isReasoningModel) {
      // Handle special reasoning parameters for specific models
      if (openrouterModelId === 'x-ai/grok-3-mini-beta' && modelId.includes('reasoning-high')) {
        return wrapLanguageModel({
          model: getOpenRouterClient()('x-ai/grok-3-mini-beta', { reasoning: { effort: "high" }, logprobs: false }),
          middleware: deepseekR1Middleware,
        });
      }

      return wrapLanguageModel({
        model: getOpenRouterClient()(openrouterModelId, { logprobs: false }),
        middleware: deepseekR1Middleware,
      });
    }

    // Regular model without special middleware
    return getOpenRouterClient()(openrouterModelId);
  }

  switch (modelId) {
    // Anthropic models
    case "claude-3-7-sonnet":
      return getAnthropicClient()('claude-3-7-sonnet-20250219');

    // OpenAI models
    case "gpt-5-nano":
      return getOpenAIClient()("gpt-5-nano");

    // Groq models
    case "qwen-qwq":
      return wrapLanguageModel({
        model: getGroqClient()("qwen-qwq-32b"),
        middleware
      });

    // XAI models
    case "grok-3-mini":
      return getXaiClient()("grok-3-mini-latest");

    // Note: OpenRouter and Requesty models are now handled dynamically above this switch statement





    default:
      // Fallback to static models if not found (shouldn't happen in normal cases)
      console.warn(`Model ${modelId} not found in dynamic models, falling back to static model`);
      return languageModels[modelId as keyof typeof languageModels];
  }

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

// Get the actual model instance for title generation
export const titleGenerationModel = languageModels[titleGenerationModelId as keyof typeof languageModels];

// Function to get the appropriate title generation model based on the provider of the selected model
export const getTitleGenerationModelId = (selectedModelId: modelID): modelID => {
  // Define preferred title generation models for each provider with environment variable fallbacks
  const titleGenerationModels: Record<string, modelID> = {
    'openrouter': process.env.OPENROUTER_TITLE_MODEL || 'openrouter/qwen/qwen-turbo',
    'requesty': process.env.REQUESTY_TITLE_MODEL || 'requesty/alibaba/qwen-turbo',
    'openai': process.env.OPENAI_TITLE_MODEL || 'gpt-5-nano',
    'anthropic': process.env.ANTHROPIC_TITLE_MODEL || 'claude-3-7-sonnet',
    'groq': process.env.GROQ_TITLE_MODEL || 'qwen-qwq',
    'xai': process.env.XAI_TITLE_MODEL || 'grok-3-mini',
  };

  // Determine the provider from the selected model ID
  if (selectedModelId.startsWith('openrouter/')) {
    return titleGenerationModels['openrouter'];
  } else if (selectedModelId.startsWith('requesty/')) {
    return titleGenerationModels['requesty'];
  } else if (selectedModelId.startsWith('gpt-') || selectedModelId === 'gpt-5-nano') {
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
export const getTitleGenerationModel = (selectedModelId: modelID, apiKeys?: Record<string, string>, userId?: string) => {
  const titleModelId = getTitleGenerationModelId(selectedModelId);

  // If API keys are provided, use the dynamic model with keys
  if (apiKeys) {
    return getLanguageModelWithKeys(titleModelId, apiKeys, userId);
  }

  // If no API keys provided, check if the title model exists in static models
  if (titleModelId in languageModels) {
    return languageModels[titleModelId as keyof typeof languageModels];
  }

  // Fallback to a static model that definitely exists
  // Priority: gpt-5-nano -> claude-3-7-sonnet -> qwen-qwq -> grok-3-mini
  if ('gpt-5-nano' in languageModels) {
    return languageModels['gpt-5-nano'];
  } else if ('claude-3-7-sonnet' in languageModels) {
    return languageModels['claude-3-7-sonnet'];
  } else if ('qwen-qwq' in languageModels) {
    return languageModels['qwen-qwq'];
  } else if ('grok-3-mini' in languageModels) {
    return languageModels['grok-3-mini'];
  }

  // This should never happen, but if it does, throw a clear error
  throw new Error('No available title generation model found in static models');
};

export type modelID = keyof typeof languageModels | string;

// Legacy fallback models - Real models now come from dynamic API (/api/models)
// Contains only essential non-Requesty models for fallback; Dynamic models handle enabled/disabled state
export const MODELS = Object.keys(languageModels) as modelID[];

export const defaultModel: modelID = "openrouter/google/gemini-2.5-flash";
