#!/usr/bin/env bash
set -euo pipefail

# ...edit this value if your submodule path differs...
SUBMODULE_PATH="multi-container-app"
BRANCH="${1:-main}"

echo "🧹 Cleaning submodule: $SUBMODULE_PATH"

# Deinit and remove working copy
git submodule deinit -f -- "$SUBMODULE_PATH" 2>/dev/null || true
rm -rf -- "$SUBMODULE_PATH"

# Remove cached index & .git directory entries
git rm --cached -r --ignore-unmatch "$SUBMODULE_PATH" 2>/dev/null || true

# Remove from .gitmodules and add file if changed
if [ -f .gitmodules ]; then
  git config --file=.gitmodules --remove-section "submodule.$SUBMODULE_PATH" 2>/dev/null || true
  # stage .gitmodules only if it changed
  if ! git diff --exit-code -- .gitmodules >/dev/null 2>&1; then
    git add .gitmodules
  fi
fi

# Remove section from .git/config if present
git config --file .git/config --remove-section "submodule.$SUBMODULE_PATH" 2>/dev/null || true

# Sync submodules and force update to clear references
git submodule sync --recursive 2>/dev/null || true
git submodule update --init --recursive --force 2>/dev/null || true

# Clean untracked files (be careful)
# NOTE: Runs only a dry-run by default. Remove --dry-run to actually delete.
echo "🧾 Git clean (dry-run): showing files that would be removed"
git clean -ndx

# Stage changes and commit
git add -A
if git diff --cached --quiet; then
  echo "ℹ️ No staged changes to commit."
else
  git commit -m "chore: remove submodule '$SUBMODULE_PATH'"
  echo "✅ Committed removal. To push run: git push origin $BRANCH"
fi

echo "Done. Verify repository state with: git status && git log --oneline -n 5"
