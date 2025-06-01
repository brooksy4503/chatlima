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
  supportsWebSearch?: boolean;
  premium?: boolean;
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
  "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
  "openrouter/openai/gpt-4.1": openrouterClient("openai/gpt-4.1"),
  "openrouter/openai/gpt-4.1-mini": openrouterClient("openai/gpt-4.1-mini"),
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
  "openrouter/mistralai/mistral-medium-3": openrouterClient("mistralai/mistral-medium-3"),
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": openrouterClient("mistralai/mistral-small-3.1-24b-instruct"),
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
    premium: true
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false,
    premium: true
  },
  "openrouter/anthropic/claude-3.7-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
    apiVersion: "anthropic/claude-3.7-sonnet",
    capabilities: ["Reasoning", "Coding", "Agentic"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  "openrouter/anthropic/claude-3.7-sonnet:thinking": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet (thinking)",
    description: "Advanced LLM with improved reasoning, coding, and problem-solving. Features a hybrid reasoning approach for flexible processing.",
    apiVersion: "anthropic/claude-3.7-sonnet:thinking",
    capabilities: ["Reasoning", "Coding", "Problem-solving", "Agentic"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  "openrouter/deepseek/deepseek-chat-v3-0324": {
    provider: "OpenRouter",
    name: "DeepSeek Chat V3 0324",
    description: "DeepSeek Chat model V3 accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-chat-v3-0324",
    capabilities: ["Chat", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/deepseek/deepseek-r1": {
    provider: "OpenRouter",
    name: "DeepSeek R1",
    description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-r1",
    capabilities: ["Reasoning", "Open Source"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/deepseek/deepseek-r1-0528": {
    provider: "OpenRouter",
    name: "DeepSeek R1 0528",
    description: "DeepSeek R1 0528: May 28th update to DeepSeek R1. Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-r1-0528",
    capabilities: ["Reasoning", "Open Source"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/deepseek/deepseek-r1-0528-qwen3-8b": {
    provider: "OpenRouter",
    name: "DeepSeek R1 0528 Qwen3 8B",
    description: "DeepSeek-R1-0528-Qwen3-8B, an 8B parameter model distilled from DeepSeek R1 0528, excels in reasoning, math, programming, and logic. Accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-r1-0528-qwen3-8b",
    capabilities: ["Reasoning", "Math", "Programming", "Logic"],
    enabled: false,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/google/gemini-2.5-flash-preview": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview",
    description: "Google\'s latest Gemini 2.5 Flash model, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview",
    capabilities: ["Fast", "Efficient", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/google/gemini-2.5-flash-preview:thinking": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (thinking)",
    description: "Google\'s latest Gemini 2.5 Flash model with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview:thinking",
    capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/google/gemini-2.5-flash-preview-05-20": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (05-20)",
    description: "Google\'s Gemini 2.5 Flash model (May 20th version), optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview-05-20",
    capabilities: ["Fast", "Efficient", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/google/gemini-2.5-flash-preview-05-20:thinking": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Flash Preview (05-20, thinking)",
    description: "Google\'s Gemini 2.5 Flash model (May 20th version) with thinking capabilities, optimized for speed and efficiency, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview-05-20:thinking",
    capabilities: ["Fast", "Efficient", "Multimodal", "Thinking"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/google/gemini-2.5-pro-preview-03-25": {
    provider: "OpenRouter",
    name: "Google Gemini 2.5 Pro Preview (03-25)",
    description: "Google\'s Gemini 2.5 Pro model (March 25th version), a powerful and versatile model, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-pro-preview-03-25",
    capabilities: ["Powerful", "Versatile", "Multimodal"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  "openrouter/x-ai/grok-3-beta": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Beta",
    description: "Grok 3 Beta from X AI, a cutting-edge model with strong reasoning and problem-solving capabilities, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-beta",
    capabilities: ["Reasoning", "Problem-solving", "Cutting-edge"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  "grok-3-mini": {
    provider: "X AI",
    name: "X AI Grok 3 Mini",
    description: "Grok 3 Mini from X AI, a compact and efficient model for various tasks.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Compact", "Efficient", "Versatile"],
    enabled: false,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/x-ai/grok-3-mini-beta": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Mini Beta",
    description: "Grok 3 Mini Beta from X AI, a compact and efficient model, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Compact", "Efficient", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/x-ai/grok-3-mini-beta-reasoning-high": {
    provider: "OpenRouter",
    name: "X AI Grok 3 Mini Beta (High Reasoning)",
    description: "Grok 3 Mini Beta from X AI with high reasoning effort, accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Compact", "Efficient", "Versatile", "High Reasoning"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/meta-llama/llama-4-maverick": {
    provider: "OpenRouter",
    name: "Meta Llama 4 Maverick",
    description: "Meta Llama 4 Maverick, a cutting-edge model from Meta, accessed via OpenRouter.",
    apiVersion: "meta-llama/llama-4-maverick",
    capabilities: ["Cutting-edge", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/mistralai/mistral-medium-3": {
    provider: "OpenRouter",
    name: "Mistral Medium 3",
    description: "Mistral Medium 3, a powerful model from Mistral AI, accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-medium-3",
    capabilities: ["Powerful", "Versatile"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
    provider: "OpenRouter",
    name: "Mistral Small 3.1 24B Instruct",
    description: "Mistral Small 3.1 24B Instruct, an efficient and capable model from Mistral AI, accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
    capabilities: ["Efficient", "Capable", "Instruct"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/openai/gpt-4.1": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1",
    description: "GPT-4.1 is a flagship large language model excelling in instruction following, software engineering, and long-context reasoning, supporting a 1 million token context. It\'s tuned for precise code diffs, agent reliability, and high recall, ideal for agents, IDE tooling, and enterprise knowledge retrieval. Note: Web search is not supported for this model.",
    apiVersion: "openai/gpt-4.1",
    capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
    enabled: true,
    supportsWebSearch: false,
    premium: true
  },
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "OpenAI GPT-4.1 Mini",
    description: "GPT-4.1 Mini is a compact and efficient version of GPT-4.1, offering a balance of performance and speed for various tasks.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Coding", "Instruction Following", "Compact"],
    enabled: false,
    supportsWebSearch: false,
    premium: false
  },
  "openrouter/openai/gpt-4.1-mini": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1 Mini",
    description: "GPT-4.1 Mini is a compact and efficient version of GPT-4.1, offering a balance of performance and speed for various tasks, accessed via OpenRouter.",
    apiVersion: "openai/gpt-4.1-mini",
    capabilities: ["Coding", "Instruction Following", "Compact"],
    enabled: true,
    supportsWebSearch: false,
    premium: false
  },
  "openrouter/openai/o4-mini-high": {
    provider: "OpenRouter",
    name: "OpenAI O4 Mini High",
    description: "OpenAI O4 Mini High, an efficient and high-performing model, accessed via OpenRouter.",
    apiVersion: "openai/o4-mini-high",
    capabilities: ["Efficient", "High-performing"],
    enabled: true,
    supportsWebSearch: false,
    premium: false
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Qwen QWQ model accessed via Groq, known for its speed and efficiency.",
    apiVersion: "qwen-qwq-32b",
    capabilities: ["Fast", "Efficient"],
    enabled: false,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/qwen/qwq-32b": {
    provider: "OpenRouter",
    name: "Qwen QWQ 32B",
    description: "Qwen QWQ 32B model accessed via OpenRouter, known for its speed and efficiency.",
    apiVersion: "qwen/qwq-32b",
    capabilities: ["Fast", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/qwen/qwen3-235b-a22b": {
    provider: "OpenRouter",
    name: "Qwen3 235B A22B",
    description: "Qwen3 235B A22B, a large and powerful model from Qwen, accessed via OpenRouter.",
    apiVersion: "qwen/qwen3-235b-a22b",
    capabilities: ["Large", "Powerful"],
    enabled: true,
    supportsWebSearch: true,
    premium: false
  },
  "openrouter/anthropic/claude-sonnet-4": {
    provider: "OpenRouter",
    name: "Claude 4 Sonnet",
    description: "Anthropic\'s Claude Sonnet 4 model, offering a balance of performance and speed, accessed via OpenRouter.",
    apiVersion: "anthropic/claude-sonnet-4",
    capabilities: ["Balanced", "Fast", "Efficient"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
  },
  "openrouter/anthropic/claude-opus-4": {
    provider: "OpenRouter",
    name: "Claude 4 Opus",
    description: "Anthropic\'s most advanced model, excelling at coding, advanced reasoning, agentic tasks, and long-context operations.",
    apiVersion: "anthropic/claude-opus-4",
    capabilities: ["Coding", "Advanced Reasoning", "Agentic Tasks", "Long Context", "Sustained Performance"],
    enabled: true,
    supportsWebSearch: true,
    premium: true
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

export const defaultModel: modelID = "openrouter/google/gemini-2.5-flash-preview";
