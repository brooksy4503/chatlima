jest.mock("jsdom", () => ({
  JSDOM: class MockJSDOM {
    window: any;

    constructor(html: string, options?: { url?: string }) {
      const baseUrl = options?.url || "https://example.com/";
      const hrefMatches = Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map(
        (match) => match[1],
      );

      this.window = {
        document: {
          title: "Mock Title",
          body: {
            innerHTML: html,
            textContent: "Mock body text",
          },
          querySelectorAll: (selector: string) => {
            if (selector !== "a[href]") return [];
            return hrefMatches.map((href) => ({
              getAttribute: (name: string) => (name === "href" ? href : null),
              href: new URL(href, baseUrl).toString(),
            }));
          },
        },
      };
    }
  },
}));

jest.mock("@mozilla/readability", () => ({
  Readability: class MockReadability {
    parse() {
      const longText = "Readable content from parser. ".repeat(60);
      return {
        title: "Mock Article",
        content: `<h1>Hello</h1><p>${longText}</p>`,
        textContent: longText,
      };
    }
  },
}));

jest.mock("turndown", () => ({
  __esModule: true,
  default: class MockTurndown {
    turndown(input: string) {
      return input;
    }
  },
}));

jest.mock("node:dns/promises", () => ({
  lookup: jest.fn(),
}));

jest.mock("ofetch", () => ({
  ofetch: {
    raw: jest.fn(),
  },
}));

import { lookup } from "node:dns/promises";
import { ofetch } from "ofetch";
import { WebFetchError, WebFetchService } from "../webFetchService";

const mockLookup = lookup as jest.MockedFunction<typeof lookup>;
const mockRaw = ofetch.raw as jest.MockedFunction<typeof ofetch.raw>;

const publicLookup = [{ address: "93.184.216.34", family: 4 }] as any;

const makeRawResponse = (params: {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}) => {
  const status = params.status ?? 200;
  const headers = new Headers(params.headers ?? {});
  return {
    status,
    ok: status >= 200 && status < 300,
    headers,
    _data: params.body ?? "",
  } as any;
};

describe("WebFetchService", () => {
  const basePolicy = {
    ...WebFetchService.getDefaultPolicy(),
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLookup.mockResolvedValue(publicLookup);
  });

  it("blocks requests when feature is disabled", async () => {
    await expect(
      WebFetchService.fetchPage(
        { url: "https://example.com" },
        { ...basePolicy, enabled: false },
      ),
    ).rejects.toMatchObject<WebFetchError>({
      code: "WEB_FETCH_DISABLED",
    });
  });

  it("rejects invalid protocols", async () => {
    await expect(
      WebFetchService.fetchPage({ url: "ftp://example.com" }, basePolicy),
    ).rejects.toMatchObject<WebFetchError>({
      code: "WEB_FETCH_INVALID_URL",
    });
  });

  it("accepts bare domains by defaulting to https", async () => {
    mockRaw.mockResolvedValueOnce(
      makeRawResponse({
        headers: { "content-type": "text/html; charset=utf-8" },
        body: "<html><body><article><p>ok</p></article></body></html>",
      }),
    );

    const result = await WebFetchService.fetchPage(
      { url: "chatlima.com" },
      basePolicy,
    );

    expect(result.finalUrl).toBe("https://chatlima.com/");
  });

  it("rejects localhost hostnames", async () => {
    await expect(
      WebFetchService.fetchPage({ url: "http://localhost:3000" }, basePolicy),
    ).rejects.toMatchObject<WebFetchError>({
      code: "WEB_FETCH_FORBIDDEN_HOST",
    });
  });

  it("rejects unsupported content types", async () => {
    mockRaw.mockResolvedValueOnce(
      makeRawResponse({
        headers: { "content-type": "application/pdf" },
      }),
    );

    await expect(
      WebFetchService.fetchPage({ url: "https://example.com" }, basePolicy),
    ).rejects.toMatchObject<WebFetchError>({
      code: "WEB_FETCH_UNSUPPORTED_CONTENT_TYPE",
    });
  });

  it("returns extracted content and marks truncation", async () => {
    mockRaw.mockResolvedValueOnce(
      makeRawResponse({
        headers: { "content-type": "text/html; charset=utf-8" },
        body: `
          <html>
            <head><title>Example title</title></head>
            <body>
              <article>
                <h1>Hello</h1>
                <p>This is a long paragraph that should be truncated by the cap.</p>
              </article>
            </body>
          </html>
        `,
      }),
    );

    const result = await WebFetchService.fetchPage(
      { url: "https://example.com", maxChars: 500 },
      basePolicy,
    );

    expect(result.finalUrl).toBe("https://example.com/");
    expect(result.title).toBeTruthy();
    expect(result.truncated).toBe(true);
    expect(result.content).toContain("[Content truncated due to size limit]");
  });

  it("blocks site mode when disabled", async () => {
    await expect(
      WebFetchService.fetchPage(
        { url: "https://example.com", siteMode: true },
        { ...basePolicy, siteModeEnabled: false },
      ),
    ).rejects.toMatchObject<WebFetchError>({
      code: "WEB_FETCH_SITE_MODE_DISABLED",
    });
  });

  it("crawls same-domain pages in site mode with bounds", async () => {
    mockRaw.mockImplementation(async (url: any) => {
      const current = String(url);
      if (current === "https://example.com/") {
        return makeRawResponse({
          headers: { "content-type": "text/html; charset=utf-8" },
          body: `
            <html><body>
              <a href="/about">About</a>
              <a href="https://other.com/skip">Skip external</a>
              <article><h1>Home</h1><p>Home content.</p></article>
            </body></html>
          `,
        });
      }
      if (current === "https://example.com/about") {
        return makeRawResponse({
          headers: { "content-type": "text/html; charset=utf-8" },
          body: `
            <html><body>
              <a href="/contact">Contact</a>
              <article><h1>About</h1><p>About content.</p></article>
            </body></html>
          `,
        });
      }
      if (current === "https://example.com/contact") {
        return makeRawResponse({
          headers: { "content-type": "text/html; charset=utf-8" },
          body: `
            <html><body>
              <article><h1>Contact</h1><p>Contact content.</p></article>
            </body></html>
          `,
        });
      }

      throw new Error(`Unexpected URL in test: ${current}`);
    });

    const result = await WebFetchService.fetchPage(
      {
        url: "https://example.com",
        siteMode: true,
        siteModeDepth: 2,
        siteModeMaxPages: 2,
      },
      { ...basePolicy, siteModeEnabled: true },
    );

    expect(result.siteMode).toBe(true);
    expect(result.pages).toHaveLength(2);
    expect(result.pages?.map((page) => page.url)).toEqual([
      "https://example.com/",
      "https://example.com/about",
    ]);
    expect(result.content).toContain("URL: https://example.com/");
    expect(result.content).toContain("URL: https://example.com/about");
    expect(result.content).not.toContain("other.com/skip");
  });
});
