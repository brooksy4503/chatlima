import { ChatMCPServerService, MCPServerContext } from '../chatMCPServerService';

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
    Client: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
    SSEClientTransport: jest.fn().mockImplementation(function (this: unknown) {
        return {};
    }),
}));

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
    StdioClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
    StreamableHTTPClientTransport: jest.fn(),
}));

jest.mock('child_process', () => ({
    spawn: jest.fn(),
}));

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { logDiagnostic } from '@/lib/utils/performantLogging';

describe('ChatMCPServerService', () => {
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;
    const MockClient = Client as jest.MockedClass<typeof Client>;

    beforeEach(() => {
        jest.clearAllMocks();
        MockClient.mockImplementation(
            () =>
                ({
                    connect: jest.fn().mockResolvedValue(undefined),
                    listTools: jest.fn().mockResolvedValue({
                        tools: [
                            {
                                name: 'tool1',
                                description: 'd',
                                inputSchema: { type: 'object', properties: {} },
                            },
                        ],
                    }),
                    close: jest.fn().mockResolvedValue(undefined),
                }) as any
        );
    });

    const createMockContext = (overrides: Partial<MCPServerContext> = {}): MCPServerContext => ({
        mcpServers: [
            {
                url: 'http://localhost:3000',
                type: 'sse',
                headers: [{ key: 'Authorization', value: 'Bearer token' }],
            },
        ],
        selectedModel: 'openai/gpt-4',
        ...overrides,
    });

    describe('initializeMCPServers', () => {
        it('initializes SSE server and runs cleanup', async () => {
            const context = createMockContext();
            const result = await ChatMCPServerService.initializeMCPServers(context);

            expect(MockClient).toHaveBeenCalled();
            expect(result.mcpClients.length).toBe(1);
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_INIT_START',
                'Starting MCP server initialization',
                expect.objectContaining({ serverCount: 1, selectedModel: 'openai/gpt-4' })
            );

            await result.cleanup();
            const instance = MockClient.mock.results[0]?.value as { close: jest.Mock };
            expect(instance.close).toHaveBeenCalled();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_CLEANUP_START',
                'Starting MCP client cleanup',
                expect.objectContaining({ clientCount: 1 })
            );
        });

        it('filters out MCP servers for DeepSeek R1 models', async () => {
            const result = await ChatMCPServerService.initializeMCPServers(
                createMockContext({ selectedModel: 'openrouter/deepseek/deepseek-r1' })
            );

            expect(result.tools).toEqual({});
            expect(result.mcpClients).toEqual([]);
            expect(MockClient).not.toHaveBeenCalled();
        });

        it('returns empty result when no servers configured', async () => {
            const result = await ChatMCPServerService.initializeMCPServers(
                createMockContext({ mcpServers: [] })
            );

            expect(result).toMatchObject({ tools: {}, mcpClients: [] });
        });

        it('logs MCP_SERVER_ERROR when stdio transport is misconfigured', async () => {
            await ChatMCPServerService.initializeMCPServers(
                createMockContext({
                    mcpServers: [{ url: 'stdio://test', type: 'stdio', args: ['test'] }],
                })
            );

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_SERVER_ERROR',
                'Failed to initialize MCP client',
                expect.objectContaining({
                    error: 'Missing command or args for stdio MCP server',
                })
            );
        });

        it('logs MCP_SERVER_ERROR for unsupported transport type', async () => {
            await ChatMCPServerService.initializeMCPServers(
                createMockContext({
                    mcpServers: [{ url: 'unknown://test', type: 'unknown' as any }],
                })
            );

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_SERVER_ERROR',
                'Failed to initialize MCP client',
                expect.objectContaining({
                    error: 'Unsupported MCP transport type: unknown',
                })
            );
        });

        it('logs MCP_CLEANUP_ERROR when client.close fails', async () => {
            MockClient.mockImplementation(
                () =>
                    ({
                        connect: jest.fn().mockResolvedValue(undefined),
                        listTools: jest.fn().mockResolvedValue({ tools: [] }),
                        close: jest.fn().mockRejectedValue(new Error('Cleanup failed')),
                    }) as any
            );

            const result = await ChatMCPServerService.initializeMCPServers(createMockContext());
            await result.cleanup();

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'MCP_CLEANUP_ERROR',
                'Error closing MCP client',
                expect.objectContaining({ error: 'Cleanup failed' })
            );
        });
    });
});
