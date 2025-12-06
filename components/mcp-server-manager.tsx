"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    PlusCircle,
    ServerIcon,
    X,
    Terminal,
    Globe,
    ExternalLink,
    Trash2,
    CheckCircle,
    Plus,
    Cog,
    Edit2,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Wifi
} from "lucide-react";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "./ui/accordion";
import { KeyValuePair, MCPServer } from "@/lib/context/mcp-context";
import { MCPOAuthProvider } from "@/lib/services/mcpOAuthProvider";
import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { useRouter } from 'next/navigation';

// Default template for a new MCP server
const INITIAL_NEW_SERVER: Omit<MCPServer, 'id'> = {
    name: '',
    title: '',
    url: '',
    type: 'sse',
    command: 'node',
    args: [],
    env: [],
    headers: [],
    useOAuth: false
};

interface MCPServerManagerProps {
    servers: MCPServer[];
    onServersChange: (servers: MCPServer[]) => void;
    selectedServers: string[];
    onSelectedServersChange: (serverIds: string[]) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Check if a key name might contain sensitive information
const isSensitiveKey = (key: string): boolean => {
    const sensitivePatterns = [
        /key/i, 
        /token/i, 
        /secret/i, 
        /password/i, 
        /pass/i,
        /auth/i,
        /credential/i
    ];
    return sensitivePatterns.some(pattern => pattern.test(key));
};

// Mask a sensitive value
const maskValue = (value: string): string => {
    if (!value) return '';
    if (value.length < 8) return '••••••';
    return value.substring(0, 3) + '•'.repeat(Math.min(10, value.length - 4)) + value.substring(value.length - 1);
};

export const MCPServerManager = ({
    servers,
    onServersChange,
    selectedServers,
    onSelectedServersChange,
    open,
    onOpenChange
}: MCPServerManagerProps) => {
    const router = useRouter();
    const [newServer, setNewServer] = useState<Omit<MCPServer, 'id'>>(INITIAL_NEW_SERVER);
    const [view, setView] = useState<'list' | 'add'>('list');
    const [newEnvVar, setNewEnvVar] = useState<KeyValuePair>({ key: '', value: '' });
    const [newHeader, setNewHeader] = useState<KeyValuePair>({ key: '', value: '' });
    const [editingServerId, setEditingServerId] = useState<string | null>(null);
    const [showSensitiveEnvValues, setShowSensitiveEnvValues] = useState<Record<number, boolean>>({});
    const [showSensitiveHeaderValues, setShowSensitiveHeaderValues] = useState<Record<number, boolean>>({});
    const [editingEnvIndex, setEditingEnvIndex] = useState<number | null>(null);
    const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);
    const [editedEnvValue, setEditedEnvValue] = useState<string>('');
    const [editedHeaderValue, setEditedHeaderValue] = useState<string>('');
    const [testingServerId, setTestingServerId] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
    const [oauthStatus, setOauthStatus] = useState<Record<string, boolean>>({});
    const [authorizingServerId, setAuthorizingServerId] = useState<string | null>(null);

    const resetAndClose = () => {
        setView('list');
        setNewServer(INITIAL_NEW_SERVER);
        setNewEnvVar({ key: '', value: '' });
        setNewHeader({ key: '', value: '' });
        setShowSensitiveEnvValues({});
        setShowSensitiveHeaderValues({});
        setEditingEnvIndex(null);
        setEditingHeaderIndex(null);
        onOpenChange(false);
    };

    const addServer = () => {
        if (!newServer.name) {
            toast.error("Server name is required");
            return;
        }

        if (newServer.type === 'sse' && !newServer.url) {
            toast.error("Server URL is required for SSE transport");
            return;
        }

        if (newServer.type === 'streamable-http' && !newServer.url) {
            toast.error("Server URL is required for Streamable HTTP transport");
            return;
        }

        if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
            toast.error("Command and at least one argument are required for stdio transport");
            return;
        }

        const id = crypto.randomUUID();
        const updatedServers = [...servers, { ...newServer, id }];
        onServersChange(updatedServers);

        toast.success(`Added MCP server: ${newServer.name}`);
        setView('list');
        setNewServer(INITIAL_NEW_SERVER);
        setNewEnvVar({ key: '', value: '' });
        setNewHeader({ key: '', value: '' });
        setShowSensitiveEnvValues({});
        setShowSensitiveHeaderValues({});
        // Clear temporary test results
        setTestResults(prev => {
            const newResults = { ...prev };
            delete newResults['temp'];
            return newResults;
        });
    };

    const removeServer = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedServers = servers.filter(server => server.id !== id);
        onServersChange(updatedServers);

        // If the removed server was selected, remove it from selected servers
        if (selectedServers.includes(id)) {
            onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
        }

        toast.success("Server removed");
    };

    const toggleServer = (id: string) => {
        if (selectedServers.includes(id)) {
            // Remove from selected servers
            onSelectedServersChange(selectedServers.filter(serverId => serverId !== id));
            const server = servers.find(s => s.id === id);
            if (server) {
                toast.success(`Disabled MCP server: ${server.name}`);
            }
        } else {
            // Add to selected servers
            onSelectedServersChange([...selectedServers, id]);
            const server = servers.find(s => s.id === id);
            if (server) {
                toast.success(`Enabled MCP server: ${server.name}`);
            }
        }
    };

    const clearAllServers = () => {
        if (selectedServers.length > 0) {
            onSelectedServersChange([]);
            toast.success("All MCP servers disabled");
            resetAndClose();
        }
    };

    const testConnection = async (server: MCPServer) => {
        setTestingServerId(server.id);
        
        try {
            // For SSE and Streamable HTTP transports, we test URL validity and basic configuration
            if (server.type === 'sse' || server.type === 'streamable-http') {
                if (!server.url) {
                    throw new Error("Server URL is required");
                }
                
                // Validate URL format
                try {
                    new URL(server.url);
                } catch (urlError) {
                    throw new Error("Invalid URL format");
                }
                
                // For HTTP-based MCP servers, we validate configuration rather than test actual connection
                // since MCP has its own protocol handshake that simple HTTP requests can't handle
                setTestResults(prev => ({
                    ...prev,
                    [server.id]: { 
                        success: true, 
                        message: "Configuration valid (connection will be tested when tools are used)" 
                    }
                }));
            } 
            // For stdio transport, we can't test directly from the browser
            else if (server.type === 'stdio') {
                // Validate that we have a command and arguments
                if (!server.command) {
                    throw new Error("Command is required for stdio transport");
                }
                
                if (!server.args || server.args.length === 0) {
                    throw new Error("At least one argument is required for stdio transport");
                }
                
                setTestResults(prev => ({
                    ...prev,
                    [server.id]: { 
                        success: true, 
                        message: "Configuration valid (connection test happens on server)" 
                    }
                }));
            }
            
            toast.success(`Configuration test passed for ${server.name}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setTestResults(prev => ({
                ...prev,
                [server.id]: { 
                    success: false, 
                    message: errorMessage 
                }
            }));
            
            toast.error(`Configuration test failed for ${server.name}: ${errorMessage}`);
        } finally {
            setTestingServerId(null);
        }
    };

    const handleArgsChange = (value: string) => {
        try {
            // Try to parse as JSON if it starts with [ (array)
            const argsArray = value.trim().startsWith('[')
                ? JSON.parse(value)
                : value.split(' ').filter(Boolean);

            setNewServer({ ...newServer, args: argsArray });
        } catch (error) {
            // If parsing fails, just split by spaces
            setNewServer({ ...newServer, args: value.split(' ').filter(Boolean) });
        }
    };

    const addEnvVar = () => {
        if (!newEnvVar.key) return;

        setNewServer({
            ...newServer,
            env: [...(newServer.env || []), { ...newEnvVar }]
        });

        setNewEnvVar({ key: '', value: '' });
    };

    const removeEnvVar = (index: number) => {
        const updatedEnv = [...(newServer.env || [])];
        updatedEnv.splice(index, 1);
        setNewServer({ ...newServer, env: updatedEnv });
        
        // Clean up visibility state for this index
        const updatedVisibility = { ...showSensitiveEnvValues };
        delete updatedVisibility[index];
        setShowSensitiveEnvValues(updatedVisibility);
        
        // If currently editing this value, cancel editing
        if (editingEnvIndex === index) {
            setEditingEnvIndex(null);
        }
    };

    const startEditEnvValue = (index: number, value: string) => {
        setEditingEnvIndex(index);
        setEditedEnvValue(value);
    };

    const saveEditedEnvValue = () => {
        if (editingEnvIndex !== null) {
            const updatedEnv = [...(newServer.env || [])];
            updatedEnv[editingEnvIndex] = {
                ...updatedEnv[editingEnvIndex],
                value: editedEnvValue
            };
            setNewServer({ ...newServer, env: updatedEnv });
            setEditingEnvIndex(null);
        }
    };

    const addHeader = () => {
        if (!newHeader.key) return;

        setNewServer({
            ...newServer,
            headers: [...(newServer.headers || []), { ...newHeader }]
        });

        setNewHeader({ key: '', value: '' });
    };

    const removeHeader = (index: number) => {
        const updatedHeaders = [...(newServer.headers || [])];
        updatedHeaders.splice(index, 1);
        setNewServer({ ...newServer, headers: updatedHeaders });
        
        // Clean up visibility state for this index
        const updatedVisibility = { ...showSensitiveHeaderValues };
        delete updatedVisibility[index];
        setShowSensitiveHeaderValues(updatedVisibility);
        
        // If currently editing this value, cancel editing
        if (editingHeaderIndex === index) {
            setEditingHeaderIndex(null);
        }
    };

    const startEditHeaderValue = (index: number, value: string) => {
        setEditingHeaderIndex(index);
        setEditedHeaderValue(value);
    };

    const saveEditedHeaderValue = () => {
        if (editingHeaderIndex !== null) {
            const updatedHeaders = [...(newServer.headers || [])];
            updatedHeaders[editingHeaderIndex] = {
                ...updatedHeaders[editingHeaderIndex],
                value: editedHeaderValue
            };
            setNewServer({ ...newServer, headers: updatedHeaders });
            setEditingHeaderIndex(null);
        }
    };

    const toggleSensitiveEnvValue = (index: number) => {
        setShowSensitiveEnvValues(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleSensitiveHeaderValue = (index: number) => {
        setShowSensitiveHeaderValues(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Check OAuth status for servers
    const checkOAuthStatus = async (serverId: string, serverUrl: string) => {
        const authProvider = new MCPOAuthProvider(serverUrl, serverId);
        const hasTokens = await authProvider.hasValidTokens();
        setOauthStatus(prev => ({ ...prev, [serverId]: hasTokens }));
        return hasTokens;
    };

    // Trigger OAuth authorization flow
    const authorizeOAuth = async (server: MCPServer) => {
        if (!server.useOAuth || !server.id || !server.url) {
            toast.error("OAuth is not enabled for this server");
            return;
        }

        setAuthorizingServerId(server.id);

        try {
            // Store return URL and server info for callback
            sessionStorage.setItem('mcp_oauth_return_url', window.location.pathname);
            sessionStorage.setItem('mcp_oauth_server_id', server.id);
            sessionStorage.setItem('mcp_oauth_server_url', server.url);
            
            const authProvider = new MCPOAuthProvider(server.url, server.id);
            
            // Check if we already have tokens
            const existingTokens = await authProvider.tokens();
            if (existingTokens && await authProvider.hasValidTokens()) {
                // Clean up any stale sessionStorage keys
                sessionStorage.removeItem('mcp_oauth_server_id');
                sessionStorage.removeItem('mcp_oauth_server_url');
                sessionStorage.removeItem('mcp_oauth_return_url');
                toast.success("Already authorized");
                setOauthStatus(prev => ({ ...prev, [server.id]: true }));
                setAuthorizingServerId(null);
                return;
            }

            // Initiate OAuth flow
            const result = await auth(authProvider, { serverUrl: new URL(server.url) });

            if (result === 'REDIRECT') {
                // The redirectToAuthorization method will be called by the SDK
                // which will redirect the browser
                toast.info("Redirecting to authorization page...");
                // Keep sessionStorage keys for callback page
            } else if (result === 'AUTHORIZED') {
                // Clean up sessionStorage keys since we don't need them (no redirect)
                sessionStorage.removeItem('mcp_oauth_server_id');
                sessionStorage.removeItem('mcp_oauth_server_url');
                sessionStorage.removeItem('mcp_oauth_return_url');
                toast.success("Authorization successful!");
                setOauthStatus(prev => ({ ...prev, [server.id]: true }));
            } else {
                // Clean up sessionStorage on unexpected result
                sessionStorage.removeItem('mcp_oauth_server_id');
                sessionStorage.removeItem('mcp_oauth_server_url');
                sessionStorage.removeItem('mcp_oauth_return_url');
                throw new Error("Unexpected authorization result");
            }
        } catch (error) {
            // Clean up sessionStorage on error
            sessionStorage.removeItem('mcp_oauth_server_id');
            sessionStorage.removeItem('mcp_oauth_server_url');
            sessionStorage.removeItem('mcp_oauth_return_url');
            console.error("OAuth authorization error:", error);
            toast.error(error instanceof Error ? error.message : "Authorization failed");
        } finally {
            setAuthorizingServerId(null);
        }
    };

    // Check OAuth status for all servers on mount and when servers change
    useEffect(() => {
        const checkAllOAuthStatus = async () => {
            for (const server of servers) {
                if (server.useOAuth && server.id && server.url) {
                    await checkOAuthStatus(server.id, server.url);
                }
            }
        };
        
        if (open) {
            checkAllOAuthStatus();
        }
    }, [servers, open]);

    const hasAdvancedConfig = (server: MCPServer) => {
        return (server.env && server.env.length > 0) ||
            (server.headers && server.headers.length > 0);
    };

    // Editing support
    const startEditing = (server: MCPServer) => {
        setEditingServerId(server.id);
        setNewServer({
            name: server.name,
            title: server.title,
            url: server.url,
            type: server.type,
            command: server.command,
            args: server.args,
            env: server.env,
            headers: server.headers,
            useOAuth: server.useOAuth
        });
        setView('add');
        // Reset sensitive value visibility states
        setShowSensitiveEnvValues({});
        setShowSensitiveHeaderValues({});
        setEditingEnvIndex(null);
        setEditingHeaderIndex(null);
        // Clear test results for this server
        setTestResults(prev => {
            const newResults = { ...prev };
            delete newResults[server.id];
            return newResults;
        });
    };

    const handleFormCancel = () => {
        if (view === 'add') {
            setView('list');
            setEditingServerId(null);
            setNewServer(INITIAL_NEW_SERVER);
            setShowSensitiveEnvValues({});
            setShowSensitiveHeaderValues({});
            setEditingEnvIndex(null);
            setEditingHeaderIndex(null);
            // Clear temporary test results
            setTestResults(prev => {
                const newResults = { ...prev };
                delete newResults['temp'];
                return newResults;
            });
        } else {
            resetAndClose();
        }
    };

    const updateServer = () => {
        if (!newServer.name) {
            toast.error("Server name is required");
            return;
        }
        if (newServer.type === 'sse' && !newServer.url) {
            toast.error("Server URL is required for SSE transport");
            return;
        }
        if (newServer.type === 'streamable-http' && !newServer.url) {
            toast.error("Server URL is required for Streamable HTTP transport");
            return;
        }
        if (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) {
            toast.error("Command and at least one argument are required for stdio transport");
            return;
        }
        const updated = servers.map(s =>
            s.id === editingServerId ? { ...newServer, id: editingServerId!, useOAuth: newServer.useOAuth } : s
        );
        onServersChange(updated);
        toast.success(`Updated MCP server: ${newServer.name}`);
        setView('list');
        setEditingServerId(null);
        setNewServer(INITIAL_NEW_SERVER);
        setShowSensitiveEnvValues({});
        setShowSensitiveHeaderValues({});
        // Clear temporary test results
        setTestResults(prev => {
            const newResults = { ...prev };
            delete newResults['temp'];
            return newResults;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-[480px] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <ServerIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                        MCP Server Configuration
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Connect to Model Context Protocol servers to access additional AI tools.
                        {selectedServers.length > 0 && (
                            <span className="block mt-1 text-xs font-medium text-primary">
                                {selectedServers.length} server{selectedServers.length !== 1 ? 's' : ''} currently active
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {view === 'list' ? (
                    <>
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {servers.length > 0 ? (
                                <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 shrink-0">
                                        <h3 className="text-sm font-medium">Available Servers</h3>
                                        <span className="text-xs text-muted-foreground">
                                            Select multiple servers to combine their tools
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch min-h-0">
                                        <div className="space-y-2.5 pb-2">
                                            {servers
                                                .sort((a, b) => {
                                                    const aActive = selectedServers.includes(a.id);
                                                    const bActive = selectedServers.includes(b.id);
                                                    if (aActive && !bActive) return -1;
                                                    if (!aActive && bActive) return 1;
                                                    return 0;
                                                })
                                                .map((server) => {
                                                const isActive = selectedServers.includes(server.id);
                                                return (
                                                    <div
                                                        key={server.id}
                                                        className={`
                                relative flex flex-col p-3.5 rounded-xl transition-colors
                                border ${isActive
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-border hover:border-primary/30 hover:bg-primary/5'}
                              `}
                                                    >
                                                    {/* Server Header with Type Badge and Delete Button */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            {server.type === 'sse' ? (
                                                                <Globe className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
                                                            ) : (
                                                                <Terminal className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
                                                            )}
                                                            <h4 className="text-sm font-medium truncate">{server.name}</h4>
                                                            {hasAdvancedConfig(server) && (
                                                                <span className="flex-shrink-0">
                                                                    <Cog className="h-3 w-3 text-muted-foreground" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                             <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground shrink-0 font-medium">
                                                                 {server.type === 'streamable-http' ? 'S-HTTP' : server.type.toUpperCase()}
                                                             </span>
                                                             <button
                                                                  onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      testConnection(server);
                                                                  }}
                                                                  className="p-1 rounded-full hover:bg-muted/70 shrink-0"
                                                                  aria-label="Test connection"
                                                                  disabled={testingServerId === server.id}
                                                              >
                                                                  {testingServerId === server.id ? (
                                                                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                  ) : (
                                                                      <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                                                                  )}
                                                              </button>
                                                             <button
                                                                 onClick={(e) => removeServer(server.id, e)}
                                                                 className="p-1 rounded-full hover:bg-muted/70 shrink-0"
                                                                 aria-label="Remove server"
                                                             >
                                                                 <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                             </button>
                                                             <button
                                                                 onClick={() => startEditing(server)}
                                                                 className="p-1 rounded-full hover:bg-muted/50 shrink-0"
                                                                 aria-label="Edit server"
                                                             >
                                                                 <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                             </button>
                                                        </div>
                                                    </div>

                                                    {/* Server Details */}
                                                    <p className="text-xs text-muted-foreground mb-2.5 truncate">
                                                        {server.type === 'sse' || server.type === 'streamable-http'
                                                            ? server.url
                                                            : `${server.command} ${server.args?.join(' ')}`
                                                        }
                                                    </p>

                                                    {/* OAuth Status */}
                                                    {server.useOAuth && (
                                                        <div className={`text-xs mb-2.5 p-2 rounded-md flex items-center justify-between ${
                                                            oauthStatus[server.id]
                                                                ? 'bg-green-500/10 text-green-700 dark:text-green-300' 
                                                                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                                                        }`}>
                                                            <div className="flex items-center gap-1.5">
                                                                {oauthStatus[server.id] ? (
                                                                    <>
                                                                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                                                        <span>Authorized</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                                                        <span>Not authorized</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {!oauthStatus[server.id] && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={() => authorizeOAuth(server)}
                                                                    disabled={authorizingServerId === server.id}
                                                                >
                                                                    {authorizingServerId === server.id ? (
                                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    ) : (
                                                                        'Authorize'
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Test Result */}
                                                    {testResults[server.id] && (
                                                        <div className={`text-xs mb-2.5 p-2 rounded-md ${
                                                            testResults[server.id].success 
                                                                ? 'bg-green-500/10 text-green-700 dark:text-green-300' 
                                                                : 'bg-red-500/10 text-red-700 dark:text-red-300'
                                                        }`}>
                                                            <div className="flex items-center gap-1.5">
                                                                {testResults[server.id].success ? (
                                                                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                                                ) : (
                                                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                                                )}
                                                                <span className="truncate">{testResults[server.id].message}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <Button
                                                        size="sm"
                                                        className="w-full gap-1.5 hover:text-black hover:dark:text-white rounded-lg"
                                                        variant={isActive ? "default" : "outline"}
                                                        onClick={() => toggleServer(server.id)}
                                                    >
                                                        {isActive && <CheckCircle className="h-3.5 w-3.5 shrink-0" />}
                                                        {isActive ? "Active" : "Enable Server"}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4 sm:px-6">
                                    <div className="rounded-full p-3 bg-primary/10">
                                        <ServerIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="text-sm sm:text-base font-medium">No MCP Servers Added</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground max-w-[300px]">
                                            Add your first MCP server to access additional AI tools
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
                                        <a
                                            href="https://modelcontextprotocol.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-primary transition-colors"
                                        >
                                            Learn about MCP
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer for list view */}
                        <div className="shrink-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-border flex flex-col sm:flex-row justify-between gap-3">
                            <Button
                                variant="outline"
                                onClick={clearAllServers}
                                size="sm"
                                className="gap-1.5 hover:text-black hover:dark:text-white w-full sm:w-auto"
                                disabled={selectedServers.length === 0}
                            >
                                <X className="h-3.5 w-3.5 shrink-0" />
                                Disable All
                            </Button>
                            <Button
                                onClick={() => setView('add')}
                                size="sm"
                                className="gap-1.5 w-full sm:w-auto"
                            >
                                <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                                Add Server
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch min-h-0 px-4 sm:px-6">
                            <div className="space-y-4 pb-2">
                                <h3 className="text-sm font-medium">{editingServerId ? "Edit MCP Server" : "Add New MCP Server"}</h3>
                                <div className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name" className="text-sm">
                                            Server Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newServer.name}
                                            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                            placeholder="My MCP Server"
                                            className="relative z-0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Unique identifier for this server
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="title" className="text-sm">
                                            Display Title (Optional)
                                        </Label>
                                        <Input
                                            id="title"
                                            value={newServer.title || ''}
                                            onChange={(e) => setNewServer({ ...newServer, title: e.target.value })}
                                            placeholder="File System Access"
                                            className="relative z-0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Human-friendly name for UI display
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="transport-type" className="text-sm">
                                            Transport Type
                                        </Label>
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Choose how to connect to your MCP server:</p>
                                            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setNewServer({ ...newServer, type: 'sse' })}
                                                    className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
                                                        newServer.type === 'sse' 
                                                            ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                                                            : 'border-border hover:border-border/80 hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <Globe className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${newServer.type === 'sse' ? 'text-primary' : ''}`} />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm">SSE</p>
                                                        <p className="text-xs text-muted-foreground truncate">Server-Sent Events</p>
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setNewServer({ ...newServer, type: 'stdio' })}
                                                    className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all ${
                                                        newServer.type === 'stdio' 
                                                            ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                                                            : 'border-border hover:border-border/80 hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <Terminal className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${newServer.type === 'stdio' ? 'text-primary' : ''}`} />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm">stdio</p>
                                                        <p className="text-xs text-muted-foreground truncate">Standard I/O</p>
                                                    </div>
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNewServer({ ...newServer, type: 'streamable-http' })}
                                                className={`flex items-center gap-2 p-3 rounded-md text-left border transition-all w-full ${
                                                    newServer.type === 'streamable-http' 
                                                        ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                                                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                                                }`}
                                            >
                                                <Globe className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${newServer.type === 'streamable-http' ? 'text-primary' : ''}`} />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm">Streamable HTTP</p>
                                                    <p className="text-xs text-muted-foreground truncate">Streamable HTTP Server</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {newServer.type === 'sse' || newServer.type === 'streamable-http' ? (
                                        <>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="url" className="text-sm">
                                                    Server URL
                                                </Label>
                                                <Input
                                                    id="url"
                                                    value={newServer.url}
                                                    onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                                                    placeholder={newServer.type === 'streamable-http' ? "https://mcp.example.com/token/mcp" : "https://mcp.example.com/token/sse"}
                                                    className="relative z-0"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Full URL to the {newServer.type === 'sse' ? 'SSE' : 'Streamable HTTP'} endpoint of the MCP server
                                                </p>
                                            </div>
                                            
                                            {/* OAuth Toggle */}
                                            <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
                                                <input
                                                    type="checkbox"
                                                    id="use-oauth"
                                                    checked={newServer.useOAuth || false}
                                                    onChange={(e) => setNewServer({ ...newServer, useOAuth: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="use-oauth" className="text-sm font-normal cursor-pointer flex-1">
                                                    Use OAuth Authentication
                                                </Label>
                                            </div>
                                            {newServer.useOAuth && (
                                                <p className="text-xs text-muted-foreground -mt-2">
                                                    Enable this if the MCP server requires OAuth login. You&apos;ll be prompted to authorize when using the server.
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="command" className="text-sm">
                                                    Command
                                                </Label>
                                                <Input
                                                    id="command"
                                                    value={newServer.command}
                                                    onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                                                    placeholder="node"
                                                    className="relative z-0"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Executable to run (e.g., node, python)
                                                </p>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="args" className="text-sm">
                                                    Arguments
                                                </Label>
                                                <Input
                                                    id="args"
                                                    value={newServer.args?.join(' ') || ''}
                                                    onChange={(e) => handleArgsChange(e.target.value)}
                                                    placeholder="src/mcp-server.js --port 3001"
                                                    className="relative z-0"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Space-separated arguments or JSON array
                                                </p>
                                            </div>
                                        </>
                                    )}

                                     {/* Test Connection Button */}
                                     <div className="flex justify-end">
                                         <Button
                                             type="button"
                                             variant="outline"
                                             size="sm"
                                             onClick={() => {
                                                 // Create a temporary server object for testing
                                                 const tempServer: MCPServer = {
                                                     id: 'temp',
                                                     ...newServer
                                                 };
                                                 testConnection(tempServer);
                                             }}
                                             disabled={
                                                 !newServer.name ||
                                                 (newServer.type === 'sse' && !newServer.url) ||
                                                 (newServer.type === 'streamable-http' && !newServer.url) ||
                                                 (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length)) ||
                                                 testingServerId === 'temp'
                                             }
                                             className="gap-1.5"
                                         >
                                             {testingServerId === 'temp' ? (
                                                 <>
                                                     <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                     Testing...
                                                 </>
                                             ) : (
                                                  <>
                                                      <Wifi className="h-3.5 w-3.5 shrink-0" />
                                                      Test Connection
                                                  </>
                                             )}
                                         </Button>
                                     </div>

                                     {/* Advanced Configuration */}
                                     <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="env-vars">
                                            <AccordionTrigger className="text-sm py-2">
                                                Environment Variables
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row items-end gap-2">
                                                        <div className="flex-1 w-full">
                                                            <Label htmlFor="env-key" className="text-xs mb-1 block">
                                                                Key
                                                            </Label>
                                                            <Input
                                                                id="env-key"
                                                                value={newEnvVar.key}
                                                                onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                                                                placeholder="API_KEY"
                                                                className="h-8 relative z-0"
                                                            />
                                                        </div>
                                                        <div className="flex-1 w-full">
                                                            <Label htmlFor="env-value" className="text-xs mb-1 block">
                                                                Value
                                                            </Label>
                                                            <Input
                                                                id="env-value"
                                                                value={newEnvVar.value}
                                                                onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                                                                placeholder="your-secret-key"
                                                                className="h-8 relative z-0"
                                                                type="text"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={addEnvVar}
                                                            disabled={!newEnvVar.key}
                                                            className="h-8 mt-1 w-full sm:w-auto shrink-0"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>

                                                    {newServer.env && newServer.env.length > 0 ? (
                                                        <div className="border rounded-md divide-y">
                                                            {newServer.env.map((env, index) => (
                                                                <div key={index} className="flex items-center justify-between p-2 text-sm">
                                                                    <div className="flex-1 flex items-center gap-1 truncate min-w-0">
                                                                        <span className="font-mono text-xs shrink-0">{env.key}</span>
                                                                        <span className="mx-2 text-muted-foreground shrink-0">=</span>
                                                                        
                                                                        {editingEnvIndex === index ? (
                                                                            <div className="flex gap-1 flex-1 min-w-0">
                                                                                <Input
                                                                                    className="h-6 text-xs py-1 px-2 flex-1"
                                                                                    value={editedEnvValue}
                                                                                    onChange={(e) => setEditedEnvValue(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === 'Enter' && saveEditedEnvValue()}
                                                                                    autoFocus
                                                                                />
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    className="h-6 px-2 shrink-0"
                                                                                    onClick={saveEditedEnvValue}
                                                                                >
                                                                                    Save
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-xs text-muted-foreground truncate">
                                                                                    {isSensitiveKey(env.key) && !showSensitiveEnvValues[index] 
                                                                                        ? maskValue(env.value) 
                                                                                        : env.value}
                                                                                </span>
                                                                                <span className="flex ml-1 gap-1 shrink-0">
                                                                                    {isSensitiveKey(env.key) && (
                                                                                        <button
                                                                                            onClick={() => toggleSensitiveEnvValue(index)}
                                                                                            className="p-1 hover:bg-muted/50 rounded-full"
                                                                                        >
                                                                                            {showSensitiveEnvValues[index] ? (
                                                                                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                                                            ) : (
                                                                                                <Eye className="h-3 w-3 text-muted-foreground" />
                                                                                            )}
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => startEditEnvValue(index, env.value)}
                                                                                        className="p-1 hover:bg-muted/50 rounded-full"
                                                                                    >
                                                                                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                                                                                    </button>
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeEnvVar(index)}
                                                                        className="h-6 w-6 p-0 ml-2 shrink-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground text-center py-2">
                                                            No environment variables added
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Environment variables will be passed to the MCP server process.
                                                    </p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="headers">
                                            <AccordionTrigger className="text-sm py-2">
                                                {newServer.type === 'sse' || newServer.type === 'streamable-http' ? 'HTTP Headers' : 'Additional Configuration'}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row items-end gap-2">
                                                        <div className="flex-1 w-full">
                                                            <Label htmlFor="header-key" className="text-xs mb-1 block">
                                                                Key
                                                            </Label>
                                                            <Input
                                                                id="header-key"
                                                                value={newHeader.key}
                                                                onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                                                                placeholder="Authorization"
                                                                className="h-8 relative z-0"
                                                            />
                                                        </div>
                                                        <div className="flex-1 w-full">
                                                            <Label htmlFor="header-value" className="text-xs mb-1 block">
                                                                Value
                                                            </Label>
                                                            <Input
                                                                id="header-value"
                                                                value={newHeader.value}
                                                                onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                                                                placeholder="Bearer token123"
                                                                className="h-8 relative z-0"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={addHeader}
                                                            disabled={!newHeader.key}
                                                            className="h-8 mt-1 w-full sm:w-auto shrink-0"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>

                                                    {newServer.headers && newServer.headers.length > 0 ? (
                                                        <div className="border rounded-md divide-y">
                                                            {newServer.headers.map((header, index) => (
                                                                <div key={index} className="flex items-center justify-between p-2 text-sm">
                                                                    <div className="flex-1 flex items-center gap-1 truncate min-w-0">
                                                                        <span className="font-mono text-xs shrink-0">{header.key}</span>
                                                                        <span className="mx-2 text-muted-foreground shrink-0">:</span>
                                                                        
                                                                        {editingHeaderIndex === index ? (
                                                                            <div className="flex gap-1 flex-1 min-w-0">
                                                                                <Input
                                                                                    className="h-6 text-xs py-1 px-2 flex-1"
                                                                                    value={editedHeaderValue}
                                                                                    onChange={(e) => setEditedHeaderValue(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === 'Enter' && saveEditedHeaderValue()}
                                                                                    autoFocus
                                                                                />
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    className="h-6 px-2 shrink-0"
                                                                                    onClick={saveEditedHeaderValue}
                                                                                >
                                                                                    Save
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-xs text-muted-foreground truncate">
                                                                                    {isSensitiveKey(header.key) && !showSensitiveHeaderValues[index] 
                                                                                        ? maskValue(header.value) 
                                                                                        : header.value}
                                                                                </span>
                                                                                <span className="flex ml-1 gap-1 shrink-0">
                                                                                    {isSensitiveKey(header.key) && (
                                                                                        <button
                                                                                            onClick={() => toggleSensitiveHeaderValue(index)}
                                                                                            className="p-1 hover:bg-muted/50 rounded-full"
                                                                                        >
                                                                                            {showSensitiveHeaderValues[index] ? (
                                                                                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                                                            ) : (
                                                                                                <Eye className="h-3 w-3 text-muted-foreground" />
                                                                                            )}
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => startEditHeaderValue(index, header.value)}
                                                                                        className="p-1 hover:bg-muted/50 rounded-full"
                                                                                    >
                                                                                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                                                                                    </button>
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeHeader(index)}
                                                                        className="h-6 w-6 p-0 ml-2 shrink-0"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground text-center py-2">
                                                            No {newServer.type === 'sse' || newServer.type === 'streamable-http' ? 'headers' : 'additional configuration'} added
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {newServer.type === 'sse' || newServer.type === 'streamable-http'
                                                            ? `HTTP headers will be sent with requests to the ${newServer.type === 'sse' ? 'SSE' : 'Streamable HTTP'} endpoint.`
                                                            : 'Additional configuration parameters for the stdio transport.'}
                                                    </p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer for add/edit view */}
                        <div className="shrink-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-border flex flex-col sm:flex-row justify-between gap-3">
                            <Button 
                                variant="outline" 
                                onClick={handleFormCancel}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={editingServerId ? updateServer : addServer}
                                disabled={
                                    !newServer.name ||
                                    (newServer.type === 'sse' && !newServer.url) ||
                                    (newServer.type === 'streamable-http' && !newServer.url) ||
                                    (newServer.type === 'stdio' && (!newServer.command || !newServer.args?.length))
                                }
                                className="w-full sm:w-auto"
                            >
                                {editingServerId ? "Save Changes" : "Add Server"}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}; 
