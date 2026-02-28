import { SuggestedPrompts } from "./suggested-prompts";

interface ProjectOverviewProps {
  sendMessage?: (input: string) => void;
  selectedModel?: string;
}

export const ProjectOverview = ({ sendMessage, selectedModel }: ProjectOverviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      {/* Welcome hero - clear value and one primary action */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <p className="text-base sm:text-lg text-muted-foreground">
          Ask anything. Pick a prompt idea below or type your own—your AI assistant is ready.
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
