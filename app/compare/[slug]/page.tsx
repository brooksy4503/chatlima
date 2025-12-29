import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getModelDetails, fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { parseComparisonSlug, slugToModelId } from '@/lib/models/slug-utils';
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
  const response = await fetchAllModels({ environment: environmentKeys });
  const model1 = response.models.find(m => m.id === model1Id);
  const model2 = response.models.find(m => m.id === model2Id);

  if (!model1 || !model2) {
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Comparison page - Models not found:', {
        slug,
        model1Id,
        model2Id,
        model1Found: !!model1,
        model2Found: !!model2,
        totalModels: response.models.length,
        availableModelIds: response.models.slice(0, 10).map(m => m.id)
      });
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

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
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
