import Link from 'next/link';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelInfo } from '@/lib/types/models';

interface ModelHeroProps {
  model: ModelInfo;
  isFree: boolean;
}

export function ModelHero({ model, isFree }: ModelHeroProps) {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-foreground">
              {model.name}
            </h1>
            {isFree && (
              <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                Free
              </span>
            )}
            {model.premium && (
              <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Premium
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Provided by {model.provider}
          </p>
        </div>
      </div>

      <p className="text-lg text-foreground/90 mb-6 leading-relaxed">
        {model.description}
      </p>

      <Link href={`/chat?model=${model.id}`}>
        <Button size="lg" className="w-full sm:w-auto group">
          {isFree ? 'Chat Now' : 'Start Chat'}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}
