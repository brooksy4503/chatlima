import { SuggestedPrompts } from "./suggested-prompts";
import { ProjectOverviewV2 } from "./project-overview-v2";
import { useProjectOverviewV2 } from "@/lib/hooks/use-feature-flag";

interface ProjectOverviewProps {
  sendMessage?: (input: string) => void;
  selectedModel?: string;
}

export const ProjectOverview = ({ sendMessage, selectedModel }: ProjectOverviewProps) => {
  const { isEnabled, isLoading } = useProjectOverviewV2();

  // Show loading state while checking feature flag
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-4">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-base sm:text-lg text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Use V2 if feature flag is enabled
  if (isEnabled) {
    return (
      <ProjectOverviewV2
        sendMessage={sendMessage}
        selectedModel={selectedModel}
      />
    );
  }

  // Fall back to original version
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      {/* Welcome header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-base sm:text-lg text-muted-foreground">
          Your AI-powered chat assistant. Choose a suggestion below or start typing your own message.
        </p>
      </div>

      {/* Suggested prompts */}
      {sendMessage && (
        <div className="w-full max-w-4xl mx-auto">
          <SuggestedPrompts
            sendMessage={sendMessage}
            selectedModel={selectedModel}
            maxSuggestions={4}
            showCategories={true}
          />
        </div>
      )}
    </div>
  );
};
