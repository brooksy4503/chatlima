import Link from 'next/link';
import { ModelInfo } from '@/lib/types/models';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelPremiumBannerProps {
  model: ModelInfo;
}

export function ModelPremiumBanner({ model }: ModelPremiumBannerProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-semibold text-foreground">
          Premium Model
        </h3>
      </div>

      <p className="text-foreground/90 text-sm mb-4 leading-relaxed">
        This model requires credits to use. {model.name} offers advanced capabilities
        and high-performance features for production-grade applications.
      </p>

      <div className="space-y-3">
        <Link href="/upgrade">
          <Button className="w-full group" size="default">
            Upgrade to Access
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        <Link href="/models">
          <Button variant="outline" className="w-full" size="default">
            Browse Free Models
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-yellow-500/20">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            <span className="font-semibold">Credits required</span> for premium models.
            Free models are available without credits.
          </p>
        </div>
      </div>
    </div>
  );
}
