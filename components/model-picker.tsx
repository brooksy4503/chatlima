"use client";
import { MODELS, PRESETS, ALL_MODELS_AND_PRESETS, modelDetails, allModelAndPresetDetails, type modelID, type ModelOrPresetID, defaultModel } from "@/ai/providers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Info, Bolt, Code, Brain, Lightbulb, Image, Gauge, Rocket, Bot, ChevronDown, Check, Layers, Search, Users, PenTool } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ModelPickerProps {
  selectedModel: ModelOrPresetID;
  setSelectedModel: (model: ModelOrPresetID) => void;
  onModelSelected?: () => void;
  showPresets?: boolean; // Toggle to show/hide presets
}

export const ModelPicker = ({ selectedModel, setSelectedModel, onModelSelected, showPresets = true }: ModelPickerProps) => {
  const [hoveredModel, setHoveredModel] = useState<ModelOrPresetID | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<'models' | 'presets'>('models'); // Toggle between models and presets
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modelListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { canAccessPremiumModels, loading: creditsLoading } = useCredits(undefined, user?.id);
  
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
  
  // Filter and sort models and presets based on search term - memoized to prevent re-renders
  const filteredAndSortedModels = useMemo(() => {
    const itemsToFilter = viewMode === 'presets' ? PRESETS : (viewMode === 'models' ? MODELS : ALL_MODELS_AND_PRESETS);
    return [...itemsToFilter]
      .filter((id) => {
        const modelOrPresetId = id as ModelOrPresetID;
        const item = allModelAndPresetDetails[modelOrPresetId];
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          ('provider' in item ? item.provider.toLowerCase().includes(searchLower) : false) ||
          item.capabilities.some((cap: string) => cap.toLowerCase().includes(searchLower))
        );
      })
      .sort((idA, idB) => {
        const itemA = allModelAndPresetDetails[idA];
        const itemB = allModelAndPresetDetails[idB];
        
        // For presets, sort by category first, then by name
        if (viewMode === 'presets' && 'category' in itemA && 'category' in itemB) {
          if (itemA.category !== itemB.category) {
            return (itemA.category || 'general').localeCompare(itemB.category || 'general');
          }
        }
        
        return itemA.name.localeCompare(itemB.name);
      });
  }, [searchTerm, viewMode]);

  // Reset keyboard focus when search term changes
  useEffect(() => {
    setKeyboardFocusedIndex(-1);
  }, [searchTerm]);

  // Set initial keyboard focus when picker opens
  useEffect(() => {
    if (isOpen && filteredAndSortedModels.length > 0) {
      const selectedIndex = filteredAndSortedModels.findIndex(id => id === selectedModel);
      setKeyboardFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, filteredAndSortedModels, selectedModel]);

  // Get current model details to display
  const keyboardFocusedModel = keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedModels.length 
    ? filteredAndSortedModels[keyboardFocusedIndex] as ModelOrPresetID 
    : null;
  
  // Separate display logic: button always shows selected model, details panel shows hovered/focused model
  const detailsPanelModelId = keyboardFocusedModel || hoveredModel || selectedModel;
  const detailsPanelModelDetails = allModelAndPresetDetails[detailsPanelModelId];
  
  // Main button always shows the selected model (no layout flipping)
  const selectedModelDetails = allModelAndPresetDetails[selectedModel];
  const isModelUnavailable = creditsLoading ? false : (!canAccessPremiumModels() && selectedModelDetails.premium);

  // Handle model change - memoized to prevent re-renders
  const handleModelChange = useCallback((modelId: string) => {
    if ((ALL_MODELS_AND_PRESETS as string[]).includes(modelId)) {
      const typedModelId = modelId as ModelOrPresetID;
      setSelectedModel(typedModelId);
      setIsOpen(false);
      setSearchTerm("");
      setKeyboardFocusedIndex(-1);
      onModelSelected?.();
    }
  }, [setSelectedModel, onModelSelected]);

  // Handle opening the popover - memoized to prevent re-renders
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
      setKeyboardFocusedIndex(-1);
    } else {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Handle search input change - memoized to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Render individual item (model or preset)
  const renderItem = useCallback((id: ModelOrPresetID, index: number, isInCategory: boolean = false) => {
    const item = allModelAndPresetDetails[id];
    const isUnavailable = creditsLoading ? false : (item.premium && !canAccessPremiumModels());
    const isSelected = selectedModel === id;
    const isKeyboardFocused = keyboardFocusedIndex === index;
    
    const itemElement = (
      <div
        key={id}
        className={cn(
          "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150",
          isInCategory && "ml-4", // Indent if in category
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground focus:outline-none",
          isSelected && "!bg-primary/15 !text-foreground font-medium",
          isKeyboardFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/30",
          isUnavailable && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => {
          if (!isUnavailable) {
            handleModelChange(id);
          }
        }}
        onMouseEnter={() => {
          setHoveredModel(id);
          setKeyboardFocusedIndex(-1); // Clear keyboard focus when using mouse
        }}
        onMouseLeave={() => setHoveredModel(null)}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {'provider' in item ? getProviderIcon(item.provider) : getCategoryIcon(('category' in item ? item.category : null) || 'general')}
            <span className="font-medium truncate">{item.name}</span>
            {item.premium && (
              <Sparkles className="h-3 w-3 text-yellow-500 ml-1 flex-shrink-0" />
            )}
            {isSelected && <Check className="h-3 w-3 ml-auto text-primary" />}
          </div>
          <div className="flex flex-wrap gap-1">
            {item.capabilities.slice(0, 2).map((capability) => (
              <span 
                key={capability}
                className={cn(
                  "inline-flex text-[9px] px-1 py-0.5 rounded-full font-medium",
                  getCapabilityColor(capability)
                )}
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      </div>
    );

    if (isUnavailable && !creditsLoading) {
      return (
        <TooltipProvider key={`${id}-tooltip`} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{itemElement}</TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">This is a premium {viewMode === 'presets' ? 'preset' : 'model'}. Credits are required to use it.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return itemElement;
  }, [selectedModel, keyboardFocusedIndex, creditsLoading, canAccessPremiumModels, handleModelChange, viewMode]);

  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding':
        return <Code className="h-3 w-3 text-blue-600" />;
      case 'content':
        return <PenTool className="h-3 w-3 text-green-600" />;
      case 'research':
        return <Search className="h-3 w-3 text-purple-600" />;
      case 'support':
        return <Users className="h-3 w-3 text-orange-600" />;
      case 'creative':
        return <Lightbulb className="h-3 w-3 text-yellow-600" />;
      default:
        return <Bot className="h-3 w-3 text-gray-600" />;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setKeyboardFocusedIndex(prev => {
          const newIndex = prev < filteredAndSortedModels.length - 1 ? prev + 1 : 0;
          // Scroll to keep focused item visible
          setTimeout(() => {
            const focusedElement = modelListRef.current?.children[newIndex] as HTMLElement;
            if (focusedElement) {
              focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setKeyboardFocusedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredAndSortedModels.length - 1;
          // Scroll to keep focused item visible
          setTimeout(() => {
            const focusedElement = modelListRef.current?.children[newIndex] as HTMLElement;
            if (focusedElement) {
              focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 0);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedModels.length) {
          const selectedModelId = filteredAndSortedModels[keyboardFocusedIndex];
          const model = allModelAndPresetDetails[selectedModelId];
          const isUnavailable = creditsLoading ? false : (model.premium && !canAccessPremiumModels());
          if (!isUnavailable) {
            handleModelChange(selectedModelId);
          }
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredAndSortedModels, keyboardFocusedIndex, creditsLoading, canAccessPremiumModels, handleModelChange]);

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className={cn(
                  "max-w-[200px] sm:max-w-fit sm:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full justify-between",
                  "border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20",
                  "transition-all duration-200 ring-offset-background focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
                  "text-foreground hover:text-foreground font-normal",
                  isModelUnavailable && "opacity-50"
                )}
              >
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {getProviderIcon('provider' in selectedModelDetails ? selectedModelDetails.provider : 'OpenRouter')}
                  <span className="text-xs font-medium truncate">{selectedModelDetails.name}</span>
                </div>
                <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {isModelUnavailable ? (
              <p>This model requires premium access. Please check your credits.</p>
            ) : (
              <p>Select an AI model for this conversation. Each model has different capabilities and costs.</p>
            )}
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent 
          className="w-[320px] sm:w-[480px] md:w-[680px] p-0 bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 max-h-[400px] overflow-hidden" 
          align="start"
        >
          {/* Search input and mode toggle */}
          <div className="px-3 pt-3 pb-2 border-b border-border/40 space-y-2">
            {showPresets && (
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-md">
                <Button
                  variant={viewMode === 'models' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('models')}
                  className="flex-1 h-7 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Models
                </Button>
                <Button
                  variant={viewMode === 'presets' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('presets')}
                  className="flex-1 h-7 text-xs"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Presets
                </Button>
              </div>
            )}
            <Input
              ref={searchInputRef}
              type="search"
              placeholder={`Search ${viewMode}... (Use ↑↓ arrow keys to navigate, Enter to select)`}
              aria-label={`Search ${viewMode} by name, ${viewMode === 'models' ? 'provider' : 'category'}, or capability`}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full h-8"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[320px_1fr] items-start max-h-[340px] overflow-hidden">
            {/* Model/Preset selector column */}
            <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1 overflow-y-auto max-h-[340px]">
              <div ref={modelListRef} className="space-y-1 p-1">
                {filteredAndSortedModels.length > 0 ? (
                  viewMode === 'presets' ? (
                    // Group presets by category
                    (() => {
                      const grouped: Record<string, ModelOrPresetID[]> = {};
                      filteredAndSortedModels.forEach((id) => {
                        const preset = allModelAndPresetDetails[id];
                        const category = ('category' in preset ? preset.category : null) || 'general';
                        if (!grouped[category]) {
                          grouped[category] = [];
                        }
                        grouped[category].push(id);
                      });
                      
                      return Object.entries(grouped).map(([category, presets]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-foreground/60 capitalize">
                            {(() => {
                              switch (category) {
                                case 'coding': return <Code className="h-3 w-3" />;
                                case 'content': return <PenTool className="h-3 w-3" />;
                                case 'research': return <Search className="h-3 w-3" />;
                                case 'support': return <Users className="h-3 w-3" />;
                                case 'creative': return <Lightbulb className="h-3 w-3" />;
                                default: return <Bot className="h-3 w-3" />;
                              }
                            })()}
                            {category}
                          </div>
                          {presets.map((id, presetIndex) => {
                            const globalIndex = filteredAndSortedModels.indexOf(id);
                            return renderItem(id, globalIndex, true);
                          })}
                        </div>
                      ));
                    })()
                  ) : (
                    // Render models normally
                    filteredAndSortedModels.map((id, index) => renderItem(id, index, false))
                  )
                ) : (
                  <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground">
                    No {viewMode} found.
                  </div>
                )}
              </div>
            </div>
            
            {/* Model details column - hidden on smallest screens, visible on sm+ */}
            <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col overflow-y-auto max-h-[340px] min-h-[340px]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getProviderIcon('provider' in detailsPanelModelDetails ? detailsPanelModelDetails.provider : 'OpenRouter')}
                  <h3 className="text-sm font-semibold">{detailsPanelModelDetails.name}</h3>
                  {detailsPanelModelDetails.premium && (
                    <Sparkles className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Provider: <span className="font-medium">{'provider' in detailsPanelModelDetails ? detailsPanelModelDetails.provider : 'OpenRouter'}</span>
                </div>
                
                {/* Capability badges */}
                <div className="flex flex-wrap gap-1 mt-2 mb-3">
                  {detailsPanelModelDetails.capabilities.map((capability) => (
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
                  {detailsPanelModelDetails.description}
                </div>
              </div>
              
                              <div className="bg-muted/40 rounded-md p-2 hidden md:block">
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                    <span>{'apiVersion' in detailsPanelModelDetails ? 'API Version:' : 'Base Model:'}</span>
                    <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                      {'apiVersion' in detailsPanelModelDetails ? detailsPanelModelDetails.apiVersion : detailsPanelModelDetails.baseModel || 'Preset'}
                    </code>
                  </div>
                </div>
            </div>
            
            {/* Condensed model details for mobile only */}
            <div className="p-3 sm:hidden border-t border-border/30">
              <div className="flex flex-wrap gap-1 mb-2">
                {detailsPanelModelDetails.capabilities.slice(0, 4).map((capability) => (
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
                {detailsPanelModelDetails.capabilities.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{detailsPanelModelDetails.capabilities.length - 4} more</span>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
