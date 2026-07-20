import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import { spawn } from "child_process";
import { logDiagnostic } from '@/lib/utils/performantLogging';
import { tool, jsonSchema } from 'ai';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';

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
    useOAuth?: boolean;
    id?: string;  // Server ID for OAuth token lookup
    oauthTokens?: {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
    };
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
                                inputSchema: jsonSchema(mcpTool.inputSchema || { type: 'object', properties: {} }),
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
                // Security guards (e.g. MCP_STDIO_BLOCKED, MCP_URL_BLOCKED) must
                // fail the entire request rather than silently skip the offending
                // server.
                if (
                    error instanceof Error &&
                    (error.message.startsWith('MCP_STDIO_BLOCKED') ||
                        error.message.startsWith('MCP_URL_BLOCKED'))
                ) {
                    throw error;
                }
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
                // Authoritative security guard: client-supplied stdio configs would
                // spawn arbitrary server-side processes (RCE). This must fail the
                // request, not silently skip the server. The parser also strips
                // stdio entries; this guard protects any caller that bypasses it.
                logDiagnostic('MCP_STDIO_BLOCKED', 'Rejected client-supplied stdio MCP config', { requestId });
                throw new Error('MCP_STDIO_BLOCKED: stdio MCP servers are not permitted from client requests.');
            case 'streamable-http':
                return this.createStreamableHTTPTransport(mcpServer, requestId);
            default:
                throw new Error(`Unsupported MCP transport type: ${mcpServer.type}`);
        }
    }

    /**
     * Creates SSE transport
     */
    private static async createSSETransport(mcpServer: MCPServerConfig, requestId: string): Promise<Transport> {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
            mcpServer.headers.forEach(header => {
                if (header.key) headers[header.key] = header.value || '';
            });
        }

        // SSRF guard: validate the URL (and resolve its DNS) before handing it
        // to the transport. Throws MCP_URL_BLOCKED on a private/blocked host,
        // which the dispatcher rethrows to fail the whole request.
        const transportUrl = await this.assertSafeMcpUrl(mcpServer.url, requestId);

        logDiagnostic('MCP_SSE_TRANSPORT', 'Creating SSE transport', {
            requestId,
            url: mcpServer.url,
            headerCount: Object.keys(headers).length
        });

        const guardedFetch = this.createGuardedFetch(requestId);

        // Inject the guarded fetch into BOTH the EventSource (SSE GET stream)
        // via eventSourceInit.fetch and the recurring POST requests via fetch.
        // The SDK's SSEClientTransport reads eventSourceInit.fetch first, then
        // the top-level fetch option, for the GET stream; the top-level fetch
        // is used for POSTs.
        return new SSEClientTransport(
            transportUrl,
            {
                ...(Object.keys(headers).length > 0 ? { requestInit: { headers } } : {}),
                fetch: guardedFetch,
                eventSourceInit: { fetch: guardedFetch } as any,
            },
        );
    }

    /**
     * Validates an MCP server URL through the same WebFetchService SSRF guard
     * used by web_fetch (localhost, private IPv4 ranges, cloud-metadata
     * 169.254.0.0/16, CGN 100.64.0.0/10, IPv6 ULA/link-local, embedded
     * credentials, DNS resolution). Throws a typed MCP_URL_BLOCKED error so
     * the dispatcher can fail the request rather than silently skip the server.
     *
     * NOTE (residual DNS-rebind risk): this resolves DNS once at call time. A
     * transport that opened its own connection later could be pivoted to a
     * private IP if the attacker flipped their DNS between this resolution and
     * the transport's. We close that gap by ALSO injecting a guarded fetch
     * (createGuardedFetch) into the transports that re-runs assertPublicUrl on
     * every outbound request, so a rebind is caught at connection time.
     */
    private static async assertSafeMcpUrl(rawUrl: string, requestId: string): Promise<URL> {
        try {
            const normalized = WebFetchService.validateAndNormalizeUrl(rawUrl);
            await WebFetchService.assertPublicUrl(normalized);
            return new URL(normalized);
        } catch (error) {
            if (error instanceof WebFetchError) {
                logDiagnostic('MCP_URL_BLOCKED', 'Rejected MCP server URL (SSRF guard)', {
                    requestId,
                    url: rawUrl,
                    code: error.code,
                });
                throw new Error(
                    `MCP_URL_BLOCKED: MCP server URL is not allowed (${error.code}).`,
                );
            }
            throw error;
        }
    }

    /**
     * Returns a fetch wrapper that re-runs the SSRF guard (validateAndNormalizeUrl
     * + assertPublicUrl) on the request URL of every outbound call. This is
     * injected into the SDK transports' `fetch` option so that a DNS rebind
     * between assertSafeMcpUrl's pre-validation and the transport's actual
     * connection is caught at request time. Non-numeric hosts are re-resolved
     * by assertPublicUrl, so a record that flips to a private IP is rejected.
     */
    private static createGuardedFetch(requestId: string): (url: string | URL, init?: RequestInit) => Promise<Response> {
        return async (url: string | URL, init?: RequestInit) => {
            const urlString = typeof url === 'string' ? url : url.toString();
            try {
                const normalized = WebFetchService.validateAndNormalizeUrl(urlString);
                await WebFetchService.assertPublicUrl(normalized);
            } catch (error) {
                const code = error instanceof WebFetchError ? error.code : 'UNKNOWN';
                logDiagnostic('MCP_URL_BLOCKED', 'Rejected outbound MCP fetch (SSRF guard)', {
                    requestId,
                    url: urlString,
                    code,
                });
                throw new Error(
                    `MCP_URL_BLOCKED: outbound MCP request to a non-public host was rejected (${code}).`,
                );
            }
            return fetch(urlString, init);
        };
    }

    /**
     * Creates Stdio transport after verifying runtime dependencies (no install-on-request).
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
            await this.verifyUvAvailable(requestId);
        }
        else if (mcpServer.command.includes('python3')) {
            await this.verifyPythonModuleFromArgs(mcpServer.args, requestId);
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
    private static async createStreamableHTTPTransport(mcpServer: MCPServerConfig, requestId: string): Promise<Transport> {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
            mcpServer.headers.forEach(header => {
                if (header.key) headers[header.key] = header.value || '';
            });
        }

        // If OAuth is enabled and tokens are provided, use Bearer token in headers
        if (mcpServer.useOAuth && mcpServer.oauthTokens?.access_token) {
            headers['Authorization'] = `Bearer ${mcpServer.oauthTokens.access_token}`;
            logDiagnostic('MCP_HTTP_TRANSPORT_OAUTH', 'Creating StreamableHTTP transport with OAuth token', {
                requestId,
                url: mcpServer.url,
                hasToken: true
            });
        }

        // SSRF guard: validate the URL before constructing the transport.
        // Throws MCP_URL_BLOCKED on a private/blocked host.
        const transportUrl = await this.assertSafeMcpUrl(mcpServer.url, requestId);

        logDiagnostic('MCP_HTTP_TRANSPORT', 'Creating StreamableHTTP transport', {
            requestId,
            url: mcpServer.url,
            headerCount: Object.keys(headers).length,
            useOAuth: mcpServer.useOAuth || false
        });

        // Inject a guarded fetch so every outbound request (including any the
        // transport makes after connect) is re-validated against the SSRF
        // blocklist, closing the DNS-rebind residual noted in assertSafeMcpUrl.
        const guardedFetch = this.createGuardedFetch(requestId);

        // For OAuth, we use headers with Bearer token instead of authProvider
        // because authProvider requires browser redirects which don't work server-side
        // The OAuth flow is handled on the client side, and tokens are passed to the server
        return new StreamableHTTPClientTransport(transportUrl,
            Object.keys(headers).length > 0 ? {
                requestInit: {
                    headers: headers
                },
                fetch: guardedFetch,
            } : { fetch: guardedFetch }
        );
    }

    private static commandExists(command: string): Promise<boolean> {
        return new Promise((resolve) => {
            const check = spawn('which', [command]);
            check.on('close', (code) => resolve(code === 0));
            check.on('error', () => resolve(false));
        });
    }

    private static async verifyUvAvailable(requestId: string): Promise<void> {
        logDiagnostic('MCP_UV_VERIFY', 'Verifying uv is available on PATH', { requestId });

        const available = await this.commandExists('uv');
        if (!available) {
            throw new Error(
                'MCP stdio server requires `uv` on PATH. Install uv at build/deploy time before using uvx-based MCP servers.'
            );
        }
    }

    private static verifyPythonModuleInstalled(moduleName: string): Promise<boolean> {
        return new Promise((resolve) => {
            const check = spawn('python3', ['-c', `import ${moduleName}`]);
            check.on('close', (code) => resolve(code === 0));
            check.on('error', () => resolve(false));
        });
    }

    private static async verifyPythonModuleFromArgs(args: string[], requestId: string): Promise<void> {
        const packageName = resolvePythonModulePackageName(args);

        if (!packageName) {
            logDiagnostic('MCP_PYTHON_VERIFY_SKIP', 'No package name found in python args (missing -m)', { requestId });
            return;
        }

        logDiagnostic('MCP_PYTHON_VERIFY', 'Verifying Python module is importable', {
            requestId,
            packageName,
        });

        const available = await this.verifyPythonModuleInstalled(packageName);
        if (!available) {
            throw new Error(
                `MCP stdio server requires Python module "${packageName}" to be pre-installed. Install it at build/deploy time.`
            );
        }
    }
}

/** Resolve `python3 -m <package>` module name; returns null for script-based invocations. */
export function resolvePythonModulePackageName(args: string[]): string | null {
    const mIndex = args.indexOf('-m');
    if (mIndex === -1 || mIndex + 1 >= args.length) {
        return null;
    }

    const packageName = args[mIndex + 1];
    return packageName || null;
}