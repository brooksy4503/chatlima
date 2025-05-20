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
  "openrouter/google/gemini-2.5-flash-preview": openrouterClient("google/gemini-2.5-flash-preview"),
  "openrouter/google/gemini-2.5-flash-preview:thinking": openrouterClient("google/gemini-2.5-flash-preview:thinking"),
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
  "openrouter/openai/o4-mini-high": wrapLanguageModel({
    model: openrouterClient("openai/o4-mini-high"),
    middleware: deepseekR1Middleware,
  }),
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
  "openrouter/qwen/qwen3-235b-a22b": openrouterClient("qwen/qwen3-235b-a22b")
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "openrouter/anthropic/claude-3.5-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.5 Sonnet",
    description: "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at: Coding, Data science, Visual processing, Agentic tasks",
    apiVersion: "anthropic/claude-3.5-sonnet",
    capabilities: ["Coding", "Data science", "Visual processing", "Agentic tasks"],
    enabled: true,
    supportsWebSearch: true
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "openrouter/anthropic/claude-3.7-sonnet": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic\'s Claude 3.7 Sonnet accessed via OpenRouter. Strong reasoning and coding capabilities.",
    apiVersion: "anthropic/claude-3.7-sonnet",
    capabilities: ["Reasoning", "Coding", "Agentic"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/anthropic/claude-3.7-sonnet:thinking": {
    provider: "OpenRouter",
    name: "Claude 3.7 Sonnet (thinking)",
    description: "Advanced LLM with improved reasoning, coding, and problem-solving. Features a hybrid reasoning approach for flexible processing.",
    apiVersion: "anthropic/claude-3.7-sonnet:thinking",
    capabilities: ["Reasoning", "Coding", "Problem-solving", "Agentic"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/deepseek/deepseek-chat-v3-0324": {
    provider: "OpenRouter",
    name: "DeepSeek Chat V3 0324",
    description: "DeepSeek Chat model V3 accessed via OpenRouter.",
    apiVersion: "deepseek/deepseek-chat-v3-0324",
    capabilities: ["Chat", "Efficient"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/deepseek/deepseek-r1": {
    provider: "OpenRouter",
    name: "DeepSeek R1",
    description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed. Note: This model cannot be used for Tool Calling (e.g., MCP Servers).",
    apiVersion: "deepseek/deepseek-r1",
    capabilities: ["Reasoning", "Open Source"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/google/gemini-2.5-flash-preview": {
    provider: "OpenRouter",
    name: "Gemini 2.5 Flash Preview",
    description: "Google\'s state-of-the-art workhorse model for advanced reasoning, coding, mathematics, and scientific tasks, with built-in \"thinking\" capabilities. Accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview",
    capabilities: ["Reasoning", "Coding", "Mathematics", "Scientific"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/google/gemini-2.5-flash-preview:thinking": {
    provider: "OpenRouter",
    name: "Gemini 2.5 Flash Preview (thinking)",
    description: "Gemini 2.5 Flash is Google\'s state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in \"thinking\" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. Accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-flash-preview:thinking",
    capabilities: ["Reasoning", "Coding", "Mathematics", "Scientific", "Thinking"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/google/gemini-2.5-pro-preview-03-25": {
    provider: "OpenRouter",
    name: "Gemini 2.5 Pro Preview",
    description: "Google\'s state-of-the-art AI model for advanced reasoning, coding, math, and science, accessed via OpenRouter.",
    apiVersion: "google/gemini-2.5-pro-preview-03-25",
    capabilities: ["Reasoning", "Coding", "Math", "Science"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/x-ai/grok-3-beta": {
    provider: "OpenRouter",
    name: "Grok 3 Beta",
    description: "xAI\'s flagship model excelling at enterprise tasks, coding, summarization, and deep domain knowledge. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-beta",
    capabilities: ["Reasoning", "Coding", "Knowledge"],
    enabled: true,
    supportsWebSearch: true
  },
  "grok-3-mini": {
    provider: "XAI",
    name: "Grok 3 Mini",
    description: "Latest version of XAI\'s Grok 3 Mini with strong reasoning and coding capabilities.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "openrouter/x-ai/grok-3-mini-beta": {
    provider: "OpenRouter",
    name: "Grok 3 Mini Beta",
    description: "Lightweight model ideal for reasoning-heavy tasks, math, and puzzles. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Tool calling is disabled. Accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Reasoning", "Math", "Puzzles"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/x-ai/grok-3-mini-beta-reasoning-high": {
    provider: "OpenRouter",
    name: "Grok 3 Mini Beta (High Reasoning)",
    description: "xAI Grok 3 Mini Beta configured for high reasoning effort. Ideal for complex reasoning, math, and puzzles. Note: This model cannot be used for Tool Calling (e.g., MCP Servers). Tool calling is disabled. Accessed via OpenRouter.",
    apiVersion: "x-ai/grok-3-mini-beta",
    capabilities: ["Reasoning", "Math", "Puzzles", "High Effort"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/meta-llama/llama-4-maverick": {
    provider: "OpenRouter",
    name: "Llama 4 Maverick",
    description: "Meta\'s Llama 4 Maverick: a high-capacity, multimodal MoE language model. Supports multilingual text/image input and produces text/code output.",
    apiVersion: "meta-llama/llama-4-maverick",
    capabilities: ["Multimodal", "Multilingual", "Image Input", "Code Output", "Reasoning"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/mistralai/mistral-medium-3": {
    provider: "OpenRouter",
    name: "Mistral Medium 3",
    description: "High-performance enterprise-grade language model with frontier-level capabilities. Balances state-of-the-art reasoning and multimodal performance. Accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-medium-3",
    capabilities: ["Reasoning", "Coding", "STEM", "Enterprise"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/mistralai/mistral-small-3.1-24b-instruct": {
    provider: "OpenRouter",
    name: "Mistral Small 3.1 Instruct",
    description: "Mistral Small 3.1 Instruct model accessed via OpenRouter.",
    apiVersion: "mistralai/mistral-small-3.1-24b-instruct",
    capabilities: ["Instruct", "Efficient"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/openai/gpt-4.1": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1",
    description: "GPT-4.1 is a flagship large language model excelling in instruction following, software engineering, and long-context reasoning, supporting a 1 million token context. It\'s tuned for precise code diffs, agent reliability, and high recall, ideal for agents, IDE tooling, and enterprise knowledge retrieval. Note: Web search is not supported for this model.",
    apiVersion: "openai/gpt-4.1",
    capabilities: ["Coding", "Instruction Following", "Long Context", "Multimodal", "Agents", "IDE Tooling", "Knowledge Retrieval"],
    enabled: true,
    supportsWebSearch: false
  },
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "OpenAI GPT-4.1 Mini",
    description: "Compact version of OpenAI\'s GPT-4.1 with good balance of capabilities, including vision.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Balance", "Creative", "Vision"],
    enabled: false
  },
  "openrouter/openai/gpt-4.1-mini": {
    provider: "OpenRouter",
    name: "OpenAI GPT-4.1 Mini",
    description: "Mid-sized model competitive with GPT-4o, lower latency/cost. Strong coding & vision. Accessed via OpenRouter. Note: Web search is not supported for this model.",
    apiVersion: "openai/gpt-4.1-mini",
    capabilities: ["Coding", "Vision", "Efficient"],
    enabled: true,
    supportsWebSearch: false
  },
  "openrouter/openai/o4-mini-high": {
    provider: "OpenRouter",
    name: "OpenAI o4 Mini High",
    description: "OpenAI o4-mini-high, a compact reasoning model optimized for speed and cost, with strong multimodal and agentic capabilities. Accessed via OpenRouter.",
    apiVersion: "openai/o4-mini-high",
    capabilities: ["Reasoning", "Coding", "Efficient", "Agentic", "Multimodal"],
    enabled: true,
    supportsWebSearch: true
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Latest version of Alibaba\'s Qwen QWQ with strong reasoning and coding capabilities.",
    apiVersion: "qwen-qwq",
    capabilities: ["Reasoning", "Efficient", "Agentic"],
    enabled: false
  },
  "openrouter/qwen/qwq-32b": {
    provider: "OpenRouter",
    name: "Qwen QwQ 32B",
    description: "QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. Accessed via OpenRouter.",
    apiVersion: "qwen/qwq-32b",
    capabilities: ["Reasoning", "Hard Problems"],
    enabled: true,
    supportsWebSearch: true
  },
  "openrouter/qwen/qwen3-235b-a22b": {
    provider: "OpenRouter",
    name: "Qwen3 235B A22B",
    description: "Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model by Qwen, activating 22B parameters per forward pass. It supports 'thinking' and 'non-thinking' modes, excels in reasoning, multilingual tasks, instruction-following, and agent tool-calling, with a context window up to 131K tokens via OpenRouter.",
    apiVersion: "qwen/qwen3-235b-a22b",
    capabilities: ["Reasoning", "Coding", "Multilingual", "Agentic"],
    enabled: true,
    supportsWebSearch: true
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
