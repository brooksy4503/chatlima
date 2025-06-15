"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getApiKey, model, titleGenerationModel, getTitleGenerationModel, type modelID } from "@/ai/providers";
import { type MessagePart } from "@/lib/db/schema";

// Helper to extract text content from a message regardless of format
function getMessageText(message: any): string {
  // Check if the message has parts (new format)
  if (message.parts && Array.isArray(message.parts)) {
    const textParts = message.parts.filter((p: any) => p.type === 'text' && p.text);
    if (textParts.length > 0) {
      return textParts.map((p: any) => p.text).join('\n');
    }
  }

  // Fallback to content (old format)
  if (typeof message.content === 'string') {
    return message.content;
  }

  // If content is an array (potentially of parts), try to extract text
  if (Array.isArray(message.content)) {
    const textItems = message.content.filter((item: any) =>
      typeof item === 'string' || (item.type === 'text' && item.text)
    );

    if (textItems.length > 0) {
      return textItems.map((item: any) =>
        typeof item === 'string' ? item : item.text
      ).join('\n');
    }
  }

  return '';
}

export async function generateTitle(messages: any[], selectedModel?: string, apiKeys?: Record<string, string>) {
  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.role === 'user');

  // If no user message, fallback to a default title (or handle as error)
  if (!firstUserMessage) {
    console.warn("No user message found for title generation.");
    return 'New Chat';
  }

  const userContent = getMessageText(firstUserMessage);

  // Prepare messages for the API - just the user content
  const titleGenMessages = [
    {
      role: 'user' as const,
      content: userContent
    }
  ];

  console.log('Generating title with simplified messages:', JSON.stringify(titleGenMessages, null, 2)); // Log the messages

  // Determine the title generation model to use
  let titleModel;
  if (selectedModel && apiKeys) {
    // Use dynamic model selection with API keys
    titleModel = getTitleGenerationModel(selectedModel as modelID, apiKeys);
  } else if (selectedModel) {
    // Use dynamic model selection without API keys
    titleModel = getTitleGenerationModel(selectedModel as modelID);
  } else {
    // Fallback to static model
    titleModel = titleGenerationModel;
  }

  try {
    const { object } = await generateObject({
      model: titleModel,
      schema: z.object({
        title: z.string().min(1).max(100),
      }),
      system: `
      You are a helpful assistant that generates short, concise titles for chat conversations based *only* on the user's first message.
      The title should summarize the main topic or request of the user's message.
      The title should be no more than 30 characters.
      The title should be unique and not generic like "Chat Title".
      Focus on keywords from the user's message.
      `,
      messages: [
        ...titleGenMessages,
        {
          role: "user",
          content: "Generate a concise title based on my first message.",
        },
      ],
    });
    return object.title;
  } catch (error) {
    console.error('Error generating title with generateObject:', error);
    // Fallback to a simple title derived from the first few words if AI fails
    return userContent.split(' ').slice(0, 5).join(' ') + (userContent.split(' ').length > 5 ? '...' : '');
  }
}
