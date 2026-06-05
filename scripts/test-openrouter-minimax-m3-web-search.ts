import dotenv from 'dotenv';
import { streamText, stepCountIs } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

dotenv.config({ path: '.env.local' });
dotenv.config();

type OpenRouterErrorBody = {
  error?: {
    code?: string | number;
    message?: string;
    metadata?: unknown;
  };
};

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_TEST_MODEL || 'minimax/minimax-m3';
const prompt =
  process.env.OPENROUTER_TEST_PROMPT ||
  'Using web search, what are the most recent notable AI product announcements this week? Keep the answer brief and include citations.';

if (!apiKey) {
  console.error('OPENROUTER_API_KEY is required.');
  process.exit(1);
}

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    withSearch: !args.has('--without-search'),
    stream: !args.has('--no-stream'),
    aiSdk: args.has('--ai-sdk'),
  };
}

function buildPayload(options: { withSearch: boolean; stream: boolean }) {
  return {
    model,
    stream: options.stream,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    ...(options.withSearch
      ? {
          tools: [
            {
              type: 'openrouter:web_search',
              parameters: {
                engine: 'auto',
                max_results: 5,
                max_total_results: 10,
                search_context_size: 'medium',
              },
            },
          ],
        }
      : {}),
  };
}

function getInterestingHeaders(response: Response) {
  const names = [
    'x-request-id',
    'x-openrouter-request-id',
    'cf-ray',
    'content-type',
  ];

  return Object.fromEntries(
    names
      .map((name) => [name, response.headers.get(name)])
      .filter(([, value]) => value)
  );
}

async function readStreamingResponse(response: Response) {
  if (!response.body) {
    return { textChars: 0, eventCount: 0, errorEvents: [] as unknown[] };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let textChars = 0;
  let eventCount = 0;
  const errorEvents: unknown[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const dataLines = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim());

      for (const data of dataLines) {
        if (!data || data === '[DONE]') {
          continue;
        }

        eventCount++;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta;
          const content = delta?.content;

          if (typeof content === 'string') {
            textChars += content.length;
          }

          if (parsed?.error) {
            errorEvents.push(parsed.error);
          }
        } catch {
          errorEvents.push({ parseError: true, raw: data.slice(0, 500) });
        }
      }
    }
  }

  return { textChars, eventCount, errorEvents };
}

async function main() {
  const options = parseArgs();

  if (options.aiSdk) {
    await runAiSdkDiagnostic(options);
    return;
  }

  const payload = buildPayload(options);

  console.log('OpenRouter MiniMax M3 diagnostic');
  console.log({
    model,
    stream: options.stream,
    withSearch: options.withSearch,
    promptChars: prompt.length,
  });

  const startedAt = Date.now();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima Diagnostic',
    },
    body: JSON.stringify(payload),
  });

  console.log('HTTP response', {
    status: response.status,
    statusText: response.statusText,
    elapsedMs: Date.now() - startedAt,
    headers: getInterestingHeaders(response),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    let parsed: OpenRouterErrorBody | undefined;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      // Keep parsed undefined; print a safe body excerpt below.
    }

    console.log('Error body', parsed ?? bodyText.slice(0, 2000));
    process.exit(1);
  }

  if (options.stream) {
    const summary = await readStreamingResponse(response);
    console.log('Stream summary', {
      elapsedMs: Date.now() - startedAt,
      ...summary,
    });

    if (summary.errorEvents.length > 0) {
      process.exit(1);
    }
    return;
  }

  const data = await response.json();
  console.log('JSON summary', {
    elapsedMs: Date.now() - startedAt,
    id: data.id,
    model: data.model,
    usage: data.usage,
    finishReason: data.choices?.[0]?.finish_reason,
    contentChars: data.choices?.[0]?.message?.content?.length ?? 0,
    annotations: data.choices?.[0]?.message?.annotations?.length ?? 0,
  });
}

async function runAiSdkDiagnostic(options: { withSearch: boolean; stream: boolean }) {
  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
      'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima Diagnostic',
    },
  });

  console.log('OpenRouter MiniMax M3 AI SDK diagnostic');
  console.log({
    model,
    stream: options.stream,
    withSearch: options.withSearch,
    promptChars: prompt.length,
  });

  const startedAt = Date.now();
  let onErrorValue: unknown;

  const result = streamText({
    model: openrouter(model),
    maxOutputTokens: 512,
    messages: [{ role: 'user', content: prompt }],
    tools: options.withSearch
      ? {
          web_search: openrouter.tools.webSearch({
            maxResults: 5,
            engine: 'auto',
            searchPrompt: 'Use web search for current information. Prefer medium context depth.',
          }),
        }
      : {},
    stopWhen: stepCountIs(20),
    providerOptions: {
      openrouter: {
        user: 'chatlima_diagnostic',
        extraBody: {
          user: 'chatlima_diagnostic',
        },
      },
    },
    onError(error) {
      onErrorValue = error;
      console.log('AI SDK onError', JSON.stringify(error, null, 2));
    },
  });

  let textChars = 0;
  try {
    for await (const chunk of result.textStream) {
      textChars += chunk.length;
    }

    console.log('AI SDK stream summary', {
      elapsedMs: Date.now() - startedAt,
      textChars,
      onErrorValue,
    });
  } catch (error) {
    console.error('AI SDK stream threw', {
      elapsedMs: Date.now() - startedAt,
      textChars,
      error,
      message: error instanceof Error ? error.message : undefined,
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Diagnostic failed', {
    name: error?.name,
    message: error?.message,
    cause: error?.cause,
  });
  process.exit(1);
});
