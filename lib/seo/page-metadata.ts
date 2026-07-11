import type { Metadata } from 'next';

/** Homepage brand-forward SERP copy (absolute title — no template suffix). */
export const HOMEPAGE_SEO = {
  title: 'ChatLima — Multi-Model AI Chat (GPT, Claude, Gemini & 300+)',
  description:
    'ChatLima is the multi-model AI chat app for GPT, Claude, Gemini, DeepSeek and 300+ models — with web search, files, MCP tools, and transparent credits. Start free.',
} as const;

export function buildComparisonMetadata(model1Name: string, model2Name: string): Metadata {
  const title = `${model1Name} vs ${model2Name}: Pricing, Specs & Context`;
  const description = `Compare ${model1Name} vs ${model2Name} side by side — pricing, context window, capabilities, and which to pick on ChatLima.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'ChatLima',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function buildModelPageTitle(modelName: string, isFree: boolean): string {
  return isFree
    ? `${modelName} (Free) — Chat on ChatLima`
    : `${modelName} — Chat Free on ChatLima`;
}

export function buildModelPageDescription(
  modelName: string,
  isFree: boolean,
  capabilities: string[],
  contextMax?: number | null
): string {
  const caps =
    capabilities.length > 0
      ? capabilities.map((c) => c.toLowerCase()).join(', ')
      : 'AI';

  if (isFree) {
    return `Try ${modelName} free on ChatLima — no signup required. ${caps} model with pricing, specs, and one-click chat.`;
  }

  const context = contextMax ? `${contextMax.toLocaleString()} context` : 'large context';
  return `Chat with ${modelName} on ChatLima. ${caps} model with ${context}, transparent credits, and easy model switching.`;
}
