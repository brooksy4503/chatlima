/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/mcp/oauth/proxy/route';
import { auth } from '@/lib/auth';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/webFetchService', () => {
  // Stub the two guards the route uses. By default they pass through; tests
  // override validateAndNormalizeUrl to echo input and assertPublicUrl to
  // reject blocked hosts.
  const actual: any = jest.requireActual('@/lib/services/webFetchService');
  return {
    ...actual,
    WebFetchService: {
      ...actual.WebFetchService,
      validateAndNormalizeUrl: jest.fn((url: string) => url),
      assertPublicUrl: jest.fn().mockResolvedValue(undefined),
    },
    WebFetchError: actual.WebFetchError,
  };
});

const mockGetSession = auth.api.getSession as unknown as jest.Mock;
const mockValidate = WebFetchService.validateAndNormalizeUrl as jest.Mock;
const mockAssertPublic = WebFetchService.assertPublicUrl as jest.Mock;

const originalFetch = globalThis.fetch;

function blockHost(blockedUrlSubstring: string) {
  // Make assertPublicUrl reject when the URL contains the given substring.
  mockAssertPublic.mockImplementation(async (url: string) => {
    if (url.includes(blockedUrlSubstring)) {
      throw new WebFetchError(
        'WEB_FETCH_FORBIDDEN_HOST',
        'Local and private network hosts are not allowed.',
        403,
      );
    }
  });
}

function mockFetchJson(status: number, body: unknown) {
  (globalThis.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

function buildGetRequest(url: string) {
  return new NextRequest(`http://localhost/api/mcp/oauth/proxy?url=${encodeURIComponent(url)}`, {
    method: 'GET',
  });
}

function buildPostRequest(url: string, body: unknown) {
  return new NextRequest(`http://localhost/api/mcp/oauth/proxy?url=${encodeURIComponent(url)}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('MCP OAuth proxy SSRF guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockValidate.mockImplementation((url: string) => url);
    mockAssertPublic.mockResolvedValue(undefined);
    mockFetchJson(200, { issuer: 'https://example.com' });
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns 401 when unauthenticated (GET)', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET(
      buildGetRequest('https://example.com/.well-known/oauth-authorization-server'),
    );

    expect(response.status).toBe(401);
    // SSRF guard must NOT even run for unauthenticated callers.
    expect(mockAssertPublic).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated (POST)', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(
      buildPostRequest('https://example.com/api/auth/mcp/register', { foo: 'bar' }),
    );

    expect(response.status).toBe(401);
    expect(mockAssertPublic).not.toHaveBeenCalled();
  });

  it('returns 403 for a cloud-metadata IP (GET)', async () => {
    blockHost('169.254.169.254');

    const response = await GET(
      buildGetRequest('http://169.254.169.254/.well-known/oauth-authorization-server'),
    );

    expect(response.status).toBe(403);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns 403 for localhost (GET)', async () => {
    blockHost('localhost');

    const response = await GET(
      buildGetRequest('http://localhost:3000/.well-known/oauth-authorization-server'),
    );

    expect(response.status).toBe(403);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('rejects a bypass-attempt pathname with 400 (exact-match gate)', async () => {
    // The old substring `includes('/.well-known/oauth')` accepted this path;
    // the tightened exact-match gate must reject it.
    const response = await GET(
      buildGetRequest('https://example.com/.well-known/oauth-anything'),
    );

    expect(response.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('proxies a valid public OAuth metadata URL (GET)', async () => {
    mockFetchJson(200, { issuer: 'https://example.com' });

    const response = await GET(
      buildGetRequest('https://example.com/.well-known/oauth-authorization-server'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ issuer: 'https://example.com' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      method: 'GET',
      redirect: 'manual',
    });
  });

  it('proxies a valid public registration endpoint (POST) and rejects private POST', async () => {
    mockFetchJson(200, { client_id: 'abc' });

    const response = await POST(
      buildPostRequest('https://example.com/api/auth/mcp/register', {
        client_name: 'test',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ client_id: 'abc' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      redirect: 'manual',
    });

    // Private host on POST -> 403, no fetch.
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockValidate.mockImplementation((url: string) => url);
    blockHost('192.168.1.5');

    const blocked = await POST(
      buildPostRequest('http://192.168.1.5/api/auth/mcp/register', { x: 1 }),
    );
    expect(blocked.status).toBe(403);
  });

  it('POST rejects non-register pathnames even on a public host', async () => {
    const response = await POST(
      buildPostRequest('https://example.com/.well-known/oauth-authorization-server', { x: 1 }),
    );

    expect(response.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
