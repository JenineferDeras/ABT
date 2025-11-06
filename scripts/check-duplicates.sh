#!/bin/bash

echo "🔍 Scanning for duplicate files, backups, and unnecessary copies..."
echo ""

# Check for backup files
echo "📦 Checking for backup files..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "*.backup" -o \
  -name "*.bak" -o \
  -name "*.old" -o \
  -name "*.orig" -o \
  -name "*~" -o \
  -name "*.swp" -o \
  -name "*.swo" -o \
  -name ".*.swp" -o \
  -name "backup_*" \
\) 2>/dev/null

echo ""
echo "📋 Checking for duplicate package.json files..."
find /workspaces/nextjs-with-supabase -type f -name "package.json*" 2>/dev/null

echo ""
echo "🔒 Checking for duplicate lockfiles..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "package-lock.json*" -o \
  -name "yarn.lock*" -o \
  -name "pnpm-lock.yaml*" \
\) 2>/dev/null

echo ""
echo "📝 Checking for duplicate .env files..."
find /workspaces/nextjs-with-supabase -type f -name ".env*" 2>/dev/null

echo ""
echo "🗂️ Checking for temporary/cache directories..."
find /workspaces/nextjs-with-supabase -type d \( \
  -name "__pycache__" -o \
  -name ".cache" -o \
  -name "*.tmp" -o \
  -name "backup_*" -o \
  -name ".next" \
\) 2>/dev/null

echo ""
echo "📊 Checking for duplicate config files..."
find /workspaces/nextjs-with-supabase -type f \( \
  -name "*.config.js*" -o \
  -name "*.config.ts*" -o \
  -name "tsconfig*.json*" \
\) 2>/dev/null

echo ""
echo "🔍 Checking for duplicate VS Code settings..."
find /workspaces/nextjs-with-supabase/.vscode -type f -name "*.json*" 2>/dev/null

echo ""
echo "✅ Scan complete!"
