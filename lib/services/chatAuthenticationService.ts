import { auth } from '@/lib/auth';
import { createErrorResponse } from '@/app/api/chat/route';
import { logDiagnostic } from '@/lib/utils/performantLogging';

export interface AuthenticatedUser {
    userId: string;
    isAnonymous: boolean;
    polarCustomerId?: string;
    openRouterUserId: string;
}

export class ChatAuthenticationService {
    /**
     * Authenticates the user and returns authentication context
     */
    static async authenticateUser(req: Request): Promise<AuthenticatedUser> {
        const requestId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('AUTH_START', 'Starting authentication check', { requestId });

        const session = await auth.api.getSession({ headers: req.headers });

        // If no session exists, return error
        if (!session || !session.user || !session.user.id) {
            logDiagnostic('AUTH_FAILED', 'Authentication failed - no session', { requestId });
            throw new Error("Authentication required. Please log in.");
        }

        const userId = session.user.id;
        const isAnonymous = (session.user as any)?.isAnonymous === true;

        // Create OpenRouter user identifier for tracking
        const openRouterUserId = isAnonymous
            ? `chatlima_anon_${userId}`
            : `chatlima_user_${userId}`;

        // Try to get the Polar customer ID from session
        const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;

        logDiagnostic('AUTH_SUCCESS', 'Authentication successful', {
            requestId,
            userId,
            isAnonymous,
            polarCustomerId: polarCustomerId ? 'present' : 'absent'
        });

        return {
            userId,
            isAnonymous,
            polarCustomerId,
            openRouterUserId
        };
    }
}