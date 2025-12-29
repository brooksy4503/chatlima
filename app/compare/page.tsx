import { getAllPrebuiltComparisonSlugs, PREBUILT_COMPARISONS } from '@/lib/models/model-priority';
import { fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { modelIdToSlug } from '@/lib/models/slug-utils';
import Link from 'next/link';
import { GitCompare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return getAllPrebuiltComparisonSlugs().map(slug => ({ slug }));
}

export const dynamic = 'auto';

export async function generateMetadata() {
  return {
    title: 'Compare AI Models - ChatLima',
    description: 'Compare AI models side-by-side to find the best model for your needs. Features, pricing, and capabilities comparison.',
    openGraph: {
      title: 'Compare AI Models - ChatLima',
      description: 'Compare AI models side-by-side to find the best model for your needs.',
      type: 'website',
      siteName: 'ChatLima',
    },
  };
}

export default async function ComparePage() {
  // Fetch models to get display names
  const environmentKeys = getEnvironmentApiKeys();
  let response;
  try {
    response = await fetchAllModels({ environment: environmentKeys });
    if (process.env.NODE_ENV === 'development') {
      console.log('[Compare Page] Fetched models:', {
        totalModels: response.models.length,
        sampleIds: response.models.slice(0, 5).map(m => m.id)
      });
    }
  } catch (error) {
    console.error('Failed to fetch models in compare page:', error);
    response = { models: [] };
  }
  
  // Helper to get a readable model name from ID
  const getModelDisplayName = (modelId: string): string => {
    const model = response.models.find(m => m.id === modelId);
    if (model) return model.name;
    
    // Fallback: format the model ID nicely
    const parts = modelId.split('/');
    const modelName = parts[parts.length - 1] || modelId;
    // Remove common suffixes and format
    return modelName
      .replace(/:free$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get popular comparisons - show all, using fallback names if models don't exist
  const popularComparisons = PREBUILT_COMPARISONS.slice(0, 7)
    .map(comp => {
      const slug = modelIdToSlug(comp.model1Id) + '-vs-' + modelIdToSlug(comp.model2Id);
      
      return {
        model1Name: getModelDisplayName(comp.model1Id),
        model2Name: getModelDisplayName(comp.model2Id),
        slug,
        model1Exists: !!response.models.find(m => m.id === comp.model1Id),
        model2Exists: !!response.models.find(m => m.id === comp.model2Id),
      };
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
          <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <GitCompare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Compare AI Models
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compare models side-by-side to make informed decisions about which AI model is right for you
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Popular Comparisons
          </h2>
          {popularComparisons.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {popularComparisons.map(comp => (
                <Link
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {comp.model1Name}
                      </h3>
                      <span className="text-muted-foreground">vs</span>
                      <h3 className="text-lg font-semibold text-foreground">
                        {comp.model2Name}
                      </h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Compare features, pricing, and capabilities
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No comparisons available at the moment.
              </p>
              <Link href="/models">
                <Button variant="outline">
                  Browse All Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/models">
            <Button variant="outline" size="lg">
              Browse All Models
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
