import { auth } from '@/lib/auth';
import { logDiagnostic } from '@/lib/utils/performantLogging';

export interface AuthenticatedUser {
    userId: string;
    isAnonymous: boolean;
    polarCustomerId?: string;
    openRouterUserId: string;
}

export class ChatAuthenticationError extends Error {
    code: string;
    status: number;

    constructor(code: string, message: string, status: number) {
        super(message);
        this.name = 'ChatAuthenticationError';
        this.code = code;
        this.status = status;
    }
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
            const billingEnforced = process.env.BILLING_ENFORCED === 'true';
            if (billingEnforced) {
                // Surface paywall code so the UI can show the access gate funnel.
                throw new ChatAuthenticationError(
                    'PAYWALL_SUBSCRIPTION_REQUIRED',
                    'Paid subscription required to chat.',
                    402
                );
            }

            throw new ChatAuthenticationError(
                'AUTHENTICATION_REQUIRED',
                'Authentication required. Please log in.',
                401
            );
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