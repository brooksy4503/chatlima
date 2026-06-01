import { tool } from 'ai';
import { z } from 'zod';
import type { UIMessage } from 'ai';
import { getUIMessageText } from '@/lib/message-utils';
import { parseFile } from '@/lib/file-reader';
import { fetchFileContent } from '@/lib/file-upload';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';
import type { AccessPolicyFlags } from '@/lib/config/access-policy';

export function buildAttachedFileUrlByPath(messages: UIMessage[]): Map<string, string> {
  const attachedFileUrlByPath = new Map<string, string>();
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const messageText = getUIMessageText(msg);
    if (!messageText) continue;
    const lines = messageText.split('\n');
    for (const line of lines) {
      const match = line.match(
        /filepath:\s*([^\s|]+)\s*\|\s*url:\s*(https?:\/\/\S+)/i
      );
      if (match) {
        attachedFileUrlByPath.set(match[1].trim(), match[2].trim());
      }
    }
  }
  return attachedFileUrlByPath;
}

export function buildWebFetchPolicy(accessPolicyFlags: AccessPolicyFlags) {
  return {
    ...WebFetchService.getDefaultPolicy(),
    enabled: accessPolicyFlags.nativeWebFetchEnabled,
    defaultMaxChars: accessPolicyFlags.nativeWebFetchMaxChars,
    defaultTimeoutMs: accessPolicyFlags.nativeWebFetchTimeoutMs,
    maxResponseBytes: accessPolicyFlags.nativeWebFetchMaxBytes,
    maxRedirects: accessPolicyFlags.nativeWebFetchMaxRedirects,
    siteModeEnabled: accessPolicyFlags.nativeWebFetchSiteModeEnabled,
    siteModeMaxPages: accessPolicyFlags.nativeWebFetchSiteModeMaxPages,
    siteModeDepth: accessPolicyFlags.nativeWebFetchSiteModeDepth,
  };
}

export function buildReadFileTool(params: {
  attachedFileUrlByPath: Map<string, string>;
  projectFileUrlByPath: Map<string, string>;
}) {
  const { attachedFileUrlByPath, projectFileUrlByPath } = params;

  return tool({
    description:
      'Read contents of a file uploaded by the user. Supports: CSV, Excel, PDF, text files, code files. Returns parsed content based on file type.',
    inputSchema: z.object({
      filepath: z
        .string()
        .describe(
          'File path or full URL (e.g., "uploads/data-2024-02-06-143022.csv" or "https://...")'
        ),
    }),
    execute: async ({ filepath }) => {
      try {
        const rawPath = (filepath || '').trim();
        const normalizedPath = rawPath.startsWith('://')
          ? `https${rawPath}`
          : rawPath.startsWith('//')
            ? `https:${rawPath}`
            : rawPath;

        const isFullUrl = /^https?:\/\//i.test(normalizedPath);
        const blobBaseUrl =
          process.env.BLOB_PUBLIC_URL || process.env.NEXT_PUBLIC_BLOB_URL;
        const mappedUrl =
          attachedFileUrlByPath.get(rawPath) ||
          attachedFileUrlByPath.get(normalizedPath);
        const projectMappedUrl =
          projectFileUrlByPath.get(rawPath) ||
          projectFileUrlByPath.get(normalizedPath);
        const blobUrl = isFullUrl
          ? normalizedPath
          : mappedUrl
            ? mappedUrl
            : projectMappedUrl
              ? projectMappedUrl
              : blobBaseUrl
                ? `${blobBaseUrl.replace(/\/$/, '')}/${normalizedPath.replace(/^\//, '')}`
                : normalizedPath;

        if (!/^https?:\/\//i.test(blobUrl)) {
          return JSON.stringify({
            success: false,
            error:
              'Invalid file reference. Expected an absolute URL or a filepath with BLOB_PUBLIC_URL configured.',
          });
        }

        const result = await fetchFileContent(blobUrl);
        if (!result.success || !result.content) {
          return JSON.stringify({
            success: false,
            error: result.error || 'Failed to fetch file',
          });
        }

        const buffer = Buffer.from(result.content);
        const cleanPath = (result.finalUrl || filepath).split('?')[0].split('#')[0];
        const filename = cleanPath.split('/').pop() || filepath;
        const responseMimeType = result.contentType?.split(';')[0]?.trim();
        const parseResult = await parseFile(buffer, filename, responseMimeType);

        if (!parseResult.success) {
          return JSON.stringify({
            success: false,
            error: parseResult.error || 'Failed to parse file',
          });
        }

        return JSON.stringify(
          { success: true, content: parseResult.content },
          null,
          2
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[read_file] Error:', error);
        return JSON.stringify({ success: false, error: message });
      }
    },
  });
}

export function buildWebFetchTool(webFetchPolicy: ReturnType<typeof buildWebFetchPolicy>) {
  return tool({
    description:
      'Fetch and extract readable content from a public web URL. Best for reading a specific link and using it as context.',
    inputSchema: z.object({
      url: z.string().describe('Public http/https URL to read'),
      mode: z
        .enum(['markdown', 'text'])
        .optional()
        .describe('Output format. Defaults to markdown.'),
      maxChars: z
        .number()
        .int()
        .positive()
        .max(100000)
        .optional()
        .describe('Maximum characters to return. Defaults to server policy.'),
      followRedirects: z
        .boolean()
        .optional()
        .describe('Whether to follow redirects. Defaults to true.'),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(60000)
        .optional()
        .describe('Request timeout in milliseconds. Defaults to server policy.'),
      siteMode: z
        .boolean()
        .optional()
        .describe(
          'Optional whole-site mode. Disabled unless explicitly enabled by server configuration.'
        ),
      siteModeSameDomain: z
        .boolean()
        .optional()
        .describe('When siteMode is enabled, limit crawl to the same domain. Defaults to true.'),
      siteModeMaxPages: z
        .number()
        .int()
        .positive()
        .max(100)
        .optional()
        .describe('When siteMode is enabled, maximum pages to crawl (capped by server policy).'),
      siteModeDepth: z
        .number()
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('When siteMode is enabled, crawl depth (capped by server policy).'),
    }),
    execute: async ({
      url,
      mode,
      maxChars,
      followRedirects,
      timeoutMs,
      siteMode,
      siteModeSameDomain,
      siteModeMaxPages,
      siteModeDepth,
    }) => {
      try {
        const result = await WebFetchService.fetchPage(
          {
            url,
            mode,
            maxChars,
            followRedirects,
            timeoutMs,
            siteMode,
            siteModeSameDomain,
            siteModeMaxPages,
            siteModeDepth,
          },
          webFetchPolicy
        );
        return JSON.stringify({ success: true, ...result }, null, 2);
      } catch (error) {
        if (error instanceof WebFetchError) {
          return JSON.stringify({
            success: false,
            code: error.code,
            error: error.message,
          });
        }
        const message =
          error instanceof Error ? error.message : 'Unknown web fetch error';
        return JSON.stringify({
          success: false,
          code: 'WEB_FETCH_UNKNOWN_ERROR',
          error: message,
        });
      }
    },
  });
}

export function buildBaseChatTools(params: {
  mcpTools: Record<string, unknown>;
  messages: UIMessage[];
  projectFileUrlByPath: Map<string, string>;
  accessPolicyFlags: AccessPolicyFlags;
}): Record<string, unknown> {
  const { mcpTools, messages, projectFileUrlByPath, accessPolicyFlags } = params;
  const attachedFileUrlByPath = buildAttachedFileUrlByPath(messages);
  const webFetchPolicy = buildWebFetchPolicy(accessPolicyFlags);
  const read_file = buildReadFileTool({ attachedFileUrlByPath, projectFileUrlByPath });

  return {
    ...mcpTools,
    read_file,
    ...(webFetchPolicy.enabled ? { web_fetch: buildWebFetchTool(webFetchPolicy) } : {}),
  };
}
