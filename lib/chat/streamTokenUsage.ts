import type { UIMessage } from 'ai';
import { getUIMessageText } from '@/lib/message-utils';
import { logDiagnostic } from '@/lib/utils/performantLogging';

export interface TokenUsageSnapshot {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ComputeStreamTokenUsageParams {
  event: {
    usage?: Record<string, unknown>;
    steps?: Array<{ usage?: Record<string, unknown> }>;
    durationMs?: number;
  };
  response: {
    usage?: Record<string, unknown>;
    messages?: Array<{ content?: unknown }>;
  };
  modelMessagesFinal: UIMessage[];
  effectiveSystemInstruction: string;
  requestId: string;
}

/** Aggregate usage from stream finish event/response with conversation-based fallbacks. */
export function computeStreamTokenUsage(
  params: ComputeStreamTokenUsageParams
): TokenUsageSnapshot {
  const { event, response, modelMessagesFinal, effectiveSystemInstruction, requestId } =
    params;

  const typedResponse = response;
  let tokenUsageData: Record<string, unknown> | null =
    (event.usage as Record<string, unknown>) ||
    (typedResponse.usage as Record<string, unknown>) ||
    null;

  if (event.steps && Array.isArray(event.steps)) {
    let totalStepInputTokens = 0;
    let totalStepOutputTokens = 0;
    let hasStepTokens = false;

    for (const step of event.steps) {
      if (step?.usage) {
        const stepUsage = step.usage;
        const stepInputTokens =
          Number(stepUsage.promptTokens) ||
          Number(stepUsage.inputTokens) ||
          Number(stepUsage.prompt_tokens) ||
          Number(stepUsage.input_tokens) ||
          0;
        const stepOutputTokens =
          Number(stepUsage.completionTokens) ||
          Number(stepUsage.outputTokens) ||
          Number(stepUsage.completion_tokens) ||
          Number(stepUsage.output_tokens) ||
          0;

        if (stepInputTokens > 0 || stepOutputTokens > 0) {
          totalStepInputTokens += stepInputTokens;
          totalStepOutputTokens += stepOutputTokens;
          hasStepTokens = true;
        }
      }
    }

    if (hasStepTokens) {
      tokenUsageData = {
        ...tokenUsageData,
        inputTokens:
          totalStepInputTokens ||
          Number(tokenUsageData?.inputTokens) ||
          Number(tokenUsageData?.prompt_tokens) ||
          0,
        outputTokens:
          totalStepOutputTokens ||
          Number(tokenUsageData?.outputTokens) ||
          Number(tokenUsageData?.completion_tokens) ||
          0,
        totalTokens:
          totalStepInputTokens + totalStepOutputTokens ||
          Number(tokenUsageData?.totalTokens) ||
          Number(tokenUsageData?.total_tokens) ||
          0,
      };
    }
  }

  const inputTokenCount =
    Number(tokenUsageData?.inputTokens) || Number(tokenUsageData?.prompt_tokens) || 0;
  const outputTokenCount =
    Number(tokenUsageData?.outputTokens) ||
    Number(tokenUsageData?.completion_tokens) ||
    0;

  const needsInputEstimation = !tokenUsageData || inputTokenCount === 0;
  const needsOutputEstimation = !tokenUsageData || outputTokenCount === 0;

  if (needsInputEstimation || needsOutputEstimation) {
    const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
    let outputContentLength = 0;
    let inputContentLength = 0;

    if (needsOutputEstimation && lastMessage?.content) {
      if (Array.isArray(lastMessage.content)) {
        outputContentLength = lastMessage.content
          .filter((part: { type?: string }) => part.type === 'text')
          .map((part: { text?: string }) => part.text ?? '')
          .join('').length;
      } else if (typeof lastMessage.content === 'string') {
        outputContentLength = lastMessage.content.length;
      }
    }

    if (needsInputEstimation) {
      for (const message of modelMessagesFinal) {
        inputContentLength += getUIMessageText(message).length;
      }
      if (effectiveSystemInstruction) {
        inputContentLength += effectiveSystemInstruction.length;
      }
    }

    const estimatedOutputTokens = Math.ceil(outputContentLength / 4);
    const estimatedInputTokens = Math.ceil(inputContentLength / 4);

    return {
      inputTokens: needsInputEstimation ? estimatedInputTokens : inputTokenCount,
      outputTokens: needsOutputEstimation ? estimatedOutputTokens : outputTokenCount,
      totalTokens:
        (needsInputEstimation ? estimatedInputTokens : inputTokenCount) +
        (needsOutputEstimation ? estimatedOutputTokens : outputTokenCount),
    };
  }

  logDiagnostic('STREAM_TOKEN_USAGE', 'Using provider-reported token usage', {
    requestId,
    inputTokenCount,
    outputTokenCount,
  });

  return {
    inputTokens: inputTokenCount,
    outputTokens: outputTokenCount,
    totalTokens: inputTokenCount + outputTokenCount,
  };
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
