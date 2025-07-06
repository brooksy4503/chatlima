import { modelID } from "@/ai/providers";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Square, Globe, AlertCircle } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { useRef, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useWebSearch } from "@/lib/context/web-search-context";
import { useAuth } from "@/hooks/useAuth";
import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
import { FileUpload } from "./file-upload";
import { FilePreviewList } from "./file-preview";
import { type ProcessedFile } from "@/lib/file-processing";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
  attachedFiles?: ProcessedFile[];
  onFilesChange?: (files: ProcessedFile[]) => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
  attachedFiles = [],
  onFilesChange,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localFiles, setLocalFiles] = useState<ProcessedFile[]>(attachedFiles);

  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
  const { user } = useAuth();

  const handleWebSearchToggle = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  // Check if user has enough credits for web search (5 credits minimum)
  // Use a more resilient check that handles temporary null values during hot reload
  const userCredits = user?.credits ?? 0;
  const hasEnoughCreditsForWebSearch = user?.hasCredits !== false && userCredits >= WEB_SEARCH_COST;
  const isAnonymousUser = !user || user?.isAnonymous;
  // Only allow web search if user has sufficient credits and is not anonymous
  const canUseWebSearch = !isAnonymousUser && hasEnoughCreditsForWebSearch;

  // Calculate estimated cost
  const getEstimatedCost = () => {
    const baseCost = 1; // Base cost for any message
    const webSearchCost = webSearchEnabled ? WEB_SEARCH_COST : 0;
    return baseCost + webSearchCost;
  };

  const estimatedCost = getEstimatedCost();
  const shouldShowCostWarning = webSearchEnabled && canUseWebSearch && input.trim();

  // Focus textarea after model selection
  const handleModelSelected = () => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Determine tooltip message based on credit status
  const getWebSearchTooltipMessage = () => {
    if (isAnonymousUser) {
      return "Sign in and purchase credits to enable Web Search";
    }
    if (!hasEnoughCreditsForWebSearch) {
      return "Purchase credits to enable Web Search";
    }
    return webSearchEnabled ? 'Disable web search' : 'Enable web search';
  };

  // File handling functions
  const handleFileSelect = (newFiles: ProcessedFile[]) => {
    const updatedFiles = [...localFiles, ...newFiles];
    setLocalFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = localFiles.filter((_, i) => i !== index);
    setLocalFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  // Check if model supports multimodal content
  const supportsFiles = selectedModel.startsWith("openrouter/") || selectedModel.startsWith("requesty/");
  
  // Update send button disabled state to include files
  const canSend = !isStreaming && (input.trim() || localFiles.length > 0);

  return (
    <div className="relative w-full space-y-2">
      {/* File previews */}
      {localFiles.length > 0 && (
        <FilePreviewList
          files={localFiles}
          onRemoveFile={handleRemoveFile}
          className="mb-2"
        />
      )}
      
      <div className="relative">
        <ShadcnTextarea
          ref={textareaRef}
          className="resize-y bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
          value={input}
          autoFocus
          placeholder={localFiles.length > 0 ? "Add a message to send with your files..." : "Send a message..."}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isLoading && canSend) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          style={{
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        />
      
      {/* Cost visibility warning */}
      {shouldShowCostWarning && (
        <div className="absolute top-2 right-14 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700/30">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">{estimatedCost} credits</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <div className="text-xs">
                <div>Estimated cost: {estimatedCost} credits</div>
                <div className="text-muted-foreground">Base: 1 credit + Web Search: {WEB_SEARCH_COST} credits</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

        <div className="absolute left-2 bottom-2 z-10">
          <div className="flex items-center gap-2">
            <ModelPicker
              setSelectedModel={setSelectedModel}
              selectedModel={selectedModel}
              onModelSelected={handleModelSelected}
            />
            {supportsFiles && (
              <FileUpload
                onFileSelect={handleFileSelect}
                disabled={isLoading}
                multiple={true}
              />
            )}
            {selectedModel.startsWith("openrouter/") && (
              <div className="relative flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      ref={iconButtonRef}
                      aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
                      onClick={handleWebSearchToggle}
                      disabled={!canUseWebSearch}
                      className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-150 ${
                        !canUseWebSearch 
                          ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50' 
                          : webSearchEnabled 
                            ? 'bg-primary text-primary-foreground border-primary shadow' 
                            : 'bg-background border-border text-muted-foreground hover:bg-accent'
                      } focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    >
                      <Globe className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>
                    {getWebSearchTooltipMessage()}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type={isStreaming ? "button" : "submit"}
              onClick={isStreaming ? stop : undefined}
              disabled={(!isStreaming && !canSend) || (isStreaming && status === "submitted")}
              className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted/60 disabled:border disabled:border-border disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isStreaming ? (
                <Square className="h-4 w-4 text-primary-foreground" />
              ) : (
                <ArrowUp className={`h-4 w-4 ${(!isStreaming && !canSend) ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {isStreaming ? "Stop generation" : "Send message"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
