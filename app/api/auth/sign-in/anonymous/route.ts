"use server";

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
    console.log('Anonymous sign-in endpoint called');

    try {
        // Forward to the auth handler
        const response = await auth.handler(
            new Request(`${request.url.split('/api/auth')[0]}/api/auth/sign-in/anonymous`, {
                method: 'POST',
                headers: request.headers,
                body: request.body,
                // @ts-expect-error - duplex is required for Node.js but not included in the TypeScript types
                duplex: 'half'
            })
        );

        console.log('Anonymous sign-in response status:', response.status);

        // Check if the response is successful
        if (!response.ok) {
            // Clone the response to read the body
            const clonedResponse = response.clone();
            try {
                const responseBody = await clonedResponse.text();
                console.error('Auth handler error response:', responseBody);
            } catch (bodyError) {
                console.error('Could not read error response body:', bodyError);
            }

            // Still return the original response to maintain behavior
            return response;
        }

        console.log('Anonymous sign-in successful');
        return response;
    } catch (error) {
        console.error('Error in anonymous sign-in:', error);
        // Log more details about the error
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return new Response(
            JSON.stringify({ error: 'Failed to sign in anonymously' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 