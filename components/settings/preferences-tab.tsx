"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Globe, ImagePlus, LayoutDashboard, MessageSquareText } from "lucide-react";
import type { ImageGenerationOutputFormat, ImageGenerationQuality } from "@/lib/openrouter-image-generation-tool";
import { IMAGE_GENERATION_COST } from "@/lib/tokenCounter";

interface PreferencesTabProps {
  showWelcomeScreen: boolean;
  onShowWelcomeScreenChange: (value: boolean) => void;
  showSuggestedPrompts: boolean;
  onShowSuggestedPromptsChange: (value: boolean) => void;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  onWebSearchContextSizeChange: (value: 'low' | 'medium' | 'high') => void;
  imageGenerationEnabled: boolean;
  imageGenerationQuality: ImageGenerationQuality;
  onImageGenerationQualityChange: (value: ImageGenerationQuality) => void;
  imageGenerationAspectRatio: string;
  onImageGenerationAspectRatioChange: (value: string) => void;
  imageGenerationOutputFormat: ImageGenerationOutputFormat;
  onImageGenerationOutputFormatChange: (value: ImageGenerationOutputFormat) => void;
  imageGenerationModel: string;
  onImageGenerationModelChange: (value: string) => void;
}

export function PreferencesTab({
  showWelcomeScreen,
  onShowWelcomeScreenChange,
  showSuggestedPrompts,
  onShowSuggestedPromptsChange,
  webSearchEnabled,
  webSearchContextSize,
  onWebSearchContextSizeChange,
  imageGenerationEnabled,
  imageGenerationQuality,
  onImageGenerationQualityChange,
  imageGenerationAspectRatio,
  onImageGenerationAspectRatioChange,
  imageGenerationOutputFormat,
  onImageGenerationOutputFormatChange,
  imageGenerationModel,
  onImageGenerationModelChange,
}: PreferencesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your application experience.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="welcome-onboarding" className="text-sm font-medium cursor-pointer">
              Show Welcome/Onboarding
            </Label>
            <p className="text-xs text-muted-foreground">
              Display the welcome and onboarding setup cards on new empty chats
            </p>
          </div>
        </div>
        <Switch
          id="welcome-onboarding"
          checked={showWelcomeScreen}
          onCheckedChange={onShowWelcomeScreenChange}
        />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
            <MessageSquareText className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="suggested-prompts" className="text-sm font-medium cursor-pointer">
              Show Suggested Prompts
            </Label>
            <p className="text-xs text-muted-foreground">
              Display prompt ideas on new empty chats
            </p>
          </div>
        </div>
        <Switch
          id="suggested-prompts"
          checked={showSuggestedPrompts}
          onCheckedChange={onShowSuggestedPromptsChange}
        />
      </div>

      {webSearchEnabled && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium">
                Web Search Context Size
              </Label>
              <p className="text-xs text-muted-foreground">
                Amount of context to include from web search results
              </p>
            </div>
          </div>
          <Select
            value={webSearchContextSize}
            onValueChange={(value) => onWebSearchContextSizeChange(value as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select context size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Low</span>
                  <span className="text-xs text-muted-foreground">Minimal context, faster responses</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Medium</span>
                  <span className="text-xs text-muted-foreground">Balanced context and speed</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex flex-col items-start">
                  <span className="font-medium">High</span>
                  <span className="text-xs text-muted-foreground">Maximum context, slower responses</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
            <ImagePlus className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm font-medium">Create Image Defaults</Label>
            <p className="text-xs text-muted-foreground">
              Used when the Create image toggle is on in the composer ({IMAGE_GENERATION_COST} credits per image).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-gen-model" className="text-xs text-muted-foreground">Image model</Label>
          <Input
            id="image-gen-model"
            value={imageGenerationModel}
            onChange={(e) => onImageGenerationModelChange(e.target.value)}
            placeholder="openai/gpt-5-image"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quality</Label>
          <Select
            value={imageGenerationQuality}
            onValueChange={(value) => onImageGenerationQualityChange(value as ImageGenerationQuality)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Aspect ratio</Label>
          <Select
            value={imageGenerationAspectRatio}
            onValueChange={onImageGenerationAspectRatioChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1 (Square)</SelectItem>
              <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Output format</Label>
          <Select
            value={imageGenerationOutputFormat}
            onValueChange={(value) => onImageGenerationOutputFormatChange(value as ImageGenerationOutputFormat)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!imageGenerationEnabled && (
          <p className="text-xs text-muted-foreground">
            Turn on Create image in the composer to use these defaults.
          </p>
        )}
      </div>
    </div>
  );
}
