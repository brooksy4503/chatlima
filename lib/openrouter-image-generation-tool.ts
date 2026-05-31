import { tool } from 'ai';
import { put } from '@vercel/blob';
import { z } from 'zod';

export type ImageGenerationQuality = 'low' | 'medium' | 'high';
export type ImageGenerationOutputFormat = 'png' | 'jpeg' | 'webp';

export interface ImageGenerationToolParameters {
    model?: string;
    quality?: ImageGenerationQuality;
    aspectRatio?: string;
    size?: string;
    background?: string;
    outputFormat?: ImageGenerationOutputFormat;
    apiKey?: string;
}

const imageGenerationInputSchema = z.object({
    prompt: z.string().min(1).describe('A detailed visual prompt describing the image to generate.'),
});

const imageGenerationResultSchema = z.object({
    status: z.string().optional(),
    imageUrl: z.string().optional(),
    image_url: z.string().optional(),
    error: z.string().optional(),
});

type ImageGenerationResult = z.infer<typeof imageGenerationResultSchema>;

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } | null {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
        return null;
    }

    return {
        contentType: match[1],
        buffer: Buffer.from(match[2], 'base64'),
    };
}

async function persistGeneratedImage(dataUrl: string, outputFormat?: ImageGenerationOutputFormat): Promise<string> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return dataUrl;
    }

    const decoded = dataUrlToBuffer(dataUrl);
    if (!decoded) {
        return dataUrl;
    }

    const extension = outputFormat ?? decoded.contentType.split('/')[1] ?? 'png';
    const blob = await put(
        `generated-images/${crypto.randomUUID()}.${extension}`,
        decoded.buffer,
        {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: decoded.contentType,
        }
    );

    return blob.url;
}

function extractImageUrl(response: unknown): string | null {
    const data = response as {
        choices?: Array<{
            message?: {
                images?: Array<{ image_url?: { url?: string }; imageUrl?: { url?: string } | string }>;
            };
        }>;
    };

    const firstImage = data.choices?.[0]?.message?.images?.[0];
    if (!firstImage) {
        return null;
    }

    if (typeof firstImage.image_url?.url === 'string') {
        return firstImage.image_url.url;
    }

    if (typeof firstImage.imageUrl === 'string') {
        return firstImage.imageUrl;
    }

    if (typeof firstImage.imageUrl?.url === 'string') {
        return firstImage.imageUrl.url;
    }

    return null;
}

/**
 * App-executed image generation tool backed by OpenRouter image-output models.
 *
 * OpenRouter's `openrouter:image_generation` server tool can create images, but
 * the generated URL is not reliably exposed to callers. Calling an image-output
 * model directly returns `message.images[]`, which Chatlima can persist/render.
 */
export function createOpenRouterImageGenerationTool(
    parameters?: ImageGenerationToolParameters
) {
    return tool({
        description: 'Generate an image from a detailed text prompt and return a renderable image URL.',
        inputSchema: imageGenerationInputSchema,
        execute: async ({ prompt }): Promise<ImageGenerationResult> => {
            const apiKey = parameters?.apiKey ?? process.env.OPENROUTER_API_KEY;
            if (!apiKey) {
                return {
                    status: 'error',
                    error: 'OpenRouter API key is not configured.',
                };
            }

            const imagePrompt = [
                prompt,
                parameters?.aspectRatio ? `Aspect ratio: ${parameters.aspectRatio}.` : null,
                parameters?.quality ? `Quality: ${parameters.quality}.` : null,
                parameters?.background ? `Background: ${parameters.background}.` : null,
            ].filter(Boolean).join('\n');

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
                    'X-Title': 'ChatLima',
                },
                body: JSON.stringify({
                    model: parameters?.model ?? 'openai/gpt-5-image',
                    messages: [{ role: 'user', content: imagePrompt }],
                    modalities: ['image', 'text'],
                }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || data?.error) {
                return {
                    status: 'error',
                    error: data?.error?.message ?? `OpenRouter image generation failed (${response.status})`,
                };
            }

            const imageUrl = extractImageUrl(data);
            if (!imageUrl) {
                return {
                    status: 'error',
                    error: 'OpenRouter did not return an image URL.',
                };
            }

            return {
                status: 'ok',
                imageUrl: imageUrl.startsWith('data:image/')
                    ? await persistGeneratedImage(imageUrl, parameters?.outputFormat)
                    : imageUrl,
            };
        },
    });
}
