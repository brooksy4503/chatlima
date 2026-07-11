import { notFound } from 'next/navigation';
import { fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { modelIdToSlug, slugToModelId } from '@/lib/models/slug-utils';
import { resolveModelFromSlug, seoModelLabel } from '@/lib/models/resolve-model';
import {
  buildModelPageDescription,
  buildModelPageTitle,
} from '@/lib/seo/page-metadata';
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
import { getRemainingCreditsByExternalId } from '@/lib/polar';
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

  let modelId = slugToModelId(decodedSlug);
  const model = resolveModelFromSlug(response.models, modelId, decodedSlug);

  if (!model) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Model Page Metadata] Model not found for slug: ${decodedSlug}`);
      console.error(`Tried modelId: ${modelId}`);
    }
    return {
      title: 'Model Not Found',
      description: 'This AI model could not be found. Explore our available models.',
    };
  }

  modelId = model.id;
  const isFree = model.id.endsWith(':free');
  const label = seoModelLabel(model);
  const title = buildModelPageTitle(label, isFree);
  const description = buildModelPageDescription(
    label,
    isFree,
    model.capabilities ?? [],
    model.contextMax
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description: model.description || description,
      type: 'website',
      siteName: 'ChatLima',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: model.description || description,
    },
    alternates: {
      canonical: `/model/${slug}`,
    },
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
  
  let modelId = slugToModelId(decodedSlug);
  const model = resolveModelFromSlug(response.models, modelId, decodedSlug);

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
          const credits = await getRemainingCreditsByExternalId(userId);
          canAccessPremium = typeof credits === 'number' && credits > 0;
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
    // Prioritize NEXT_PUBLIC_SITE_URL, then VERCEL_URL, then default
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'chatlima.com';
    baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
  }

  return (
    <div className="min-h-screen w-full flex-1 bg-gradient-to-b from-background to-muted/20">
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
