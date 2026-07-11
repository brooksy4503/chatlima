import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { parseComparisonSlug, slugToModelId } from '@/lib/models/slug-utils';
import { resolveModelFromSlug, seoModelLabel } from '@/lib/models/resolve-model';
import { buildComparisonMetadata } from '@/lib/seo/page-metadata';
import { ComparisonTable } from '@/components/comparison/comparison-table';
import { ComparisonCards } from '@/components/comparison/comparison-cards';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Use 'auto' instead of 'force-static' to allow dynamic generation in development
// Pages will still be statically generated at build time when possible
export const dynamic = 'auto';

export async function generateStaticParams() {
  const { getAllPrebuiltComparisonSlugs } = await import('@/lib/models/model-priority');
  return getAllPrebuiltComparisonSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Decode URL-encoded characters (e.g., %3A becomes :) for backward compatibility
  // Normalize :free to -free for URL safety (handles both old and new formats)
  const decodedSlug = decodeURIComponent(slug).replace(/:free/g, '-free');
  const comparison = parseComparisonSlug(decodedSlug);

  if (!comparison) {
    return {
      title: 'Comparison Not Found',
      description: 'This model comparison could not be found. Browse our available comparisons.',
    };
  }

  const model1Id = slugToModelId(comparison.model1Slug);
  const model2Id = slugToModelId(comparison.model2Slug);

  try {
    const environmentKeys = getEnvironmentApiKeys();
    const response = await fetchAllModels({ environment: environmentKeys });
    const model1 = resolveModelFromSlug(response.models, model1Id, comparison.model1Slug);
    const model2 = resolveModelFromSlug(response.models, model2Id, comparison.model2Slug);

    if (model1 && model2) {
      return {
        ...buildComparisonMetadata(seoModelLabel(model1), seoModelLabel(model2)),
        alternates: {
          canonical: `/compare/${decodedSlug}`,
        },
      };
    }
  } catch (error) {
    console.error('[Comparison Metadata] Failed to resolve models:', error);
  }

  // Fallback when catalog fetch fails — still include slug-derived names for CTR
  const fallback1 = seoModelLabel({ id: model1Id, name: model1Id });
  const fallback2 = seoModelLabel({ id: model2Id, name: model2Id });
  return {
    ...buildComparisonMetadata(fallback1, fallback2),
    alternates: {
      canonical: `/compare/${decodedSlug}`,
    },
  };
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Decode URL-encoded characters (e.g., %3A becomes :) for backward compatibility
  // Normalize :free to -free for URL safety (handles both old and new formats)
  const decodedSlug = decodeURIComponent(slug).replace(/:free/g, '-free');
  const comparison = parseComparisonSlug(decodedSlug);

  if (!comparison) {
    notFound();
  }

  const model1Id = slugToModelId(comparison.model1Slug);
  const model2Id = slugToModelId(comparison.model2Slug);

  const environmentKeys = getEnvironmentApiKeys();
  let response;
  try {
    response = await fetchAllModels({ environment: environmentKeys });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    notFound();
  }

  const model1 = resolveModelFromSlug(response.models, model1Id, comparison.model1Slug);
  const model2 = resolveModelFromSlug(response.models, model2Id, comparison.model2Slug);

  if (!model1 || !model2) {
    // Enhanced logging for debugging
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = {
        slug,
        parsedComparison: comparison,
        model1Slug: comparison.model1Slug,
        model2Slug: comparison.model2Slug,
        model1Id,
        model2Id,
        model1Found: !!model1,
        model2Found: !!model2,
        totalModels: response.models.length,
        sampleModelIds: response.models.slice(0, 20).map(m => m.id),
        similarModel1: response.models.filter(m =>
          m.id.includes(model1Id.split('/').pop() || '') ||
          model1Id.includes(m.id.split('/').pop() || '')
        ).slice(0, 3).map(m => m.id),
        similarModel2: response.models.filter(m =>
          m.id.includes(model2Id.split('/').pop() || '') ||
          model2Id.includes(m.id.split('/').pop() || '')
        ).slice(0, 3).map(m => m.id),
      };
      console.error('[Comparison Page] Models not found');
      console.error(JSON.stringify(debugInfo, null, 2));
    }
    notFound();
  }

  return (
    <div className="min-h-screen w-full flex-1 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            {model1.name} vs {model2.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Side-by-side pricing, context window, and capabilities — try both on ChatLima.
          </p>
        </div>

        <div className="mb-12">
          <ComparisonCards model1={model1} model2={model2} />
        </div>

        <ComparisonTable model1={model1} model2={model2} />

        <div className="mt-12 pt-12 border-t border-border/40">
          <div className="grid sm:grid-cols-2 gap-6">
            <Link href={`/model/${encodeURIComponent(comparison.model1Slug)}`}>
              <Button variant="outline" className="w-full" size="lg">
                {model1.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/model/${encodeURIComponent(comparison.model2Slug)}`}>
              <Button variant="outline" className="w-full" size="lg">
                {model2.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/compare">
            <Button variant="outline">
              View All Comparisons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
