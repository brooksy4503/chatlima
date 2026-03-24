export interface AccessPolicyFlags {
    billingEnforced: boolean;
    allowByokBypass: boolean;
}

const parseBooleanEnv = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback;
    return value.toLowerCase() === 'true';
};

export const getAccessPolicyFlags = (): AccessPolicyFlags => {
    return {
        billingEnforced: parseBooleanEnv(process.env.BILLING_ENFORCED, false),
        allowByokBypass: parseBooleanEnv(process.env.ALLOW_BYOK_BYPASS, true),
    };
};

