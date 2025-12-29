import Link from 'next/link';
import { ModelInfo } from '@/lib/types/models';
import { modelIdToSlug } from '@/lib/models/slug-utils';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelsGridProps {
  title: string;
  models: ModelInfo[];
  showBadges: boolean;
}

export function ModelsGrid({ title, models, showBadges }: ModelsGridProps) {
  if (models.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        {title}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map(model => {
          const slug = modelIdToSlug(model.id);
          const isFree = model.id.endsWith(':free');

          return (
            <Link
              key={model.id}
              href={`/model/${slug}`}
              className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                        {model.name}
                      </h3>
                      {model.premium && (
                        <Sparkles className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {model.provider}
                    </p>
                  </div>
                </div>

                {showBadges && (
                  <div className="flex flex-wrap gap-2">
                    {isFree && (
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium">
                        Free
                      </span>
                    )}
                    {model.vision && (
                      <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md text-xs font-medium">
                        Vision
                      </span>
                    )}
                    {model.capabilities.slice(0, 2).map(capability => (
                      <span
                        key={capability}
                        className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                )}

                {model.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {model.description}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary/10"
                >
                  {isFree ? 'Chat Free' : 'View Details'}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
