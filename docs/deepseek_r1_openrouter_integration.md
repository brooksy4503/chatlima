# Integrating DeepSeek R1 via OpenRouter with Vercel AI SDK

This document outlines the necessary configurations and prompting strategies to successfully integrate the DeepSeek R1 model when accessed through OpenRouter, using the Vercel AI SDK. These steps address common issues such as Zod validation errors for `logprobs` and ensuring the final answer is correctly displayed in the UI.

## Summary of Key Configurations

To ensure DeepSeek R1 functions correctly, the following adjustments were made:

1.  **Model Definition in `ai/providers.ts`**:
    *   The `openrouter/deepseek/deepseek-r1` model was enabled.
    *   It was wrapped with `extractReasoningMiddleware` to separate reasoning from the final answer.
    *   `logprobs: false` was added to the `openrouterClient` configuration for this model to prevent validation errors.
    *   The `extractReasoningMiddleware` for DeepSeek R1 was configured to use `tagName: 'think'` and `startWithReasoning: false` (or rely on the default, which is `false`).

    ```typescript
    // In ai/providers.ts

    // ... other imports ...
    import {
      customProvider,
      wrapLanguageModel,
      extractReasoningMiddleware
    } from "ai";

    // Middleware for general reasoning (if any)
    const middleware = extractReasoningMiddleware({
      tagName: 'think',
    });

    // Specific middleware for DeepSeek R1
    const deepseekR1Middleware = extractReasoningMiddleware({
      tagName: 'think',
      // startWithReasoning: true, // This was found to cause issues, default (false) is better
    });

    const openrouterClient = createOpenRouter({
      apiKey: getApiKey('OPENROUTER_API_KEY'),
      // ... other headers ...
    });

    const languageModels = {
      // ... other models ...
      "openrouter/deepseek/deepseek-r1": wrapLanguageModel({
        model: openrouterClient("deepseek/deepseek-r1", { logprobs: false }), // Disable logprobs
        middleware: deepseekR1Middleware,
      }),
      // ... other models ...
    };

    export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
      // ... other model details ...
      "openrouter/deepseek/deepseek-r1": {
        provider: "OpenRouter",
        name: "DeepSeek R1",
        description: "DeepSeek R1: Open-source model with performance on par with OpenAI o1, featuring open reasoning tokens. 671B parameters (37B active). MIT licensed.",
        apiVersion: "deepseek/deepseek-r1",
        capabilities: ["Reasoning", "Open Source"],
        enabled: true // Ensure the model is enabled
      },
      // ... other model details ...
    };
    // ... rest of the file ...
    ```

2.  **System Prompt in API Route (`app/api/chat/route.ts`)**:
    *   A specific system message is prepended to the conversation history when `openrouter/deepseek/deepseek-r1` is selected. This prompt guides the model to structure its output correctly.

    ```typescript
    // In app/api/chat/route.ts

    // ... other imports ...
    import { type UIMessage, nanoid } from 'ai'; // Assuming nanoid is used for IDs

    export async function POST(req: Request) {
      const {
        messages,
        selectedModel,
        // ... other parameters ...
      }: {
        messages: UIMessage[];
        selectedModel: modelID;
        // ... other types ...
      } = await req.json();

      let modelMessages: UIMessage[] = [...messages];

      if (selectedModel === "openrouter/deepseek/deepseek-r1") {
        const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
        modelMessages.unshift({
          role: "system",
          id: nanoid(), // Or any unique ID generation method
          content: systemContent,
          parts: [{ type: "text", text: systemContent }]
        });
      }

      // ... rest of the API route logic ...

      // When instantiating model for web search, also disable logprobs for DeepSeek R1
      if (webSearch.enabled && selectedModel.startsWith("openrouter/")) {
        const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
        // ... client instantiation ...
        if (selectedModel === "openrouter/deepseek/deepseek-r1") {
          modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
        } else {
          modelInstance = openrouterClient(openrouterModelId);
        }
      }
      // ...
    }
    ```

## Explanation of Changes

*   **`logprobs: false`**: The DeepSeek R1 model, when accessed via OpenRouter, sometimes sends `logprobs` in a format (or with missing sub-fields like `content` as an array) that causes Zod validation errors in the Vercel AI SDK. Disabling `logprobs` altogether avoids this issue.
*   **`extractReasoningMiddleware` with `startWithReasoning: false` (default)**: While `startWithReasoning: true` might seem logical for a model that uses reasoning tags, it can be too strict. If the model outputs any leading characters (even whitespace) before the `<think>` tag, it can cause errors. The default `false` is more robust as it searches for the tag within the stream.
*   **System Prompt**: DeepSeek R1 requires explicit guidance on how to structure its output. The prompt:
    `"Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags."`
    ensures that:
    *   Reasoning is wrapped in `<think>...</think>` and captured by `message.reasoning`.
    *   The final answer is provided as plain text immediately after, becoming `message.content`, which can be directly rendered by the UI without issues from unhandled tags like `<answer>`.

By implementing these configurations, DeepSeek R1 can be used effectively with OpenRouter and the Vercel AI SDK, providing both its reasoning process and the final answer in a usable format. 