import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getModelDetails, fetchAllModels } from '@/lib/models/fetch-models';
import { modelIdToSlug, slugToModelId } from '@/lib/models/slug-utils';
import { getRelatedModels } from '@/lib/models/model-priority';
import { ModelHero } from '@/components/model-page/model-hero';
import { ModelSpecs } from '@/components/model-page/model-specs';
import { ModelDescription } from '@/components/model-page/model-description';
import { ModelPrompts } from '@/components/model-page/model-prompts';
import { ModelRelated } from '@/components/model-page/model-related';
import { ModelPremiumBanner } from '@/components/model-page/model-premium-banner';
import { ModelComparisonLinks } from '@/components/model-page/model-comparison-links';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const response = await fetchAllModels({ environment: {} });
    const { getTopModelsForPreRender } = await import('@/lib/models/model-priority');
    const topModels = getTopModelsForPreRender(response.models, 100);

    return topModels.map(model => ({
      slug: modelIdToSlug(model.id)
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const modelId = slugToModelId(slug);
  const model = await getModelDetails(modelId, { environment: {} });

  if (!model) {
    return {
      title: 'Model Not Found - ChatLima',
      description: 'This AI model could not be found. Explore our available models.'
    };
  }

  const isFree = model.id.endsWith(':free');

  return {
    title: isFree
      ? `${model.name} (Free) - Chat on ChatLima`
      : `${model.name} - Chat Free on ChatLima`,
    description: isFree
      ? `${model.name} is a ${model.capabilities.join(', ').toLowerCase()} model. Try ${model.name} for free on ChatLima - no signup required.`
      : `${model.name} is a ${model.capabilities.join(', ').toLowerCase()} model with ${model.contextMax?.toLocaleString() || 'large'} context. Chat with ${model.name} free on ChatLima with premium access.`,
    openGraph: {
      title: isFree
        ? `${model.name} (Free) - Chat on ChatLima`
        : `${model.name} - Chat Free on ChatLima`,
      description: model.description || `Chat with ${model.name} on ChatLima - multi-model AI chat with advanced features.`,
      type: 'website',
      siteName: 'ChatLima',
    },
    twitter: {
      card: 'summary_large_image',
      title: isFree
        ? `${model.name} (Free) - Chat on ChatLima`
        : `${model.name} - Chat Free on ChatLima`,
      description: model.description,
    },
    alternates: {
      canonical: `/model/${slug}`
    }
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const modelId = slugToModelId(slug);

  const response = await fetchAllModels({ environment: {} });
  const model = response.models.find(m => m.id === modelId);

  if (!model) {
    notFound();
  }

  const relatedModels = getRelatedModels(model, response.models, 4);
  const isFree = model.id.endsWith(':free');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ModelHero model={model} isFree={isFree} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <ModelSpecs model={model} />
            <ModelDescription model={model} />
            <ModelPrompts model={model} />
          </div>

          <div className="space-y-6">
            {!isFree && <ModelPremiumBanner model={model} />}
            <ModelRelated models={relatedModels} />
            <ModelComparisonLinks model={model} relatedModels={relatedModels} />
          </div>
        </div>
      </div>
    </div>
  );
}
