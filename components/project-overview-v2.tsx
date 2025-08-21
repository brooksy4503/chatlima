import { SuggestedPrompts } from "./suggested-prompts";

interface ProjectOverviewV2Props {
  sendMessage?: (input: string) => void;
  selectedModel?: string;
}

export const ProjectOverviewV2 = ({ sendMessage, selectedModel }: ProjectOverviewV2Props) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-6 bg-gradient-to-br from-background/50 to-muted/30 rounded-2xl border">
      {/* Enhanced welcome header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to ChatLima
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Your intelligent AI assistant with enhanced capabilities.
          Get started with a suggestion or ask anything you&apos;d like.
        </p>
        
        {/* Additional features section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-primary font-semibold">⚡</span>
            </div>
            <span className="font-medium">Fast Responses</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-primary font-semibold">🧠</span>
            </div>
            <span className="font-medium">Smart Suggestions</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-primary font-semibold">🔒</span>
            </div>
            <span className="font-medium">Secure & Private</span>
          </div>
        </div>
      </div>

      {/* Enhanced suggested prompts */}
      {sendMessage && (
        <div className="w-full max-w-5xl mx-auto">
          <SuggestedPrompts 
            sendMessage={sendMessage}
            selectedModel={selectedModel}
            maxSuggestions={6}
            showCategories={true}
          />
        </div>
      )}
    </div>
  );
};