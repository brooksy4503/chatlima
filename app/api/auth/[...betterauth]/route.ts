import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Export the handlers wrapped for Next.js App Router
export const { GET, POST } = toNextJsHandler(auth.handler);

// Note: Removed console.log that was running on every module load in dev mode
// This was causing excessive logging due to Next.js Turbopack hot module reloading 