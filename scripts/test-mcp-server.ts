#!/usr/bin/env tsx
/**
 * MCP Server Test Script
 * 
 * Tests MCP server connectivity, OAuth discovery, and tool listing.
 * 
 * Usage:
 *   pnpm tsx scripts/test-mcp-server.ts <server-url> [options]
 * 
 * Examples:
 *   pnpm tsx scripts/test-mcp-server.ts https://api.supermemory.ai/mcp
 *   pnpm tsx scripts/test-mcp-server.ts https://api.supermemory.ai/mcp --type streamable-http --oauth
 *   pnpm tsx scripts/test-mcp-server.ts https://mcp.example.com/sse --type sse
 */

import { Client as MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface TestOptions {
    url: string;
    type: 'sse' | 'stdio' | 'streamable-http';
    oauth?: boolean;
    headers?: Record<string, string>;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
}

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60));
}

function logSuccess(message: string) {
    log(`✓ ${message}`, 'green');
}

function logError(message: string) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
    log(`⚠ ${message}`, 'yellow');
}

function logInfo(message: string) {
    log(`ℹ ${message}`, 'cyan');
}

/**
 * Test OAuth client registration
 */
async function testOAuthClientRegistration(serverUrl: string, redirectUrl: string): Promise<boolean> {
    logSection('OAuth Client Registration Test');

    try {
        const url = new URL(serverUrl);
        const baseUrl = `${url.protocol}//${url.host}`;

        // First, discover the registration endpoint
        const wellKnownUrl = `${baseUrl}/.well-known/oauth-authorization-server`;
        logInfo(`Discovering registration endpoint from: ${wellKnownUrl}`);

        const metadataResponse = await fetch(wellKnownUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!metadataResponse.ok) {
            logError(`Failed to fetch OAuth metadata: ${metadataResponse.status}`);
            return false;
        }

        const metadata = await metadataResponse.json();
        const registrationEndpoint = metadata.registration_endpoint;

        if (!registrationEndpoint) {
            logWarning('No registration endpoint found in metadata');
            return false;
        }

        logSuccess(`Found registration endpoint: ${registrationEndpoint}`);

        // Prepare client registration request
        const clientMetadata = {
            client_name: 'ChatLima MCP Test Client',
            client_uri: 'https://chatlima.com',
            redirect_uris: [redirectUrl],
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            scope: 'openid profile email offline_access',
            token_endpoint_auth_method: 'none', // PKCE
        };

        logInfo(`Registering client with metadata:`, clientMetadata);
        logInfo(`Registration endpoint: ${registrationEndpoint}`);

        const registrationResponse = await fetch(registrationEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(clientMetadata),
        });

        logInfo(`Registration response status: ${registrationResponse.status} ${registrationResponse.statusText}`);

        if (registrationResponse.ok) {
            const clientInfo = await registrationResponse.json();
            logSuccess('Client registered successfully!');
            console.log('Client information:', JSON.stringify(clientInfo, null, 2));
            return true;
        } else {
            const errorText = await registrationResponse.text();
            logError(`Client registration failed: ${registrationResponse.status}`);
            logInfo(`Response: ${errorText.substring(0, 500)}`);

            // Check for CORS error
            if (registrationResponse.status === 0 || errorText.includes('CORS')) {
                logWarning('This appears to be a CORS error. The server may not allow cross-origin requests.');
                logWarning('Client registration must be done from the browser, not from a Node.js script.');
            }

            return false;
        }
    } catch (error) {
        logError(`Registration test failed: ${error instanceof Error ? error.message : String(error)}`);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            logWarning('This is likely a CORS issue. Client registration must be done from the browser.');
        }

        return false;
    }
}

/**
 * Test OAuth endpoint discovery
 */
async function testOAuthDiscovery(serverUrl: string): Promise<void> {
    logSection('OAuth Endpoint Discovery Test');

    try {
        const url = new URL(serverUrl);
        const baseUrl = `${url.protocol}//${url.host}`;
        const wellKnownUrl = `${baseUrl}/.well-known/oauth-authorization-server`;

        logInfo(`Testing well-known endpoint: ${wellKnownUrl}`);

        try {
            const response = await fetch(wellKnownUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            logInfo(`Response status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const metadata = await response.json();
                logSuccess('OAuth metadata discovered successfully');
                console.log(JSON.stringify(metadata, null, 2));

                if (metadata.token_endpoint && metadata.authorization_endpoint) {
                    logSuccess(`Token endpoint: ${metadata.token_endpoint}`);
                    logSuccess(`Authorization endpoint: ${metadata.authorization_endpoint}`);
                } else {
                    logWarning('Missing required OAuth endpoints in metadata');
                }
            } else {
                const text = await response.text();
                logWarning(`Well-known endpoint returned ${response.status}`);
                logInfo(`Response: ${text.substring(0, 200)}`);

                // Try fallback endpoints
                logInfo('Trying fallback endpoints...');
                const fallbackToken = `${baseUrl}/token`;
                const fallbackAuth = `${baseUrl}/authorize`;

                logInfo(`Fallback token endpoint: ${fallbackToken}`);
                logInfo(`Fallback authorization endpoint: ${fallbackAuth}`);
            }
        } catch (fetchError) {
            logError(`Failed to fetch well-known endpoint: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);

            if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
                logWarning('This might be a CORS issue or network connectivity problem');
                logInfo('Note: OAuth discovery requires CORS to be enabled on the server');
            }
        }
    } catch (urlError) {
        logError(`Invalid URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
    }
}

/**
 * Test basic connectivity to the server
 */
async function testBasicConnectivity(url: string): Promise<boolean> {
    logSection('Basic Connectivity Test');

    try {
        const serverUrl = new URL(url);
        const baseUrl = `${serverUrl.protocol}//${serverUrl.host}`;

        logInfo(`Testing connectivity to: ${baseUrl}`);

        // Try a simple HEAD request to check if server is reachable
        try {
            const response = await fetch(baseUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            logSuccess(`Server is reachable (${response.status} ${response.statusText})`);
            return true;
        } catch (fetchError) {
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                logError('Connection timeout - server may be unreachable or slow');
            } else {
                logError(`Connection failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
            }
            return false;
        }
    } catch (urlError) {
        logError(`Invalid URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
        return false;
    }
}

/**
 * Test MCP protocol connection
 */
async function testMCPConnection(options: TestOptions): Promise<boolean> {
    logSection('MCP Protocol Connection Test');

    try {
        logInfo(`Connecting to ${options.url} using ${options.type} transport...`);

        let transport;

        switch (options.type) {
            case 'sse':
                transport = new SSEClientTransport(
                    new URL(options.url),
                    options.headers ? { requestInit: { headers: options.headers } } : undefined
                );
                break;

            case 'streamable-http':
                transport = new StreamableHTTPClientTransport(
                    new URL(options.url),
                    options.headers ? { requestInit: { headers: options.headers } } : undefined
                );
                break;

            case 'stdio':
                if (!options.command || !options.args) {
                    logError('Command and args are required for stdio transport');
                    return false;
                }
                transport = new StdioClientTransport({
                    command: options.command,
                    args: options.args,
                    env: options.env as Record<string, string> || process.env as Record<string, string>
                });
                break;

            default:
                logError(`Unsupported transport type: ${options.type}`);
                return false;
        }

        const client = new MCPClient(
            { name: 'chatlima-test-client', version: '1.0.0' },
            { capabilities: {} }
        );

        logInfo('Connecting MCP client...');
        await client.connect(transport);
        logSuccess('MCP client connected successfully');

        // Test listing tools
        logInfo('Listing available tools...');
        const toolsList = await client.listTools();
        const tools = toolsList.tools || [];

        if (tools.length > 0) {
            logSuccess(`Found ${tools.length} tool(s):`);
            tools.forEach((tool: any) => {
                console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
            });
        } else {
            logWarning('No tools found on this MCP server');
        }

        // Test listing resources (if available)
        try {
            logInfo('Listing available resources...');
            const resourcesList = await client.listResources();
            const resources = resourcesList.resources || [];

            if (resources.length > 0) {
                logSuccess(`Found ${resources.length} resource(s):`);
                resources.forEach((resource: any) => {
                    console.log(`  - ${resource.uri}: ${resource.name || 'Unnamed'}`);
                });
            } else {
                logInfo('No resources found (this is normal for many MCP servers)');
            }
        } catch (error) {
            logWarning(`Resource listing not supported or failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Clean up
        await client.close();
        logSuccess('MCP client disconnected cleanly');

        return true;
    } catch (error) {
        logError(`MCP connection failed: ${error instanceof Error ? error.message : String(error)}`);

        if (error instanceof Error && error.stack) {
            logInfo('Stack trace:');
            console.log(error.stack);
        }

        // Provide helpful error messages
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                logWarning('This might be a CORS issue. Check if the server allows cross-origin requests.');
            }
            if (error.message.includes('401') || error.message.includes('403')) {
                logWarning('Authentication required. Try enabling OAuth or adding authentication headers.');
            }
            if (error.message.includes('404')) {
                logWarning('Endpoint not found. Verify the URL path is correct.');
            }
        }

        return false;
    }
}

/**
 * Parse command line arguments
 */
function parseArgs(): TestOptions | null {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
Usage: pnpm tsx scripts/test-mcp-server.ts <server-url> [options]

Options:
  --type <type>              Transport type: sse, stdio, or streamable-http (default: streamable-http)
  --oauth                     Test OAuth endpoint discovery
  --header <key:value>        Add HTTP header (can be used multiple times)
  --command <cmd>             Command for stdio transport
  --args <args>              Arguments for stdio transport (space-separated)
  --env <key=value>           Environment variable for stdio transport (can be used multiple times)

Examples:
  pnpm tsx scripts/test-mcp-server.ts https://api.supermemory.ai/mcp
  pnpm tsx scripts/test-mcp-server.ts https://api.supermemory.ai/mcp --type streamable-http --oauth
  pnpm tsx scripts/test-mcp-server.ts https://mcp.example.com/sse --type sse --header "Authorization:Bearer token123"
  pnpm tsx scripts/test-mcp-server.ts --type stdio --command node --args "server.js --port 3000"
        `);
        return null;
    }

    const url = args[0];
    const options: TestOptions = {
        url,
        type: 'streamable-http',
        headers: {},
        env: {},
    };

    for (let i = 1; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--type' && i + 1 < args.length) {
            const type = args[++i] as 'sse' | 'stdio' | 'streamable-http';
            if (['sse', 'stdio', 'streamable-http'].includes(type)) {
                options.type = type;
            } else {
                logError(`Invalid transport type: ${type}`);
                return null;
            }
        } else if (arg === '--oauth') {
            options.oauth = true;
        } else if (arg === '--header' && i + 1 < args.length) {
            const header = args[++i];
            const [key, ...valueParts] = header.split(':');
            if (key && valueParts.length > 0) {
                options.headers![key] = valueParts.join(':');
            } else {
                logError(`Invalid header format: ${header}. Use key:value`);
                return null;
            }
        } else if (arg === '--command' && i + 1 < args.length) {
            options.command = args[++i];
        } else if (arg === '--args' && i + 1 < args.length) {
            options.args = args[++i].split(' ');
        } else if (arg === '--env' && i + 1 < args.length) {
            const env = args[++i];
            const [key, ...valueParts] = env.split('=');
            if (key && valueParts.length > 0) {
                options.env![key] = valueParts.join('=');
            } else {
                logError(`Invalid env format: ${env}. Use key=value`);
                return null;
            }
        }
    }

    return options;
}

/**
 * Main test function
 */
async function main() {
    log('MCP Server Test Script', 'bright');
    log('======================', 'bright');

    const options = parseArgs();
    if (!options) {
        process.exit(1);
    }

    console.log('\nConfiguration:');
    console.log(`  URL: ${options.url}`);
    console.log(`  Type: ${options.type}`);
    if (options.oauth) {
        console.log(`  OAuth: enabled`);
    }
    if (options.headers && Object.keys(options.headers).length > 0) {
        console.log(`  Headers: ${Object.keys(options.headers).length} header(s)`);
    }
    if (options.command) {
        console.log(`  Command: ${options.command}`);
    }
    if (options.args && options.args.length > 0) {
        console.log(`  Args: ${options.args.join(' ')}`);
    }

    let allTestsPassed = true;

    // Test 1: Basic connectivity
    const connectivityOk = await testBasicConnectivity(options.url);
    if (!connectivityOk) {
        logWarning('Basic connectivity test failed - subsequent tests may also fail');
        allTestsPassed = false;
    }

    // Test 2: OAuth discovery (if requested or if OAuth is enabled)
    if (options.oauth || options.type === 'streamable-http') {
        await testOAuthDiscovery(options.url);

        // Test client registration (this will likely fail due to CORS, but shows what would happen)
        if (options.oauth) {
            const redirectUrl = 'http://localhost:3000/oauth/callback'; // Default for testing
            logInfo('\nNote: Client registration test runs server-side and may fail due to CORS.');
            logInfo('In the browser, the MCP SDK will handle registration automatically.');
            await testOAuthClientRegistration(options.url, redirectUrl);
        }
    }

    // Test 3: MCP protocol connection
    const mcpOk = await testMCPConnection(options);
    if (!mcpOk) {
        allTestsPassed = false;
    }

    // Summary
    logSection('Test Summary');
    if (allTestsPassed && connectivityOk && mcpOk) {
        logSuccess('All tests passed!');
        process.exit(0);
    } else {
        logError('Some tests failed. Review the output above for details.');
        process.exit(1);
    }
}

// Run the tests
main().catch((error) => {
    logError(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
        console.error(error.stack);
    }
    process.exit(1);
});
