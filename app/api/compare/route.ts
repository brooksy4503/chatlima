import { handleCompareRequest } from '@/lib/chat/compareOrchestrator';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    return await handleCompareRequest(req);
  } catch (error) {
    console.error('[Compare API] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Compare failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
