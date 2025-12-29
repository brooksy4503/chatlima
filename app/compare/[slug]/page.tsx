import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getModelDetails, fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { parseComparisonSlug, slugToModelId, modelIdToSlug } from '@/lib/models/slug-utils';
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
  const comparison = parseComparisonSlug(slug);

  if (!comparison) {
    return {
      title: 'Comparison Not Found - ChatLima',
      description: 'This model comparison could not be found. Browse our available comparisons.'
    };
  }

  return {
    title: `Compare AI Models - ChatLima`,
    description: 'Side-by-side comparison of AI models. Compare features, pricing, and capabilities.',
    openGraph: {
      title: 'Compare AI Models - ChatLima',
      description: 'Side-by-side comparison of AI models. Compare features, pricing, and capabilities.',
      type: 'website',
      siteName: 'ChatLima',
    },
  };
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comparison = parseComparisonSlug(slug);

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

    // Extract model name part (e.g., "gpt-5-pro" from "openai/gpt-5-pro")
    const modelNamePart = targetId.split('/').pop()?.replace(/:free$/, '') || '';
    if (!modelNamePart) return undefined;

    // Try finding models that end with the model name (handles openrouter/openai/gpt-5-pro when looking for openai/gpt-5-pro)
    // Prefer openrouter models first, then others
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

  const model1 = findModel(model1Id, comparison.model1Slug);
  const model2 = findModel(model2Id, comparison.model2Slug);

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
        // Check for similar model IDs
        similarModel1: response.models.filter(m => 
          m.id.includes(model1Id.split('/').pop() || '') || 
          model1Id.includes(m.id.split('/').pop() || '')
        ).slice(0, 3).map(m => m.id),
        similarModel2: response.models.filter(m => 
          m.id.includes(model2Id.split('/').pop() || '') || 
          model2Id.includes(m.id.split('/').pop() || '')
        ).slice(0, 3).map(m => m.id),
      };
      // Use console.error with stringified object to ensure it's logged properly
      console.error('[Comparison Page] Models not found');
      console.error(JSON.stringify(debugInfo, null, 2));
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            {model1.name} vs {model2.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Compare these two models side-by-side to help you make the best choice for your needs
          </p>
        </div>

        <div className="mb-12">
          <ComparisonCards model1={model1} model2={model2} />
        </div>

        <ComparisonTable model1={model1} model2={model2} />

        <div className="mt-12 pt-12 border-t border-border/40">
          <div className="grid sm:grid-cols-2 gap-6">
            <Link href={`/model/${comparison.model1Slug}`}>
              <Button variant="outline" className="w-full" size="lg">
                {model1.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/model/${comparison.model2Slug}`}>
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
