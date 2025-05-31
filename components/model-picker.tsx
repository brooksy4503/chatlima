"use client";
import { MODELS, modelDetails, type modelID, defaultModel } from "@/ai/providers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Info, Bolt, Code, Brain, Lightbulb, Image, Gauge, Rocket, Bot } from "lucide-react";
import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface ModelPickerProps {
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
}

export const ModelPicker = ({ selectedModel, setSelectedModel }: ModelPickerProps) => {
  const [hoveredModel, setHoveredModel] = useState<modelID | null>(null);
  const { user } = useAuth();
  const { canAccessPremiumModels, loading: creditsLoading } = useCredits(undefined, user?.id);
  
  // Ensure we always have a valid model ID immediately for stable rendering
  // const stableModelId = MODELS.includes(selectedModel) ? selectedModel : defaultModel; // Replaced by direct use of selectedModel
  
  // Function to get the appropriate icon for each provider
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return <Zap className="h-3 w-3 text-orange-600" />;
      case 'openai':
        return <Zap className="h-3 w-3 text-green-500" />;
      case 'google':
        return <Zap className="h-3 w-3 text-red-500" />;
      case 'groq':
        return <Zap className="h-3 w-3 text-blue-500" />;
      case 'xai':
        return <Zap className="h-3 w-3 text-yellow-500" />;
      case 'openrouter':
        return <Zap className="h-3 w-3 text-purple-500" />;
      default:
        return <Zap className="h-3 w-3 text-blue-500" />;
    }
  };
  
  // Function to get capability icon
  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'code':
        return <Code className="h-2.5 w-2.5" />;
      case 'reasoning':
        return <Brain className="h-2.5 w-2.5" />;
      case 'research':
        return <Lightbulb className="h-2.5 w-2.5" />;
      case 'vision':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-2.5 w-2.5" />;
      case 'fast':
      case 'rapid':
        return <Bolt className="h-2.5 w-2.5" />;
      case 'efficient':
      case 'compact':
        return <Gauge className="h-2.5 w-2.5" />;
      case 'creative':
      case 'balance':
        return <Rocket className="h-2.5 w-2.5" />;
      case 'agentic':
        return <Bot className="h-2.5 w-2.5" />;
      default:
        return <Info className="h-2.5 w-2.5" />;
    }
  };
  
  // Get capability badge color
  const getCapabilityColor = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'code':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'reasoning':
      case 'research':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'vision':
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      case 'fast':
      case 'rapid':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case 'efficient':
      case 'compact':
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case 'creative':
      case 'balance':
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
      case 'agentic':
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  // Get current model details to display
  const displayModelId = hoveredModel || selectedModel; // Use selectedModel
  const currentModelDetails = modelDetails[displayModelId];

  // Sort models alphabetically by name
  const sortedModels = [...MODELS].sort((idA, idB) => {
    const nameA = modelDetails[idA].name;
    const nameB = modelDetails[idB].name;
    return nameA.localeCompare(nameB);
  });

  // Handle model change
  const handleModelChange = (modelId: string) => {
    if ((MODELS as string[]).includes(modelId)) {
      const typedModelId = modelId as modelID;
      setSelectedModel(typedModelId);
    }
  };

  return (
    <div>
      <Select 
        value={selectedModel} // Use selectedModel directly
        onValueChange={handleModelChange} 
      >
        <SelectTrigger 
          className="max-w-[200px] sm:max-w-fit sm:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full group border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 ring-offset-background focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          <SelectValue 
            placeholder="Select model" 
            className="text-xs font-medium flex items-center gap-1 sm:gap-2 text-primary dark:text-primary-foreground"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              {getProviderIcon(modelDetails[selectedModel].provider)} {/* Use selectedModel */}
              <span className="font-medium truncate">{modelDetails[selectedModel].name}</span> {/* Use selectedModel */}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          className="bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 rounded-lg overflow-hidden p-0 w-[320px] sm:w-[480px] md:w-[680px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[320px_1fr] items-start">
            {/* Model selector column */}
            <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1">
              <SelectGroup className="space-y-1">
                {sortedModels.map((id) => {
                  const modelId = id as modelID;
                  const item = (
                    <SelectItem 
                      key={id} 
                      value={id}
                      onMouseEnter={() => setHoveredModel(modelId)}
                      onMouseLeave={() => setHoveredModel(null)}
                      className={cn(
                        "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150",
                        "hover:bg-primary/5 hover:text-primary-foreground",
                        "focus:bg-primary/10 focus:text-primary focus:outline-none",
                        "data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary",
                        selectedModel === id && "!bg-primary/15 !text-primary font-medium",
                        modelDetails[modelId].premium && !canAccessPremiumModels() && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={creditsLoading || (modelDetails[modelId].premium && !canAccessPremiumModels())}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          {getProviderIcon(modelDetails[modelId].provider)}
                          <span className="font-medium truncate">{modelDetails[modelId].name}</span>
                          {modelDetails[modelId].premium && (
                            <Sparkles className="h-3 w-3 text-yellow-500 ml-1 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {modelDetails[modelId].provider}
                        </span>
                      </div>
                    </SelectItem>
                  );

                  if (modelDetails[modelId].premium && !canAccessPremiumModels() && !creditsLoading) {
                    return (
                      <TooltipProvider key={`${id}-tooltip`} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>{item}</TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">This is a premium model. Credits are required to use it.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }
                  return item;
                })}
              </SelectGroup>
            </div>
            
            {/* Model details column - hidden on smallest screens, visible on sm+ */}
            <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col sticky top-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getProviderIcon(currentModelDetails.provider)}
                  <h3 className="text-sm font-semibold">{currentModelDetails.name}</h3>
                  {currentModelDetails.premium && (
                    <Sparkles className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Provider: <span className="font-medium">{currentModelDetails.provider}</span>
                </div>
                
                {/* Capability badges */}
                <div className="flex flex-wrap gap-1 mt-2 mb-3">
                  {currentModelDetails.capabilities.map((capability) => (
                    <span 
                      key={capability}
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                        getCapabilityColor(capability)
                      )}
                    >
                      {getCapabilityIcon(capability)}
                      <span>{capability}</span>
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-foreground/90 leading-relaxed mb-3 hidden md:block">
                  {currentModelDetails.description}
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-md p-2 hidden md:block">
                <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                  <span>API Version:</span>
                  <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                    {currentModelDetails.apiVersion}
                  </code>
                </div>
              </div>
            </div>
            
            {/* Condensed model details for mobile only */}
            <div className="p-3 sm:hidden border-t border-border/30">
              <div className="flex flex-wrap gap-1 mb-2">
                {currentModelDetails.capabilities.slice(0, 4).map((capability) => (
                  <span 
                    key={capability}
                    className={cn(
                      "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                      getCapabilityColor(capability)
                    )}
                  >
                    {getCapabilityIcon(capability)}
                    <span>{capability}</span>
                  </span>
                ))}
                {currentModelDetails.capabilities.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{currentModelDetails.capabilities.length - 4} more</span>
                )}
              </div>
            </div>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};
