// Mock dependencies
jest.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn()
        }
    }
}));

jest.mock('@/lib/utils/performantLogging', () => ({
    logDiagnostic: jest.fn()
}));

jest.mock('@/app/api/chat/route', () => ({
    createErrorResponse: jest.fn()
}), { virtual: true });

import { ChatAuthenticationService, AuthenticatedUser } from '../chatAuthenticationService';
import { auth } from '@/lib/auth';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import { createErrorResponse } from '@/app/api/chat/route';

describe('ChatAuthenticationService', () => {
    const mockAuth = auth.api.getSession as jest.MockedFunction<typeof auth.api.getSession>;
    const mockLogDiagnostic = logDiagnostic as jest.MockedFunction<typeof logDiagnostic>;
    const mockCreateErrorResponse = createErrorResponse as jest.MockedFunction<typeof createErrorResponse>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockSession = (userOverrides: any = {}) => ({
        session: {
            id: 'session123',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: userOverrides.id || 'user123',
            expiresAt: new Date(Date.now() + 3600000),
            token: 'token123',
            ipAddress: null,
            userAgent: null
        },
        user: {
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            image: null,
            isAnonymous: false,
            ...userOverrides
        }
    });

    describe('authenticateUser', () => {
        const mockRequest = {
            headers: new Headers({ 'authorization': 'Bearer token' })
        } as Request;

        it('should successfully authenticate a regular user', async () => {
            const mockSession = createMockSession({
                id: 'user123',
                isAnonymous: false,
                polarCustomerId: 'polar456'
            });

            mockAuth.mockResolvedValue(mockSession);

            const result = await ChatAuthenticationService.authenticateUser(mockRequest);

            expect(result).toEqual({
                userId: 'user123',
                isAnonymous: false,
                polarCustomerId: 'polar456',
                openRouterUserId: 'chatlima_user_user123'
            });

            expect(mockAuth).toHaveBeenCalledWith({ headers: mockRequest.headers });
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_START',
                'Starting authentication check',
                expect.objectContaining({ requestId: expect.any(String) })
            );
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_SUCCESS',
                'Authentication successful',
                expect.objectContaining({
                    requestId: expect.any(String),
                    userId: 'user123',
                    isAnonymous: false,
                    polarCustomerId: 'present'
                })
            );
        });

        it('should successfully authenticate an anonymous user', async () => {
            const mockSession = createMockSession({
                id: 'anon123',
                isAnonymous: true
            });

            mockAuth.mockResolvedValue(mockSession);

            const result = await ChatAuthenticationService.authenticateUser(mockRequest);

            expect(result).toEqual({
                userId: 'anon123',
                isAnonymous: true,
                polarCustomerId: undefined,
                openRouterUserId: 'chatlima_anon_anon123'
            });

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_SUCCESS',
                'Authentication successful',
                expect.objectContaining({
                    requestId: expect.any(String),
                    userId: 'anon123',
                    isAnonymous: true,
                    polarCustomerId: 'absent'
                })
            );
        });

        it('should handle polarCustomerId from metadata', async () => {
            const mockSession = createMockSession({
                id: 'user123',
                isAnonymous: false,
                metadata: {
                    polarCustomerId: 'meta789'
                }
            });

            mockAuth.mockResolvedValue(mockSession);

            const result = await ChatAuthenticationService.authenticateUser(mockRequest);

            expect(result.polarCustomerId).toBe('meta789');
        });

        it('should throw error when no session exists', async () => {
            mockAuth.mockResolvedValue(null);

            await expect(ChatAuthenticationService.authenticateUser(mockRequest))
                .rejects.toThrow();

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_FAILED',
                'Authentication failed - no session',
                expect.objectContaining({ requestId: expect.any(String) })
            );
        });

        it('should throw error when session exists but no user', async () => {
            const mockSession = {
                session: {
                    id: 'session123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user123',
                    expiresAt: new Date(Date.now() + 3600000),
                    token: 'token123',
                    ipAddress: null,
                    userAgent: null
                },
                user: null
            } as any;

            mockAuth.mockResolvedValue(mockSession);

            await expect(ChatAuthenticationService.authenticateUser(mockRequest))
                .rejects.toThrow("Authentication required. Please log in.");
        });

        it('should throw error when session exists but user has no id', async () => {
            const mockSession = {
                session: {
                    id: 'session123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: 'user123',
                    expiresAt: new Date(Date.now() + 3600000),
                    token: 'token123',
                    ipAddress: null,
                    userAgent: null
                },
                user: {
                    id: null
                }
            } as any;

            mockAuth.mockResolvedValue(mockSession);

            await expect(ChatAuthenticationService.authenticateUser(mockRequest))
                .rejects.toThrow("Authentication required. Please log in.");
        });

        it('should handle auth API errors', async () => {
            const authError = new Error('Auth service unavailable');
            mockAuth.mockRejectedValue(authError);

            await expect(ChatAuthenticationService.authenticateUser(mockRequest))
                .rejects.toThrow(authError);

            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_START',
                'Starting authentication check',
                expect.objectContaining({ requestId: expect.any(String) })
            );
        });

        it('should generate unique request IDs for each call', async () => {
            const mockSession = createMockSession({
                id: 'user123',
                isAnonymous: false
            });

            mockAuth.mockResolvedValue(mockSession);

            await ChatAuthenticationService.authenticateUser(mockRequest);
            await ChatAuthenticationService.authenticateUser(mockRequest);

            const calls = mockLogDiagnostic.mock.calls.filter(call => call[0] === 'AUTH_START');
            expect(calls[0][2].requestId).not.toBe(calls[1][2].requestId);
        });

        it('should handle undefined polarCustomerId gracefully', async () => {
            const mockSession = createMockSession({
                id: 'user123',
                isAnonymous: false,
                polarCustomerId: undefined,
                metadata: undefined
            });

            mockAuth.mockResolvedValue(mockSession);

            const result = await ChatAuthenticationService.authenticateUser(mockRequest);

            expect(result.polarCustomerId).toBeUndefined();
            expect(mockLogDiagnostic).toHaveBeenCalledWith(
                'AUTH_SUCCESS',
                'Authentication successful',
                expect.objectContaining({
                    polarCustomerId: 'absent'
                })
            );
        });
    });
});