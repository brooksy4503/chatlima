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
            <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs border-border">
              <div className="flex items-center gap-2">
                {loading ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Settings className="w-3 h-3 shrink-0" />
                )}
                <SelectValue>
                  {activePreset ? (
                    <span className="flex items-center gap-1 truncate">
                      {activePreset.name}
                      {activePreset.isDefault && (
                        <Star className="w-3 h-3 text-yellow-500 shrink-0" />
                      )}
                    </span>
                  ) : 'Manual Mode'}
                </SelectValue>
              </div>
            </SelectTrigger>
          </TooltipTrigger>
          
          <TooltipContent side="top" className="max-w-[240px] text-xs p-2">
            {activePreset ? (
              <div className="space-y-1">
                <div className="font-medium truncate">{activePreset.name}</div>
                <div className="text-muted-foreground">
                  {activePreset.modelId} • T: {activePreset.temperature.toFixed(1)}
                </div>
                <div className="text-muted-foreground">
                  Max tokens: {activePreset.maxTokens}
                </div>
                {activePreset.webSearchEnabled && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Web Search: {activePreset.webSearchContextSize} results
                  </Badge>
                )}
              </div>
            ) : (
              'Configure settings manually without a preset'
            )}
          </TooltipContent>
        </Tooltip>

        <SelectContent className="min-w-[200px]">
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

      {/* Active preset indicator */}
      {activePreset && !loading && (
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      )}

      <PresetManager 
        open={showManager}
        onOpenChange={setShowManager}
      />
    </div>
  );
}