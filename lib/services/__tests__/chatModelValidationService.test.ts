import { ChatModelValidationService, ModelValidationContext } from '../chatModelValidationService';

// Mock dependencies
jest.mock('@/lib/models/fetch-models', () => ({
    getModelDetails: jest.fn()
}));

jest.mock('@/lib/parameter-validation', () => ({
    validatePresetParameters: jest.fn(),
    getModelDefaults: jest.fn()
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

import { getModelDetails } from '@/lib/models/fetch-models';
import { validatePresetParameters, getModelDefaults } from '@/lib/parameter-validation';

describe('ChatModelValidationService', () => {
    const mockGetModelDetails = getModelDetails as jest.MockedFunction<typeof getModelDetails>;
    const mockValidatePresetParameters = validatePresetParameters as jest.MockedFunction<typeof validatePresetParameters>;
    const mockGetModelDefaults = getModelDefaults as jest.MockedFunction<typeof getModelDefaults>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockModelInfo = (overrides: any = {}) => ({
        id: 'openai/gpt-4',
        provider: 'openai',
        name: 'GPT-4',
        premium: false,
        vision: true,
        supportsWebSearch: true,
        capabilities: ['text', 'vision'],
        status: 'active',
        lastChecked: new Date(),
        ...overrides
    });

    const createMockContext = (overrides: Partial<ModelValidationContext> = {}): ModelValidationContext => ({
        selectedModel: 'openai/gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        systemInstruction: 'You are helpful',
        ...overrides
    });

    describe('validateAndConfigureModel', () => {
        it('should validate and configure model successfully', async () => {
            const context = createMockContext();
            const mockModelInfo = createMockModelInfo();
            const mockDefaults = {
              temperature: 0.5,
              maxTokens: 2000,
              systemInstruction: 'Default system instruction'
            };

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockValidatePresetParameters.mockReturnValue({ valid: true, errors: [] });
            mockGetModelDefaults.mockReturnValue(mockDefaults);

            const result = await ChatModelValidationService.validateAndConfigureModel(context);

            expect(result).toEqual({
                modelInfo: mockModelInfo,
                effectiveTemperature: 0.7,
                effectiveMaxTokens: 1000,
                effectiveSystemInstruction: 'You are helpful'
            });

            expect(mockGetModelDetails).toHaveBeenCalledWith('openai/gpt-4');
            expect(mockValidatePresetParameters).toHaveBeenCalledWith(
                mockModelInfo,
                0.7,
                1000,
                'You are helpful'
            );
            expect(mockConsoleLog).toHaveBeenCalledWith('[Parameter Validation] Preset parameters validated successfully');
        });

        it('should use model defaults when parameters not provided', async () => {
            const context = createMockContext({
                temperature: undefined,
                maxTokens: undefined,
                systemInstruction: undefined
            });
            const mockModelInfo = createMockModelInfo();
            const mockDefaults = {
                temperature: 0.5,
                maxTokens: 2000,
                systemInstruction: 'Default system instruction'
            };

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockValidatePresetParameters.mockReturnValue({ valid: true, errors: [] });
            mockGetModelDefaults.mockReturnValue(mockDefaults);

            const result = await ChatModelValidationService.validateAndConfigureModel(context);

            expect(result.effectiveTemperature).toBe(0.5);
            expect(result.effectiveMaxTokens).toBe(2000);
            expect(result.effectiveSystemInstruction).toContain('You are a helpful AI assistant');
        });

        it('should use default system instruction when not provided', async () => {
            const context = createMockContext({ systemInstruction: undefined });
            const mockModelInfo = createMockModelInfo();
            const mockDefaults = {
                temperature: 0.5,
                maxTokens: 2000,
                systemInstruction: 'Default system instruction'
            };

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockValidatePresetParameters.mockReturnValue({ valid: true, errors: [] });
            mockGetModelDefaults.mockReturnValue(mockDefaults);

            const result = await ChatModelValidationService.validateAndConfigureModel(context);

            expect(result.effectiveSystemInstruction).toContain('You are a helpful AI assistant');
            expect(result.effectiveSystemInstruction).toContain(new Date().toISOString().split('T')[0]);
        });

        it('should throw error when preset parameters are invalid', async () => {
            const context = createMockContext();
            const mockModelInfo = createMockModelInfo();
            const validationErrors = ['Temperature must be between 0 and 1', 'Max tokens too high'];

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockValidatePresetParameters.mockReturnValue({
                valid: false,
                errors: validationErrors
            });

            await expect(ChatModelValidationService.validateAndConfigureModel(context))
                .rejects.toThrow('Invalid preset parameters: Temperature must be between 0 and 1, Max tokens too high');

            expect(mockConsoleError).toHaveBeenCalledWith(
                '[Parameter Validation] Invalid preset parameters:',
                validationErrors
            );
        });

        it('should skip parameter validation when no parameters provided', async () => {
            const context = createMockContext({
                temperature: undefined,
                maxTokens: undefined,
                systemInstruction: undefined
            });
            const mockModelInfo = createMockModelInfo();
            const mockDefaults = {
                temperature: 0.5,
                maxTokens: 2000,
                systemInstruction: 'Default system instruction'
            };

            mockGetModelDetails.mockResolvedValue(mockModelInfo);
            mockGetModelDefaults.mockReturnValue(mockDefaults);

            const result = await ChatModelValidationService.validateAndConfigureModel(context);

            expect(mockValidatePresetParameters).not.toHaveBeenCalled();
            expect(result).toEqual({
                modelInfo: mockModelInfo,
                effectiveTemperature: 0.5,
                effectiveMaxTokens: 2000,
                effectiveSystemInstruction: expect.stringContaining('You are a helpful AI assistant')
            });
        });

        it('should handle model details fetch error', async () => {
            const context = createMockContext();

            mockGetModelDetails.mockRejectedValue(new Error('Model not found'));

            await expect(ChatModelValidationService.validateAndConfigureModel(context))
                .rejects.toThrow('Model not found');
        });

        it('should handle null model info', async () => {
            const context = createMockContext();

            mockGetModelDetails.mockResolvedValue(null);
            mockValidatePresetParameters.mockReturnValue({ valid: true, errors: [] });
            mockGetModelDefaults.mockReturnValue({
                temperature: 0.5,
                maxTokens: 2000,
                systemInstruction: 'Default system instruction'
            });

            const result = await ChatModelValidationService.validateAndConfigureModel(context);

            expect(result.modelInfo).toBeNull();
        });
    });

    describe('supportsWebSearch', () => {
        it('should return true when model supports web search', () => {
            const modelInfo = createMockModelInfo({ supportsWebSearch: true });

            const result = ChatModelValidationService.supportsWebSearch(modelInfo);

            expect(result).toBe(true);
        });

        it('should return false when model does not support web search', () => {
            const modelInfo = createMockModelInfo({ supportsWebSearch: false });

            const result = ChatModelValidationService.supportsWebSearch(modelInfo);

            expect(result).toBe(false);
        });

        it('should return false when supportsWebSearch is undefined', () => {
            const modelInfo = createMockModelInfo({ supportsWebSearch: undefined });

            const result = ChatModelValidationService.supportsWebSearch(modelInfo);

            expect(result).toBe(false);
        });
    });

    describe('isPremium', () => {
        it('should return true when model is premium', () => {
            const modelInfo = createMockModelInfo({ premium: true });

            const result = ChatModelValidationService.isPremium(modelInfo);

            expect(result).toBe(true);
        });

        it('should return false when model is not premium', () => {
            const modelInfo = createMockModelInfo({ premium: false });

            const result = ChatModelValidationService.isPremium(modelInfo);

            expect(result).toBe(false);
        });

        it('should return false when premium is undefined', () => {
            const modelInfo = createMockModelInfo({ premium: undefined });

            const result = ChatModelValidationService.isPremium(modelInfo);

            expect(result).toBe(false);
        });
    });

    describe('supportsVision', () => {
        it('should return true when model supports vision', () => {
            const modelInfo = createMockModelInfo({ vision: true });

            const result = ChatModelValidationService.supportsVision(modelInfo);

            expect(result).toBe(true);
        });

        it('should return false when model does not support vision', () => {
            const modelInfo = createMockModelInfo({ vision: false });

            const result = ChatModelValidationService.supportsVision(modelInfo);

            expect(result).toBe(false);
        });

        it('should return false when vision is undefined', () => {
            const modelInfo = createMockModelInfo({ vision: undefined });

            const result = ChatModelValidationService.supportsVision(modelInfo);

            expect(result).toBe(false);
        });
    });
});