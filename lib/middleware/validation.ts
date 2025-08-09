import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ValidationError } from '@/lib/types/api';
import { nanoid } from 'nanoid';

/**
 * Validation and error handling middleware
 */
export class ValidationMiddleware {
    /**
     * Validate and sanitize query parameters
     */
    static validateQueryParams(req: NextRequest, schema: Record<string, any>): {
        isValid: boolean;
        data: Record<string, any>;
        errors: ValidationError[];
    } {
        const requestId = nanoid();
        const { searchParams } = new URL(req.url);
        const data: Record<string, any> = {};
        const errors: ValidationError[] = [];

        for (const [key, validator] of Object.entries(schema)) {
            const value = searchParams.get(key);

            // Check if required field is missing
            if (validator.required && (value === null || value === undefined)) {
                errors.push({
                    field: key,
                    message: `${key} is required`,
                });
                continue;
            }

            // Skip validation if field is optional and not provided
            if (!validator.required && (value === null || value === undefined)) {
                continue;
            }

            // Type validation and conversion
            let convertedValue: any = value;

            try {
                switch (validator.type) {
                    case 'string':
                        convertedValue = value || '';
                        if (validator.minLength && convertedValue.length < validator.minLength) {
                            errors.push({
                                field: key,
                                message: `${key} must be at least ${validator.minLength} characters long`,
                                value: convertedValue,
                            });
                        }
                        if (validator.maxLength && convertedValue.length > validator.maxLength) {
                            errors.push({
                                field: key,
                                message: `${key} must be no more than ${validator.maxLength} characters long`,
                                value: convertedValue,
                            });
                        }
                        if (validator.enum && !validator.enum.includes(convertedValue)) {
                            errors.push({
                                field: key,
                                message: `${key} must be one of: ${validator.enum.join(', ')}`,
                                value: convertedValue,
                            });
                        }
                        break;

                    case 'number':
                        convertedValue = value ? parseFloat(value) : 0;
                        if (isNaN(convertedValue)) {
                            errors.push({
                                field: key,
                                message: `${key} must be a valid number`,
                                value,
                            });
                        } else {
                            if (validator.min !== undefined && convertedValue < validator.min) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be at least ${validator.min}`,
                                    value: convertedValue,
                                });
                            }
                            if (validator.max !== undefined && convertedValue > validator.max) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be no more than ${validator.max}`,
                                    value: convertedValue,
                                });
                            }
                        }
                        break;

                    case 'integer':
                        convertedValue = value ? parseInt(value, 10) : 0;
                        if (isNaN(convertedValue)) {
                            errors.push({
                                field: key,
                                message: `${key} must be a valid integer`,
                                value,
                            });
                        } else {
                            if (validator.min !== undefined && convertedValue < validator.min) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be at least ${validator.min}`,
                                    value: convertedValue,
                                });
                            }
                            if (validator.max !== undefined && convertedValue > validator.max) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be no more than ${validator.max}`,
                                    value: convertedValue,
                                });
                            }
                        }
                        break;

                    case 'boolean':
                        convertedValue = value === 'true' || value === '1';
                        break;

                    case 'date':
                        convertedValue = value ? new Date(value) : new Date();
                        if (isNaN(convertedValue.getTime())) {
                            errors.push({
                                field: key,
                                message: `${key} must be a valid date`,
                                value,
                            });
                        }
                        break;

                    case 'array':
                        if (value) {
                            convertedValue = value.split(',').map(item => item.trim());
                            if (validator.itemType) {
                                convertedValue = convertedValue.map((item: string) => {
                                    switch (validator.itemType) {
                                        case 'number':
                                            return parseFloat(item);
                                        case 'integer':
                                            return parseInt(item, 10);
                                        default:
                                            return item;
                                    }
                                });
                            }
                        } else {
                            convertedValue = [];
                        }
                        break;
                }

                // Custom validation
                if (validator.validate && typeof validator.validate === 'function') {
                    const customError = validator.validate(convertedValue);
                    if (customError) {
                        errors.push({
                            field: key,
                            message: customError,
                            value: convertedValue,
                        });
                    }
                }

                data[key] = convertedValue;
            } catch (error) {
                errors.push({
                    field: key,
                    message: `Invalid ${key}: ${error instanceof Error ? error.message : String(error)}`,
                    value,
                });
            }
        }

        return {
            isValid: errors.length === 0,
            data,
            errors,
        };
    }

    /**
     * Validate request body
     */
    static async validateBody(req: NextRequest, schema: Record<string, any>): Promise<{
        isValid: boolean;
        data: Record<string, any>;
        errors: ValidationError[];
    }> {
        const requestId = nanoid();

        try {
            const body = await req.json();
            const data: Record<string, any> = {};
            const errors: ValidationError[] = [];

            for (const [key, validator] of Object.entries(schema)) {
                const value = body[key];

                // Check if required field is missing
                if (validator.required && (value === null || value === undefined)) {
                    errors.push({
                        field: key,
                        message: `${key} is required`,
                    });
                    continue;
                }

                // Skip validation if field is optional and not provided
                if (!validator.required && (value === null || value === undefined)) {
                    continue;
                }

                // Type validation
                switch (validator.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            errors.push({
                                field: key,
                                message: `${key} must be a string`,
                                value,
                            });
                        } else {
                            if (validator.minLength && value.length < validator.minLength) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be at least ${validator.minLength} characters long`,
                                    value,
                                });
                            }
                            if (validator.maxLength && value.length > validator.maxLength) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be no more than ${validator.maxLength} characters long`,
                                    value,
                                });
                            }
                            if (validator.enum && !validator.enum.includes(value)) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be one of: ${validator.enum.join(', ')}`,
                                    value,
                                });
                            }
                        }
                        break;

                    case 'number':
                        if (typeof value !== 'number' || isNaN(value)) {
                            errors.push({
                                field: key,
                                message: `${key} must be a valid number`,
                                value,
                            });
                        } else {
                            if (validator.min !== undefined && value < validator.min) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be at least ${validator.min}`,
                                    value,
                                });
                            }
                            if (validator.max !== undefined && value > validator.max) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be no more than ${validator.max}`,
                                    value,
                                });
                            }
                        }
                        break;

                    case 'integer':
                        if (typeof value !== 'number' || !Number.isInteger(value)) {
                            errors.push({
                                field: key,
                                message: `${key} must be a valid integer`,
                                value,
                            });
                        } else {
                            if (validator.min !== undefined && value < validator.min) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be at least ${validator.min}`,
                                    value,
                                });
                            }
                            if (validator.max !== undefined && value > validator.max) {
                                errors.push({
                                    field: key,
                                    message: `${key} must be no more than ${validator.max}`,
                                    value,
                                });
                            }
                        }
                        break;

                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            errors.push({
                                field: key,
                                message: `${key} must be a boolean`,
                                value,
                            });
                        }
                        break;

                    case 'array':
                        if (!Array.isArray(value)) {
                            errors.push({
                                field: key,
                                message: `${key} must be an array`,
                                value,
                            });
                        }
                        break;

                    case 'object':
                        if (typeof value !== 'object' || value === null) {
                            errors.push({
                                field: key,
                                message: `${key} must be an object`,
                                value,
                            });
                        }
                        break;
                }

                // Custom validation
                if (validator.validate && typeof validator.validate === 'function') {
                    const customError = validator.validate(value);
                    if (customError) {
                        errors.push({
                            field: key,
                            message: customError,
                            value,
                        });
                    }
                }

                data[key] = value;
            }

            return {
                isValid: errors.length === 0,
                data,
                errors,
            };
        } catch (error) {
            return {
                isValid: false,
                data: {},
                errors: [{
                    field: 'body',
                    message: 'Invalid JSON in request body',
                }],
            };
        }
    }

    /**
     * Create standardized error response
     */
    static createErrorResponse(
        code: string,
        message: string,
        status: number = 400,
        details?: any
    ): NextResponse<ApiResponse> {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code,
                    message,
                    details,
                },
            },
            { status }
        );
    }

    /**
     * Create validation error response
     */
    static createValidationErrorResponse(errors: ValidationError[]): NextResponse<ApiResponse> {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request validation failed',
                    details: errors,
                },
            },
            { status: 400 }
        );
    }

    /**
     * Create success response
     */
    static createSuccessResponse<T>(
        data: T,
        meta?: Record<string, any>,
        status: number = 200
    ): NextResponse<ApiResponse<T>> {
        return NextResponse.json(
            {
                success: true,
                data,
                meta,
            },
            { status }
        );
    }
}