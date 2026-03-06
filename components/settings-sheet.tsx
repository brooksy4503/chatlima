"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, ServerIcon, Activity, Settings2 } from "lucide-react";
import { ApiKeysTab } from "./settings/api-keys-tab";
import { MCPServersTab } from "./settings/mcp-servers-tab";
import { ProviderHealthTab } from "./settings/provider-health-tab";
import { PreferencesTab } from "./settings/preferences-tab";
import { MCPServer } from "@/lib/context/mcp-context";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
  mcpServers: MCPServer[];
  onMcpServersChange: (servers: MCPServer[]) => void;
  selectedMcpServers: string[];
  onSelectedMcpServersChange: (serverIds: string[]) => void;
  showWelcomeScreen: boolean;
  onShowWelcomeScreenChange: (value: boolean) => void;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  onWebSearchContextSizeChange: (value: 'low' | 'medium' | 'high') => void;
}

export function SettingsSheet({
  open,
  onOpenChange,
  defaultTab = "api-keys",
  mcpServers,
  onMcpServersChange,
  selectedMcpServers,
  onSelectedMcpServersChange,
  showWelcomeScreen,
  onShowWelcomeScreenChange,
  webSearchEnabled,
  webSearchContextSize,
  onWebSearchContextSizeChange,
}: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-xl">Settings</SheetTitle>
          <SheetDescription>
            Manage your application preferences and configuration.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs 
          defaultValue={defaultTab} 
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="border-b border-border shrink-0 px-6">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 gap-6">
              <TabsTrigger 
                value="api-keys" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 gap-2"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger 
                value="mcp-servers" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 gap-2"
              >
                <ServerIcon className="h-4 w-4" />
                <span className="hidden sm:inline">MCP Servers</span>
              </TabsTrigger>
              <TabsTrigger 
                value="provider-health" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 gap-2"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 gap-2"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="api-keys" className="mt-0 focus-visible:outline-none">
              <ApiKeysTab />
            </TabsContent>
            
            <TabsContent value="mcp-servers" className="mt-0 focus-visible:outline-none">
              <MCPServersTab
                servers={mcpServers}
                onServersChange={onMcpServersChange}
                selectedServers={selectedMcpServers}
                onSelectedServersChange={onSelectedMcpServersChange}
              />
            </TabsContent>
            
            <TabsContent value="provider-health" className="mt-0 focus-visible:outline-none">
              <ProviderHealthTab />
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-0 focus-visible:outline-none">
              <PreferencesTab
                showWelcomeScreen={showWelcomeScreen}
                onShowWelcomeScreenChange={onShowWelcomeScreenChange}
                webSearchEnabled={webSearchEnabled}
                webSearchContextSize={webSearchContextSize}
                onWebSearchContextSizeChange={onWebSearchContextSizeChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
