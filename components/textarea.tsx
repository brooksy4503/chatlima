import { modelID } from "@/ai/providers";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Globe } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { useRef } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useWebSearch } from "@/lib/context/web-search-context";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();

  const handleWebSearchToggle = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  return (
    <div className="relative w-full">
      <ShadcnTextarea
        className="resize-none bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
        value={input}
        autoFocus
        placeholder="Send a message..."
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="absolute left-2 bottom-2 z-10">
        <div className="flex items-center gap-2">
          <ModelPicker
            setSelectedModel={setSelectedModel}
            selectedModel={selectedModel}
          />
          {selectedModel.startsWith("openrouter/") && (
            <div className="relative flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    ref={iconButtonRef}
                    aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
                    onClick={handleWebSearchToggle}
                    className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-150 ${webSearchEnabled ? 'bg-primary text-primary-foreground border-primary shadow' : 'bg-background border-border text-muted-foreground hover:bg-accent'} focus:outline-none focus:ring-2 focus:ring-primary/30`}
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>
                  {webSearchEnabled ? 'Disable web search' : 'Enable web search'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      <button
        type={isStreaming ? "button" : "submit"}
        onClick={isStreaming ? stop : undefined}
        disabled={(!isStreaming && !input.trim()) || (isStreaming && status === "submitted")}
        className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200"
      >
        {isStreaming ? (
          <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4 text-primary-foreground" />
        )}
      </button>
    </div>
  );
};
