describe("getAccessPolicyFlags", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.BILLING_ENFORCED;
    delete process.env.ALLOW_BYOK_BYPASS;
    delete process.env.NATIVE_WEB_FETCH_ENABLED;
    delete process.env.NATIVE_WEB_FETCH_MAX_CHARS;
    delete process.env.NATIVE_WEB_FETCH_TIMEOUT_MS;
    delete process.env.NATIVE_WEB_FETCH_MAX_BYTES;
    delete process.env.NATIVE_WEB_FETCH_MAX_REDIRECTS;
    delete process.env.NATIVE_WEB_FETCH_SITE_MODE_ENABLED;
    delete process.env.NATIVE_WEB_FETCH_SITE_MODE_MAX_PAGES;
    delete process.env.NATIVE_WEB_FETCH_SITE_MODE_DEPTH;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses expected defaults", async () => {
    const { getAccessPolicyFlags } = await import("../access-policy");
    const flags = getAccessPolicyFlags();

    expect(flags.billingEnforced).toBe(false);
    expect(flags.allowByokBypass).toBe(true);
    expect(flags.nativeWebFetchEnabled).toBe(false);
    expect(flags.nativeWebFetchMaxChars).toBe(30000);
    expect(flags.nativeWebFetchTimeoutMs).toBe(12000);
    expect(flags.nativeWebFetchMaxBytes).toBe(5000000);
    expect(flags.nativeWebFetchMaxRedirects).toBe(5);
    expect(flags.nativeWebFetchSiteModeEnabled).toBe(false);
    expect(flags.nativeWebFetchSiteModeMaxPages).toBe(20);
    expect(flags.nativeWebFetchSiteModeDepth).toBe(2);
  });

  it("parses explicit env overrides", async () => {
    process.env.BILLING_ENFORCED = "true";
    process.env.ALLOW_BYOK_BYPASS = "false";
    process.env.NATIVE_WEB_FETCH_ENABLED = "true";
    process.env.NATIVE_WEB_FETCH_MAX_CHARS = "45000";
    process.env.NATIVE_WEB_FETCH_TIMEOUT_MS = "9000";
    process.env.NATIVE_WEB_FETCH_MAX_BYTES = "4200000";
    process.env.NATIVE_WEB_FETCH_MAX_REDIRECTS = "7";
    process.env.NATIVE_WEB_FETCH_SITE_MODE_ENABLED = "true";
    process.env.NATIVE_WEB_FETCH_SITE_MODE_MAX_PAGES = "10";
    process.env.NATIVE_WEB_FETCH_SITE_MODE_DEPTH = "3";

    const { getAccessPolicyFlags } = await import("../access-policy");
    const flags = getAccessPolicyFlags();

    expect(flags.billingEnforced).toBe(true);
    expect(flags.allowByokBypass).toBe(false);
    expect(flags.nativeWebFetchEnabled).toBe(true);
    expect(flags.nativeWebFetchMaxChars).toBe(45000);
    expect(flags.nativeWebFetchTimeoutMs).toBe(9000);
    expect(flags.nativeWebFetchMaxBytes).toBe(4200000);
    expect(flags.nativeWebFetchMaxRedirects).toBe(7);
    expect(flags.nativeWebFetchSiteModeEnabled).toBe(true);
    expect(flags.nativeWebFetchSiteModeMaxPages).toBe(10);
    expect(flags.nativeWebFetchSiteModeDepth).toBe(3);
  });
});
