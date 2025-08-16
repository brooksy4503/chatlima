import { SuggestedPrompts } from "./suggested-prompts";

interface ProjectOverviewProps {
  sendMessage?: (input: string) => void;
  selectedModel?: string;
}

export const ProjectOverview = ({ sendMessage, selectedModel }: ProjectOverviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      {/* Welcome header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        </h1>
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
