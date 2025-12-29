import Link from 'next/link';
import { ModelInfo } from '@/lib/types/models';
import { modelIdToSlug } from '@/lib/models/slug-utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelRelatedProps {
  models: ModelInfo[];
}

export function ModelRelated({ models }: ModelRelatedProps) {
  if (models.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Related Models
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Similar models you might be interested in
      </p>
      <div className="space-y-3">
        {models.map(model => {
          const slug = modelIdToSlug(model.id);
          const isFree = model.id.endsWith(':free');

          return (
            <Link
              key={model.id}
              href={`/model/${encodeURIComponent(slug)}`}
              className="block bg-muted/40 rounded-lg p-4 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {model.name}
                    </h3>
                    {isFree && (
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {model.description || model.capabilities.join(', ')}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
      <Link href="/models">
        <Button variant="outline" className="w-full mt-4">
          View All Models
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
