"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { MCPOAuthProvider } from "@/lib/services/mcpOAuthProvider";

// Define types for MCP server
export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MCPServer {
  id: string;
  name: string;
  title?: string;
  url: string;
  type: 'sse' | 'stdio' | 'streamable-http';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
  description?: string;
  useOAuth?: boolean;  // Enable OAuth flow instead of static headers
  _meta?: Record<string, any>;
}

// Type for processed MCP server config for API
export interface MCPServerApi {
  type: 'sse' | 'stdio' | 'streamable-http';
  url: string;
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
  title?: string;
  useOAuth?: boolean;
  id?: string;  // Include ID so server can look up OAuth tokens
  oauthTokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  };
  _meta?: Record<string, any>;
}

interface MCPContextType {
  mcpServers: MCPServer[];
  setMcpServers: (servers: MCPServer[]) => void;
  selectedMcpServers: string[];
  setSelectedMcpServers: (serverIds: string[]) => void;
  mcpServersForApi: MCPServerApi[];
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

export function MCPProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [mcpServers, setMcpServers] = useLocalStorage<MCPServer[]>(
    STORAGE_KEYS.MCP_SERVERS, 
    []
  );
  const [selectedMcpServers, setSelectedMcpServers] = useLocalStorage<string[]>(
    STORAGE_KEYS.SELECTED_MCP_SERVERS, 
    []
  );
  const [mcpServersForApi, setMcpServersForApi] = useState<MCPServerApi[]>([]);

  // Prevent hydration mismatch by ensuring we only use localStorage values after mounting
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use default values during SSR and initial render to prevent hydration mismatch
  const effectiveMcpServers = useMemo(() => isMounted ? mcpServers : [], [isMounted, mcpServers]);
  const effectiveSelectedMcpServers = useMemo(() => isMounted ? selectedMcpServers : [], [isMounted, selectedMcpServers]);

  // Process MCP servers for API consumption whenever server data changes
  useEffect(() => {
    if (!effectiveSelectedMcpServers.length) {
      setMcpServersForApi([]);
      return;
    }
    
    // Track if this effect is still valid to prevent stale updates
    let isCancelled = false;
    
    const processServers = async () => {
      // Capture the current server IDs and server data at the start of processing
      const currentServerIds = new Set(effectiveSelectedMcpServers);
      const capturedServers = effectiveSelectedMcpServers
        .map(id => effectiveMcpServers.find(server => server.id === id))
        .filter((server): server is MCPServer => Boolean(server));
      
      // Create a snapshot of server data for comparison
      const serverSnapshot = new Map(
        capturedServers.map(server => [server.id, { url: server.url, useOAuth: server.useOAuth }])
      );

      const processedServers: MCPServerApi[] = await Promise.all(
        capturedServers.map(async (server) => {
          const baseConfig: MCPServerApi = {
            type: server.type,
            url: server.url,
            command: server.command,
            args: server.args,
            env: server.env,
            headers: server.headers,
            title: server.title,
            useOAuth: server.useOAuth,
            id: server.id,
            _meta: server._meta
          };

          // If OAuth is enabled, retrieve tokens from localStorage
          if (server.useOAuth && server.id) {
            const authProvider = new MCPOAuthProvider(server.url, server.id);
            const tokens = await authProvider.tokens();
            if (tokens) {
              baseConfig.oauthTokens = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_in: tokens.expires_in,
                token_type: tokens.token_type
              };
            }
          }

          return baseConfig;
        })
      );

      // Only update state if this effect hasn't been cancelled and the server data hasn't changed
      if (!isCancelled) {
        // Verify that the selected servers haven't changed during async processing
        const currentIdsMatch = currentServerIds.size === effectiveSelectedMcpServers.length &&
          effectiveSelectedMcpServers.every(id => currentServerIds.has(id));
        
        // Verify that the server data hasn't changed (check URL and OAuth status)
        const serverDataMatch = effectiveSelectedMcpServers.every(id => {
          const currentServer = effectiveMcpServers.find(s => s.id === id);
          const snapshot = serverSnapshot.get(id);
          return currentServer && snapshot &&
            currentServer.url === snapshot.url &&
            currentServer.useOAuth === snapshot.useOAuth;
        });
        
        if (currentIdsMatch && serverDataMatch) {
          setMcpServersForApi(processedServers);
        }
      }
    };

    processServers();
    
    // Cleanup function to mark this effect as cancelled if dependencies change
    return () => {
      isCancelled = true;
    };
  }, [effectiveMcpServers, effectiveSelectedMcpServers]);

  return (
    <MCPContext.Provider 
      value={{ 
        mcpServers: effectiveMcpServers, 
        setMcpServers, 
        selectedMcpServers: effectiveSelectedMcpServers, 
        setSelectedMcpServers,
        mcpServersForApi 
      }}
    >
      {children}
    </MCPContext.Provider>
  );
}

export function useMCP() {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error("useMCP must be used within an MCPProvider");
  }
  return context;
} 