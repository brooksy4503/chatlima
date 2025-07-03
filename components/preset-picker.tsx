"use client";
import { PRESETS, defaultPresets, type PresetID, type ModelOrPresetID } from "@/ai/providers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, ChevronDown, Check, Code, Users, Search, Lightbulb, PenTool, Bot } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useCredits } from "@/hooks/useCredits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface PresetPickerProps {
  selectedModel: ModelOrPresetID;
  setSelectedModel: (model: ModelOrPresetID) => void;
  onModelSelected?: () => void;
}

export const PresetPicker = ({ selectedModel, setSelectedModel, onModelSelected }: PresetPickerProps) => {
  const [hoveredPreset, setHoveredPreset] = useState<PresetID | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const presetListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { canAccessPremiumModels, loading: creditsLoading } = useCredits(undefined, user?.id);
  
  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding':
        return <Code className="h-4 w-4 text-blue-600" />;
      case 'content':
        return <PenTool className="h-4 w-4 text-green-600" />;
      case 'research':
        return <Search className="h-4 w-4 text-purple-600" />;
      case 'support':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'creative':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bot className="h-4 w-4 text-gray-600" />;
    }
  };

  // Function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'coding':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'content':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'research':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'support':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case 'creative':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  // Filter and sort presets based on search term - memoized to prevent re-renders
  const filteredAndSortedPresets = useMemo(() => {
    return [...PRESETS]
      .filter((id) => {
        const presetId = id as PresetID;
        const preset = defaultPresets[presetId];
        const searchLower = searchTerm.toLowerCase();
        return (
          preset.name.toLowerCase().includes(searchLower) ||
          preset.category?.toLowerCase().includes(searchLower) ||
          preset.capabilities.some((cap: string) => cap.toLowerCase().includes(searchLower))
        );
      })
      .sort((idA, idB) => {
        const presetA = defaultPresets[idA];
        const presetB = defaultPresets[idB];
        // Sort by category first, then by name
        if (presetA.category !== presetB.category) {
          return (presetA.category || 'general').localeCompare(presetB.category || 'general');
        }
        return presetA.name.localeCompare(presetB.name);
      });
  }, [searchTerm]);

  // Group presets by category
  const presetsByCategory = useMemo(() => {
    const grouped: Record<string, PresetID[]> = {};
    filteredAndSortedPresets.forEach((presetId) => {
      const preset = defaultPresets[presetId];
      const category = preset.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(presetId);
    });
    return grouped;
  }, [filteredAndSortedPresets]);

  // Reset keyboard focus when search term changes
  useEffect(() => {
    setKeyboardFocusedIndex(-1);
  }, [searchTerm]);

  // Set initial keyboard focus when picker opens
  useEffect(() => {
    if (isOpen && filteredAndSortedPresets.length > 0) {
      const selectedIndex = filteredAndSortedPresets.findIndex(id => id === selectedModel);
      setKeyboardFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, filteredAndSortedPresets, selectedModel]);

  // Get current preset details to display
  const keyboardFocusedPreset = keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedPresets.length 
    ? filteredAndSortedPresets[keyboardFocusedIndex] as PresetID 
    : null;
  
  // Separate display logic: button always shows selected preset, details panel shows hovered/focused preset
  const detailsPanelPresetId = keyboardFocusedPreset || hoveredPreset || (selectedModel.startsWith('@preset/') ? selectedModel as PresetID : PRESETS[0]);
  const detailsPanelPresetDetails = defaultPresets[detailsPanelPresetId];
  
  // Main button shows either selected preset or fallback
  const selectedIsPreset = selectedModel.startsWith('@preset/');
  const selectedPresetDetails = selectedIsPreset ? defaultPresets[selectedModel as PresetID] : null;

  // Handle preset change - memoized to prevent re-renders
  const handlePresetChange = useCallback((presetId: string) => {
    if ((PRESETS as string[]).includes(presetId)) {
      const typedPresetId = presetId as PresetID;
      setSelectedModel(typedPresetId);
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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setKeyboardFocusedIndex(prev => {
          const newIndex = prev < filteredAndSortedPresets.length - 1 ? prev + 1 : 0;
          // Scroll to keep focused item visible
          setTimeout(() => {
            const focusedElement = presetListRef.current?.children[newIndex] as HTMLElement;
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
          const newIndex = prev > 0 ? prev - 1 : filteredAndSortedPresets.length - 1;
          // Scroll to keep focused item visible
          setTimeout(() => {
            const focusedElement = presetListRef.current?.children[newIndex] as HTMLElement;
            if (focusedElement) {
              focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 0);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filteredAndSortedPresets.length) {
          const selectedPresetId = filteredAndSortedPresets[keyboardFocusedIndex];
          const preset = defaultPresets[selectedPresetId];
          const isUnavailable = creditsLoading ? false : (preset.premium && !canAccessPremiumModels());
          if (!isUnavailable) {
            handlePresetChange(selectedPresetId);
          }
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredAndSortedPresets, keyboardFocusedIndex, creditsLoading, canAccessPremiumModels, handlePresetChange]);

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
                  "text-foreground hover:text-foreground font-normal"
                )}
              >
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {selectedIsPreset && selectedPresetDetails ? (
                    <>
                      {getCategoryIcon(selectedPresetDetails.category || 'general')}
                      <span className="text-xs font-medium truncate">{selectedPresetDetails.name}</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 text-gray-600" />
                      <span className="text-xs font-medium truncate">Select Preset</span>
                    </>
                  )}
                </div>
                <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>Select a specialized AI preset for your task. Presets come with optimized settings and prompts.</p>
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent 
          className="w-[320px] sm:w-[480px] md:w-[680px] p-0 bg-background/95 dark:bg-muted/95 backdrop-blur-sm border-border/80 max-h-[400px] overflow-hidden" 
          align="start"
        >
          {/* Search input */}
          <div className="px-3 pt-3 pb-2 border-b border-border/40">
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search presets... (Use ↑↓ arrow keys to navigate, Enter to select)"
              aria-label="Search presets by name, category, or capability"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full h-8"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[320px_1fr] items-start max-h-[340px] overflow-hidden">
            {/* Preset selector column */}
            <div className="sm:border-r border-border/40 bg-muted/20 p-0 pr-1 overflow-y-auto max-h-[340px]">
              <div ref={presetListRef} className="space-y-2 p-2">
                {Object.keys(presetsByCategory).length > 0 ? (
                  Object.entries(presetsByCategory).map(([category, presets]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1">
                        {getCategoryIcon(category)}
                        <span className="text-xs font-semibold text-foreground/80 capitalize">
                          {category}
                        </span>
                      </div>
                      {presets.map((presetId, index) => {
                        const preset = defaultPresets[presetId];
                        const isUnavailable = creditsLoading ? false : (preset.premium && !canAccessPremiumModels());
                        const isSelected = selectedModel === presetId;
                        const globalIndex = filteredAndSortedPresets.indexOf(presetId);
                        const isKeyboardFocused = keyboardFocusedIndex === globalIndex;
                        
                        const presetItem = (
                          <div
                            key={presetId}
                            className={cn(
                              "!px-2 sm:!px-3 py-1.5 sm:py-2 cursor-pointer rounded-md text-xs transition-colors duration-150 ml-6",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                              isSelected && "!bg-primary/15 !text-foreground font-medium",
                              isKeyboardFocused && "!bg-accent !text-accent-foreground ring-2 ring-primary/30",
                              isUnavailable && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => {
                              if (!isUnavailable) {
                                handlePresetChange(presetId);
                              }
                            }}
                            onMouseEnter={() => {
                              setHoveredPreset(presetId);
                              setKeyboardFocusedIndex(-1); // Clear keyboard focus when using mouse
                            }}
                            onMouseLeave={() => setHoveredPreset(null)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate">{preset.name}</span>
                                {preset.premium && (
                                  <Sparkles className="h-3 w-3 text-yellow-500 ml-1 flex-shrink-0" />
                                )}
                                {isSelected && <Check className="h-3 w-3 ml-auto text-primary" />}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {preset.capabilities.slice(0, 2).map((capability) => (
                                  <span 
                                    key={capability}
                                    className={cn(
                                      "inline-flex text-[9px] px-1 py-0.5 rounded-full font-medium",
                                      getCategoryColor(preset.category || 'general')
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
                            <TooltipProvider key={`${presetId}-tooltip`} delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>{presetItem}</TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">This is a premium preset. Credits are required to use it.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                        return presetItem;
                      })}
                    </div>
                  ))
                ) : (
                  <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground">
                    No presets found.
                  </div>
                )}
              </div>
            </div>
            
            {/* Preset details column - hidden on smallest screens, visible on sm+ */}
            <div className="sm:block hidden p-2 sm:p-3 md:p-4 flex-col overflow-y-auto max-h-[340px] min-h-[340px]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryIcon(detailsPanelPresetDetails.category || 'general')}
                  <h3 className="text-sm font-semibold">{detailsPanelPresetDetails.name}</h3>
                  {detailsPanelPresetDetails.premium && (
                    <Sparkles className="h-4 w-4 text-yellow-500 ml-1 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Category: <span className="font-medium capitalize">{detailsPanelPresetDetails.category || 'general'}</span>
                </div>
                
                {/* Capability badges */}
                <div className="flex flex-wrap gap-1 mt-2 mb-3">
                  {detailsPanelPresetDetails.capabilities.map((capability) => (
                    <span 
                      key={capability}
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                        getCategoryColor(detailsPanelPresetDetails.category || 'general')
                      )}
                    >
                      <span>{capability}</span>
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-foreground/90 leading-relaxed mb-3 hidden md:block">
                  {detailsPanelPresetDetails.description}
                </div>
              </div>
              
              <div className="bg-muted/40 rounded-md p-2 hidden md:block">
                <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                  <span>Base Model:</span>
                  <code className="bg-background/80 px-2 py-0.5 rounded text-[10px] font-mono">
                    {detailsPanelPresetDetails.baseModel || 'OpenRouter Preset'}
                  </code>
                </div>
              </div>
            </div>
            
            {/* Condensed preset details for mobile only */}
            <div className="p-3 sm:hidden border-t border-border/30">
              <div className="flex flex-wrap gap-1 mb-2">
                {detailsPanelPresetDetails.capabilities.slice(0, 4).map((capability) => (
                  <span 
                    key={capability}
                    className={cn(
                      "inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                      getCategoryColor(detailsPanelPresetDetails.category || 'general')
                    )}
                  >
                    <span>{capability}</span>
                  </span>
                ))}
                {detailsPanelPresetDetails.capabilities.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{detailsPanelPresetDetails.capabilities.length - 4} more</span>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};