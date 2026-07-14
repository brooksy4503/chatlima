import { spawn } from 'child_process';
import {
  ChatMCPServerService,
  resolvePythonModulePackageName,
} from '@/lib/services/chatMCPServerService';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn().mockImplementation((config) => config),
}));

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: jest.fn(),
}));

jest.mock('@/lib/utils/performantLogging', () => ({
  logDiagnostic: jest.fn(),
}));

describe('resolvePythonModulePackageName', () => {
  it('returns module name when -m flag is present', () => {
    expect(resolvePythonModulePackageName(['-m', 'mcp_server'])).toBe('mcp_server');
  });

  it('returns null for script-based python args without -m', () => {
    expect(resolvePythonModulePackageName(['/path/to/server.py'])).toBeNull();
  });

  it('returns null when -m is the final arg', () => {
    expect(resolvePythonModulePackageName(['-m'])).toBeNull();
  });
});

describe('ChatMCPServerService python verify-only', () => {
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies python module import when args use python -m module', async () => {
    const mockSubprocess = {
      on: jest.fn((event: string, handler: (value?: unknown) => void) => {
        if (event === 'close') {
          handler(0);
        }
      }),
    };
    mockSpawn.mockReturnValue(mockSubprocess as never);

    const createStdioTransport = (ChatMCPServerService as unknown as {
      createTransport: (server: unknown, requestId: string) => Promise<unknown>;
    }).createTransport;

    await createStdioTransport.call(ChatMCPServerService, {
      type: 'stdio',
      url: '',
      command: 'python3',
      args: ['-m', 'mcp_server'],
    }, 'req-1');

    expect(mockSpawn).toHaveBeenCalledWith('python3', ['-c', 'import mcp_server']);
    expect(mockSpawn).not.toHaveBeenCalledWith('uv', expect.any(Array));
  });

  it('skips verify for script-based python args', async () => {
    const createStdioTransport = (ChatMCPServerService as unknown as {
      createTransport: (server: unknown, requestId: string) => Promise<unknown>;
    }).createTransport;

    await createStdioTransport.call(ChatMCPServerService, {
      type: 'stdio',
      url: '',
      command: 'python3',
      args: ['/path/to/server.py'],
    }, 'req-2');

    expect(mockSpawn).not.toHaveBeenCalled();
  });
});
