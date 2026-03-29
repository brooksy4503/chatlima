import { ofetch } from "ofetch";
import TurndownService from "turndown";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export type WebFetchMode = "markdown" | "text";

export interface WebFetchInput {
  url: string;
  mode?: WebFetchMode;
  maxChars?: number;
  followRedirects?: boolean;
  timeoutMs?: number;
  siteMode?: boolean;
  siteModeSameDomain?: boolean;
  siteModeMaxPages?: number;
  siteModeDepth?: number;
}

export interface WebFetchOutput {
  finalUrl: string;
  title?: string;
  content: string;
  truncated: boolean;
  contentType?: string;
  fetchedAt: string;
  siteMode?: boolean;
  pages?: Array<{
    url: string;
    title?: string;
    depth: number;
    contentType: string;
    truncated: boolean;
  }>;
}

export interface WebFetchPolicy {
  enabled: boolean;
  defaultMaxChars: number;
  defaultTimeoutMs: number;
  maxResponseBytes: number;
  maxRedirects: number;
  siteModeEnabled: boolean;
  siteModeMaxPages: number;
  siteModeDepth: number;
}

const DEFAULT_POLICY: WebFetchPolicy = {
  enabled: false,
  defaultMaxChars: 30_000,
  defaultTimeoutMs: 12_000,
  maxResponseBytes: 5_000_000,
  maxRedirects: 5,
  siteModeEnabled: false,
  siteModeMaxPages: 20,
  siteModeDepth: 2,
};

const ALLOWED_CONTENT_TYPES = ["text/html", "text/plain", "text/markdown"];

export class WebFetchError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "WebFetchError";
    this.code = code;
    this.status = status;
  }
}

export class WebFetchService {
  static getDefaultPolicy(): WebFetchPolicy {
    return { ...DEFAULT_POLICY };
  }

  static async fetchPage(
    input: WebFetchInput,
    policy: WebFetchPolicy,
  ): Promise<WebFetchOutput> {
    if (!policy.enabled) {
      throw new WebFetchError(
        "WEB_FETCH_DISABLED",
        "Native web fetch is currently disabled.",
        403,
      );
    }

    const mode = input.mode ?? "markdown";
    const siteMode = input.siteMode ?? false;
    if (siteMode && !policy.siteModeEnabled) {
      throw new WebFetchError(
        "WEB_FETCH_SITE_MODE_DISABLED",
        "Whole-site mode is not enabled for this environment.",
        403,
      );
    }
    const maxChars = Math.max(500, input.maxChars ?? policy.defaultMaxChars);
    const timeoutMs = Math.max(1_000, input.timeoutMs ?? policy.defaultTimeoutMs);
    const followRedirects = input.followRedirects ?? true;
    const sameDomainOnly = input.siteModeSameDomain ?? true;
    const siteModeMaxPages = Math.max(
      1,
      Math.min(input.siteModeMaxPages ?? policy.siteModeMaxPages, policy.siteModeMaxPages),
    );
    const siteModeDepth = Math.max(
      0,
      Math.min(input.siteModeDepth ?? policy.siteModeDepth, policy.siteModeDepth),
    );

    const currentUrl = this.validateAndNormalizeUrl(input.url);
    await this.assertPublicUrl(currentUrl);

    if (siteMode) {
      return this.fetchSite({
        startUrl: currentUrl,
        mode,
        maxChars,
        timeoutMs,
        followRedirects,
        maxPages: siteModeMaxPages,
        maxDepth: siteModeDepth,
        sameDomainOnly,
      }, policy);
    }

    const singleResult = await this.fetchSingleUrl({
      url: currentUrl,
      mode,
      maxChars,
      timeoutMs,
      followRedirects,
    }, policy);

    return {
      finalUrl: singleResult.finalUrl,
      title: singleResult.title,
      content: singleResult.content,
      truncated: singleResult.truncated,
      contentType: singleResult.contentType,
      fetchedAt: new Date().toISOString(),
    };
  }

  private static async fetchSingleUrl(
    params: {
      url: string;
      mode: WebFetchMode;
      maxChars: number;
      timeoutMs: number;
      followRedirects: boolean;
    },
    policy: WebFetchPolicy,
  ): Promise<{
    finalUrl: string;
    title?: string;
    content: string;
    truncated: boolean;
    contentType: string;
    links: string[];
  }> {
    let currentUrl = params.url;
    let redirects = 0;
    // Follow redirects manually so each hop can be SSRF-validated on each redirect target.
    while (true) {
      const response = await ofetch.raw(currentUrl, {
        method: "GET",
        timeout: params.timeoutMs,
        redirect: "manual",
        retry: 0,
        responseType: "text",
        parseResponse: (txt) => txt,
      });

      if (this.isRedirect(response.status) && params.followRedirects) {
        const location = response.headers.get("location");
        if (!location) {
          throw new WebFetchError(
            "WEB_FETCH_REDIRECT_ERROR",
            "Redirect response did not include a Location header.",
            502,
          );
        }

        redirects += 1;
        if (redirects > policy.maxRedirects) {
          throw new WebFetchError(
            "WEB_FETCH_TOO_MANY_REDIRECTS",
            `Too many redirects (>${policy.maxRedirects}).`,
            400,
          );
        }

        currentUrl = new URL(location, currentUrl).toString();
        currentUrl = this.validateAndNormalizeUrl(currentUrl);
        await this.assertPublicUrl(currentUrl);
        continue;
      }

      if (!response.ok) {
        throw new WebFetchError(
          "WEB_FETCH_HTTP_ERROR",
          `Failed to fetch URL (HTTP ${response.status}).`,
          502,
        );
      }

      const contentTypeHeader = response.headers.get("content-type") ?? "";
      const contentType = contentTypeHeader.split(";")[0].trim().toLowerCase();

      if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
        throw new WebFetchError(
          "WEB_FETCH_UNSUPPORTED_CONTENT_TYPE",
          `Unsupported content type: ${contentType || "unknown"}.`,
          415,
        );
      }

      const contentLength = Number(response.headers.get("content-length") ?? "0");
      if (Number.isFinite(contentLength) && contentLength > policy.maxResponseBytes) {
        throw new WebFetchError(
          "WEB_FETCH_RESPONSE_TOO_LARGE",
          `Response exceeds max size of ${policy.maxResponseBytes} bytes.`,
          413,
        );
      }

      const body = String(response._data ?? "");
      const bodyBytes = Buffer.byteLength(body, "utf8");
      if (bodyBytes > policy.maxResponseBytes) {
        throw new WebFetchError(
          "WEB_FETCH_RESPONSE_TOO_LARGE",
          `Response exceeds max size of ${policy.maxResponseBytes} bytes.`,
          413,
        );
      }

      const parsed = this.extractContent({
        body,
        finalUrl: currentUrl,
        mode: params.mode,
      });

      const { content, truncated } = this.truncateContent(parsed.content, params.maxChars);
      const links = contentType === "text/html" ? this.extractLinks(body, currentUrl) : [];

      return {
        finalUrl: currentUrl,
        title: parsed.title,
        content,
        truncated,
        contentType,
        links,
      };
    }
  }

  private static async fetchSite(
    params: {
      startUrl: string;
      mode: WebFetchMode;
      maxChars: number;
      timeoutMs: number;
      followRedirects: boolean;
      maxPages: number;
      maxDepth: number;
      sameDomainOnly: boolean;
    },
    policy: WebFetchPolicy,
  ): Promise<WebFetchOutput> {
    const startHost = new URL(params.startUrl).hostname.toLowerCase();
    const queue: Array<{ url: string; depth: number }> = [{ url: params.startUrl, depth: 0 }];
    const visited = new Set<string>();
    const pages: Array<{
      url: string;
      title?: string;
      depth: number;
      contentType: string;
      truncated: boolean;
      content: string;
    }> = [];

    while (queue.length > 0 && pages.length < params.maxPages) {
      const candidate = queue.shift();
      if (!candidate) break;

      const normalized = this.normalizeForCrawl(candidate.url);
      if (visited.has(normalized)) {
        continue;
      }
      visited.add(normalized);

      await this.assertPublicUrl(normalized);

      try {
        const page = await this.fetchSingleUrl(
          {
            url: normalized,
            mode: params.mode,
            maxChars: params.maxChars,
            timeoutMs: params.timeoutMs,
            followRedirects: params.followRedirects,
          },
          policy,
        );

        const pageDepth = candidate.depth;
        pages.push({
          url: page.finalUrl,
          title: page.title,
          depth: pageDepth,
          contentType: page.contentType,
          truncated: page.truncated,
          content: page.content,
        });

        if (pageDepth < params.maxDepth) {
          for (const discoveredLink of page.links) {
            const linkHost = new URL(discoveredLink).hostname.toLowerCase();
            if (params.sameDomainOnly && linkHost !== startHost) {
              continue;
            }

            const discoveredNormalized = this.normalizeForCrawl(discoveredLink);
            if (!visited.has(discoveredNormalized)) {
              queue.push({ url: discoveredNormalized, depth: pageDepth + 1 });
            }
          }
        }
      } catch (error) {
        if (pages.length === 0) {
          throw error;
        }
      }
    }

    if (pages.length === 0) {
      throw new WebFetchError(
        "WEB_FETCH_SITE_MODE_NO_CONTENT",
        "Could not fetch readable content from the requested site.",
        502,
      );
    }

    const combinedContent = pages
      .map((page, index) => {
        const pageHeading = `# Page ${index + 1}${page.title ? `: ${page.title}` : ""}`;
        return `${pageHeading}\nURL: ${page.url}\nDepth: ${page.depth}\n\n${page.content}`;
      })
      .join("\n\n---\n\n");
    const { content, truncated } = this.truncateContent(combinedContent, params.maxChars);
    const primary = pages[0];

    return {
      finalUrl: primary.url,
      title: primary.title,
      content,
      truncated,
      contentType: "text/markdown",
      fetchedAt: new Date().toISOString(),
      siteMode: true,
      pages: pages.map((page) => ({
        url: page.url,
        title: page.title,
        depth: page.depth,
        contentType: page.contentType,
        truncated: page.truncated,
      })),
    };
  }

  private static isRedirect(status: number): boolean {
    return [301, 302, 303, 307, 308].includes(status);
  }

  private static validateAndNormalizeUrl(rawUrl: string): string {
    const trimmed = (rawUrl ?? "").trim();
    if (!trimmed) {
      throw new WebFetchError("WEB_FETCH_INVALID_URL", "A URL is required.");
    }

    const withProtocol = this.addDefaultProtocolIfMissing(trimmed);

    let parsed: URL;
    try {
      parsed = new URL(withProtocol);
    } catch {
      throw new WebFetchError("WEB_FETCH_INVALID_URL", "Invalid URL format.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new WebFetchError(
        "WEB_FETCH_INVALID_URL",
        "Only http and https URLs are supported.",
      );
    }

    if (parsed.username || parsed.password) {
      throw new WebFetchError(
        "WEB_FETCH_INVALID_URL",
        "URLs with embedded credentials are not allowed.",
      );
    }

    return parsed.toString();
  }

  private static addDefaultProtocolIfMissing(value: string): string {
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value)) {
      return value;
    }

    if (value.startsWith("//")) {
      return `https:${value}`;
    }

    return `https://${value}`;
  }

  private static async assertPublicUrl(url: string): Promise<void> {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
      throw new WebFetchError(
        "WEB_FETCH_FORBIDDEN_HOST",
        "Local and private network hosts are not allowed.",
        403,
      );
    }

    const directIp = isIP(hostname) ? hostname : null;
    if (directIp && this.isBlockedIp(directIp)) {
      throw new WebFetchError(
        "WEB_FETCH_FORBIDDEN_HOST",
        "Local and private network hosts are not allowed.",
        403,
      );
    }

    if (!directIp) {
      const records = await lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        throw new WebFetchError("WEB_FETCH_DNS_ERROR", "Could not resolve URL host.", 502);
      }

      for (const record of records) {
        if (this.isBlockedIp(record.address)) {
          throw new WebFetchError(
            "WEB_FETCH_FORBIDDEN_HOST",
            "Local and private network hosts are not allowed.",
            403,
          );
        }
      }
    }
  }

  private static isBlockedIp(ip: string): boolean {
    const normalized = ip.toLowerCase();
    const ipVersion = isIP(normalized);
    if (!ipVersion) return true;

    if (ipVersion === 4) {
      return this.isPrivateIPv4(normalized);
    }

    const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mappedIpv4) {
      return this.isPrivateIPv4(mappedIpv4[1]);
    }

    if (normalized === "::1" || normalized === "::") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // fc00::/7
    if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
      return true; // fe80::/10
    }

    return false;
  }

  private static isPrivateIPv4(ip: string): boolean {
    const parts = ip.split(".").map((x) => Number(x));
    if (parts.length !== 4 || parts.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) {
      return true;
    }

    const [a, b] = parts;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10
    return false;
  }

  private static extractContent(params: {
    body: string;
    finalUrl: string;
    mode: WebFetchMode;
  }): { title?: string; content: string } {
    const { body, mode } = params;
    const title = this.extractTitle(body);
    const contentHtml = this.extractPrimaryHtml(body);
    const contentText = this.extractText(contentHtml);

    if (mode === "text") {
      return {
        title,
        content: this.cleanWhitespace(contentText),
      };
    }

    const turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
      bulletListMarker: "-",
    });

    const markdown = this.cleanWhitespace(turndown.turndown(contentHtml));
    if (markdown) {
      return { title, content: markdown };
    }

    return { title, content: this.cleanWhitespace(contentText) };
  }

  private static cleanWhitespace(value: string): string {
    return value
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
  }

  private static extractLinks(html: string, baseUrl: string): string[] {
    const urls = new Set<string>();

    const hrefRegex = /<a\b[^>]*\bhref\s*=\s*(['"])(.*?)\1/gi;
    let match: RegExpExecArray | null = null;

    while ((match = hrefRegex.exec(html)) !== null) {
      const href = this.decodeHtmlEntities(match[2]).trim();
      if (!href) continue;
      if (href.startsWith("#")) continue;

      try {
        const parsed = new URL(href, baseUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) continue;
        urls.add(parsed.toString());
      } catch {
        continue;
      }
    }

    return Array.from(urls);
  }

  private static extractTitle(html: string): string | undefined {
    const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (!match?.[1]) return undefined;
    return this.cleanWhitespace(this.decodeHtmlEntities(match[1]));
  }

  private static extractPrimaryHtml(html: string): string {
    const cleaned = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");

    const articleMatch = cleaned.match(/<article\b[^>]*>[\s\S]*?<\/article>/i);
    if (articleMatch?.[0]) {
      return articleMatch[0];
    }

    const mainMatch = cleaned.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
    if (mainMatch?.[0]) {
      return mainMatch[0];
    }

    const bodyMatch = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch?.[1]) {
      return bodyMatch[1];
    }

    return cleaned;
  }

  private static extractText(html: string): string {
    const withLineBreaks = html
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ");
    return this.decodeHtmlEntities(withLineBreaks);
  }

  private static decodeHtmlEntities(value: string): string {
    const namedEntities: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: "\"",
      apos: "'",
      nbsp: " ",
      ndash: "-",
      mdash: "-",
      hellip: "...",
    };

    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (full, entity: string) => {
      const normalized = entity.toLowerCase();
      if (normalized in namedEntities) {
        return namedEntities[normalized];
      }

      if (normalized.startsWith("#x")) {
        const codePoint = Number.parseInt(normalized.slice(2), 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
      }

      if (normalized.startsWith("#")) {
        const codePoint = Number.parseInt(normalized.slice(1), 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : full;
      }

      return full;
    });
  }

  private static normalizeForCrawl(url: string): string {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  }

  private static truncateContent(
    content: string,
    maxChars: number,
  ): { content: string; truncated: boolean } {
    if (content.length <= maxChars) {
      return { content, truncated: false };
    }

    const marker = "\n\n[Content truncated due to size limit]";
    const truncated = content.slice(0, Math.max(0, maxChars - marker.length)).trimEnd() + marker;
    return { content: truncated, truncated: true };
  }
}
