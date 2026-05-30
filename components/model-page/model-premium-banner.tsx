import Link from 'next/link';
import { ModelInfo } from '@/lib/types/models';
import { Lock, ArrowRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelPremiumBannerProps {
  model: ModelInfo;
}

/** Shown when a model requires more credits than the viewer has available */
export function ModelPremiumBanner({ model }: ModelPremiumBannerProps) {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-xl p-6 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Credits required
        </h3>
      </div>

      <p className="text-foreground/90 text-sm mb-4 leading-relaxed">
        {model.name} uses tiered credit pricing. Subscribe for a monthly credit allowance, connect your own
        provider API key (BYOK), or browse lower-cost models on the catalog.
      </p>

      <div className="space-y-3">
        <Link href="/upgrade">
          <Button className="w-full group" size="default">
            View plans
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        <Link href="/models">
          <Button variant="outline" className="w-full" size="default">
            Browse models by cost
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-primary/20">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Credit cost per message is shown in the model picker. Economy models typically cost 1 credit;
            frontier models cost more.
          </p>
        </div>
      </div>
    </div>
  );
}
