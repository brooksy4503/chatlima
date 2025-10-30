import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { spawn } from "child_process";
import { logDiagnostic } from '@/lib/utils/performantLogging';
import { tool, jsonSchema } from 'ai';

interface KeyValuePair {
    key: string;
    value: string;
}

interface MCPServerConfig {
    url: string;
    type: 'sse' | 'stdio' | 'streamable-http';
    command?: string;
    args?: string[];
    env?: KeyValuePair[];
    headers?: KeyValuePair[];
}

export interface MCPServerContext {
    mcpServers: MCPServerConfig[];
    selectedModel: string;
}

export interface MCPServerResult {
    tools: Record<string, any>;
    mcpClients: any[];
    cleanup: () => Promise<void>;
}

export class ChatMCPServerService {
    /**
     * Initializes MCP servers and returns tools and cleanup function
     */
    static async initializeMCPServers(context: MCPServerContext): Promise<MCPServerResult> {
        const { mcpServers, selectedModel } = context;

        const requestId = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('MCP_INIT_START', 'Starting MCP server initialization', {
            requestId,
            serverCount: mcpServers.length,
            selectedModel
        });

        // Disable MCP servers for DeepSeek R1 models
        const filteredMcpServers = this.filterMCPServersForModel(mcpServers, selectedModel);

        if (filteredMcpServers.length === 0) {
            logDiagnostic('MCP_INIT_SKIP', 'No MCP servers to initialize (filtered out)', { requestId });
            return {
                tools: {},
                mcpClients: [],
                cleanup: async () => { }
            };
        }

        const tools: Record<string, any> = {};
        const mcpClients: any[] = [];

        // Process each MCP server configuration
        for (const mcpServer of filteredMcpServers) {
            try {
                logDiagnostic('MCP_SERVER_PROCESS', `Processing MCP server`, {
                    requestId,
                    type: mcpServer.type,
                    url: mcpServer.url
                });

                // Create appropriate transport based on type
                const transport = await this.createTransport(mcpServer, requestId);

                logDiagnostic('MCP_CLIENT_CREATE', 'Creating MCP client', { requestId });
                const mcpClient = new MCPClient({ name: 'chatlima-client', version: '1.0.0' }, { capabilities: {} });
                
                logDiagnostic('MCP_CLIENT_CONNECT', 'Connecting MCP client', { requestId, url: mcpServer.url });
                await mcpClient.connect(transport);
                mcpClients.push(mcpClient);

                logDiagnostic('MCP_LIST_TOOLS', 'Listing MCP tools', { requestId });
                const toolsList = await mcpClient.listTools();
                const mcptools = toolsList.tools || [];

                // Convert MCP tools array to AI SDK tool format
                const toolsObject = Array.isArray(mcptools) 
                    ? mcptools.reduce((acc: Record<string, any>, mcpTool: any) => {
                        if (mcpTool && mcpTool.name) {
                            // Convert MCP tool format to AI SDK tool format using the tool() helper
                            acc[mcpTool.name] = tool({
                                description: mcpTool.description || '',
                                parameters: jsonSchema(mcpTool.inputSchema || { type: 'object', properties: {} }),
                                execute: async (params: any) => {
                                    try {
                                        const result = await mcpClient.callTool({
                                            name: mcpTool.name,
                                            arguments: params
                                        });
                                        return result.content;
                                    } catch (error) {
                                        console.error(`Error executing MCP tool ${mcpTool.name}:`, error);
                                        throw error;
                                    }
                                }
                            });
                        }
                        return acc;
                    }, {})
                    : mcptools;

                logDiagnostic('MCP_TOOLS_LOADED', `MCP tools loaded from ${mcpServer.type} transport`, {
                    requestId,
                    toolCount: Object.keys(toolsObject).length,
                    toolNames: Object.keys(toolsObject)
                });

                // Add MCP tools to tools object
                Object.assign(tools, toolsObject);
            } catch (error) {
                console.error(`[MCP_SERVER_ERROR] Failed to initialize MCP client:`, error);
                logDiagnostic('MCP_SERVER_ERROR', `Failed to initialize MCP client`, {
                    requestId,
                    type: mcpServer.type,
                    url: mcpServer.url,
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
                // Continue with other servers instead of failing the entire request
            }
        }

        // Create cleanup function
        const cleanup = async () => {
            logDiagnostic('MCP_CLEANUP_START', 'Starting MCP client cleanup', {
                requestId,
                clientCount: mcpClients.length
            });

            for (const client of mcpClients) {
                try {
                    await client.close();
                } catch (error) {
                    logDiagnostic('MCP_CLEANUP_ERROR', 'Error closing MCP client', {
                        requestId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            logDiagnostic('MCP_CLEANUP_COMPLETE', 'MCP client cleanup completed', { requestId });
        };

        logDiagnostic('MCP_INIT_COMPLETE', 'MCP server initialization completed', {
            requestId,
            totalTools: Object.keys(tools).length,
            activeClients: mcpClients.length
        });

        return {
            tools,
            mcpClients,
            cleanup
        };
    }

    /**
     * Filters MCP servers based on model compatibility
     */
    private static filterMCPServersForModel(mcpServers: MCPServerConfig[], selectedModel: string): MCPServerConfig[] {
        // Disable MCP servers for DeepSeek R1 models
        const disabledModels = [
            "openrouter/deepseek/deepseek-r1",
            "openrouter/deepseek/deepseek-r1-0528",
            "openrouter/deepseek/deepseek-r1-0528-qwen3-8b"
        ];

        if (disabledModels.includes(selectedModel)) {
            return [];
        }

        return mcpServers;
    }

    /**
     * Creates the appropriate transport for an MCP server
     */
    private static async createTransport(mcpServer: MCPServerConfig, requestId: string): Promise<Transport> {
        switch (mcpServer.type) {
            case 'sse':
                return this.createSSETransport(mcpServer, requestId);
            case 'stdio':
                return await this.createStdioTransport(mcpServer, requestId);
            case 'streamable-http':
                return this.createStreamableHTTPTransport(mcpServer, requestId);
            default:
                throw new Error(`Unsupported MCP transport type: ${mcpServer.type}`);
        }
    }

    /**
     * Creates SSE transport
     */
    private static createSSETransport(mcpServer: MCPServerConfig, requestId: string): Transport {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
            mcpServer.headers.forEach(header => {
                if (header.key) headers[header.key] = header.value || '';
            });
        }

        logDiagnostic('MCP_SSE_TRANSPORT', 'Creating SSE transport', {
            requestId,
            url: mcpServer.url,
            headerCount: Object.keys(headers).length
        });

        return new SSEClientTransport(
            new URL(mcpServer.url),
            Object.keys(headers).length > 0 ? {
                requestInit: { headers }
            } : undefined
        );
    }

    /**
     * Creates Stdio transport with package installation if needed
     */
    private static async createStdioTransport(mcpServer: MCPServerConfig, requestId: string): Promise<Transport> {
        if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
            throw new Error("Missing command or args for stdio MCP server");
        }

        const env: Record<string, string> = {};
        if (mcpServer.env && mcpServer.env.length > 0) {
            mcpServer.env.forEach(envVar => {
                if (envVar.key) env[envVar.key] = envVar.value || '';
            });
        }

        // Handle uvx pattern
        if (mcpServer.command === 'uvx') {
            await this.ensureUvInstalled(requestId);
        }
        // Handle python package installation
        else if (mcpServer.command.includes('python3')) {
            await this.installPythonPackage(mcpServer.args, requestId);
        }

        logDiagnostic('MCP_STDIO_TRANSPORT', 'Creating Stdio transport', {
            requestId,
            command: mcpServer.command,
            argsCount: mcpServer.args.length,
            envCount: Object.keys(env).length
        });

        // Ensure child process inherits PATH and other important env vars
        const spawnEnv = Object.keys(env).length > 0 
            ? { ...process.env, ...env } 
            : process.env;

        return new StdioClientTransport({
            command: mcpServer.command,
            args: mcpServer.args,
            env: spawnEnv as Record<string, string>
        });
    }

    /**
     * Creates StreamableHTTP transport
     */
    private static createStreamableHTTPTransport(mcpServer: MCPServerConfig, requestId: string): Transport {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
            mcpServer.headers.forEach(header => {
                if (header.key) headers[header.key] = header.value || '';
            });
        }

        logDiagnostic('MCP_HTTP_TRANSPORT', 'Creating StreamableHTTP transport', {
            requestId,
            url: mcpServer.url,
            headerCount: Object.keys(headers).length
        });

        const transportUrl = new URL(mcpServer.url);
        // Let the SDK handle protocol version negotiation automatically
        return new StreamableHTTPClientTransport(transportUrl, 
            Object.keys(headers).length > 0 ? {
                requestInit: {
                    headers: headers
                }
            } : undefined
        );
    }

    /**
     * Ensures uv is installed for uvx commands
     */
    private static async ensureUvInstalled(requestId: string): Promise<void> {
        logDiagnostic('MCP_UV_INSTALL', 'Ensuring uv is installed', { requestId });

        return new Promise<void>((resolve) => {
            const installUvSubprocess = spawn('pip3', ['install', 'uv']);

            let uvInstallStdout = '';
            let uvInstallStderr = '';

            installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
            installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });

            installUvSubprocess.on('close', (code: number) => {
                if (code !== 0) {
                    logDiagnostic('MCP_UV_INSTALL_ERROR', 'Failed to install uv using pip3', {
                        requestId,
                        exitCode: code,
                        stderr: uvInstallStderr
                    });
                } else {
                    logDiagnostic('MCP_UV_INSTALL_SUCCESS', 'uv installed successfully', { requestId });
                }
                resolve();
            });

            installUvSubprocess.on('error', (err) => {
                logDiagnostic('MCP_UV_INSTALL_ERROR', 'Error spawning pip3 to install uv', {
                    requestId,
                    error: err.message
                });
                resolve();
            });
        });
    }

    /**
     * Installs Python package for python3 commands
     */
    private static async installPythonPackage(args: string[], requestId: string): Promise<void> {
        const packageName = args[args.indexOf('-m') + 1];

        if (!packageName) {
            logDiagnostic('MCP_PYTHON_INSTALL_SKIP', 'No package name found in python args', { requestId });
            return;
        }

        logDiagnostic('MCP_PYTHON_INSTALL', 'Installing Python package using uv', {
            requestId,
            packageName
        });

        return new Promise<void>((resolve) => {
            const subprocess = spawn('uv', ['pip', 'install', packageName]);

            subprocess.on('close', (code: number) => {
                if (code !== 0) {
                    logDiagnostic('MCP_PYTHON_INSTALL_ERROR', 'Failed to install Python package', {
                        requestId,
                        packageName,
                        exitCode: code
                    });
                } else {
                    logDiagnostic('MCP_PYTHON_INSTALL_SUCCESS', 'Python package installed successfully', {
                        requestId,
                        packageName
                    });
                }
                resolve();
            });

            subprocess.on('error', (err) => {
                logDiagnostic('MCP_PYTHON_INSTALL_ERROR', 'Error installing Python package', {
                    requestId,
                    packageName,
                    error: err.message
                });
                resolve();
            });
        });
    }
}