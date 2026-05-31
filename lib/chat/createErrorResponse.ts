export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: string
): Response {
  return new Response(
    JSON.stringify({ error: { code, message, details } }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}
