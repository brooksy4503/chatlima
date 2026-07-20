/**
 * @jest-environment node
 *
 * Regression tests for the MCP streamable-http / sse SSRF fix (Plan 003).
 *
 * `mcpServer.url` comes straight from the /api/chat request body. Before this
 * fix, a client could point an MCP HTTP/SSE transport at a private IP,
 * localhost, or cloud-metadata endpoint and the server would connect to it
 * (and, for streamable-http, attach an attacker-chosen Bearer token). These
 * tests assert that:
 *
 * 1. A streamable-http config pointed at a cloud-metadata IP is rejected
 *    (throws MCP_URL_BLOCKED) and StreamableHTTPClientTransport is never built.
 * 2. An sse config pointed at localhost is rejected and SSEClientTransport is
 *    never built.
 * 3. A streamable-http config pointed at a public https URL is accepted, and
 *    the transport IS constructed (with a guarded fetch injected).
 */
import { ChatMCPServerService } from '@/lib/services/chatMCPServerService';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';

// Mock the MCP SDK transports so the test can assert whether they were
// constructed. If the guard were removed, the constructor WOULD be called.
jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn(),
}));

// Mock the MCP Client so initializeMCPServers can attempt connect() without a
// real server. connect() resolves so the failure is observable only via the
// transport constructor not being called (for the rejection cases) or the
// public-URL case proceeding.
jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    listTools: jest.fn().mockResolvedValue({ tools: [] }),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('@/lib/utils/performantLogging', () => ({
  logDiagnostic: jest.fn(),
}));

// Import after mocks are registered.
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MockedSSE = SSEClientTransport as unknown as jest.Mock;
const MockedStreamable = StreamableHTTPClientTransport as unknown as jest.Mock;

describe('MCP HTTP/SSE transport SSRF guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // validateAndNormalizeUrl is a passthrough by default; assertPublicUrl
    // passes by default. Individual tests override assertPublicUrl to drive
    // the blocked-host behavior.
    jest
      .spyOn(WebFetchService, 'validateAndNormalizeUrl')
      .mockImplementation((url: string) => url);
    jest.spyOn(WebFetchService, 'assertPublicUrl').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects a streamable-http config pointed at cloud-metadata and never builds the transport', async () => {
    (WebFetchService.assertPublicUrl as jest.Mock).mockImplementation(async (url: string) => {
      if (url.includes('169.254.169.254')) {
        throw new WebFetchError(
          'WEB_FETCH_FORBIDDEN_HOST',
          'Local and private network hosts are not allowed.',
          403,
        );
      }
    });

    await expect(
      ChatMCPServerService.initializeMCPServers({
        mcpServers: [
          { type: 'streamable-http', url: 'http://169.254.169.254/latest/meta-data/' },
        ],
        selectedModel: 'openai/gpt-4',
      }),
    ).rejects.toThrow(/MCP_URL_BLOCKED/);

    expect(MockedStreamable).not.toHaveBeenCalled();
  });

  it('rejects an sse config pointed at localhost and never builds the transport', async () => {
    (WebFetchService.assertPublicUrl as jest.Mock).mockImplementation(async (url: string) => {
      if (url.includes('localhost')) {
        throw new WebFetchError(
          'WEB_FETCH_FORBIDDEN_HOST',
          'Local and private network hosts are not allowed.',
          403,
        );
      }
    });

    await expect(
      ChatMCPServerService.initializeMCPServers({
        mcpServers: [{ type: 'sse', url: 'http://localhost:3000/sse' }],
        selectedModel: 'openai/gpt-4',
      }),
    ).rejects.toThrow(/MCP_URL_BLOCKED/);

    expect(MockedSSE).not.toHaveBeenCalled();
  });

  it('accepts a streamable-http config pointed at a public https URL', async () => {
    // assertPublicUrl passes by default (public host).
    await ChatMCPServerService.initializeMCPServers({
      mcpServers: [{ type: 'streamable-http', url: 'https://example.com/mcp' }],
      selectedModel: 'openai/gpt-4',
    });

    expect(MockedStreamable).toHaveBeenCalledTimes(1);
    // A guarded fetch must be injected (the options object passed to the
    // transport must include a `fetch` function).
    const optionsArg = MockedStreamable.mock.calls[0][1];
    expect(typeof optionsArg.fetch).toBe('function');
  });

  it('accepts an sse config pointed at a public https URL and injects a guarded fetch', async () => {
    await ChatMCPServerService.initializeMCPServers({
      mcpServers: [{ type: 'sse', url: 'https://example.com/sse' }],
      selectedModel: 'openai/gpt-4',
    });

    expect(MockedSSE).toHaveBeenCalledTimes(1);
    const optionsArg = MockedSSE.mock.calls[0][1];
    expect(typeof optionsArg.fetch).toBe('function');
    // The SSE GET stream uses eventSourceInit.fetch.
    expect(typeof optionsArg.eventSourceInit?.fetch).toBe('function');
  });
});
