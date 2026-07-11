import type { UIMessage } from 'ai';
import { getUIMessageText } from '@/lib/message-utils';
import { logDiagnostic } from '@/lib/utils/performantLogging';

export type TokenUsageSource = 'ai_sdk' | 'steps' | 'estimated';

export interface TokenUsageSnapshot {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  source: TokenUsageSource;
}

export interface ResolveStreamTokenUsageParams {
  event: {
    totalUsage?: Record<string, unknown>;
    usage?: Record<string, unknown>;
    steps?: Array<{ usage?: Record<string, unknown> }>;
    durationMs?: number;
    text?: string;
  };
  response: {
    usage?: Record<string, unknown>;
    messages?: Array<{ content?: unknown; role?: string }>;
  };
  modelMessagesFinal: UIMessage[];
  effectiveSystemInstruction: string;
  requestId: string;
}

/** @deprecated Use ResolveStreamTokenUsageParams */
export type ComputeStreamTokenUsageParams = ResolveStreamTokenUsageParams;

function parseUsageRecord(
  usage: Record<string, unknown> | undefined | null
): { inputTokens: number; outputTokens: number; totalTokens: number } | null {
  if (!usage) {
    return null;
  }

  const inputTokens =
    Number(usage.inputTokens) ||
    Number(usage.promptTokens) ||
    Number(usage.prompt_tokens) ||
    Number(usage.input_tokens) ||
    0;
  const outputTokens =
    Number(usage.outputTokens) ||
    Number(usage.completionTokens) ||
    Number(usage.completion_tokens) ||
    Number(usage.output_tokens) ||
    0;

  if (inputTokens <= 0 && outputTokens <= 0) {
    return null;
  }

  const totalTokens =
    Number(usage.totalTokens) ||
    Number(usage.total_tokens) ||
    inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
}

function sumStepUsage(
  steps: Array<{ usage?: Record<string, unknown> }> | undefined
): { inputTokens: number; outputTokens: number; totalTokens: number } | null {
  if (!steps?.length) {
    return null;
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let hasStepTokens = false;

  for (const step of steps) {
    const parsed = parseUsageRecord(step?.usage);
    if (!parsed) {
      continue;
    }
    inputTokens += parsed.inputTokens;
    outputTokens += parsed.outputTokens;
    hasStepTokens = true;
  }

  if (!hasStepTokens) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

function estimateTokenUsage(params: {
  response: ResolveStreamTokenUsageParams['response'];
  event: ResolveStreamTokenUsageParams['event'];
  modelMessagesFinal: UIMessage[];
  effectiveSystemInstruction: string;
  inputTokenCount: number;
  outputTokenCount: number;
}): TokenUsageSnapshot {
  const {
    response,
    event,
    modelMessagesFinal,
    effectiveSystemInstruction,
    inputTokenCount,
    outputTokenCount,
  } = params;

  const needsInputEstimation = inputTokenCount === 0;
  const needsOutputEstimation = outputTokenCount === 0;

  let estimatedInputTokens = inputTokenCount;
  let estimatedOutputTokens = outputTokenCount;

  if (needsOutputEstimation) {
    const lastMessage = response.messages?.[response.messages.length - 1];
    let outputContentLength = 0;

    if (lastMessage?.content) {
      if (Array.isArray(lastMessage.content)) {
        outputContentLength = lastMessage.content
          .filter((part: { type?: string }) => part.type === 'text')
          .map((part: { text?: string }) => part.text ?? '')
          .join('').length;
      } else if (typeof lastMessage.content === 'string') {
        outputContentLength = lastMessage.content.length;
      }
    }

    if (!outputContentLength && event.text) {
      outputContentLength = event.text.length;
    }

    estimatedOutputTokens = outputContentLength > 0 ? Math.ceil(outputContentLength / 4) : 1;
  }

  if (needsInputEstimation) {
    let inputContentLength = 0;
    for (const message of modelMessagesFinal) {
      inputContentLength += getUIMessageText(message).length;
    }
    if (effectiveSystemInstruction) {
      inputContentLength += effectiveSystemInstruction.length;
    }
    estimatedInputTokens = Math.ceil(inputContentLength / 4);
  }

  return {
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    totalTokens: estimatedInputTokens + estimatedOutputTokens,
    source: 'estimated',
  };
}

/**
 * Canonical token resolver for completed streamText turns.
 * Prefers AI SDK combined usage (totalUsage / usage), then step sums, then char estimates.
 */
export function resolveStreamTokenUsage(
  params: ResolveStreamTokenUsageParams
): TokenUsageSnapshot {
  const { event, response, modelMessagesFinal, effectiveSystemInstruction, requestId } =
    params;

  const sdkUsage =
    parseUsageRecord(event.totalUsage) ||
    parseUsageRecord(event.usage) ||
    parseUsageRecord(response.usage);

  if (sdkUsage) {
    logDiagnostic('STREAM_TOKEN_USAGE', 'Using AI SDK combined token usage', {
      requestId,
      inputTokenCount: sdkUsage.inputTokens,
      outputTokenCount: sdkUsage.outputTokens,
      source: 'ai_sdk',
    });

    return {
      ...sdkUsage,
      source: 'ai_sdk',
    };
  }

  const stepUsage = sumStepUsage(event.steps);
  if (stepUsage) {
    logDiagnostic('STREAM_TOKEN_USAGE', 'Using summed step token usage', {
      requestId,
      inputTokenCount: stepUsage.inputTokens,
      outputTokenCount: stepUsage.outputTokens,
      source: 'steps',
    });

    return {
      ...stepUsage,
      source: 'steps',
    };
  }

  const estimated = estimateTokenUsage({
    response,
    event,
    modelMessagesFinal,
    effectiveSystemInstruction,
    inputTokenCount: 0,
    outputTokenCount: 0,
  });

  logDiagnostic('STREAM_TOKEN_USAGE', 'Using estimated token usage', {
    requestId,
    inputTokenCount: estimated.inputTokens,
    outputTokenCount: estimated.outputTokens,
    source: 'estimated',
  });

  return estimated;
}

/** @deprecated Use resolveStreamTokenUsage */
export function computeStreamTokenUsage(
  params: ComputeStreamTokenUsageParams
): TokenUsageSnapshot {
  return resolveStreamTokenUsage(params);
}

export function estimateTimeToFirstTokenMs(params: {
  timeToFirstTokenMs: number | null;
  eventDurationMs?: number;
  requestStartTime: number;
}): number | null {
  const { timeToFirstTokenMs, eventDurationMs, requestStartTime } = params;
  if (timeToFirstTokenMs !== null) {
    return timeToFirstTokenMs;
  }
  if (eventDurationMs) {
    return Math.round(eventDurationMs * 0.2);
  }
  const calculatedProcessingTimeMs = Date.now() - requestStartTime;
  return Math.round(calculatedProcessingTimeMs * 0.2);
}

export function computeTokensPerSecond(params: {
  timeToFirstTokenMs: number | null;
  outputTokens: number;
  requestStartTime: number;
}): number | null {
  const { timeToFirstTokenMs, outputTokens, requestStartTime } = params;
  if (timeToFirstTokenMs === null || outputTokens <= 0) {
    return null;
  }
  const calculatedProcessingTimeMs = Date.now() - requestStartTime;
  const generationTimeMs = calculatedProcessingTimeMs - timeToFirstTokenMs;
  if (generationTimeMs <= 0) {
    return null;
  }
  return outputTokens / (generationTimeMs / 1000);
}
