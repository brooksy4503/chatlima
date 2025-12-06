"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MCPOAuthProvider } from '@/lib/services/mcpOAuthProvider';

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing authorization...');
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessedRef.current) {
            return;
        }

        const handleCallback = async () => {
            hasProcessedRef.current = true;
            
            // Get server ID from sessionStorage (set during redirect)
            const serverId = sessionStorage.getItem('mcp_oauth_server_id');
            const serverUrl = sessionStorage.getItem('mcp_oauth_server_url');

            // Get authorization code and state from URL
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            try {
                if (!serverId || !serverUrl) {
                    throw new Error('Missing server information. Please try authorizing again.');
                }

                if (error) {
                    throw new Error(errorDescription || error || 'Authorization failed');
                }

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Create OAuth provider
                const authProvider = new MCPOAuthProvider(serverUrl, serverId);

                console.log(`[MCP OAuth] Callback received code, exchanging for tokens...`);
                console.log(`[MCP OAuth] Server: ${serverUrl}, Server ID: ${serverId}`);

                // Exchange the authorization code for tokens
                // We do NOT call auth() here because that function initiates the flow,
                // not completes it. Calling it would cause a redirect loop.
                await authProvider.exchangeCodeForTokens(code);
                
                console.log(`[MCP OAuth] Token exchange successful!`);

                setStatus('success');
                setMessage('Authorization successful! Redirecting...');

                // Clear session storage
                sessionStorage.removeItem('mcp_oauth_server_id');
                sessionStorage.removeItem('mcp_oauth_server_url');

                // Redirect back to chat (or previous page)
                // Default to root '/' since that's where the main chat page is
                const returnUrl = sessionStorage.getItem('mcp_oauth_return_url') || '/';
                sessionStorage.removeItem('mcp_oauth_return_url');
                
                console.log(`[MCP OAuth] OAuth successful, redirecting to: ${returnUrl}`);
                
                setTimeout(() => {
                    router.push(returnUrl);
                }, 1500);
            } catch (error) {
                console.error('OAuth callback error:', error);
                const errorMessage = error instanceof Error ? error.message : 'An error occurred during authorization';
                console.error('Error details:', {
                    error,
                    serverId: serverId || 'missing',
                    serverUrl: serverUrl || 'missing',
                    code: code ? 'present' : 'missing',
                    errorMessage,
                });
                
                setStatus('error');
                setMessage(errorMessage);

                // Get return URL before clearing session storage
                const returnUrl = sessionStorage.getItem('mcp_oauth_return_url') || '/';

                // Clear session storage on error
                sessionStorage.removeItem('mcp_oauth_server_id');
                sessionStorage.removeItem('mcp_oauth_server_url');
                sessionStorage.removeItem('mcp_oauth_return_url');
                
                console.log(`[MCP OAuth] OAuth failed, redirecting to: ${returnUrl}`);
                
                setTimeout(() => {
                    router.push(returnUrl);
                }, 3000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4 p-8">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-4xl mb-4">✓</div>
                        <p className="text-lg font-semibold">{message}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-red-500 text-4xl mb-4">✗</div>
                        <p className="text-lg font-semibold text-red-500">{message}</p>
                        <p className="text-sm text-muted-foreground mt-2">Redirecting to chat...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center space-y-4 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}
