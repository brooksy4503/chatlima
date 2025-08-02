import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { nanoid } from 'nanoid';

// Diagnostic logging helper
const logDiagnostic = (category: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[TokenUsageAPI:${category}] ${timestamp} - ${message}`, data || '');
};

export async function GET(req: NextRequest) {
  const requestId = nanoid(); // Unique ID for this request
  logDiagnostic('REQUEST_START', `Starting token usage API request`, {
    requestId,
    url: req.url,
    method: req.method
  });

  try {
    // Check if user is authenticated
    logDiagnostic('AUTH_CHECK', `Checking user authentication`, { requestId });
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      logDiagnostic('AUTH_FAILED', `Authentication failed`, { requestId });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
      requestId,
      userId: session.user.id
    });

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const provider = searchParams.get('provider') || undefined;
    const type = searchParams.get('type') || 'stats'; // 'stats' or 'daily'
    const chatId = searchParams.get('chatId') || undefined; // New parameter for specific chat

    logDiagnostic('PARAMS_PARSED', `Parsed query parameters`, {
      requestId,
      userId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      provider,
      type,
      chatId
    });

    // Validate date parameters
    if (startDate && isNaN(startDate.getTime())) {
      logDiagnostic('VALIDATION_ERROR', `Invalid startDate format`, {
        requestId,
        startDate: searchParams.get('startDate')
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Invalid startDate format' } },
        { status: 400 }
      );
    }

    if (endDate && isNaN(endDate.getTime())) {
      logDiagnostic('VALIDATION_ERROR', `Invalid endDate format`, {
        requestId,
        endDate: searchParams.get('endDate')
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'Invalid endDate format' } },
        { status: 400 }
      );
    }

    if (startDate && endDate && startDate > endDate) {
      logDiagnostic('VALIDATION_ERROR', `startDate must be before endDate`, {
        requestId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETER', message: 'startDate must be before endDate' } },
        { status: 400 }
      );
    }

    logDiagnostic('VALIDATION_SUCCESS', `Parameter validation passed`, { requestId });

    let result;

    // If chatId is provided, get token usage for that specific chat
    if (chatId) {
      logDiagnostic('FETCH_CHAT_START', `Fetching token usage for specific chat`, {
        requestId,
        userId,
        chatId
      });

      result = await TokenTrackingService.getChatTokenUsage(chatId, userId);

      logDiagnostic('FETCH_CHAT_SUCCESS', `Successfully fetched chat token usage`, {
        requestId,
        messageCount: result.messageCount,
        totalTokens: result.totalTokens
      });
    } else if (type === 'daily') {
      logDiagnostic('FETCH_DAILY_START', `Fetching daily token usage`, {
        requestId,
        userId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        provider
      });

      // Get daily token usage
      result = await TokenTrackingService.getDailyTokenUsage(userId, {
        startDate,
        endDate,
        provider,
      });

      logDiagnostic('FETCH_DAILY_SUCCESS', `Successfully fetched daily token usage`, {
        requestId,
        recordCount: Array.isArray(result) ? result.length : 'unknown'
      });
    } else {
      logDiagnostic('FETCH_STATS_START', `Fetching user token stats`, {
        requestId,
        userId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        provider
      });

      // Get overall token usage statistics
      result = await TokenTrackingService.getUserTokenStats(userId, {
        startDate,
        endDate,
        provider,
      });

      logDiagnostic('FETCH_STATS_SUCCESS', `Successfully fetched user token stats`, {
        requestId,
        hasBreakdownByProvider: !!(result as any).breakdownByProvider
      });
    }

    const response = {
      success: true,
      data: result,
      meta: {
        userId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        provider,
        type,
        chatId,
      },
    };

    logDiagnostic('REQUEST_SUCCESS', `Token usage API request completed successfully`, {
      requestId,
      response: {
        ...response,
        // Don't log the full data to avoid overly verbose logs
        data: chatId ?
          { messageCount: (response.data as any).messageCount, totalTokens: (response.data as any).totalTokens } :
          type === 'daily' ?
            { recordCount: Array.isArray(response.data) ? response.data.length : 'unknown' } :
            { hasBreakdownByProvider: !!(response.data as any).breakdownByProvider }
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    logDiagnostic('REQUEST_ERROR', `Error in token usage API request`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('[Token Usage API] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve token usage data' } },
      { status: 500 }
    );
  }
}