import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';

// Define OAuth types locally since they may not be exported from the SDK
interface OAuthClientMetadata {
    client_name: string;
    client_uri?: string;
    redirect_uris: string[];
    grant_types: string[];
    response_types: string[];
    scope?: string;
    token_endpoint_auth_method?: string;
}

interface OAuthClientInformation {
    client_id: string;
    client_secret?: string;
    [key: string]: any;
}

interface OAuthTokens {
    access_token: string;
    token_type: string;  // Required by SDK
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
    scope?: string;
    [key: string]: any;
}

/**
 * OAuth provider for MCP servers that require authentication
 * Handles OAuth 2.1 flow with PKCE for browser-based authentication
 */
export class MCPOAuthProvider implements OAuthClientProvider {
    private serverUrl: string;
    private serverId: string;
    private storagePrefix: string;

    constructor(serverUrl: string, serverId: string) {
        this.serverUrl = serverUrl;
        this.serverId = serverId;
        this.storagePrefix = `mcp_oauth_${serverId}`;
    }

    get redirectUrl(): string {
        if (typeof window === 'undefined') {
            // Server-side: return a placeholder, but this shouldn't be called on server
            return '/oauth/callback';
        }
        return `${window.location.origin}/oauth/callback`;
    }

    get clientMetadata(): OAuthClientMetadata {
        return {
            client_name: 'ChatLima MCP Client',
            client_uri: typeof window !== 'undefined' ? window.location.origin : '',
            redirect_uris: [this.redirectUrl],
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            scope: 'read write',
            token_endpoint_auth_method: 'none', // PKCE is used instead
        };
    }

    async tokens(): Promise<OAuthTokens | undefined> {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const stored = localStorage.getItem(`${this.storagePrefix}_tokens`);
        if (!stored) {
            return undefined;
        }

        try {
            return JSON.parse(stored) as OAuthTokens;
        } catch {
            return undefined;
        }
    }

    async saveTokens(tokens: OAuthTokens): Promise<void> {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(`${this.storagePrefix}_tokens`, JSON.stringify(tokens));
        // Store timestamp for expiration checking
        localStorage.setItem(`${this.storagePrefix}_tokens_stored_at`, Date.now().toString());
    }

    async clientInformation(): Promise<OAuthClientInformation | undefined> {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const stored = localStorage.getItem(`${this.storagePrefix}_client_info`);
        if (!stored) {
            return undefined;
        }

        try {
            return JSON.parse(stored) as OAuthClientInformation;
        } catch {
            return undefined;
        }
    }

    async saveClientInformation(clientInformation: OAuthClientInformation): Promise<void> {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(
            `${this.storagePrefix}_client_info`,
            JSON.stringify(clientInformation)
        );
    }

    async codeVerifier(): Promise<string> {
        if (typeof window === 'undefined') {
            return '';
        }

        return localStorage.getItem(`${this.storagePrefix}_code_verifier`) || '';
    }

    async saveCodeVerifier(verifier: string): Promise<void> {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(`${this.storagePrefix}_code_verifier`, verifier);
    }

    async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
        if (typeof window === 'undefined') {
            throw new Error('Cannot redirect to authorization on server side');
        }

        // Store the server ID in sessionStorage so callback knows which server to complete auth for
        sessionStorage.setItem('mcp_oauth_server_id', this.serverId);
        sessionStorage.setItem('mcp_oauth_server_url', this.serverUrl);

        // Redirect to authorization URL
        window.location.href = authorizationUrl.toString();
    }

    /**
     * Clear all stored OAuth data for this server
     */
    clearAuthData(): void {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.removeItem(`${this.storagePrefix}_tokens`);
        localStorage.removeItem(`${this.storagePrefix}_client_info`);
        localStorage.removeItem(`${this.storagePrefix}_code_verifier`);
    }

    /**
     * Check if this server has valid tokens
     */
    async hasValidTokens(): Promise<boolean> {
        const tokens = await this.tokens();
        if (!tokens || !tokens.access_token) {
            return false;
        }

        // Check if token is expired (if expires_in is provided)
        if (tokens.expires_in) {
            const storedAt = localStorage.getItem(`${this.storagePrefix}_tokens_stored_at`);
            if (storedAt) {
                const storedTime = parseInt(storedAt, 10);
                const expiresAt = storedTime + (tokens.expires_in * 1000);
                if (Date.now() >= expiresAt) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Discover OAuth authorization server metadata
     * According to MCP spec, endpoints are discovered via /.well-known/oauth-authorization-server
     */
    private async discoverOAuthEndpoints(): Promise<{ token_endpoint: string; authorization_endpoint: string }> {
        const serverUrl = new URL(this.serverUrl);
        const baseUrl = `${serverUrl.protocol}//${serverUrl.host}`;

        // Try well-known endpoint first (RFC 8414)
        try {
            const metadataUrl = `${baseUrl}/.well-known/oauth-authorization-server`;
            const response = await fetch(metadataUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const metadata = await response.json();
                if (metadata.token_endpoint && metadata.authorization_endpoint) {
                    return {
                        token_endpoint: metadata.token_endpoint,
                        authorization_endpoint: metadata.authorization_endpoint,
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to discover OAuth endpoints via well-known:', error);
        }

        // Fallback to default endpoints at domain root (MCP spec)
        return {
            token_endpoint: `${baseUrl}/token`,
            authorization_endpoint: `${baseUrl}/authorize`,
        };
    }

    /**
     * Exchange authorization code for tokens
     * This is called from the OAuth callback page
     */
    async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
        if (typeof window === 'undefined') {
            throw new Error('Cannot exchange code on server side');
        }

        // Get required OAuth data
        const codeVerifier = await this.codeVerifier();
        const clientInfo = await this.clientInformation();

        if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try authorizing again.');
        }

        if (!clientInfo || !clientInfo.client_id) {
            throw new Error('Client information not found. Please try authorizing again.');
        }

        // Discover OAuth endpoints
        const endpoints = await this.discoverOAuthEndpoints();

        // Prepare token request (OAuth 2.1 with PKCE)
        const tokenRequest = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUrl,
            client_id: clientInfo.client_id,
            code_verifier: codeVerifier,
        });

        try {
            const response = await fetch(endpoints.token_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: tokenRequest.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Token exchange failed: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error_description || errorData.error || errorMessage;
                } catch {
                    errorMessage = `${errorMessage} ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const tokenData = await response.json();

            // Ensure token_type is set (required by SDK)
            const tokens: OAuthTokens = {
                access_token: tokenData.access_token,
                token_type: tokenData.token_type || 'Bearer',
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in,
                id_token: tokenData.id_token,
                scope: tokenData.scope,
            };

            // Save tokens
            await this.saveTokens(tokens);

            return tokens;
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }
}
