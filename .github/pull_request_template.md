## Summary

<!-- What changed and why? -->

## Regression checklist

- [ ] Consulted `SPEC.md` for affected behavior; updated if contracts changed
- [ ] `pnpm test:unit:ci` passes locally (or full `pnpm test:unit` if component tests touched)
- [ ] `pnpm lint` and `pnpm build` pass locally
- [ ] Added/updated **seam tests** for client ↔ server sync if chat persistence or branching changed (`__tests__/lib/chatStateSeams.test.ts`)
- [ ] Ran relevant manual chat scenarios (see `docs/REGRESSION_TESTING.md`) or noted N/A
- [ ] Playwright: `pnpm test:basic -- --project=basic-ui-chrome` (and branching project if UI changed)

## Test plan

<!-- Steps a reviewer can follow -->

## Risk / follow-ups

<!-- Known gaps, migrations, backfills, or deferred tests -->
