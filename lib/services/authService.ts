import { auth } from '@/lib/auth';

export interface AuthResult {
    session: any | null;
    userId: string;
    isAnonymous: boolean;
    polarCustomerId?: string;
    openRouterUserId: string;
}

export interface EarlyAuthResult {
    session: any | null;
    userId: string;
    isAnonymous: boolean;
}

export class AuthService {
    /**
     * Get early session for initial processing (before full validation)
     */
    static async getEarlySession(req: Request): Promise<EarlyAuthResult> {
        const earlySession = await auth.api.getSession({ headers: req.headers });
        const earlyUserId = earlySession?.user?.id || 'anonymous';
        const earlyIsAnonymous = (earlySession?.user as any)?.isAnonymous === true;

        return {
            session: earlySession,
            userId: earlyUserId,
            isAnonymous: earlyIsAnonymous,
        };
    }

    /**
     * Get full session with all authentication details
     */
    static async getFullSession(req: Request): Promise<AuthResult> {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return {
                session: null,
                userId: 'anonymous',
                isAnonymous: true,
                openRouterUserId: 'anonymous',
            };
        }

        const isAnonymous = (session.user as any).isAnonymous === true;
        const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;

        const openRouterUserId = isAnonymous
            ? 'anonymous'
            : session.user.id;

        return {
            session,
            userId: session.user.id,
            isAnonymous,
            polarCustomerId,
            openRouterUserId,
        };
    }

    /**
     * Check if user is anonymous
     */
    static isAnonymousUser(session: any | null): boolean {
        if (!session?.user) return true;
        return (session.user as any).isAnonymous === true;
    }

    /**
     * Extract Polar customer ID from session
     */
    static getPolarCustomerId(session: any | null): string | undefined {
        if (!session?.user) return undefined;
        return (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;
    }

    /**
     * Get user type description for logging/display
     */
    static getUserTypeDescription(isAnonymous: boolean): string {
        return isAnonymous ? "Anonymous users" : "Users without credits";
    }
}
