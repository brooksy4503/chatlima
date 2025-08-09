import { PaginationParams } from '@/lib/types/api';

/**
 * Pagination utility class
 */
export class PaginationUtil {
    /**
     * Parse and validate pagination parameters
     */
    static parsePagination(params: {
        page?: string | number;
        limit?: string | number;
        offset?: string | number;
    }): PaginationParams {
        const page = this.parseNumber(params.page, 1);
        const limit = this.parseNumber(params.limit, 20, 1, 100); // Max 100 items per page
        const offset = params.offset !== undefined ? this.parseNumber(params.offset, 0) : undefined;

        return {
            page,
            limit,
            offset,
        };
    }

    /**
     * Calculate offset from page and limit
     */
    static calculateOffset(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    /**
     * Calculate total pages from total items and limit
     */
    static calculateTotalPages(totalItems: number, limit: number): number {
        return Math.ceil(totalItems / limit);
    }

    /**
     * Create pagination metadata
     */
    static createMetadata(
        page: number,
        limit: number,
        totalItems: number,
        baseUrl: string,
        queryParams: Record<string, any> = {}
    ) {
        const totalPages = this.calculateTotalPages(totalItems, limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Build query parameters for pagination links
        const buildUrl = (pageNum: number) => {
            const url = new URL(baseUrl);
            const params = new URLSearchParams();

            // Add existing query parameters
            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            // Add pagination parameters
            params.set('page', pageNum.toString());
            params.set('limit', limit.toString());

            url.search = params.toString();
            return url.toString();
        };

        return {
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNext,
                hasPrev,
                nextPage: hasNext ? buildUrl(page + 1) : null,
                prevPage: hasPrev ? buildUrl(page - 1) : null,
                firstPage: buildUrl(1),
                lastPage: buildUrl(totalPages),
            },
        };
    }

    /**
     * Apply pagination to database query results
     */
    static applyPagination<T>(
        items: T[],
        page: number,
        limit: number,
        offset?: number
    ): { items: T[]; total: number } {
        const total = items.length;
        const startIndex = offset !== undefined ? offset : this.calculateOffset(page, limit);
        const endIndex = startIndex + limit;

        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            total,
        };
    }

    /**
     * Parse number with validation
     */
    private static parseNumber(
        value: string | number | undefined,
        defaultValue: number,
        min?: number,
        max?: number
    ): number {
        if (value === undefined || value === null) {
            return defaultValue;
        }

        const num = typeof value === 'string' ? parseInt(value, 10) : value;

        if (isNaN(num)) {
            return defaultValue;
        }

        if (min !== undefined && num < min) {
            return min;
        }

        if (max !== undefined && num > max) {
            return max;
        }

        return num;
    }

    /**
     * Get pagination query parameters from URL
     */
    static getQueryParams(url: string): {
        page?: string;
        limit?: string;
        offset?: string;
        [key: string]: string | undefined;
    } {
        const urlObj = new URL(url);
        const params: Record<string, string | undefined> = {};

        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    }

    /**
     * Validate pagination parameters
     */
    static validatePagination(params: PaginationParams): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (params.page !== undefined && params.page < 1) {
            errors.push('Page must be greater than 0');
        }

        if (params.limit !== undefined && params.limit < 1) {
            errors.push('Limit must be greater than 0');
        }

        if (params.limit !== undefined && params.limit > 100) {
            errors.push('Limit cannot exceed 100 items per page');
        }

        if (params.offset !== undefined && params.offset < 0) {
            errors.push('Offset cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}