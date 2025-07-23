'use client';

import React, { useState } from 'react';
import { usePresets } from '@/lib/context/preset-context';
import { PresetManager } from './preset-manager';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Settings, Star, Plus, Loader } from 'lucide-react';

interface PresetSelectorProps {
  className?: string;
}

export function PresetSelector({ className }: PresetSelectorProps) {
  const { presets, activePreset, setActivePreset, loading } = usePresets();
  const [showManager, setShowManager] = useState(false);

  const handlePresetChange = (value: string) => {
    if (value === 'manage') {
      setShowManager(true);
    } else {
      const preset = value === 'none' ? null : presets.find(p => p.id === value) || null;
      setActivePreset(preset);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={activePreset?.id || 'none'}
        onValueChange={handlePresetChange}
        disabled={loading}
      >
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <SelectTrigger className="h-8 w-auto min-w-[80px] text-xs border-border md:min-w-[100px] max-w-full w-full sm:w-auto">
              <div className="flex items-center gap-2">
                {loading ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Settings className="w-3 h-3 shrink-0" />
                )}
                <SelectValue>
                  {activePreset ? (
                    <span className="flex items-center gap-1 truncate">
                      {activePreset.isDefault && (
                        <Star className="w-3 h-3 text-yellow-500 shrink-0" />
                      )}
                      <span className="truncate">{activePreset.name}</span>
                    </span>
                  ) : 'Manual Mode'}
                </SelectValue>
              </div>
            </SelectTrigger>
          </TooltipTrigger>
          
          <TooltipContent side="top" className="max-w-[280px] text-xs p-3">
            {activePreset ? (
              <div className="space-y-2">
                <div className="font-semibold text-foreground truncate text-sm">
                  {activePreset.name}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                      Model
                    </span>
                    <span className="font-mono text-xs truncate">{activePreset.modelId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Temp
                      </span>
                      <span className="font-medium">{activePreset.temperature.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                        Tokens
                      </span>
                      <span className="font-medium">{activePreset.maxTokens}</span>
                    </div>
                  </div>
                </div>
                {activePreset.webSearchEnabled && (
                  <Badge variant="secondary" className="mt-1 text-xs py-0.5">
                    <span className="font-medium">Web Search:</span> {activePreset.webSearchContextSize} results
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium text-foreground">Manual Mode</div>
                <div className="text-muted-foreground text-xs">
                  Configure settings manually without a preset
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>

        <SelectContent className="min-w-[200px] md:min-w-[220px]">
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3" />
              <span>Manual Mode</span>
            </div>
          </SelectItem>

          {presets.length > 0 && (
            <SelectGroup>
              <SelectLabel className="px-2 py-1 text-xs text-muted-foreground">
                Your Presets
              </SelectLabel>
              {presets.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{preset.name}</span>
                    {preset.isDefault && (
                      <Star className="w-3 h-3 text-yellow-500 shrink-0" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          <SelectGroup>
            <SelectLabel className="px-2 py-1 text-xs text-muted-foreground">
              Preset Management
            </SelectLabel>
            <SelectItem value="manage">
              <div className="flex items-center gap-2">
                <Plus className="w-3 h-3" />
                <span>Manage Presets</span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Active preset indicator - Use md:block to match useIsMobile breakpoint (768px) */}
      {activePreset && !loading && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="h-5 px-2 py-0.5 text-[10px] font-medium cursor-help bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/20 md:h-6 md:px-2.5 md:py-1 md:text-xs max-w-full hidden md:block"
            >
              <span className="truncate max-w-[80px] md:max-w-[100px]">{activePreset.name}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs p-2">
            <div className="space-y-1">
              <div className="font-medium">Active Preset</div>
              <div className="text-muted-foreground text-xs">{activePreset.name}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      <PresetManager
        open={showManager}
        onOpenChange={setShowManager}
      />
    </div>
  );
}