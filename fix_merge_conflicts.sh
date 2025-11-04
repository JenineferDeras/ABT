#!/bin/bash

echo "🔧 Fixing all merge conflicts in the repository..."

# Find all files with merge conflict markers
echo "📁 Finding files with merge conflicts..."
git diff --name-only --diff-filter=U 2>/dev/null || true

# Use git to resolve merge conflicts by accepting current branch changes
echo "🔄 Resolving merge conflicts..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" | xargs grep -l "<<<<<<< HEAD" 2>/dev/null | while read file; do
    echo "🔧 Fixing merge conflicts in: $file"
    
    # Remove merge conflict markers and keep the HEAD version (current branch)
    sed -i '' '/<<<<<<< HEAD/,/=======/d; />>>>>>> /d' "$file"
    
    echo "✅ Fixed: $file"
done

echo "🎉 All merge conflicts resolved!"
