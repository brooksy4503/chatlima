import { ModelInfo } from '@/lib/types/models';
import { Eye, Zap, Brain, Code, Gauge } from 'lucide-react';

interface ModelSpecsProps {
  model: ModelInfo;
}

function formatPricingDisplay(pricePerToken: number): string {
  const pricePerMillion = pricePerToken * 1000000;
  if (pricePerMillion >= 1) {
    return `$${pricePerMillion.toFixed(2)}/M`;
  } else if (pricePerMillion >= 0.01) {
    return `$${pricePerMillion.toFixed(3)}/M`;
  } else {
    return `$${pricePerMillion.toFixed(4)}/M`;
  }
}

function formatContextDisplay(contextMax: number): string {
  return `${contextMax.toLocaleString()} tokens`;
}

export function ModelSpecs({ model }: ModelSpecsProps) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-4">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Specifications
      </h2>

      {model.contextMax && (
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <span className="text-foreground">Context Length</span>
          </div>
          <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
            {formatContextDisplay(model.contextMax)}
          </code>
        </div>
      )}

      {model.pricing?.input !== undefined && (
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            <span className="text-foreground">Input Price</span>
          </div>
          <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
            {formatPricingDisplay(model.pricing.input)}
          </code>
        </div>
      )}

      {model.pricing?.output !== undefined && (
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-foreground">Output Price</span>
          </div>
          <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
            {formatPricingDisplay(model.pricing.output)}
          </code>
        </div>
      )}

      {model.vision && (
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <span className="text-foreground">Vision Support</span>
          </div>
          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded text-sm font-medium">
            Yes
          </span>
        </div>
      )}

      {model.capabilities.length > 0 && (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-blue-500" />
            <span className="text-foreground">Capabilities</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {model.capabilities.map(capability => (
              <span
                key={capability}
                className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md text-sm font-medium"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
