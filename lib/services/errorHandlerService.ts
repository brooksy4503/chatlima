export interface ErrorDetails {
    code: string;
    message: string;
    details?: string;
    status: number;
}

export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: string;
    };
}

export class ErrorHandlerService {
    /**
     * Create a standardized error response
     */
    static createErrorResponse(
        code: string,
        message: string,
        status: number,
        details?: string
    ): Response {
        return new Response(
            JSON.stringify({ error: { code, message, details } }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }

    /**
     * Handle authentication errors
     */
    static createAuthError(message: string = "Authentication required"): Response {
        return this.createErrorResponse(
            "AUTH_REQUIRED",
            message,
            401
        );
    }

    /**
     * Handle credit-related errors
     */
    static createCreditError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "INSUFFICIENT_CREDITS",
            message,
            402,
            details
        );
    }

    /**
     * Handle usage limit errors
     */
    static createUsageLimitError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "USAGE_LIMIT_EXCEEDED",
            message,
            429,
            details
        );
    }

    /**
     * Handle model-related errors
     */
    static createModelError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "MODEL_ERROR",
            message,
            400,
            details
        );
    }

    /**
     * Handle MCP-related errors
     */
    static createMCPError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "MCP_ERROR",
            message,
            500,
            details
        );
    }

    /**
     * Handle web search errors
     */
    static createWebSearchError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "WEB_SEARCH_ERROR",
            message,
            400,
            details
        );
    }

    /**
     * Handle validation errors
     */
    static createValidationError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "VALIDATION_ERROR",
            message,
            400,
            details
        );
    }

    /**
     * Handle internal server errors
     */
    static createInternalError(message: string = "Internal server error", details?: string): Response {
        return this.createErrorResponse(
            "INTERNAL_ERROR",
            message,
            500,
            details
        );
    }

    /**
     * Handle rate limiting errors
     */
    static createRateLimitError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "RATE_LIMIT_EXCEEDED",
            message,
            429,
            details
        );
    }

    /**
     * Handle premium model restriction errors
     */
    static createPremiumModelError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "PREMIUM_MODEL_RESTRICTED",
            message,
            403,
            details
        );
    }

    /**
     * Handle negative credit balance errors
     */
    static createNegativeCreditsError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "NEGATIVE_CREDITS",
            message,
            402,
            details
        );
    }

    /**
     * Handle attachment/vision errors
     */
    static createVisionError(message: string, details?: string): Response {
        return this.createErrorResponse(
            "VISION_NOT_SUPPORTED",
            message,
            400,
            details
        );
    }

    /**
     * Extract error message from unknown error types
     */
    static extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'Unknown error occurred';
    }

    /**
     * Create error response from caught error
     */
    static createErrorFromException(
        error: unknown,
        code: string = "UNKNOWN_ERROR",
        status: number = 500
    ): Response {
        const message = this.extractErrorMessage(error);
        return this.createErrorResponse(code, message, status);
    }

    /**
     * Log error for debugging
     */
    static logError(error: unknown, context: string): void {
        console.error(`[${context}] Error:`, error);
    }
}
