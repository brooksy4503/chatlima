import { NextRequest, NextResponse } from 'next/server';
import { getModelDetails } from '@/lib/models/fetch-models';
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';

/**
 * GET /api/models/[modelId]/credit-cost
 * Returns the credit cost per message for a given model
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { modelId: string } }
) {
    try {
        const { modelId } = params;

        if (!modelId) {
            return NextResponse.json(
                { error: 'Model ID is required' },
                { status: 400 }
            );
        }

        // Decode the model ID (in case it's URL encoded)
        const decodedModelId = decodeURIComponent(modelId);

        // Fetch model details
        const modelInfo = await getModelDetails(decodedModelId);

        if (!modelInfo) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            );
        }

        // Calculate credit cost
        const creditCost = calculateCreditCostPerMessage(modelInfo);

        return NextResponse.json({
            modelId: decodedModelId,
            creditCost,
            premium: modelInfo.premium || false
        });

    } catch (error) {
        console.error('Error calculating credit cost:', error);
        return NextResponse.json(
            { error: 'Failed to calculate credit cost' },
            { status: 500 }
        );
    }
}
