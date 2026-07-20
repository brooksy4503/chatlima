/**
 * @jest-environment node
 *
 * Regression guard: the /api/chats/migrate route was removed because it let
 * any authenticated user steal every chat belonging to an arbitrary
 * localUserId (IDOR). This test fails if the route is re-introduced without
 * ownership checks.
 */
describe('removed /api/chats/migrate route', () => {
  it('is no longer exported (route deleted)', async () => {
    let imported: unknown = undefined;
    try {
      // Dynamic import so the test compiles even though the file is gone.
      // The specifier is built at runtime so TypeScript does not statically
      // resolve it (which would flag the missing module at compile time); the
      // runtime import still attempts to load the deleted route and throws.
      const specifier = '@/app/api/chats/migrate/route';
      const mod = await import(specifier);
      imported = mod;
    } catch {
      imported = undefined;
    }
    // The route module must not exist and must not export a POST handler.
    expect(imported).toBeUndefined();
  });
});
