#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

Z40=0000000000000000000000000000000000000000
# Paths that do not affect lint, unit tests, or production build.
DOC_ONLY_RE='^(docs/|releases/|\.cursor/|.*\.md$)'

is_docs_only_file() {
  echo "$1" | grep -Eq "$DOC_ONLY_RE"
}

# Returns 0 when every file in the push is docs-only; 1 otherwise.
should_skip_for_docs_only() {
  local any_refs=false
  local saw_files=false

  while read -r local_ref local_sha remote_ref remote_sha; do
    [ "$local_sha" = "$Z40" ] && continue
    any_refs=true

    local files
    if [ "$remote_sha" = "$Z40" ]; then
      local base
      base=$(git merge-base "$local_sha" origin/main 2>/dev/null || git merge-base "$local_sha" main 2>/dev/null || echo "")
      if [ -n "$base" ]; then
        files=$(git diff --name-only "$base" "$local_sha")
      else
        files=$(git show --name-only --pretty=format: "$local_sha")
      fi
    else
      files=$(git diff --name-only "$remote_sha" "$local_sha")
    fi

    [ -z "$files" ] && continue

    while IFS= read -r f; do
      [ -z "$f" ] && continue
      saw_files=true
      if ! is_docs_only_file "$f"; then
        return 1
      fi
    done <<< "$files"
  done

  $any_refs && $saw_files
}

# Manual runs (pnpm pre-push) always execute the full suite.
# git push supplies refs on stdin; skip when the push is docs-only only.
if [ ! -t 0 ] && should_skip_for_docs_only; then
  echo "→ Docs-only push — skipping pre-push checks"
  exit 0
fi

echo "→ pnpm lint"
pnpm lint

echo "→ pnpm test:unit:ci"
pnpm test:unit:ci

echo "→ pnpm build"
pnpm build

echo "✓ Pre-push checks passed"
