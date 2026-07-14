#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ pnpm lint"
pnpm lint

echo "→ pnpm test:unit:ci"
pnpm test:unit:ci

echo "→ pnpm build"
pnpm build

echo "✓ Pre-push checks passed"
