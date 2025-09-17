import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from 'child_process';

export interface KeyValuePair {
    key: string;
    value: string;
}

export interface MCPServerConfig {
    type: 'sse' | 'stdio' | 'streamable-http';
    url?: string;
    command?: string;
    args?: string[];
    env?: KeyValuePair[];
    headers?: KeyValuePair[];
}

export interface MCPClientResult {
    clients: any[];
    tools: Record<string, any>;
}

export class MCPService {
    /**
     * Initialize MCP clients from server configurations
     */
    static async initializeMCPServers(
        mcpServers: MCPServerConfig[],
        requestSignal?: AbortSignal
    ): Promise<MCPClientResult> {
        const mcpClients: any[] = [];
        let tools: Record<string, any> = {};

        for (const mcpServer of mcpServers) {
            try {
                // Create appropriate transport based on type
                let finalTransportForClient: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };

                if (mcpServer.type === 'sse') {
                    const headers: Record<string, string> = {};
                    if (mcpServer.headers && mcpServer.headers.length > 0) {
                        mcpServer.headers.forEach(header => {
                            if (header.key) headers[header.key] = header.value || '';
                        });
                    }
                    finalTransportForClient = {
                        type: 'sse' as const,
                        url: mcpServer.url!,
                        headers: Object.keys(headers).length > 0 ? headers : undefined
                    };
                } else if (mcpServer.type === 'streamable-http') {
                    const headers: Record<string, string> = {};
                    if (mcpServer.headers && mcpServer.headers.length > 0) {
                        mcpServer.headers.forEach(header => {
                            if (header.key) headers[header.key] = header.value || '';
                        });
                    }
                    // Use StreamableHTTPClientTransport from @modelcontextprotocol/sdk
                    const transportUrl = new URL(mcpServer.url!);
                    finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
                        // sessionId: nanoid(), // Optionally, provide a session ID if your server uses it
                        requestInit: {
                            headers: {
                                'MCP-Protocol-Version': '2025-06-18', // Required for MCP 1.13.0+
                                ...headers // Spread existing headers after protocol version
                            }
                        }
                    });
                } else if (mcpServer.type === 'stdio') {
                    if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
                        console.warn("Skipping stdio MCP server due to missing command or args");
                        continue;
                    }
                    const env: Record<string, string> = {};
                    if (mcpServer.env && mcpServer.env.length > 0) {
                        mcpServer.env.forEach(envVar => {
                            if (envVar.key) env[envVar.key] = envVar.value || '';
                        });
                    }

                    // Check for uvx pattern
                    if (mcpServer.command === 'uvx') {
                        await this.ensureUvInstalled();
                    }
                    // If python is passed in the command, install the python package mentioned in args after -m
                    else if (mcpServer.command.includes('python3')) {
                        const packageName = mcpServer.args[mcpServer.args.indexOf('-m') + 1];
                        await this.installPythonPackage(packageName);
                    }

                    finalTransportForClient = new StdioMCPTransport({
                        command: mcpServer.command!,
                        args: mcpServer.args!,
                        env: Object.keys(env).length > 0 ? env : undefined
                    });
                } else {
                    console.warn(`Skipping MCP server with unsupported transport type: ${(mcpServer as any).type}`);
                    continue;
                }

                const mcpClient = await createMCPClient({ transport: finalTransportForClient });
                mcpClients.push(mcpClient);

                const mcptools = await mcpClient.tools();

                console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));

                // Add MCP tools to tools object
                tools = { ...tools, ...mcptools };
            } catch (error) {
                console.error("Failed to initialize MCP client:", error);
                // Continue with other servers instead of failing the entire request
                // If any MCP client is essential, we might return an error here:
                // return createErrorResponse("MCP_CLIENT_ERROR", "Failed to initialize a required external tool.", 500, error.message);
            }
        }

        // Register cleanup for all clients
        if (mcpClients.length > 0 && requestSignal) {
            requestSignal.addEventListener('abort', async () => {
                for (const client of mcpClients) {
                    try {
                        await client.close();
                    } catch (error) {
                        console.error('Error closing MCP client:', error);
                    }
                }
            });
        }

        return {
            clients: mcpClients,
            tools
        };
    }

    /**
     * Ensure uv is installed for uvx commands
     */
    private static async ensureUvInstalled(): Promise<void> {
        console.log("Ensuring uv (for uvx) is installed...");
        let uvInstalled = false;
        const installUvSubprocess = spawn('pip3', ['install', 'uv']);

        // Capture output for debugging
        let uvInstallStdout = '';
        let uvInstallStderr = '';
        installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
        installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });

        await new Promise<void>((resolve) => {
            installUvSubprocess.on('close', (code: number) => {
                if (code !== 0) {
                    console.error(`Failed to install uv using pip3: exit code ${code}`);
                    console.error('pip3 stdout:', uvInstallStdout);
                    console.error('pip3 stderr:', uvInstallStderr);
                } else {
                    console.log("uv installed or already present.");
                    if (uvInstallStdout) console.log('pip3 stdout:', uvInstallStdout);
                    if (uvInstallStderr) console.log('pip3 stderr:', uvInstallStderr);
                    uvInstalled = true;
                }
                resolve();
            });
            installUvSubprocess.on('error', (err) => {
                console.error("Error spawning pip3 to install uv:", err);
                resolve(); // Resolve anyway
            });
        });

        if (!uvInstalled) {
            console.warn("Skipping uvx command: Failed to ensure uv installation.");
            throw new Error("Failed to ensure uv installation");
        }

        console.log(`Proceeding to spawn uvx command directly.`);
    }

    /**
     * Install Python package using uv
     */
    private static async installPythonPackage(packageName: string): Promise<void> {
        console.log("Attempting to install python package using uv:", packageName);
        // Use uv to install the package
        const subprocess = spawn('uv', ['pip', 'install', packageName]);

        await new Promise<void>((resolve) => {
            subprocess.on('close', (code: number) => {
                if (code !== 0) {
                    console.error(`Failed to install python package ${packageName} using uv: ${code}`);
                } else {
                    console.log(`Successfully installed python package ${packageName} using uv.`);
                }
                resolve();
            });
            subprocess.on('error', (err) => {
                console.error(`Error installing python package ${packageName}:`, err);
                resolve();
            });
        });
    }

    /**
     * Clean up MCP clients
     */
    static async cleanupClients(clients: any[]): Promise<void> {
        for (const client of clients) {
            try {
                await client.close();
            } catch (error) {
                console.error('Error closing MCP client:', error);
            }
        }
    }
}
