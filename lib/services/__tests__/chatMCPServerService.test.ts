import { ChatMCPServerService, MCPServerContext } from '../chatMCPServerService';

// Mock dependencies
jest.mock('ai', () => ({
    experimental_createMCPClient: jest.fn()
}));

jest.mock('ai/mcp-stdio', () => ({
    Experimental_StdioMCPTransport: jest.fn()
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
    StreamableHTTPClientTransport: jest.fn()
}));

jest.mock('child_process', () => ({
    spawn: jest.fn()
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from 'child_process';
import { logDiagnostic } from '@/lib/utils/performantLogging';

describe('ChatMCPServerService', () => {
    const mockCreateMCPClient = experimental_createMCPClient as jest.MockedFunction<typeof experimental_createMCPClient>;
    const mockStdioTransport = Experimental_StdioMCPTransport as jest.Mock;
    const mockStreamableHTTPTransport = StreamableHTTPClientTransport as jest.Mock;
    const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockContext = (overrides: Partial<MCPServerContext> = {}): MCPServerContext => ({
        mcpServers: [{
            url: 'http://localhost:3000',
            type: 'sse',
            headers: [{ key: 'Authorization', value: 'Bearer token' }]
        }],
        selectedModel: 'openai/gpt-4',
        ...overrides
    });

    const createMockMCPClient = () => ({
      tools: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined)
    } as any);

    describe('initializeMCPServers', () => {
        it('should initialize MCP servers successfully', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();
            const mockTools = { tool1: 'tool1', tool2: 'tool2' };

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue(mockTools);

            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(result).toEqual({
                tools: mockTools,
                mcpClients: [mockClient],
                cleanup: expect.any(Function)
            });

            expect(mockCreateMCPClient).toHaveBeenCalled();
            expect(mockClient.tools).toHaveBeenCalled();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_INIT_START',
                'Starting MCP server initialization',
                expect.objectContaining({ serverCount: 1, selectedModel: 'openai/gpt-4' })
            );
        });

        it('should filter out MCP servers for DeepSeek R1 models', async () => {
            const context = createMockContext({
                selectedModel: 'openrouter/deepseek/deepseek-r1'
            });

            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(result).toEqual({
                tools: {},
                mcpClients: [],
                cleanup: expect.any(Function)
            });

            expect(mockCreateMCPClient).not.toHaveBeenCalled();
        });

        it('should return empty result when no servers configured', async () => {
            const context = createMockContext({ mcpServers: [] });

            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(result).toEqual({
                tools: {},
                mcpClients: [],
                cleanup: expect.any(Function)
            });
        });

        it('should handle MCP client creation errors gracefully', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockRejectedValue(new Error('Connection failed'));
            mockClient.tools.mockResolvedValue({});

            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(result).toEqual({
                tools: {},
                mcpClients: [],
                cleanup: expect.any(Function)
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_SERVER_ERROR',
                'Failed to initialize MCP client',
                expect.objectContaining({
                    type: 'sse',
                    error: 'Connection failed'
                })
            );
        });

        it('should handle MCP tools loading errors', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockRejectedValue(new Error('Tools loading failed'));

            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(result).toEqual({
                tools: {},
                mcpClients: [mockClient],
                cleanup: expect.any(Function)
            });
        });

        it('should create SSE transport correctly', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});

            await ChatMCPServerService.initializeMCPServers(context);

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_SSE_TRANSPORT',
                'Creating SSE transport',
                expect.objectContaining({
                    url: 'http://localhost:3000',
                    headerCount: 1
                })
            );
        });

        it('should create Stdio transport correctly', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'stdio://python',
                    type: 'stdio',
                    command: 'python3',
                    args: ['-m', 'mcp_server']
                }]
            });
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockStdioTransport.mockReturnValue({} as any);

            await ChatMCPServerService.initializeMCPServers(context);

            expect(mockStdioTransport).toHaveBeenCalledWith({
                command: 'python3',
                args: ['-m', 'mcp_server'],
                env: undefined
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_STDIO_TRANSPORT',
                'Creating Stdio transport',
                expect.objectContaining({
                    command: 'python3',
                    argsCount: 2,
                    envCount: 0
                })
            );
        });

        it('should create StreamableHTTP transport correctly', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'http://localhost:8080',
                    type: 'streamable-http',
                    headers: [{ key: 'Authorization', value: 'Bearer token' }]
                }]
            });
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockStreamableHTTPTransport.mockReturnValue({} as any);

            await ChatMCPServerService.initializeMCPServers(context);

            expect(mockStreamableHTTPTransport).toHaveBeenCalledWith(
                expect.any(URL),
                {
                    requestInit: {
                        headers: {
                            'MCP-Protocol-Version': '2025-06-18',
                            'Authorization': 'Bearer token'
                        }
                    }
                }
            );

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_HTTP_TRANSPORT',
                'Creating StreamableHTTP transport',
                expect.objectContaining({
                    url: 'http://localhost:8080',
                    headerCount: 1
                })
            );
        });

        it('should handle uvx command installation', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'stdio://uvx',
                    type: 'stdio',
                    command: 'uvx',
                    args: ['run', 'mcp-server']
                }]
            });
            const mockClient = createMockMCPClient();
            const mockSubprocess = {
                stdout: { on: jest.fn() },
                stderr: { on: jest.fn() },
                on: jest.fn()
            };

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockStdioTransport.mockReturnValue({} as any);
            mockSpawn.mockReturnValue(mockSubprocess as any);
            mockSubprocess.on.mockImplementation((event, callback) => {
                if (event === 'close') callback(0);
            });

            await ChatMCPServerService.initializeMCPServers(context);

            expect(mockSpawn).toHaveBeenCalledWith('pip3', ['install', 'uv']);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_UV_INSTALL',
                'Ensuring uv is installed',
                expect.any(Object)
            );
        });

        it('should handle Python package installation', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'stdio://python',
                    type: 'stdio',
                    command: 'python3',
                    args: ['-m', 'mcp_server']
                }]
            });
            const mockClient = createMockMCPClient();
            const mockSubprocess = {
                on: jest.fn()
            };

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockStdioTransport.mockReturnValue({} as any);
            mockSpawn.mockReturnValue(mockSubprocess as any);
            mockSubprocess.on.mockImplementation((event, callback) => {
                if (event === 'close') callback(0);
            });

            await ChatMCPServerService.initializeMCPServers(context);

            expect(mockSpawn).toHaveBeenCalledWith('uv', ['pip', 'install', 'mcp_server']);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_PYTHON_INSTALL',
                'Installing Python package using uv',
                expect.objectContaining({ packageName: 'mcp_server' })
            );
        });

        it('should throw error for unsupported transport type', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'unknown://test',
                    type: 'unknown' as any
                }]
            });

            await expect(ChatMCPServerService.initializeMCPServers(context))
                .rejects.toThrow('Unsupported MCP transport type: unknown');
        });

        it('should throw error for stdio transport without command', async () => {
            const context = createMockContext({
                mcpServers: [{
                    url: 'stdio://test',
                    type: 'stdio',
                    args: ['test']
                }]
            });

            await expect(ChatMCPServerService.initializeMCPServers(context))
                .rejects.toThrow('Missing command or args for stdio MCP server');
        });

        it('should call cleanup function correctly', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockClient.close.mockResolvedValue();

            const result = await ChatMCPServerService.initializeMCPServers(context);
            await result.cleanup();

            expect(mockClient.close).toHaveBeenCalled();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_CLEANUP_START',
                'Starting MCP client cleanup',
                expect.objectContaining({ clientCount: 1 })
            );
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_CLEANUP_COMPLETE',
                'MCP client cleanup completed',
                expect.any(Object)
            );
        });

        it('should handle cleanup errors gracefully', async () => {
            const context = createMockContext();
            const mockClient = createMockMCPClient();

            mockCreateMCPClient.mockResolvedValue(mockClient);
            mockClient.tools.mockResolvedValue({});
            mockClient.close.mockRejectedValue(new Error('Cleanup failed'));

            const result = await ChatMCPServerService.initializeMCPServers(context);
            await result.cleanup();

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_CLEANUP_ERROR',
                'Error closing MCP client',
                expect.objectContaining({ error: 'Cleanup failed' })
            );
        });
    });
});