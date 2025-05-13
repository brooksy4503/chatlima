import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Export the handlers wrapped for Next.js App Router
export const { GET, POST } = toNextJsHandler(auth.handler);

// Log that Better-Auth routes are registered
console.log('Better-Auth routes registered successfully'); 