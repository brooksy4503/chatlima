import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

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
}

const middleware = extractReasoningMiddleware({
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

const languageModels = {
  "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
  "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
  "qwen-qwq": wrapLanguageModel(
    {
      model: groqClient("qwen-qwq-32b"),
      middleware
    }
  ),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": openrouterClient("mistralai/mistral-small-3.1-24b-instruct"),
  "openrouter/deepseek/deepseek-chat-v3-0324": openrouterClient("deepseek/deepseek-chat-v3-0324"),
  "openrouter/anthropic/claude-3.7-sonnet": openrouterClient("anthropic/claude-3.7-sonnet"),
  "openrouter/google/gemini-2.5-pro-preview-03-25": openrouterClient("google/gemini-2.5-pro-preview-03-25"),
  "openrouter/openai/gpt-4.1-mini": openrouterClient("openai/gpt-4.1-mini"),
  "openrouter/x-ai/grok-3-beta": openrouterClient("x-ai/grok-3-beta"),
  "openrouter/x-ai/grok-3-mini-beta": openrouterClient("x-ai/grok-3-mini-beta"),
  "openrouter/qwen/qwq-32b": openrouterClient("qwen/qwq-32b"),
  "openrouter/mistralai/mistral-medium-3": openrouterClient("mistralai/mistral-medium-3"),
  "openrouter/qwen/qwen3-235b-a22b": openrouterClient("qwen/qwen3-235b-a22b"),
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "GPT-4.1 Mini",
    description: "Compact version of OpenAI's GPT-4.1 with good balance of capabilities, including vision.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Balance", "Creative", "Vision"],
    enabled: false
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic's Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Latest version of Alibaba's Qwen QWQ with strong reasoning and coding capabilities.",
    apiVersion: "qwen-qwq",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "grok-3-mini": {
    provider: "XAI",
    name: "Grok 3 Mini",
    description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
    provider: "OpenRouter",
    name: "Mistral Small 3.1 Instruct",
    description: "Mistral Small 3.1 Instruct model accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
    capabilities: ["Instruct", "Efficient"],
    enabled: true
  },
  "openrouter/deepseek/deepseek-chat-v3-0324": {
    provider: "OpenRouter",
    name: "DeepSeek Chat V3 0324",
    description: "DeepSeek Chat model V3 accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-chat-v3-0324",
    capabilities: ["Chat", "Efficient"],
    enabled: true
  },
  "openrouter/anthropic/claude-3.7-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic's Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
    apiVersion: "anthropic/claude-3.7-sonnet",
    capabilities: ["Reasoning", "Coding", "Agentic"],
    enabled: true
  },
  "openrouter/google/gemini-2.5-pro-preview-03-25": {
    provider: "OpenRouter",
    name: "Gemini 2.5 Pro Preview",
    description: "Google's state-of-the-art AI model for advanced reasoning, coding, math, and science, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-pro-preview-03-25",
    capabilities: ["Reasoning", "Coding", "Math", "Science"],
    enabled: true
  },
  "openrouter/openai/gpt-4.1-mini": {
    provider: "OpenRouter",
    name: "GPT-4.1 Mini",
    description: "Mid-sized model competitive with GPT-4o, lower latency/cost. Strong coding & vision. Accessed via OpenRouter.",
    apiVersion: "openai/gpt-4.1-mini",
    capabilities: ["Coding", "Vision", "Efficient"],
    enabled: true
  },
  "openrouter/x-ai/grok-3-beta": {
    provider: "OpenRouter",
    name: "Grok 3 Beta",
    description: "xAI's flagship model excelling at enterprise tasks, coding, summarization, and deep domain knowledge. Accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-beta",
    capabilities: ["Reasoning", "Coding", "Knowledge"],
    enabled: true
  },
  "openrouter/x-ai/grok-3-mini-beta": {
    provider: "OpenRouter",
    name: "Grok 3 Mini Beta",
    description: "Lightweight model ideal for reasoning-heavy tasks, math, and puzzles. Accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Reasoning", "Math", "Puzzles"],
    enabled: true
  },
  "openrouter/qwen/qwq-32b": {
    provider: "OpenRouter",
    name: "Qwen QwQ 32B",
    description: "QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. Accessed via OpenRouter.",
    apiVersion: "qwen/qwq-32b",
    capabilities: ["Reasoning", "Hard Problems"],
    enabled: true
  },
  "openrouter/mistralai/mistral-medium-3": {
    provider: "OpenRouter",
    name: "Mistral Medium 3",
    description: "High-performance enterprise-grade language model with frontier-level capabilities. Balances state-of-the-art reasoning and multimodal performance. Accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-medium-3",
    capabilities: ["Reasoning", "Coding", "STEM", "Enterprise"],
    enabled: true
  },
  "openrouter/qwen/qwen3-235b-a22b": {
    provider: "OpenRouter",
    name: "Qwen3 235B A22B",
    description: "Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a 'thinking' mode for complex reasoning, math, and code tasks, and a 'non-thinking' mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling. Accessed via OpenRouter.",
    apiVersion: "qwen/qwen3-235b-a22b",
    capabilities: ["Reasoning", "Coding", "Multilingual", "Agentic"],
    enabled: true
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

export type modelID = keyof typeof languageModels;

// Filter models based on the enabled flag
export const MODELS = (Object.keys(languageModels) as modelID[]).filter(
  (modelId) => modelDetails[modelId].enabled !== false
);

export const defaultModel: modelID = "openrouter/qwen/qwq-32b";
