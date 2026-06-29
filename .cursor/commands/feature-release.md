# Feature Release

Release a merged feature to production following the ChatLima release workflow.

**Source of truth:** `.cursor/rules/feature-release-workflow.mdc`

## Inputs (ask if missing)

Collect from the user before starting:

1. **Feature branch name** — e.g. `feature/marketing-homepage` (must be merged or ready to merge)
2. **Version bump** — `patch`, `minor`, or `major`
3. **Feature name** — short title for release notes, e.g. "Marketing Site & Image Generation"

If the user omits the branch name, infer it from the current branch when it is a `feature/`, `fix/`, or `enhance/` branch.

## Version selection guide

- **patch** (0.41.0 → 0.41.1): bug fixes, small improvements, security patches
- **minor** (0.41.0 → 0.42.0): new features, significant improvements
- **major** (0.41.0 → 1.0.0): breaking changes, major rewrites, API changes

## Pre-release checks

Run these before merging or bumping version:

```bash
git status
git log --oneline -10
git fetch origin
git log origin/main..HEAD --oneline   # commits on feature branch not on main
node -p "require('./package.json').version"
```

Also verify:

- [ ] Tests pass: `pnpm test:unit` and `pnpm build`
- [ ] Feature branch is up to date with `main`
- [ ] `SPEC.md` updated if behavior changed
- [ ] No uncommitted changes the user did not intend to release

Stop and report blockers before proceeding. Do not force-push or skip hooks unless the user explicitly asks.

## Release workflow

Execute steps in order. Confirm with the user before destructive or irreversible actions (merge, version bump, push, branch delete, force push).

### 1. Merge feature branch to main

```bash
git checkout main
git pull origin main
git merge <feature-branch-name>
git branch -d <feature-branch-name>
git push origin --delete <feature-branch-name>
```

Skip merge steps if the feature is already on `main`.

### 2. Version bump and tag

```bash
pnpm version <patch|minor|major>
```

This updates `package.json`, creates a version commit, and tags (e.g. `v0.42.0`).

### 3. Push commits and tags

```bash
git push origin main --tags
```

Pushing `main` triggers automatic production deployment via Vercel GitHub integration.

### 4. Generate release notes

Create `releases/RELEASE_NOTES_v<VERSION>.md` using this structure:

```markdown
# 🚀 ChatLima v[VERSION] - [FEATURE_NAME]

## 🎯 What's New
- User-facing features and improvements

## 🔧 Technical Implementation
- Routes, APIs, components, refactors

## 🛡️ Security & Privacy
- Security and privacy changes (or "No security-related changes")

## 📈 Benefits
- User, operator, and developer benefits

## 🔄 Migration Notes
- Breaking changes, config changes, DB migrations (or "No breaking changes")

## 🚀 Deployment
- Pre-deployment checklist and deploy commands

## 📊 Changes Summary
- Key areas added/modified
- Commits included since previous tag

---

**Full Changelog**: [v[PREV_VERSION]...v[NEW_VERSION]](https://github.com/brooksy4503/chatlima/compare/v[PREV_VERSION]...v[NEW_VERSION])
```

To gather content:

```bash
git tag --sort=-v:refname | head -5
git log v<PREV_VERSION>..v<NEW_VERSION> --oneline --no-merges
git diff v<PREV_VERSION>..v<NEW_VERSION> --stat
```

Review prior notes in `releases/RELEASE_NOTES_v*.md` for tone and format. Focus on user benefits; keep technical detail accessible.

Commit the release notes file only if the user asks to commit it.

### 5. Create GitHub release

Use `gh` (do not open the browser unless `gh` fails):

```bash
gh release create v<VERSION> \
  --title "v<VERSION> - <FEATURE_NAME>" \
  --notes-file releases/RELEASE_NOTES_v<VERSION>.md \
  --latest
```

If the release notes file is not committed yet, pass notes inline or create the file first.

### 6. Post-release verification

```bash
gh release view v<VERSION>
pnpm build   # optional local sanity check
```

Remind the user to:

- Monitor the Vercel dashboard for the production deployment
- Verify the production URL after deploy completes
- Check error tracking if applicable

## Quick reference (all steps)

```bash
git checkout main
git pull origin main
git merge feature/<branch-name>
pnpm test:unit
pnpm build
pnpm version <patch|minor|major>
git push origin main --tags
git branch -d feature/<branch-name>
git push origin --delete feature/<branch-name>
# write releases/RELEASE_NOTES_v<VERSION>.md
gh release create v<VERSION> --title "v<VERSION> - <FEATURE_NAME>" --notes-file releases/RELEASE_NOTES_v<VERSION>.md --latest
```

## Safety rules

- **Never** force-push `main` unless the user explicitly requests an emergency rollback
- **Never** run `vercel deploy --prod` on a feature branch
- **Never** skip git hooks (`--no-verify`) unless the user explicitly asks
- **Never** commit unless the user asks (version bump commit from `pnpm version` is expected)
- **Never** delete remote branches without confirming the merge succeeded

## Emergency rollback (only when user requests)

```bash
git checkout main
git reset --hard HEAD~1
git push origin main --force   # triggers auto-deploy of previous version
```

Warn the user that force-push rewrites history on `main`.

## File references

- Version: `package.json`
- Release notes: `releases/RELEASE_NOTES_v*.md`
- Workflow rule: `.cursor/rules/feature-release-workflow.mdc`
- Architecture spec: `SPEC.md`
