import { TokenTrackingService, TokenTrackingParams, ModelPricingInfo, TokenUsageData } from '@/lib/tokenTracking';
import { db } from '@/lib/db';
import { tokenUsageMetrics, modelPricing, dailyTokenUsage } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Mock the database
jest.mock('@/lib/db', () => ({
    db: {
        insert: jest.fn(),
        select: jest.fn(),
        update: jest.fn(),
        query: {
            modelPricing: {
                findFirst: jest.fn(),
            },
            dailyTokenUsage: {
                findFirst: jest.fn(),
            },
            tokenUsageMetrics: {
                findMany: jest.fn(),
            },
        },
    },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
    nanoid: jest.fn(() => 'test-id-123'),
}));

// Mock CostCalculationService
jest.mock('@/lib/services/costCalculation', () => ({
    CostCalculationService: {
        calculateCost: jest.fn(),
    },
}));

describe('TokenTrackingService', () => {
    let mockDb: any;
    let mockCostCalculationService: any;

    beforeEach(() => {
        mockDb = db as any;
        mockCostCalculationService = require('@/lib/services/costCalculation').CostCalculationService;
        jest.clearAllMocks();
    });

    describe('trackTokenUsage', () => {
        const validParams: TokenTrackingParams = {
            userId: 'user123',
            chatId: 'chat456',
            messageId: 'msg789',
            modelId: 'gpt-4',
            provider: 'openai',
            tokenUsage: {
                inputTokens: 100,
                outputTokens: 50,
            },
        };

        it('should successfully track token usage with valid parameters', async () => {
            // Arrange
            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(validParams);

            // Assert
            expect(mockDb.insert).toHaveBeenCalledWith(tokenUsageMetrics);
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                userId: validParams.userId,
                chatId: validParams.chatId,
                messageId: validParams.messageId,
                modelId: validParams.modelId,
                provider: validParams.provider,
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150,
            }));
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockDb.insert.mockImplementation(() => {
                throw new Error('Database connection failed');
            });

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act & Assert
            await expect(TokenTrackingService.trackTokenUsage(validParams))
                .resolves.not.toThrow(); // Should not throw, should handle gracefully
        });

        it('should validate required parameters', async () => {
            // Arrange
            const invalidParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                // Missing tokenUsage
            } as any;

            // Act & Assert
            await expect(TokenTrackingService.trackTokenUsage(invalidParams))
                .resolves.not.toThrow(); // Should handle gracefully
        });

        it('should handle different token usage formats', async () => {
            // Arrange
            const paramsWithDifferentFormat: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {
                    usage: {
                        prompt_tokens: 100,
                        completion_tokens: 50,
                    },
                },
            };

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(paramsWithDifferentFormat);

            // Assert
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                inputTokens: 100,
                outputTokens: 50,
                totalTokens: 150,
            }));
        });

        it('should work with minimal token usage', async () => {
            // Arrange
            const minimalParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {}, // No token counts
            };

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0,
                totalCost: 0,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(minimalParams);

            // Assert
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
            }));
        });

        it('should handle large token numbers', async () => {
            // Arrange
            const largeTokenParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {
                    inputTokens: 1000000,
                    outputTokens: 500000,
                },
            };

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 1.25,
                totalCost: 1.25,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(largeTokenParams);

            // Assert
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                inputTokens: 1000000,
                outputTokens: 500000,
                totalTokens: 1500000,
            }));
        });
    });

    describe('getModelPricing (via trackTokenUsage)', () => {
        it('should use pricing information when found', async () => {
            // Arrange
            const validParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {
                    inputTokens: 100,
                    outputTokens: 50,
                },
            };

            const mockPricing = {
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            };

            mockDb.query.modelPricing.findFirst.mockResolvedValue(mockPricing);
            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(validParams);

            // Assert
            expect(mockDb.query.modelPricing.findFirst).toHaveBeenCalledWith({
                where: expect.anything(),
                orderBy: expect.anything(),
            });
            expect(mockCostCalculationService.calculateCost).toHaveBeenCalledWith(
                100,
                50,
                'gpt-4',
                'openai',
                { includeVolumeDiscounts: false }
            );
        });

        it('should use default pricing when not found', async () => {
            // Arrange
            const validParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'unknown-model',
                provider: 'unknown-provider',
                tokenUsage: {
                    inputTokens: 100,
                    outputTokens: 50,
                },
            };

            mockDb.query.modelPricing.findFirst.mockResolvedValue(null);
            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            await TokenTrackingService.trackTokenUsage(validParams);

            // Assert
            expect(mockDb.query.modelPricing.findFirst).toHaveBeenCalledWith({
                where: expect.anything(),
                orderBy: expect.anything(),
            });
            expect(mockCostCalculationService.calculateCost).toHaveBeenCalledWith(
                100,
                50,
                'unknown-model',
                'unknown-provider',
                { includeVolumeDiscounts: false }
            );
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const validParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {
                    inputTokens: 100,
                    outputTokens: 50,
                },
            };

            mockDb.query.modelPricing.findFirst.mockRejectedValue(new Error('Database error'));
            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act & Assert
            await expect(TokenTrackingService.trackTokenUsage(validParams))
                .resolves.not.toThrow(); // Should handle gracefully
        });
    });

    describe('setModelPricing', () => {
        const validPricing = {
            modelId: 'gpt-4',
            provider: 'openai',
            inputTokenPrice: 0.0005,
            outputTokenPrice: 0.0015,
            currency: 'USD',
            isActive: true,
        };

        it('should successfully set model pricing', async () => {
            // Arrange
            const mockSet = jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue({ rowCount: 1 }),
            });
            mockDb.update.mockReturnValue({
                set: mockSet,
            });

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            // Act
            await TokenTrackingService.setModelPricing(validPricing);

            // Assert
            expect(mockDb.update).toHaveBeenCalledWith(modelPricing);
            expect(mockDb.insert).toHaveBeenCalledWith(modelPricing);
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                isActive: true,
            }));
        });

        it('should handle invalid pricing values', async () => {
            // Arrange
            const invalidPricing = {
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: -0.0005,
                outputTokenPrice: 0.0015,
                currency: 'USD',
                isActive: true,
            };

            const mockUpdate = mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue({ rowCount: 1 }),
                }),
            });

            const mockInsert = mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            // Act & Assert
            await expect(TokenTrackingService.setModelPricing(invalidPricing))
                .resolves.not.toThrow(); // Should handle gracefully
        });

        it('should handle missing currency gracefully', async () => {
            // Arrange
            const paramsWithoutCurrency = {
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: 0.0005,
                outputTokenPrice: 0.0015,
                // Missing currency
                isActive: true,
            };

            const mockSet = jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue({ rowCount: 1 }),
            });
            mockDb.update.mockReturnValue({
                set: mockSet,
            });

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            // Act & Assert - should not throw, just use undefined currency
            await expect(TokenTrackingService.setModelPricing(paramsWithoutCurrency as any))
                .resolves.not.toThrow();
        });

        it('should deactivate existing pricing when setting new pricing', async () => {
            // Arrange
            const mockSet = jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue({ rowCount: 1 }),
            });
            mockDb.update.mockReturnValue({
                set: mockSet,
            });

            const mockValues = jest.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockValues,
            });

            // Act
            await TokenTrackingService.setModelPricing(validPricing);

            // Assert
            expect(mockDb.update).toHaveBeenCalledWith(modelPricing);
            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                isActive: false,
                effectiveTo: expect.any(Date),
            }));
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockDb.insert.mockImplementation(() => {
                throw new Error('Database connection failed');
            });

            // Act & Assert
            await expect(TokenTrackingService.setModelPricing(validPricing))
                .rejects.toThrow('Database connection failed');
        });
    });

    describe('getUserTokenStats', () => {
        const validQueryParams = {
            userId: 'user123',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            provider: 'openai',
        };

        it('should return token usage stats for valid query', async () => {
            // Arrange
            const mockStatsData = [{
                totalInputTokens: '1000',
                totalOutputTokens: '500',
                totalTokens: '1500',
                totalEstimatedCost: '0.0015',
                totalActualCost: '0.0015',
                requestCount: '10',
            }];

            const mockBreakdownData = [{
                provider: 'openai',
                inputTokens: '1000',
                outputTokens: '500',
                totalTokens: '1500',
                estimatedCost: '0.0015',
                actualCost: '0.0015',
                requestCount: '10',
            }];

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockStatsData),
                }),
            }).mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        groupBy: jest.fn().mockResolvedValue(mockBreakdownData),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getUserTokenStats(validQueryParams.userId, validQueryParams);

            // Assert
            expect(result).toEqual({
                totalInputTokens: 1000,
                totalOutputTokens: 500,
                totalTokens: 1500,
                totalEstimatedCost: 0.0015,
                totalActualCost: 0.0015,
                requestCount: 10,
                breakdownByProvider: [{
                    provider: 'openai',
                    inputTokens: 1000,
                    outputTokens: 500,
                    totalTokens: 1500,
                    estimatedCost: 0.0015,
                    actualCost: 0.0015,
                    requestCount: 10,
                }],
            });
            expect(mockDb.select).toHaveBeenCalledTimes(2);
        });

        it('should handle empty results', async () => {
            // Arrange
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{
                        totalInputTokens: null,
                        totalOutputTokens: null,
                        totalTokens: null,
                        totalEstimatedCost: null,
                        totalActualCost: null,
                        requestCount: null,
                    }]),
                }),
            }).mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        groupBy: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getUserTokenStats(validQueryParams.userId, validQueryParams);

            // Assert
            expect(result).toEqual({
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalTokens: 0,
                totalEstimatedCost: 0,
                totalActualCost: 0,
                requestCount: 0,
                breakdownByProvider: [],
            });
        });

        it('should validate query parameters', async () => {
            // Arrange
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{
                        totalInputTokens: '1000',
                        totalOutputTokens: '500',
                        totalTokens: '1500',
                        totalEstimatedCost: '0.0015',
                        totalActualCost: '0.0015',
                        requestCount: '10',
                    }]),
                }),
            });

            // Act & Assert
            await expect(TokenTrackingService.getUserTokenStats('', validQueryParams))
                .rejects.toThrow();
        });

        it('should work with minimal parameters', async () => {
            // Arrange
            const minimalParams = {
                userId: 'user123',
            };

            const mockStatsData = [{
                totalInputTokens: '1000',
                totalOutputTokens: '500',
                totalTokens: '1500',
                totalEstimatedCost: '0.0015',
                totalActualCost: '0.0015',
                requestCount: '10',
            }];

            const mockBreakdownData = [{
                provider: 'openai',
                inputTokens: '1000',
                outputTokens: '500',
                totalTokens: '1500',
                estimatedCost: '0.0015',
                actualCost: '0.0015',
                requestCount: '10',
            }];

            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockStatsData),
                }),
            }).mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        groupBy: jest.fn().mockResolvedValue(mockBreakdownData),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getUserTokenStats(minimalParams.userId);

            // Assert
            expect(result).toEqual({
                totalInputTokens: 1000,
                totalOutputTokens: 500,
                totalTokens: 1500,
                totalEstimatedCost: 0.0015,
                totalActualCost: 0.0015,
                requestCount: 10,
                breakdownByProvider: [{
                    provider: 'openai',
                    inputTokens: 1000,
                    outputTokens: 500,
                    totalTokens: 1500,
                    estimatedCost: 0.0015,
                    actualCost: 0.0015,
                    requestCount: 10,
                }],
            });
        });
    });

    describe('getDailyTokenUsage', () => {
        const validQueryParams = {
            userId: 'user123',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            provider: 'openai',
        };

        it('should return daily token usage for valid query', async () => {
            // Arrange
            const mockDailyData = [{
                id: 'daily-1',
                userId: 'user123',
                date: '2023-01-01',
                provider: 'openai',
                totalInputTokens: 1000,
                totalOutputTokens: 500,
                totalTokens: 1500,
                totalEstimatedCost: '0.0015',
                totalActualCost: '0.0015',
                requestCount: 10,
            }];

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue(mockDailyData),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getDailyTokenUsage(validQueryParams.userId, validQueryParams);

            // Assert
            expect(result).toEqual([{
                date: new Date('2023-01-01'),
                provider: 'openai',
                inputTokens: 1000,
                outputTokens: 500,
                totalTokens: 1500,
                estimatedCost: 0.0015,
                actualCost: 0.0015,
                requestCount: 10,
            }]);
            expect(mockDb.select).toHaveBeenCalled();
        });

        it('should handle empty results', async () => {
            // Arrange
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getDailyTokenUsage(validQueryParams.userId, validQueryParams);

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle empty userId gracefully', async () => {
            // Arrange
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            // Act & Assert - should not throw, just return empty array
            const result = await TokenTrackingService.getDailyTokenUsage('', validQueryParams);
            expect(result).toEqual([]);
        });

        it('should work with minimal parameters', async () => {
            // Arrange
            const minimalParams = {
                userId: 'user123',
            };

            const mockDailyData = [{
                id: 'daily-1',
                userId: 'user123',
                date: '2023-01-01',
                provider: 'openai',
                totalInputTokens: 1000,
                totalOutputTokens: 500,
                totalTokens: 1500,
                totalEstimatedCost: '0.0015',
                totalActualCost: '0.0015',
                requestCount: 10,
            }];

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue(mockDailyData),
                    }),
                }),
            });

            // Act
            const result = await TokenTrackingService.getDailyTokenUsage(minimalParams.userId);

            // Assert
            expect(result).toEqual([{
                date: new Date('2023-01-01'),
                provider: 'openai',
                inputTokens: 1000,
                outputTokens: 500,
                totalTokens: 1500,
                estimatedCost: 0.0015,
                actualCost: 0.0015,
                requestCount: 10,
            }]);
        });
    });

    describe('getChatTokenUsage', () => {
        it('should return token usage for a specific chat', async () => {
            // Arrange
            const mockRecords = [
                {
                    id: 'record-1',
                    userId: 'user123',
                    chatId: 'chat456',
                    messageId: 'msg789',
                    modelId: 'gpt-4',
                    provider: 'openai',
                    inputTokens: 100,
                    outputTokens: 50,
                    totalTokens: 150,
                    estimatedCost: '0.000125',
                    actualCost: '0.000125',
                    currency: 'USD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'record-2',
                    userId: 'user123',
                    chatId: 'chat456',
                    messageId: 'msg790',
                    modelId: 'gpt-4',
                    provider: 'openai',
                    inputTokens: 200,
                    outputTokens: 100,
                    totalTokens: 300,
                    estimatedCost: '0.000250',
                    actualCost: '0.000250',
                    currency: 'USD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ];

            mockDb.query.tokenUsageMetrics.findMany.mockResolvedValue(mockRecords);

            // Act
            const result = await TokenTrackingService.getChatTokenUsage('chat456', 'user123');

            // Assert
            expect(result).toEqual({
                totalInputTokens: 300,
                totalOutputTokens: 150,
                totalTokens: 450,
                totalEstimatedCost: 0.000375,
                totalActualCost: 0.000375,
                messageCount: 2,
                breakdownByMessage: expect.arrayContaining([
                    expect.objectContaining({
                        messageId: 'msg789',
                        modelId: 'gpt-4',
                        provider: 'openai',
                        inputTokens: 100,
                        outputTokens: 50,
                        totalTokens: 150,
                        estimatedCost: 0.000125,
                        actualCost: 0.000125,
                    }),
                    expect.objectContaining({
                        messageId: 'msg790',
                        modelId: 'gpt-4',
                        provider: 'openai',
                        inputTokens: 200,
                        outputTokens: 100,
                        totalTokens: 300,
                        estimatedCost: 0.000250,
                        actualCost: 0.000250,
                    })
                ])
            });

            // Verify the query was called
            expect(mockDb.query.tokenUsageMetrics.findMany).toHaveBeenCalled();
        });

        it('should return empty results for non-existent chat', async () => {
            // Arrange
            mockDb.query.tokenUsageMetrics.findMany.mockResolvedValue([]);

            // Act
            const result = await TokenTrackingService.getChatTokenUsage('non-existent', 'user123');

            // Assert
            expect(result).toEqual({
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalTokens: 0,
                totalEstimatedCost: 0,
                totalActualCost: 0,
                messageCount: 0,
                breakdownByMessage: [],
            });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockDb.query.tokenUsageMetrics.findMany.mockRejectedValue(new Error('Database error'));

            // Act
            const result = await TokenTrackingService.getChatTokenUsage('chat456', 'user123');

            // Assert
            expect(result).toEqual({
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalTokens: 0,
                totalEstimatedCost: 0,
                totalActualCost: 0,
                messageCount: 0,
                breakdownByMessage: [],
            });
        });
    });

    describe('concurrent operations', () => {
        it('should handle concurrent token tracking operations', async () => {
            // Arrange
            const trackingParams: TokenTrackingParams = {
                userId: 'user123',
                chatId: 'chat456',
                messageId: 'msg789',
                modelId: 'gpt-4',
                provider: 'openai',
                tokenUsage: {
                    inputTokens: 100,
                    outputTokens: 50,
                },
            };

            mockDb.query.modelPricing.findFirst.mockResolvedValue({
                id: 'pricing-1',
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: '0.0005',
                outputTokenPrice: '0.0015',
                currency: 'USD',
                effectiveFrom: new Date(),
                isActive: true,
            });

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            mockCostCalculationService.calculateCost.mockResolvedValue({
                subtotal: 0.000125,
                totalCost: 0.000125,
                currency: 'USD',
                breakdown: [],
            });

            // Act
            const promises = Array(10).fill(0).map(() =>
                TokenTrackingService.trackTokenUsage(trackingParams)
            );
            await Promise.all(promises);

            // Assert - each trackTokenUsage call makes multiple database operations
            // 1 insert for tokenUsageMetrics + 1 insert for dailyTokenUsage per call
            expect(mockDb.insert).toHaveBeenCalledTimes(20);
        });

        it('should handle concurrent pricing operations', async () => {
            // Arrange
            const validPricing = {
                modelId: 'gpt-4',
                provider: 'openai',
                inputTokenPrice: 0.0005,
                outputTokenPrice: 0.0015,
                currency: 'USD',
                isActive: true,
            };

            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue({ rowCount: 1 }),
                }),
            });

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined),
            });

            // Act
            const promises = Array(10).fill(0).map(() =>
                TokenTrackingService.setModelPricing(validPricing)
            );
            await Promise.all(promises);

            // Assert
            expect(mockDb.update).toHaveBeenCalledTimes(10);
            expect(mockDb.insert).toHaveBeenCalledTimes(10);
        });
    });
});