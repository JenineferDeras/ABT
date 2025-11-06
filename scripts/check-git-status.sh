#!/bin/bash

echo "🔍 Checking Git repository status..."
echo ""

cd /workspaces/nextjs-with-supabase

echo "📝 Untracked files:"
git ls-files --others --exclude-standard

echo ""
echo "🔄 Modified files:"
git ls-files --modified

echo ""
echo "📊 Files staged for commit:"
git diff --name-only --cached

echo ""
echo "🗑️ Files that should be ignored but are tracked:"
git ls-files --ignored --exclude-standard

echo ""
echo "📦 Large files in repository:"
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" 2>/dev/null

echo ""
echo "✅ Git status check complete!"
