import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AuthContext } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * Authentication and authorization middleware
 */
export class AuthMiddleware {
    /**
     * Authenticate the user and return auth context
     */
    static async authenticate(req: NextRequest): Promise<AuthContext> {
        const requestId = nanoid();

        try {
            const session = await auth.api.getSession({ headers: req.headers });

            if (!session?.user?.id) {
                return {
                    userId: '',
                    isAuthenticated: false,
                    isAnonymous: false,
                };
            }

            const user = session.user;

            // Query database for admin status since session might not include these fields
            let isAdmin = false;
            let isAnonymous = false;
            let hasSubscription = false;
            let subscriptionType: 'monthly' | 'yearly' | null = null;
            let hasUnlimitedFreeModels = false;

            try {
                const { db } = await import('@/lib/db');
                const { users } = await import('@/lib/db/schema');
                const { eq } = await import('drizzle-orm');
                const { hasUnlimitedFreeModels: checkUnlimited } = await import('@/lib/polar');

                const userResult = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, user.id))
                    .limit(1);

                if (userResult.length > 0) {
                    const dbUser = userResult[0];
                    isAdmin = dbUser.role === 'admin' || dbUser.isAdmin === true;
                    isAnonymous = dbUser.isAnonymous === true;
                    const metadata = (dbUser.metadata as any) || {};
                    hasSubscription = metadata.hasSubscription || false;
                    subscriptionType = metadata.subscriptionType || null;
                    
                    // Check for unlimited free models access (yearly subscription)
                    if (!isAnonymous && subscriptionType === 'yearly') {
                        try {
                            hasUnlimitedFreeModels = await checkUnlimited(user.id);
                        } catch (error) {
                            console.warn('[AuthMiddleware] Error checking unlimited free models:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('[AuthMiddleware] Error querying user admin status:', error);
                // Fallback to session fields
                isAdmin = (user as any)?.role === 'admin' || (user as any)?.isAdmin === true;
                isAnonymous = (user as any)?.isAnonymous === true;
                const metadata = (user as any)?.metadata || {};
                hasSubscription = metadata.hasSubscription || false;
                subscriptionType = metadata.subscriptionType || null;
            }

            return {
                userId: user.id,
                isAuthenticated: true,
                isAdmin,
                isAnonymous,
                hasSubscription,
                subscriptionType,
                hasUnlimitedFreeModels,
            };
        } catch (error) {
            console.error('[AuthMiddleware] Authentication error:', error);
            return {
                userId: '',
                isAuthenticated: false,
                isAnonymous: false,
            };
        }
    }

    /**
     * Require authentication - returns 401 if not authenticated
     */
    static async requireAuth(req: NextRequest): Promise<{ authContext: AuthContext; response?: NextResponse }> {
        const authContext = await this.authenticate(req);

        if (!authContext.isAuthenticated) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required'
                    }
                },
                { status: 401 }
            );
            return { authContext, response };
        }

        return { authContext };
    }

    /**
     * Require admin access - returns 403 if not admin
     */
    static async requireAdmin(req: NextRequest): Promise<{ authContext: AuthContext; response?: NextResponse }> {
        const authResult = await this.requireAuth(req);

        if (authResult.response) {
            return authResult;
        }

        if (!authResult.authContext.isAdmin) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Admin access required'
                    }
                },
                { status: 403 }
            );
            return { authContext: authResult.authContext, response };
        }

        return { authContext: authResult.authContext };
    }

    /**
     * Require subscription - returns 403 if no active subscription
     */
    static async requireSubscription(req: NextRequest): Promise<{ authContext: AuthContext; response?: NextResponse }> {
        const authResult = await this.requireAuth(req);

        if (authResult.response) {
            return authResult;
        }

        if (!authResult.authContext.hasSubscription && !authResult.authContext.isAnonymous) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'SUBSCRIPTION_REQUIRED',
                        message: 'Active subscription required'
                    }
                },
                { status: 403 }
            );
            return { authContext: authResult.authContext, response };
        }

        return { authContext: authResult.authContext };
    }
}