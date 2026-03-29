export interface AccessPolicyFlags {
    billingEnforced: boolean;
    allowByokBypass: boolean;
    nativeWebFetchEnabled: boolean;
    nativeWebFetchMaxChars: number;
    nativeWebFetchTimeoutMs: number;
    nativeWebFetchMaxBytes: number;
    nativeWebFetchMaxRedirects: number;
    nativeWebFetchSiteModeEnabled: boolean;
    nativeWebFetchSiteModeMaxPages: number;
    nativeWebFetchSiteModeDepth: number;
}

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback;
    return value.toLowerCase() === 'true';
};

const parseNumberEnv = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAccessPolicyFlags = (): AccessPolicyFlags => {
    return {
        billingEnforced: parseBooleanEnv(process.env.BILLING_ENFORCED, false),
        allowByokBypass: parseBooleanEnv(process.env.ALLOW_BYOK_BYPASS, true),
        nativeWebFetchEnabled: parseBooleanEnv(process.env.NATIVE_WEB_FETCH_ENABLED, false),
        nativeWebFetchMaxChars: parseNumberEnv(process.env.NATIVE_WEB_FETCH_MAX_CHARS, 30000),
        nativeWebFetchTimeoutMs: parseNumberEnv(process.env.NATIVE_WEB_FETCH_TIMEOUT_MS, 12000),
        nativeWebFetchMaxBytes: parseNumberEnv(process.env.NATIVE_WEB_FETCH_MAX_BYTES, 5000000),
        nativeWebFetchMaxRedirects: parseNumberEnv(process.env.NATIVE_WEB_FETCH_MAX_REDIRECTS, 5),
        nativeWebFetchSiteModeEnabled: parseBooleanEnv(process.env.NATIVE_WEB_FETCH_SITE_MODE_ENABLED, false),
        nativeWebFetchSiteModeMaxPages: parseNumberEnv(process.env.NATIVE_WEB_FETCH_SITE_MODE_MAX_PAGES, 20),
        nativeWebFetchSiteModeDepth: parseNumberEnv(process.env.NATIVE_WEB_FETCH_SITE_MODE_DEPTH, 2),
    };
};

