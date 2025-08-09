"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";

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
  const effectiveMcpServers = isMounted ? mcpServers : [];
  const effectiveSelectedMcpServers = isMounted ? selectedMcpServers : [];

  // Process MCP servers for API consumption whenever server data changes
  useEffect(() => {
    if (!effectiveSelectedMcpServers.length) {
      setMcpServersForApi([]);
      return;
    }
    
    const processedServers: MCPServerApi[] = effectiveSelectedMcpServers
      .map(id => effectiveMcpServers.find(server => server.id === id))
      .filter((server): server is MCPServer => Boolean(server))
      .map(server => ({
        type: server.type,
        url: server.url,
        command: server.command,
        args: server.args,
        env: server.env,
        headers: server.headers,
        title: server.title,
        _meta: server._meta
      }));
    
    setMcpServersForApi(processedServers);
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