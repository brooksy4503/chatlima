"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, LayoutDashboard } from "lucide-react";

interface PreferencesTabProps {
  showWelcomeScreen: boolean;
  onShowWelcomeScreenChange: (value: boolean) => void;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  onWebSearchContextSizeChange: (value: 'low' | 'medium' | 'high') => void;
}

export function PreferencesTab({
  showWelcomeScreen,
  onShowWelcomeScreenChange,
  webSearchEnabled,
  webSearchContextSize,
  onWebSearchContextSizeChange,
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
            <Label htmlFor="welcome-screen" className="text-sm font-medium cursor-pointer">
              Show Welcome Screen
            </Label>
            <p className="text-xs text-muted-foreground">
              Display the welcome screen when you open the application
            </p>
          </div>
        </div>
        <Switch
          id="welcome-screen"
          checked={showWelcomeScreen}
          onCheckedChange={onShowWelcomeScreenChange}
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
    </div>
  );
}
