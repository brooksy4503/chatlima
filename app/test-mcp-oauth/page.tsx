"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MCPOAuthProvider } from '@/lib/services/mcpOAuthProvider';
import { auth } from '@modelcontextprotocol/sdk/client/auth.js';

export default function TestMCPOAuthPage() {
    const [serverUrl, setServerUrl] = useState('https://api.supermemory.ai/mcp');
    const [serverId, setServerId] = useState('test-supermemory');
    const [status, setStatus] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(`[MCP OAuth Test] ${message}`);
    };

    const testOAuthFlow = async () => {
        setStatus('Testing...');
        setLogs([]);
        
        try {
            addLog(`Starting OAuth test for: ${serverUrl}`);
            
            const authProvider = new MCPOAuthProvider(serverUrl, serverId);
            
            addLog(`Redirect URL: ${authProvider.redirectUrl}`);
            addLog(`Client metadata: ${JSON.stringify(authProvider.clientMetadata, null, 2)}`);
            
            // Check existing client info
            const existingClientInfo = await authProvider.clientInformation();
            if (existingClientInfo) {
                addLog(`Found existing client info: ${JSON.stringify(existingClientInfo, null, 2)}`);
            } else {
                addLog('No existing client info - will register new client');
            }
            
            // Check existing tokens
            const existingTokens = await authProvider.tokens();
            if (existingTokens) {
                addLog(`Found existing tokens (expires in: ${existingTokens.expires_in}s)`);
            } else {
                addLog('No existing tokens');
            }
            
            addLog('Calling MCP SDK auth() function...');
            addLog('This will: 1) Register client if needed, 2) Generate PKCE, 3) Call redirectToAuthorization()');
            addLog('');
            addLog('IMPORTANT: Watch the browser console for [MCP OAuth] redirectToAuthorization logs');
            addLog('If you see redirectToAuthorization called, check what URL it uses');
            addLog('If you DON\'T see redirectToAuthorization called, the SDK may not be calling it');
            addLog('');
            
            const result = await auth(authProvider, { serverUrl: new URL(serverUrl) });
            
            addLog(`Auth function returned: ${result}`);
            
            if (result === 'REDIRECT') {
                addLog('');
                addLog('✅ Auth returned REDIRECT');
                addLog('');
                addLog('CHECK THESE THINGS:');
                addLog('1. Look in console for "[MCP OAuth] redirectToAuthorization CALLED"');
                addLog('2. Check what URL it shows - should point to SuperMemory, not ChatLima');
                addLog('3. Check Network tab - should see navigation to SuperMemory authorization page');
                addLog('4. If redirectToAuthorization was NOT called, the SDK has a bug');
                addLog('');
                addLog('If browser redirected to /oauth/callback without going to SuperMemory first,');
                addLog('that means redirectToAuthorization was either:');
                addLog('  - Not called at all, OR');
                addLog('  - Called with the wrong URL (ChatLima callback instead of SuperMemory auth)');
                setStatus('Check console for redirectToAuthorization call');
            } else if (result === 'AUTHORIZED') {
                addLog('✅ Already authorized!');
                setStatus('Already authorized');
            } else {
                addLog(`⚠ Unexpected result: ${result}`);
                setStatus(`Unexpected result: ${result}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`❌ Error: ${errorMessage}`);
            
            if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
                addLog('This looks like a CORS error or network issue');
                addLog('Check the Network tab for failed requests');
            }
            
            setStatus(`Error: ${errorMessage}`);
            console.error('OAuth test error:', error);
        }
    };

    const clearStorage = () => {
        // Clear all MCP OAuth storage for this server
        localStorage.removeItem(`mcp_oauth_${serverId}_tokens`);
        localStorage.removeItem(`mcp_oauth_${serverId}_client_info`);
        localStorage.removeItem(`mcp_oauth_${serverId}_code_verifier`);
        localStorage.removeItem(`mcp_oauth_${serverId}_tokens_stored_at`);
        addLog('Cleared all OAuth storage for this server');
        setStatus('Storage cleared');
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">MCP OAuth Test Page</h1>
            
            <div className="space-y-4 mb-6">
                <div>
                    <Label htmlFor="server-url">Server URL</Label>
                    <Input
                        id="server-url"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="https://api.supermemory.ai/mcp"
                    />
                </div>
                
                <div>
                    <Label htmlFor="server-id">Server ID (for storage)</Label>
                    <Input
                        id="server-id"
                        value={serverId}
                        onChange={(e) => setServerId(e.target.value)}
                        placeholder="test-supermemory"
                    />
                </div>
                
                <div className="flex gap-2">
                    <Button onClick={testOAuthFlow} disabled={!serverUrl || status === 'Testing...'}>
                        Test OAuth Flow
                    </Button>
                    <Button onClick={clearStorage} variant="outline">
                        Clear Storage
                    </Button>
                </div>
            </div>
            
            {status && (
                <div className={`p-4 rounded-md mb-4 ${
                    status.startsWith('Error') ? 'bg-red-100 text-red-800' :
                    status === 'Testing...' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    <strong>Status:</strong> {status}
                </div>
            )}
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <h2 className="font-bold mb-2">Logs:</h2>
                <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                        <div className="text-gray-500">No logs yet. Click &quot;Test OAuth Flow&quot; to start.</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="whitespace-pre-wrap break-words">{log}</div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <h3 className="font-bold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Enter the MCP server URL (e.g., https://api.supermemory.ai/mcp)</li>
                    <li>Enter a unique server ID (used for localStorage keys)</li>
                    <li>Click &quot;Test OAuth Flow&quot;</li>
                    <li>Watch the logs to see each step</li>
                    <li>Check the Network tab in DevTools to see HTTP requests</li>
                    <li>If redirect doesn&apos;t happen, check for errors in logs or Network tab</li>
                </ol>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h3 className="font-bold mb-2">What to Check:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Network Tab:</strong> Look for POST to `/api/auth/mcp/register` (client registration)</li>
                    <li><strong>Console:</strong> Look for `[MCP OAuth]` messages</li>
                    <li><strong>CORS Errors:</strong> If you see CORS errors, the server needs to enable CORS</li>
                    <li><strong>Redirect:</strong> Browser should navigate to authorization page after registration</li>
                </ul>
            </div>
        </div>
    );
}
