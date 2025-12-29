import Link from 'next/link';
import { ModelInfo } from '@/lib/types/models';
import { getPrebuiltComparisonSlug } from '@/lib/models/model-priority';
import { modelIdToSlug } from '@/lib/models/slug-utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelComparisonLinksProps {
  model: ModelInfo;
  relatedModels: ModelInfo[];
}

export function ModelComparisonLinks({ model, relatedModels }: ModelComparisonLinksProps) {
  const topRelatedModels = relatedModels.slice(0, 2);
  const comparisons = topRelatedModels
    .map(relatedModel => ({
      model1Id: model.id,
      model2Id: relatedModel.id,
      slug: getPrebuiltComparisonSlug(model.id, relatedModel.id)
    }))
    .filter(comp => comp.slug !== null) as Array<{
      model1Id: string;
      model2Id: string;
      slug: string;
    }>;

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Compare Models
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        See how {model.name} compares to other popular models
      </p>

      <div className="space-y-3">
        {comparisons.map(comp => {
          const otherModel = relatedModels.find(m => m.id === comp.model2Id);
          if (!otherModel) {
            return null;
          }

          return (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="block bg-muted/40 rounded-lg p-4 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {model.name} vs {otherModel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Side-by-side comparison of features and capabilities
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/compare">
        <Button variant="outline" className="w-full mt-4" size="default">
          View All Comparisons
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
