import { test, expect } from '@playwright/test';

test.describe('Premium Model Security Tests', () => {
    test('Anonymous users should be blocked from accessing premium models', async ({ request }) => {
        // Create an anonymous session first
        const authResponse = await request.post('/api/auth/sign-in/anonymous');
        expect(authResponse.ok()).toBeTruthy();

        const authData = await authResponse.json();
        const sessionCookie = authResponse.headers()['set-cookie']?.[0];

        // Attempt to use Claude 4 Opus (premium model) as anonymous user
        const chatResponse = await request.post('/api/chat', {
            headers: {
                'Cookie': sessionCookie || '',
                'Content-Type': 'application/json',
            },
            data: {
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message',
                    },
                ],
                selectedModel: 'openrouter/anthropic/claude-4-opus-20250522',
                webSearch: { enabled: false },
                apiKeys: {},
                attachments: [],
            },
        });

        // Should be blocked with 403 Forbidden
        expect(chatResponse.status()).toBe(403);

        const errorData = await chatResponse.json();
        expect(errorData.error).toBe('PREMIUM_MODEL_RESTRICTED');
        expect(errorData.message).toContain('Anonymous users cannot access premium models');
    });

    test('Anonymous users should still access free models', async ({ request }) => {
        // Create an anonymous session first
        const authResponse = await request.post('/api/auth/sign-in/anonymous');
        expect(authResponse.ok()).toBeTruthy();

        const sessionCookie = authResponse.headers()['set-cookie']?.[0];

        // Attempt to use a free model as anonymous user
        const chatResponse = await request.post('/api/chat', {
            headers: {
                'Cookie': sessionCookie || '',
                'Content-Type': 'application/json',
            },
            data: {
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message',
                    },
                ],
                selectedModel: 'openrouter/mistralai/mistral-7b-instruct:free',
                webSearch: { enabled: false },
                apiKeys: {},
                attachments: [],
            },
        });

        // Should be allowed (200 or streaming response)
        expect([200, 201]).toContain(chatResponse.status());
    });

    test('Users with own API keys can access premium models', async ({ request }) => {
        // Create an anonymous session first
        const authResponse = await request.post('/api/auth/sign-in/anonymous');
        expect(authResponse.ok()).toBeTruthy();

        const sessionCookie = authResponse.headers()['set-cookie']?.[0];

        // Attempt to use premium model with own API key
        const chatResponse = await request.post('/api/chat', {
            headers: {
                'Cookie': sessionCookie || '',
                'Content-Type': 'application/json',
            },
            data: {
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message',
                    },
                ],
                selectedModel: 'openrouter/anthropic/claude-4-opus-20250522',
                webSearch: { enabled: false },
                apiKeys: {
                    'OPENROUTER_API_KEY': 'sk-or-test-key-12345', // Mock API key
                },
                attachments: [],
            },
        });

        // Should be allowed even for anonymous users with own API keys
        expect([200, 201]).toContain(chatResponse.status());
    });
}); 