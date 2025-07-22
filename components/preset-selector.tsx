'use client';

import React, { useState } from 'react';
import { usePresets } from '@/lib/context/preset-context';
import { PresetManager } from './preset-manager';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Settings, Star, Plus } from 'lucide-react';

interface PresetSelectorProps {
  className?: string;
}

export function PresetSelector({ className }: PresetSelectorProps) {
  const { 
    presets, 
    activePreset, 
    defaultPreset, 
    setActivePreset, 
    loading 
  } = usePresets();
  
  const [showManager, setShowManager] = useState(false);

  const handlePresetChange = (value: string) => {
    if (value === 'none') {
      setActivePreset(null);
    } else if (value === 'manage') {
      setShowManager(true);
    } else {
      const preset = presets.find(p => p.id === value);
      if (preset) {
        setActivePreset(preset);
      }
    }
  };

  const currentValue = activePreset?.id || 'none';

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Select 
                value={currentValue} 
                onValueChange={handlePresetChange}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs border-border">
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    <SelectValue placeholder="No preset">
                      {activePreset ? (
                        <span className="flex items-center gap-1">
                          {activePreset.name}
                          {activePreset.isDefault && (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                        </span>
                      ) : (
                        'Manual'
                      )}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-[200px]">
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3" />
                      Manual Mode
                    </div>
                  </SelectItem>
                  
                  {presets.length > 0 && (
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t border-border mt-1 pt-2">
                      Your Presets
                    </div>
                  )}
                  
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <span>{preset.name}</span>
                          {preset.isDefault && (
                            <Star className="w-3 h-3 text-yellow-500" />
                          )}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {preset.modelId.split('/').pop()?.replace('anthropic/', '')?.replace('claude-', 'Claude ')?.replace('openai/', '') || preset.modelId}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="border-t border-border mt-1 pt-1">
                    <SelectItem value="manage">
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        Manage Presets
                      </div>
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={8} className="text-xs">
            {activePreset ? (
              <div className="space-y-1">
                <div className="font-medium">{activePreset.name}</div>
                <div className="text-muted-foreground">
                  {activePreset.modelId} • T: {activePreset.temperature} • Tokens: {activePreset.maxTokens}
                </div>
                {activePreset.webSearchEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Web Search: {activePreset.webSearchContextSize}
                  </Badge>
                )}
              </div>
            ) : (
              'Select a preset or use manual mode'
            )}
          </TooltipContent>
        </Tooltip>
        
        {/* Preset status indicator */}
        {activePreset && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Preset active" />
          </div>
        )}
      </div>

      {/* Preset Manager Dialog */}
      <PresetManager 
        open={showManager}
        onOpenChange={setShowManager}
      />
    </>
  );
}