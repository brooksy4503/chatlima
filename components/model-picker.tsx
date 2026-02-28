"use client";
import { useModel } from "@/lib/context/model-context";
import { ModelInfo } from "@/lib/types/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Info, Bolt, Code, Brain, Lightbulb, Image, Gauge, Rocket, Bot, ChevronDown, Check, RefreshCw, AlertCircle, Star } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FavoriteToggle } from "./favorite-toggle";

// Helper functions for pricing display
function formatPricingDisplay(pricePerToken: number): string {
  const pricePerMillion = pricePerToken * 1000000;
  if (pricePerMillion >= 1) {
    return `$${pricePerMillion.toFixed(2)}/M`;
  } else if (pricePerMillion >= 0.01) {
    return `$${pricePerMillion.toFixed(3)}/M`;
  } else {
    return `$${pricePerMillion.toFixed(4)}/M`;
  }
}

function formatContextDisplay(contextMax: number): string {
  return `${contextMax.toLocaleString()} context`;
}

interface ModelPickerProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onModelSelected?: () => void;
  disabled?: boolean; // New prop to disable the picker when preset is active
  activePresetName?: string; // Optional preset name for better messaging
}

export const ModelPicker = ({ selectedModel, setSelectedModel, onModelSelected, disabled = false, activePresetName }: ModelPickerProps) => {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [focusedModel, setFocusedModel] = useState<string | null>(null); // For touch/tap focus
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modelListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { canAccessPremiumModels, loading: creditsLoading } = useCredits(undefined, user?.id);
  const [creditCosts, setCreditCosts] = useState<Record<string, number>>({});
  
  // Get dynamic models and state from enhanced context
  const { 
    availableModels = [], 
    isLoading: modelsLoading, 
    isRefreshing: modelsRefreshing,
    error: modelsError,
    refresh: refreshModels,
    favorites = [],
    favoriteCount = 0,
    userApiKeys = {}
  } = useModel();
  
  // Helper function to check if user has API key for a model's provider
  const hasApiKeyForProvider = useCallback((modelId: string) => {
    // Extract provider from model ID (e.g., "requesty/..." -> REQUESTY_API_KEY)
    const provider = modelId.split('/')[0];
    const keyMap: Record<string, string> = {
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'groq': 'GROQ_API_KEY',
      'xai': 'XAI_API_KEY',
      'openrouter': 'OPENROUTER_API_KEY',
      'requesty': 'REQUESTY_API_KEY',
    };
    const requiredKey = keyMap[provider?.toLowerCase()];
    return requiredKey && userApiKeys[requiredKey]?.trim().length > 0;
  }, [userApiKeys]);
  
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
      case 'requesty':
        return <Zap className="h-3 w-3 text-cyan-500" />;
      default:
        return <Zap className="h-3 w-3 text-blue-500" />;
    }
  };
  
  // Function to get capability icon
  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'code':
      case 'coding':
        return <Code className="h-2.5 w-2.5" />;
      case 'reasoning':
        return <Brain className="h-2.5 w-2.5" />;
      case 'research':
        return <Lightbulb className="h-2.5 w-2.5" />;
      case 'vision':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-2.5 w-2.5" aria-hidden="true" />;
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
      case 'coding':
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
  
  // Filter and sort models based on search term and active tab - memoized to prevent re-renders
  const filteredAndSortedModels = useMemo(() => {
    let modelsToFilter = [...availableModels];

    // Filter by active tab
    if (activeTab === 'favorites') {
      modelsToFilter = modelsToFilter.filter((model) => favorites.includes(model.id));
    }

    // Filter by search term
    modelsToFilter = modelsToFilter.filter((model) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        model.name.toLowerCase().includes(searchLower) ||
        model.provider.toLowerCase().includes(searchLower) ||
        model.capabilities.some(cap => cap.toLowerCase().includes(searchLower))
      );
    });

    // Sort models
    return modelsToFilter.sort((modelA, modelB) => {
      return modelA.name.localeCompare(modelB.name);
    });
  }, [availableModels, searchTerm, activeTab, favorites]);

  // Reset keyboard focus when search term or tab changes
  useEffect(() => {
    setKeyboardFocusedIndex(-1);
  }, [searchTerm, activeTab]);

  // Set initial keyboard focus when picker opens
  useEffect(() => {
    if (isOpen && filteredAndSortedModels.length > 0) {
      const selectedIndex = filteredAndSortedModels.findIndex(model => model.id === selectedModel);
      setKeyboardFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      
      // Scroll to the selected model when picker opens
      if (selectedIndex >= 0) {
        setTimeout(() => {
          const innerContainer = modelListRef.current;
          const scrollableContainer = innerContainer?.parentElement; // The actual scrollable div
          const selectedElement = innerContainer?.children[selectedIndex] as HTMLElement;
          
          if (selectedElement && scrollableContainer && innerContainer) {
            // Get the element's position relative to the scrollable container
            const elementTop = selectedElement.offsetTop;
            const containerHeight = scrollableContainer.clientHeight;
            
            // Position element about 1/3 from top to avoid cutting off
            const desiredScrollTop = elementTop - (containerHeight / 3);
            
            // Ensure we don't scroll negative or beyond content
            const maxScroll = scrollableContainer.scrollHeight - containerHeight;
            const scrollPosition = Math.max(0, Math.min(desiredScrollTop, maxScroll));
            
            scrollableContainer.scrollTop = scrollPosition;
          }
        }, 300); // Even longer delay to ensure rendering is complete
      }
    }
  }, [isOpen, filteredAndSortedModels, selectedModel]);

  // Get current model details to display
  const keyboardFocusedModel = keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedModels.length 
    ? filteredAndSortedModels[keyboardFocusedIndex] 
    : null;
  
  // Separate display logic: button always shows selected model, details panel shows hovered/focused model
  const hoveredModelData = hoveredModel ? availableModels.find(m => m.id === hoveredModel) : null;
  const touchFocusedModelData = focusedModel ? availableModels.find(m => m.id === focusedModel) : null;
  const detailsPanelModel = keyboardFocusedModel || hoveredModelData || touchFocusedModelData || availableModels.find(m => m.id === selectedModel);
  
  // Main button always shows the selected model (no layout flipping)
  const selectedModelData = availableModels.find(m => m.id === selectedModel);
  const isModelUnavailable = creditsLoading ? false : (!canAccessPremiumModels() && selectedModelData?.premium);

  // Fetch credit cost for the details panel model
  useEffect(() => {
    if (!detailsPanelModel?.id) return;
    
    // Skip if already fetched
    if (creditCosts[detailsPanelModel.id] !== undefined) return;
    
    // Fetch credit cost from API
    const fetchCreditCost = async () => {
      try {
        const response = await fetch(`/api/models/${encodeURIComponent(detailsPanelModel.id)}/credit-cost`);
        if (response.ok) {
          const data = await response.json();
          setCreditCosts(prev => ({
            ...prev,
            [detailsPanelModel.id]: data.creditCost
          }));
        }
      } catch (error) {
        console.warn(`Failed to fetch credit cost for ${detailsPanelModel.id}:`, error);
        // Fallback to default based on premium status
        setCreditCosts(prev => ({
          ...prev,
          [detailsPanelModel.id]: detailsPanelModel.premium ? 2 : 1
        }));
      }
    };
    
    fetchCreditCost();
  }, [detailsPanelModel?.id, creditCosts]);

  // Handle model change - memoized to prevent re-renders
  const handleModelChange = useCallback((modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(modelId);
      setIsOpen(false);
      setSearchTerm("");
      setKeyboardFocusedIndex(-1);
      setFocusedModel(null);
      onModelSelected?.();
    }
  }, [availableModels, setSelectedModel, onModelSelected]);

  // Handle model tap for mobile - tap to focus, tap again to select
  const handleModelTap = useCallback((modelId: string, isUnavailable: boolean) => {
    if (isUnavailable) return;
    
    // If this model is already focused, select it
    if (focusedModel === modelId) {
      handleModelChange(modelId);
    } else {
      // Otherwise, just focus it to show details
      setFocusedModel(modelId);
      setKeyboardFocusedIndex(-1); // Clear keyboard focus when using touch
    }
  }, [focusedModel, handleModelChange]);

  // Handle opening the popover - memoized to prevent re-renders
  const handleOpenChange = useCallback((open: boolean) => {
    if (disabled) return; // Prevent opening when disabled
    
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
      setKeyboardFocusedIndex(-1);
      setFocusedModel(null);
      // Keep activeTab as-is to remember user's last selection
    } else {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  // Handle search input change - memoized to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedModel(null); // Clear touch focus when searching
  }, []);

  // Handle refresh models
  const handleRefreshModels = useCallback(async () => {
    if (refreshModels) {
      try {
        await refreshModels();
      } catch (error) {
        console.error('Error during refresh:', error);
      }
    }
  }, [refreshModels]);

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
          const selectedModelData = filteredAndSortedModels[keyboardFocusedIndex];
          const isUnavailable = creditsLoading ? false : (selectedModelData.premium && !canAccessPremiumModels());
          if (!isUnavailable) {
            handleModelChange(selectedModelData.id);
          }
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredAndSortedModels, keyboardFocusedIndex, creditsLoading, canAccessPremiumModels, handleModelChange]);

  // Loading state
  if (modelsLoading) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
                          <Button
                variant="outline"
                disabled
                className={cn(
                  "w-full sm:w-full md:max-w-fit md:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full justify-between",
                  "border-primary/20 bg-primary/5 opacity-60"
                )}
              >
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="text-xs font-medium">Loading models...</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Loading available models from providers...</p>
          </TooltipContent>
        </Tooltip>
    );
  }

  // Error state
  if (modelsError || !selectedModelData) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleRefreshModels}
              disabled={modelsRefreshing}
              className={cn(
                "w-full sm:w-full md:max-w-fit md:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full justify-between",
                "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                modelsRefreshing && "opacity-60"
              )}
            >
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {modelsRefreshing ? "Refreshing..." : "Error loading models"}
                </span>
              </div>
              <RefreshCw className={cn("ml-2 h-3 w-3 shrink-0", modelsRefreshing && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{modelsRefreshing ? "Refreshing models..." : "Failed to load models. Click to retry."}</p>
          </TooltipContent>
        </Tooltip>
    );
  }

  return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                disabled={disabled}
                className={cn(
                  "w-full sm:w-full md:max-w-fit md:w-56 px-2 sm:px-3 h-8 sm:h-9 rounded-full justify-between",
                  "border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20",
                  "transition-all duration-200 ring-offset-background focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
                  "text-foreground hover:text-foreground font-normal",
                  isModelUnavailable && "opacity-50",
                  disabled && "opacity-60 cursor-not-allowed hover:bg-primary/5 dark:hover:bg-primary/10"
                )}
              >
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {getProviderIcon(selectedModelData.provider)}
                  <span className="text-xs font-medium truncate">{selectedModelData.name}</span>
                </div>
                <ChevronDown className={cn("ml-2 h-3 w-3 shrink-0 opacity-50", disabled && "opacity-30")} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {disabled ? (
              <p>
                Model is controlled by {activePresetName ? `"${activePresetName}" preset` : 'active preset'}. 
                Switch to &quot;Manual Mode&quot; to change models.
              </p>
            ) : isModelUnavailable ? (
              <p>This model requires premium access. Please check your credits.</p>
            ) : (
              <div className="space-y-1.5">
                <p className="font-medium">{selectedModelData.name}</p>
                <p className="text-muted-foreground text-xs">
                  Model – Select an AI model for this conversation. Each model has different capabilities and costs.
                </p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent 
          className="w-[320px] sm:w-[480px] md:w-[680px] p-0 bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 max-h-[min(600px,85vh)] overflow-hidden" 
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions={true}
          onMouseLeave={() => {
            setHoveredModel(null);
            // Don't clear focusedModel on mouse leave - keep it for touch devices
          }}
        >
          {/* Tabs and search input with refresh button */}
          <div className="px-3 pt-3 pb-2 border-b border-border/40 space-y-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex-1 text-xs font-medium px-2 py-1 rounded-sm transition-all duration-200",
                  activeTab === 'all'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={cn(
                  "flex-1 text-xs font-medium px-2 py-1 rounded-sm transition-all duration-200 flex items-center justify-center gap-1",
                  activeTab === 'favorites'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Star className="h-3 w-3" />
                Favorites
                {favoriteCount > 0 && (
                  <span className="bg-primary/20 text-primary text-[9px] px-1 rounded-full min-w-[14px] h-3.5 flex items-center justify-center">
                    {favoriteCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <Input
                ref={searchInputRef}
                type="search"
                placeholder={`Search ${activeTab === 'favorites' ? 'favorite ' : ''}models... (↑↓ keys or tap to preview, Enter/tap again to select)`}
                aria-label="Search models by name, provider, or capability"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="flex-1 h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshModels}
                disabled={modelsRefreshing}
                className="h-8 px-2"
                title={modelsRefreshing ? "Refreshing models..." : "Refresh models"}
              >
                <RefreshCw className={cn("h-3 w-3", modelsRefreshing && "animate-spin")} />
              </Button>
            </div>
            {availableModels.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {activeTab === 'favorites' ? (
                  favoriteCount === 0 ? (
                    "No favorite models yet. Star models to add them here!"
                  ) : (
                    `${filteredAndSortedModels.length} of ${favoriteCount} favorite models`
                  )
                ) : (
                  `${filteredAndSortedModels.length} of ${availableModels.length} models`
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[320px_1fr] items-start max-h-[min(440px,65vh)] overflow-hidden">
            {/* Model selector column */}
            <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1 overflow-y-auto max-h-[min(440px,65vh)]">
              <div ref={modelListRef} className="space-y-1 p-1">
                {filteredAndSortedModels.length > 0 ? (
                  filteredAndSortedModels.map((model, index) => {
                    // Users with BYOK (Bring Your Own Key) can use premium models from that provider
                    const userHasApiKey = hasApiKeyForProvider(model.id);
                    const isUnavailable = creditsLoading ? false : (model.premium && !canAccessPremiumModels() && !userHasApiKey);
                    const isSelected = selectedModel === model.id;
                    const isKeyboardFocused = keyboardFocusedIndex === index;
                    const isTouchFocused = focusedModel === model.id;
                    
                    const modelItem = (
                      <div
                        key={model.id}
                        className={cn(
                          "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                          isSelected && "!bg-primary/15 !text-foreground font-medium",
                          isKeyboardFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/30",
                          isTouchFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/20",
                          isUnavailable && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => {
                          handleModelTap(model.id, isUnavailable);
                        }}
                        onMouseEnter={() => {
                          setHoveredModel(model.id);
                          setKeyboardFocusedIndex(-1); // Clear keyboard focus when using mouse
                          setFocusedModel(null); // Clear touch focus when using mouse
                        }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {getProviderIcon(model.provider)}
                            <span className="font-medium truncate flex-1">{model.name}</span>
                            {model.premium && (
                              <Sparkles className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            )}
                            {model.vision && (
                              // eslint-disable-next-line jsx-a11y/alt-text
                              <Image className="h-3 w-3 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                            )}
                            <FavoriteToggle
                              modelId={model.id}
                              isFavorite={model.isFavorite || false}
                              size="sm"
                              disabled={isUnavailable}
                              className="flex-shrink-0"
                            />
                            {isSelected && <Check className="h-3 w-3 text-primary flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {model.provider}
                          </span>
                        </div>
                      </div>
                    );

                    if (isUnavailable && !creditsLoading) {
                      return (
                        <Tooltip key={`${model.id}-tooltip`}>
                          <TooltipTrigger asChild>{modelItem}</TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">This is a premium model. Credits are required to use it.</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    return modelItem;
                  })
                ) : activeTab === 'favorites' && favoriteCount === 0 ? (
                  <div className="px-2 sm:px-3 py-4 text-center">
                    <Star className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">No favorite models yet</div>
                      <div>Switch to &quot;All&quot; tab and star models you use frequently!</div>
                    </div>
                  </div>
                ) : (
                  <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground">
                    {searchTerm ? `No models found matching "${searchTerm}".` : 'No models found.'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Model details column - hidden on smallest screens, visible on sm+ */}
            {detailsPanelModel && (
              <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col overflow-y-auto max-h-[min(440px,65vh)] min-h-[min(440px,65vh)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getProviderIcon(detailsPanelModel.provider)}
                    <h3 className="text-sm font-semibold">{detailsPanelModel.name}</h3>
                    {detailsPanelModel.premium && (
                      <Sparkles className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
                    )}
                    {detailsPanelModel.vision && (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <Image className="h-4 w-4 text-indigo-500 ml-0.5 flex-shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Provider: <span className="font-medium">{detailsPanelModel.provider}</span>
                  </div>
                  
                  {/* Capability badges */}
                  <div className="flex flex-wrap gap-1 mt-2 mb-3">
                    {detailsPanelModel.capabilities.map((capability) => (
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
                    {detailsPanelModel.description}
                  </div>
                </div>
                
                {/* Model specifications */}
                <div className="bg-muted/40 rounded-md p-2 hidden md:block space-y-2">
                  {/* Token Context */}
                  {detailsPanelModel.contextMax && (
                    <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                      <span>Token Context:</span>
                      <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                        {formatContextDisplay(detailsPanelModel.contextMax)}
                      </code>
                    </div>
                  )}
                  
                  {/* Pricing Information */}
                  {detailsPanelModel.pricing && (detailsPanelModel.pricing.input !== undefined || detailsPanelModel.pricing.output !== undefined) && (
                    <>
                      {detailsPanelModel.pricing.input !== undefined && (
                        <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                          <span>Input Price:</span>
                          <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                            {formatPricingDisplay(detailsPanelModel.pricing.input)} input tokens
                          </code>
                        </div>
                      )}
                      {detailsPanelModel.pricing.output !== undefined && (
                        <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                          <span>Output Price:</span>
                          <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                            {formatPricingDisplay(detailsPanelModel.pricing.output)} output tokens
                          </code>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* API Version */}
                  {detailsPanelModel.apiVersion && (
                    <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                      <span>API Version:</span>
                      <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                        {detailsPanelModel.apiVersion}
                      </code>
                    </div>
                  )}
                  
                  {/* Credit Cost */}
                  {(() => {
                    const creditCost = creditCosts[detailsPanelModel.id] ?? (detailsPanelModel.premium ? 2 : 1);
                    return (
                      <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                        <span>Credit Cost:</span>
                        <code className={cn(
                          "bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono",
                          creditCost > 1 && "text-yellow-600 dark:text-yellow-500 font-semibold"
                        )}>
                          {creditCost} {creditCost === 1 ? 'credit' : 'credits'} per message
                        </code>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {/* Condensed model details for mobile only */}
            {detailsPanelModel && (
              <div className="p-3 sm:hidden border-t border-border/30">
                {/* Hint for touch interaction */}
                {focusedModel && focusedModel !== selectedModel && (
                  <div className="text-[10px] text-primary/80 mb-2 font-medium">
                    Tap again to select &quot;{detailsPanelModel.name}&quot;
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  {detailsPanelModel.capabilities.slice(0, 4).map((capability) => (
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
                  {detailsPanelModel.capabilities.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{detailsPanelModel.capabilities.length - 4} more</span>
                  )}
                </div>
                
                {/* Key specs for mobile */}
                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  {detailsPanelModel.contextMax && (
                    <span className="bg-muted/60 px-2 py-1 rounded">
                      {formatContextDisplay(detailsPanelModel.contextMax)}
                    </span>
                  )}
                  {detailsPanelModel.pricing?.input !== undefined && (
                    <span className="bg-muted/60 px-2 py-1 rounded">
                      In: {formatPricingDisplay(detailsPanelModel.pricing.input)}
                    </span>
                  )}
                  {detailsPanelModel.pricing?.output !== undefined && (
                    <span className="bg-muted/60 px-2 py-1 rounded">
                      Out: {formatPricingDisplay(detailsPanelModel.pricing.output)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
  );
};
