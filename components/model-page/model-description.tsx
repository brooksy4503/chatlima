import { ModelInfo } from '@/lib/types/models';

interface ModelDescriptionProps {
  model: ModelInfo;
}

export function ModelDescription({ model }: ModelDescriptionProps) {
  const hasLongDescription = model.description && model.description.length > 100;

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-4">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        About {model.name}
      </h2>

      {model.description && (
        <p className="text-foreground/90 leading-relaxed">
          {model.description}
        </p>
      )}

      <div className="space-y-3 pt-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Strengths
          </h3>
          <ul className="space-y-2 text-foreground/80">
            {model.vision && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-semibold">•</span>
                <span>Multimodal understanding - can process text and images</span>
              </li>
            )}
            {model.contextMax && model.contextMax >= 100000 && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-semibold">•</span>
                <span>Large context window ({(model.contextMax / 1000).toFixed(0)}k tokens) for long conversations</span>
              </li>
            )}
            {model.capabilities.includes('Reasoning') && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-semibold">•</span>
                <span>Advanced reasoning capabilities for complex problem-solving</span>
              </li>
            )}
            {model.capabilities.includes('Coding') && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-semibold">•</span>
                <span>Strong coding performance across multiple languages</span>
              </li>
            )}
            {model.capabilities.includes('Fast') && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-semibold">•</span>
                <span>Fast response times for real-time interactions</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Use Cases
          </h3>
          <ul className="space-y-2 text-foreground/80">
            {model.capabilities.includes('Coding') && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-semibold">•</span>
                <span>Software development and debugging</span>
              </li>
            )}
            {model.capabilities.includes('Reasoning') && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-semibold">•</span>
                <span>Complex problem-solving and analysis</span>
              </li>
            )}
            {model.capabilities.includes('Vision') && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-semibold">•</span>
                <span>Image and document understanding</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-semibold">•</span>
              <span>Content creation and writing assistance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-semibold">•</span>
              <span>General conversations and Q&A</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Limitations
          </h3>
          <p className="text-foreground/80 leading-relaxed">
            Performance may vary based on query complexity, context length, and task type.
            Consider using higher-tier models for production-critical applications.
          </p>
        </div>
      </div>
    </div>
  );
}
