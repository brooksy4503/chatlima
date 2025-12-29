import { ModelInfo } from '@/lib/types/models';

interface ComparisonTableProps {
  model1: ModelInfo;
  model2: ModelInfo;
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

export function ComparisonTable({ model1, model2 }: ComparisonTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border/40">
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                Feature
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">
                {model1.name}
              </th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">
                {model2.name}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Provider
              </td>
              <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                {model1.provider}
              </td>
              <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                {model2.provider}
              </td>
            </tr>

            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Context Length
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                  {model1.contextMax ? formatContextDisplay(model1.contextMax) : 'N/A'}
                </code>
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                  {model2.contextMax ? formatContextDisplay(model2.contextMax) : 'N/A'}
                </code>
              </td>
            </tr>

            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Input Price
              </td>
              <td className="px-6 py-4 text-sm text-center">
                {model1.pricing?.input ? (
                  <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                    {formatPricingDisplay(model1.pricing.input)}
                  </code>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-center">
                {model2.pricing?.input ? (
                  <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                    {formatPricingDisplay(model2.pricing.input)}
                  </code>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
            </tr>

            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Output Price
              </td>
              <td className="px-6 py-4 text-sm text-center">
                {model1.pricing?.output ? (
                  <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                    {formatPricingDisplay(model1.pricing.output)}
                  </code>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-center">
                {model2.pricing?.output ? (
                  <code className="bg-muted px-3 py-1 rounded text-xs font-mono">
                    {formatPricingDisplay(model2.pricing.output)}
                  </code>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
            </tr>

            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Vision Support
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <span className={model1.vision ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                  {model1.vision ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <span className={model2.vision ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                  {model2.vision ? 'Yes' : 'No'}
                </span>
              </td>
            </tr>

            <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Premium
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <span className={model1.premium ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-muted-foreground'}>
                  {model1.premium ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <span className={model2.premium ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-muted-foreground'}>
                  {model2.premium ? 'Yes' : 'No'}
                </span>
              </td>
            </tr>

            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                Capabilities
              </td>
              <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                <div className="flex flex-wrap gap-1 justify-center">
                  {model1.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs">
                      {cap}
                    </span>
                  ))}
                  {model1.capabilities.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{model1.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                <div className="flex flex-wrap gap-1 justify-center">
                  {model2.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs">
                      {cap}
                    </span>
                  ))}
                  {model2.capabilities.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{model2.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
