import { ModelInfo } from '@/lib/types/models';

interface ComparisonCardsProps {
  model1: ModelInfo;
  model2: ModelInfo;
}

export function ComparisonCards({ model1, model2 }: ComparisonCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {model1.name}
          </h3>
          {model1.premium && (
            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
              Premium
            </span>
          )}
          {model1.id.endsWith(':free') && (
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              Free
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Description
            </h4>
            <p className="text-foreground/90 text-sm leading-relaxed">
              {model1.description || 'No description available'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Strengths
            </h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              {model1.vision && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Multimodal understanding with text and image support</span>
                </li>
              )}
              {model1.contextMax && model1.contextMax >= 100000 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Large context window ({(model1.contextMax / 1000).toFixed(0)}k tokens)</span>
                </li>
              )}
              {model1.capabilities.includes('Reasoning') && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Advanced reasoning for complex tasks</span>
                </li>
              )}
              {model1.capabilities.includes('Coding') && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Strong coding performance</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Best For
            </h4>
            <p className="text-sm text-foreground/80">
              {model1.capabilities.includes('Coding') ? 'Software development and debugging' :
               model1.capabilities.includes('Reasoning') ? 'Complex problem-solving and analysis' :
               model1.vision ? 'Image and document understanding' :
               'General conversations and content creation'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {model2.name}
          </h3>
          {model2.premium && (
            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
              Premium
            </span>
          )}
          {model2.id.endsWith(':free') && (
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              Free
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Description
            </h4>
            <p className="text-foreground/90 text-sm leading-relaxed">
              {model2.description || 'No description available'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Strengths
            </h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              {model2.vision && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Multimodal understanding with text and image support</span>
                </li>
              )}
              {model2.contextMax && model2.contextMax >= 100000 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Large context window ({(model2.contextMax / 1000).toFixed(0)}k tokens)</span>
                </li>
              )}
              {model2.capabilities.includes('Reasoning') && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Advanced reasoning for complex tasks</span>
                </li>
              )}
              {model2.capabilities.includes('Coding') && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-semibold">•</span>
                  <span>Strong coding performance</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Best For
            </h4>
            <p className="text-sm text-foreground/80">
              {model2.capabilities.includes('Coding') ? 'Software development and debugging' :
               model2.capabilities.includes('Reasoning') ? 'Complex problem-solving and analysis' :
               model2.vision ? 'Image and document understanding' :
               'General conversations and content creation'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
