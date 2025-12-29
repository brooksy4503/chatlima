import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getModelDetails, fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { modelIdToSlug, slugToModelId } from '@/lib/models/slug-utils';
import { getRelatedModels } from '@/lib/models/model-priority';
import { ModelHero } from '@/components/model-page/model-hero';
import { ModelSpecs } from '@/components/model-page/model-specs';
import { ModelDescription } from '@/components/model-page/model-description';
import { ModelPrompts } from '@/components/model-page/model-prompts';
import { ModelRelated } from '@/components/model-page/model-related';
import { ModelPremiumBanner } from '@/components/model-page/model-premium-banner';
import { ModelComparisonLinks } from '@/components/model-page/model-comparison-links';
import { auth } from '@/lib/auth';
import { getRemainingCreditsByExternalId, hasUnlimitedFreeModels } from '@/lib/polar';
import { headers } from 'next/headers';

// Use 'auto' to allow dynamic rendering for models not in top 100
// while still pre-rendering top models at build time
export const dynamic = 'auto';

export async function generateStaticParams() {
  try {
    const environmentKeys = getEnvironmentApiKeys();
    const response = await fetchAllModels({ environment: environmentKeys });
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
  // Decode URL-encoded characters (e.g., %3A becomes :)
  const decodedSlug = decodeURIComponent(slug);
  const environmentKeys = getEnvironmentApiKeys();
  const response = await fetchAllModels({ environment: environmentKeys });
  
  // Try direct conversion first
  let modelId = slugToModelId(decodedSlug);
  let model = response.models.find(m => m.id === modelId);
  
  // If not found, try to find by matching slug pattern
  if (!model) {
    const slugLower = decodedSlug.toLowerCase();
    model = response.models.find(m => {
      const modelSlug = modelIdToSlug(m.id);
      return modelSlug === slugLower;
    });
  }

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
  // Decode URL-encoded characters (e.g., %3A becomes :)
  const decodedSlug = decodeURIComponent(slug);
  const environmentKeys = getEnvironmentApiKeys();
  
  let response;
  try {
    response = await fetchAllModels({ environment: environmentKeys });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    notFound();
  }
  
  // Try direct conversion first
  let modelId = slugToModelId(decodedSlug);
  let model = response.models.find(m => m.id === modelId);
  
  // If not found, try to find by matching slug pattern
  // This handles cases where model IDs have multiple slashes (e.g., openrouter/nvidia/model-name)
  if (!model) {
    const slugLower = decodedSlug.toLowerCase();
    model = response.models.find(m => {
      const modelSlug = modelIdToSlug(m.id);
      return modelSlug === slugLower;
    });
    
    if (model) {
      modelId = model.id;
    }
  }

  if (!model) {
    console.error(`Model not found for slug: ${decodedSlug}, tried modelId: ${modelId}`);
    notFound();
  }

  const relatedModels = getRelatedModels(model, response.models, 4);
  const isFree = model.id.endsWith(':free');
  const isPremium = model.premium && !isFree;

  // Check if user can access premium models
  let canAccessPremium = true; // Default to true for free models
  if (isPremium) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      const isAnonymous = !session?.user?.id || ((session.user as any)?.isAnonymous === true);
      const userId = session?.user?.id;

      if (isAnonymous) {
        canAccessPremium = false;
      } else if (userId) {
        // Check for unlimited free models subscription (yearly plan)
        const hasUnlimitedFreeModelsAccess = await hasUnlimitedFreeModels(userId);
        
        if (hasUnlimitedFreeModelsAccess) {
          // Yearly subscribers can only access free models, not premium
          canAccessPremium = false;
        } else {
          // Check if user has credits
          const credits = await getRemainingCreditsByExternalId(userId);
          canAccessPremium = typeof credits === 'number' && credits > 0;
        }
      } else {
        canAccessPremium = false;
      }
    } catch (error) {
      // If check fails, assume no access for security
      console.warn('Error checking premium access:', error);
      canAccessPremium = false;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ModelHero model={model} isFree={isFree} canAccessPremium={canAccessPremium} />

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
