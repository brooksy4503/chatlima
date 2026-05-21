#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.local}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
TARGET_PATH="${REPO_ROOT}/${ENV_FILE}"

normalize_path() {
  local path="$1"
  local dir
  local base

  dir="$(dirname "$path")"
  base="$(basename "$path")"

  if [[ -d "$dir" ]]; then
    printf '%s/%s\n' "$(cd "$dir" && pwd -P)" "$base"
  else
    printf '%s\n' "$path"
  fi
}

source_from_override() {
  local override="$1"

  if [[ -d "$override" ]]; then
    printf '%s/%s\n' "$override" "$ENV_FILE"
  else
    printf '%s\n' "$override"
  fi
}

find_source_env() {
  local fallback=""
  local worktree_path
  local candidate

  while IFS= read -r worktree_path; do
    candidate="${worktree_path}/${ENV_FILE}"

    if [[ "$(normalize_path "$candidate")" == "$(normalize_path "$TARGET_PATH")" ]]; then
      continue
    fi

    if [[ -f "$candidate" ]]; then
      if [[ "$worktree_path" != *"/.codex/worktrees/"* ]]; then
        printf '%s\n' "$candidate"
        return 0
      fi

      fallback="${candidate}"
    fi
  done < <(git worktree list --porcelain | sed -n 's/^worktree //p')

  if [[ -n "$fallback" ]]; then
    printf '%s\n' "$fallback"
    return 0
  fi

  return 1
}

if [[ -n "${ENV_SOURCE:-}" ]]; then
  SOURCE_PATH="$(source_from_override "$ENV_SOURCE")"
else
  SOURCE_PATH="$(find_source_env || true)"
fi

if [[ -z "${SOURCE_PATH:-}" || ! -f "$SOURCE_PATH" ]]; then
  echo "Could not find ${ENV_FILE} in another worktree."
  echo "Set ENV_SOURCE to a source file or checkout directory, then run again:"
  echo "  ENV_SOURCE=/path/to/checkout pnpm env:sync"
  exit 1
fi

if [[ "$(normalize_path "$SOURCE_PATH")" == "$(normalize_path "$TARGET_PATH")" ]]; then
  echo "${ENV_FILE} is already the source file for this checkout."
  exit 0
fi

cp -p "$SOURCE_PATH" "$TARGET_PATH"
echo "Copied ${SOURCE_PATH} -> ${TARGET_PATH}"
