import { modelID, modelDetails } from "@/ai/providers";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Square, Globe, AlertCircle, ImageIcon } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { PresetSelector } from "./preset-selector";
import { useRef, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useWebSearch } from "@/lib/context/web-search-context";
import { usePresets } from "@/lib/context/preset-context";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
import { ImageUpload } from "./image-upload";
import { ImagePreview } from "./image-preview";
import type { ImageAttachment } from "@/lib/types";
import { Button } from "./ui/button";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
  // Image upload props
  images?: ImageAttachment[];
  onImagesChange?: (images: ImageAttachment[]) => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
  images = [],
  onImagesChange,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
  const { activePreset } = usePresets();
  const { user } = useAuth();
  const isMobileScreen = useIsMobile();

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

  // Image handling functions
  const handleImageSelect = (newImages: ImageAttachment[]) => {
    if (onImagesChange) {
      onImagesChange([...images, ...newImages]);
    }
    setShowImageUpload(false);
  };

  const handleImageRemove = (index: number) => {
    if (onImagesChange) {
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    }
  };

  const canUploadMore = images.length < 5;
  const hasImages = images.length > 0;

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

  
  return (
    <div className="w-full space-y-3">
      {/* Image Upload Interface */}
      {modelDetails[selectedModel]?.vision && showImageUpload && (
        <div className="bg-card border border-border rounded-xl p-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            maxFiles={5 - images.length}
            disabled={isLoading || !canUploadMore}
            showDetailSelector={true}
          />
        </div>
      )}

      {/* Image Preview */}
      {hasImages && (
        <div className="bg-card border border-border rounded-xl p-3">
          <ImagePreview
            images={images}
            onRemove={handleImageRemove}
            maxWidth={120}
            maxHeight={120}
            className="mb-2"
          />
          <div className="text-xs text-muted-foreground">
            {images.length}/5 images • Click images to remove
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative w-full">
        <ShadcnTextarea
          ref={textareaRef}
          className="resize-y bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl pr-12 pt-4 pb-16 border-input focus-visible:ring-ring placeholder:text-muted-foreground"
          value={input}
          autoFocus
          placeholder={hasImages ? "Describe these images or ask questions..." : "Send a message..."}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isLoading && (input.trim() || hasImages)) {
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

        {/* Mobile Controls - Stacked below textarea */}
        {isMobileScreen && (
          <div className="flex flex-col gap-2 mt-2 w-full">
            <div className="flex gap-2 w-full min-w-0">
              <PresetSelector className="flex-1 min-w-0" />
              <div className="flex-1 min-w-0">
                <ModelPicker
                  setSelectedModel={setSelectedModel}
                  selectedModel={selectedModel}
                  onModelSelected={handleModelSelected}
                  disabled={activePreset !== null}
                  activePresetName={activePreset?.name}
                />
              </div>
            </div>
            <div className="flex gap-2 w-full">
              {/* Image Upload Button */}
              {modelDetails[selectedModel]?.vision && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      disabled={isLoading || !canUploadMore}
                      className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-colors duration-150 ${
                        !canUploadMore
                          ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50'
                          : showImageUpload
                            ? 'bg-primary text-primary-foreground border-primary shadow'
                            : 'bg-background border-border text-muted-foreground hover:bg-accent'
                      } focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>
                    {showImageUpload ? 'Hide image upload' : 'Upload images'}
                  </TooltipContent>
                </Tooltip>
              )}
              {selectedModel.startsWith("openrouter/") && (
                <div className="relative flex items-center flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        ref={iconButtonRef}
                        aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
                        onClick={handleWebSearchToggle}
                        disabled={!canUseWebSearch}
                        className={`h-10 w-10 flex items-center justify-center rounded-full border transition-colors duration-150 ${
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type={isStreaming ? "button" : "submit"}
                    onClick={isStreaming ? stop : undefined}
                    disabled={(!isStreaming && !(input.trim() || hasImages)) || (isStreaming && status === "submitted")}
                    className="flex-1 min-w-0 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted/60 disabled:border disabled:border-border disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isStreaming ? (
                      <Square className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                    ) : (
                      <ArrowUp className={`h-5 w-5 flex-shrink-0 ${(!isStreaming && !(input.trim() || hasImages)) ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
                    )}
                    <span className="ml-2 hidden sm:inline">Send</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  {isStreaming ? "Stop generation" : "Send message"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
        
        {/* Desktop Controls - Original layout */}
        {!isMobileScreen && (
          <>
            <div className="absolute left-2 bottom-2 z-10">
              <div className="flex items-center gap-2">
                <PresetSelector />
                <ModelPicker
                  setSelectedModel={setSelectedModel}
                  selectedModel={selectedModel}
                  onModelSelected={handleModelSelected}
                  disabled={activePreset !== null}
                  activePresetName={activePreset?.name}
                />
                {/* Image Upload Button */}
                {modelDetails[selectedModel]?.vision && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        disabled={isLoading || !canUploadMore}
                        className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-150 ${
                          !canUploadMore
                            ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : showImageUpload
                              ? 'bg-primary text-primary-foreground border-primary shadow'
                              : 'bg-background border-border text-muted-foreground hover:bg-accent'
                        } focus:outline-none focus:ring-2 focus:ring-primary/30`}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      {showImageUpload ? 'Hide image upload' : 'Upload images'}
                    </TooltipContent>
                  </Tooltip>
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
                  disabled={(!isStreaming && !(input.trim() || hasImages)) || (isStreaming && status === "submitted")}
                  className="absolute right-2 bottom-2 rounded-full p-2 bg-primary hover:bg-primary/90 disabled:bg-muted/60 disabled:border disabled:border-border disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isStreaming ? (
                    <Square className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <ArrowUp className={`h-4 w-4 ${(!isStreaming && !(input.trim() || hasImages)) ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {isStreaming ? "Stop generation" : "Send message"}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Model Support Message */}
      {/* Removed: Message about model not supporting images */}
    </div>
  );
};
