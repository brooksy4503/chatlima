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
import { ModelStructuredData } from '@/components/model-page/model-structured-data';
import { auth } from '@/lib/auth';
import { getRemainingCreditsByExternalId, hasUnlimitedFreeModels } from '@/lib/polar';
import { headers } from 'next/headers';

// Helper to safely get headers, returning null during static generation
async function safeGetHeaders() {
  try {
    return await headers();
  } catch (error: any) {
    // During static generation, headers() throws DYNAMIC_SERVER_USAGE
    // Return null to indicate we're in static generation
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      return null;
    }
    throw error;
  }
}

// Use 'auto' to allow dynamic rendering for models not in top 100
// while still pre-rendering top models at build time
// Note: Routes that use headers() will automatically become dynamic
export const dynamic = 'auto';
// Allow dynamic params for models not in generateStaticParams
export const dynamicParams = true;
// ISR: Revalidate every hour (3600 seconds) for fresh model data
export const revalidate = 3600;

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
  
  // Helper to find model by ID or by matching the model name part
  const findModel = (targetId: string, targetSlug: string): typeof response.models[0] | undefined => {
    // Try exact ID match first
    let model = response.models.find(m => m.id === targetId);
    if (model) return model;

    // Try matching by slug
    const targetSlugLower = targetSlug.toLowerCase();
    model = response.models.find(m => {
      const modelSlug = modelIdToSlug(m.id);
      return modelSlug === targetSlugLower;
    });
    if (model) return model;

    // Extract model name part (e.g., "claude-3-5-sonnet" from "anthropic/claude-3-5-sonnet")
    const modelNamePart = targetId.split('/').pop()?.replace(/:free$/, '') || '';
    if (!modelNamePart) return undefined;

    // Try finding models that end with the model name
    // Prefer openrouter models first, then requesty, then others
    const candidates = response.models.filter(m => {
      const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
      const parts = normalizedId.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart === modelNamePart.toLowerCase() || normalizedId.endsWith(`/${modelNamePart.toLowerCase()}`);
    });

    if (candidates.length > 0) {
      // Prefer openrouter models, then requesty, then others
      const openrouterModel = candidates.find(m => m.id.startsWith('openrouter/'));
      if (openrouterModel) return openrouterModel;
      
      const requestyModel = candidates.find(m => m.id.startsWith('requesty/'));
      if (requestyModel) return requestyModel;
      
      // Return first match
      return candidates[0];
    }

    // Last resort: try partial match
    model = response.models.find(m => {
      const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
      return normalizedId.includes(modelNamePart.toLowerCase());
    });
    return model;
  };

  // Try direct conversion first
  let modelId = slugToModelId(decodedSlug);
  const model = findModel(modelId, decodedSlug);
  
  if (!model) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Model Page Metadata] Model not found for slug: ${decodedSlug}`);
      console.error(`Tried modelId: ${modelId}`);
    }
    return {
      title: 'Model Not Found - ChatLima',
      description: 'This AI model could not be found. Explore our available models.'
    };
  }
  
  // Update modelId to the actual found model's ID
  modelId = model.id;

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
  
  // Helper to find model by ID or by matching the model name part
  const findModel = (targetId: string, targetSlug: string): typeof response.models[0] | undefined => {
    // Try exact ID match first
    let model = response.models.find(m => m.id === targetId);
    if (model) return model;

    // Try matching by slug
    const targetSlugLower = targetSlug.toLowerCase();
    model = response.models.find(m => {
      const modelSlug = modelIdToSlug(m.id);
      return modelSlug === targetSlugLower;
    });
    if (model) return model;

    // Extract model name part (e.g., "claude-3-5-sonnet" from "anthropic/claude-3-5-sonnet")
    const modelNamePart = targetId.split('/').pop()?.replace(/:free$/, '') || '';
    if (!modelNamePart) return undefined;

    // Try finding models that end with the model name (handles openrouter/anthropic/claude-3-5-sonnet when looking for anthropic/claude-3-5-sonnet)
    // Prefer openrouter models first, then requesty, then others
    const candidates = response.models.filter(m => {
      const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
      const parts = normalizedId.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart === modelNamePart.toLowerCase() || normalizedId.endsWith(`/${modelNamePart.toLowerCase()}`);
    });

    if (candidates.length > 0) {
      // Prefer openrouter models, then requesty, then others
      const openrouterModel = candidates.find(m => m.id.startsWith('openrouter/'));
      if (openrouterModel) return openrouterModel;
      
      const requestyModel = candidates.find(m => m.id.startsWith('requesty/'));
      if (requestyModel) return requestyModel;
      
      // Return first match
      return candidates[0];
    }

    // Last resort: try partial match
    model = response.models.find(m => {
      const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
      return normalizedId.includes(modelNamePart.toLowerCase());
    });
    return model;
  };

  // Try direct conversion first
  let modelId = slugToModelId(decodedSlug);
  const model = findModel(modelId, decodedSlug);

  if (!model) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Model Page] Model not found for slug: ${decodedSlug}`);
      console.error(`Tried modelId: ${modelId}`);
      console.error(`Sample available models:`, response.models.slice(0, 10).map(m => m.id));
      console.error(`Similar models:`, response.models.filter(m => 
        m.id.toLowerCase().includes(modelId.split('/').pop()?.toLowerCase() || '')
      ).slice(0, 5).map(m => m.id));
    }
    notFound();
  }
  
  // Update modelId to the actual found model's ID
  modelId = model.id;

  const relatedModels = getRelatedModels(model, response.models, 4);
  const isFree = model.id.endsWith(':free');
  const isPremium = model.premium && !isFree;

  // Check if user can access premium models
  let canAccessPremium = true; // Default to true for free models
  if (isPremium) {
    // During static generation, headers() is not available
    // Default to false (no access) for security - page will be re-rendered on-demand
    const headersList = await safeGetHeaders();
    if (headersList) {
      try {
        const session = await auth.api.getSession({ headers: headersList });
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
    } else {
      // During static generation, default to no access
      // Page will be re-rendered on-demand with proper headers
      canAccessPremium = false;
    }
  }

  // Get base URL for structured data
  // During static generation, use environment variable or default
  let baseUrl = 'https://chatlima.com';
  const headersList = await safeGetHeaders();
  if (headersList) {
    const host = headersList.get('host') || 'chatlima.com';
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    baseUrl = `${protocol}://${host}`;
  } else {
    // During static generation, use environment variable or default
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL || 'chatlima.com'}`
      : 'https://chatlima.com';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <ModelStructuredData model={model} isFree={isFree} baseUrl={baseUrl} slug={decodedSlug} />
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
