#!/bin/bash

echo "🧹 Starting comprehensive cleanup..."
echo ""

DELETED_COUNT=0

# Function to safely delete files
safe_delete() {
  local file="$1"
  if [ -f "$file" ] || [ -d "$file" ]; then
    echo "  🗑️  Deleting: $file"
    rm -rf "$file"
    ((DELETED_COUNT++))
  fi
}

# Remove backup files
echo "📦 Removing backup files..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "*.backup" -o \
  -name "*.bak" -o \
  -name "*.old" -o \
  -name "*.orig" -o \
  -name "*~" -o \
  -name "*.swp" -o \
  -name "*.swo" -o \
  -name ".*.swp" \
\) -exec rm -f {} \; 2>/dev/null

# Remove backup directories
echo ""
echo "📁 Removing backup directories..."
find /workspaces/nextjs-with-supabase -type d -name "backup_*" -exec rm -rf {} \; 2>/dev/null

# Remove duplicate lockfiles (keep only package-lock.json)
echo ""
echo "🔒 Removing duplicate lockfiles..."
safe_delete "/workspaces/nextjs-with-supabase/yarn.lock"
safe_delete "/workspaces/nextjs-with-supabase/pnpm-lock.yaml"
safe_delete "/workspaces/nextjs-with-supabase/package-lock.json.bak"

# Remove Python cache
echo ""
echo "🐍 Removing Python cache..."
find /workspaces/nextjs-with-supabase -type d -name "__pycache__" -exec rm -rf {} \; 2>/dev/null
find /workspaces/nextjs-with-supabase -type f -name "*.pyc" -exec rm -f {} \; 2>/dev/null
safe_delete "/workspaces/nextjs-with-supabase/notebooks/__pycache__"
safe_delete "/workspaces/nextjs-with-supabase/notebooks/abaco_venv"

# Remove VS Code backup files
echo ""
echo "💻 Removing VS Code backup files..."
safe_delete "/workspaces/nextjs-with-supabase/.vscode/settings.json.bak"

# Remove temporary files
echo ""
echo "🗂️ Removing temporary files..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "*.tmp" -o \
  -name "*.temp" \
\) -exec rm -f {} \; 2>/dev/null

# Remove npm debug logs
echo ""
echo "📝 Removing npm debug logs..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "npm-debug.log*" -o \
  -name "yarn-debug.log*" -o \
  -name "yarn-error.log*" \
\) -exec rm -f {} \; 2>/dev/null

# Remove npm-list.txt and licenses.json if they exist
echo ""
echo "📄 Removing generated npm files..."
safe_delete "/workspaces/nextjs-with-supabase/npm-list.txt"
safe_delete "/workspaces/nextjs-with-supabase/licenses.json"

# Remove duplicate package.json files
echo ""
echo "📦 Checking for duplicate package.json files..."
if [ -f "/workspaces/nextjs-with-supabase/package.json (partial update)" ]; then
  safe_delete "/workspaces/nextjs-with-supabase/package.json (partial update)"
fi

# Remove .next build cache
echo ""
echo "⚡ Removing Next.js build cache..."
safe_delete "/workspaces/nextjs-with-supabase/.next"

# Remove node_modules if requested (commented out for safety)
# echo ""
# echo "📦 Removing node_modules..."
# safe_delete "/workspaces/nextjs-with-supabase/node_modules"

echo ""
echo "✅ Cleanup complete! Removed $DELETED_COUNT items."
echo ""
echo "📊 Current repository state:"
du -sh /workspaces/nextjs-with-supabase 2>/dev/null || echo "Unable to calculate size"
