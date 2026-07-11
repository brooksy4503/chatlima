import { resolveModelFromSlug, seoModelLabel } from '@/lib/models/resolve-model';
import {
  buildComparisonMetadata,
  buildModelPageDescription,
  buildModelPageTitle,
  HOMEPAGE_SEO,
} from '@/lib/seo/page-metadata';

describe('seoModelLabel', () => {
  it('prefers a short catalog name', () => {
    expect(seoModelLabel({ id: 'openai/gpt-5-pro', name: 'GPT-5 Pro' })).toBe('GPT-5 Pro');
  });

  it('falls back to a readable id fragment when the name is missing or noisy', () => {
    expect(seoModelLabel({ id: 'openai/gpt-5-pro', name: '' })).toBe('gpt-5-pro');
    expect(
      seoModelLabel({
        id: 'openrouter/z-ai/glm-4.7',
        name: 'openrouter/z-ai/glm-4.7',
      })
    ).toBe('glm-4.7');
  });
});

describe('resolveModelFromSlug', () => {
  const models = [
    { id: 'openrouter/openai/gpt-5-pro', name: 'GPT-5 Pro' },
    { id: 'openai/gpt-5-chat', name: 'GPT-5 Chat' },
    { id: 'requesty/anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  ];

  it('matches exact id', () => {
    expect(resolveModelFromSlug(models, 'openai/gpt-5-chat', 'openai-gpt-5-chat')?.id).toBe(
      'openai/gpt-5-chat'
    );
  });

  it('prefers openrouter when resolving by model name part', () => {
    expect(
      resolveModelFromSlug(models, 'openai/gpt-5-pro', 'openai-gpt-5-pro')?.id
    ).toBe('openrouter/openai/gpt-5-pro');
  });
});

describe('page metadata helpers', () => {
  it('builds comparison titles that name both models', () => {
    const meta = buildComparisonMetadata('GPT-5 Pro', 'GLM-4.7');
    expect(meta.title).toBe('GPT-5 Pro vs GLM-4.7: Pricing, Specs & Context');
    expect(String(meta.description)).toContain('GPT-5 Pro vs GLM-4.7');
  });

  it('builds model page titles and descriptions', () => {
    expect(buildModelPageTitle('Gemini 3 Flash', false)).toContain('Gemini 3 Flash');
    expect(buildModelPageTitle('Gemini 3 Flash', true)).toContain('(Free)');
    expect(buildModelPageDescription('Gemini 3 Flash', true, ['Text', 'Vision'])).toContain(
      'Try Gemini 3 Flash free'
    );
  });

  it('exports homepage brand title', () => {
    expect(HOMEPAGE_SEO.title).toMatch(/^ChatLima/);
    expect(HOMEPAGE_SEO.description).toMatch(/multi-model AI chat/i);
  });
});
