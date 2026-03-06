"use client";

import { useState } from "react";
import { MCPServerManager } from "@/components/mcp-server-manager";
import { MCPServer } from "@/lib/context/mcp-context";
import { Button } from "@/components/ui/button";
import { ServerIcon, CheckCircle } from "lucide-react";

interface MCPServersTabProps {
  servers: MCPServer[];
  onServersChange: (servers: MCPServer[]) => void;
  selectedServers: string[];
  onSelectedServersChange: (serverIds: string[]) => void;
}

export function MCPServersTab({
  servers,
  onServersChange,
  selectedServers,
  onSelectedServersChange,
}: MCPServersTabProps) {
  const [managerOpen, setManagerOpen] = useState(false);
  const activeServersCount = selectedServers.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">MCP Servers</h3>
        <p className="text-sm text-muted-foreground">
          Connect to Model Context Protocol servers to access additional AI tools and capabilities.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ServerIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {activeServersCount > 0 
                  ? `${activeServersCount} server${activeServersCount !== 1 ? 's' : ''} active`
                  : 'No servers active'}
              </p>
              <p className="text-xs text-muted-foreground">
                {servers.length > 0 
                  ? `${servers.length} server${servers.length !== 1 ? 's' : ''} configured`
                  : 'No servers configured'}
              </p>
            </div>
          </div>
          <Button onClick={() => setManagerOpen(true)}>
            Manage Servers
          </Button>
        </div>

        {activeServersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {selectedServers.map((serverId) => {
              const server = servers.find(s => s.id === serverId);
              if (!server) return null;
              return (
                <div
                  key={serverId}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs"
                >
                  <CheckCircle className="h-3 w-3" />
                  {server.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MCPServerManager
        servers={servers}
        onServersChange={onServersChange}
        selectedServers={selectedServers}
        onSelectedServersChange={onSelectedServersChange}
        open={managerOpen}
        onOpenChange={setManagerOpen}
      />
    </div>
  );
}
