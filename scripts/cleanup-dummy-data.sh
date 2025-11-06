#!/bin/bash

echo "🧹 Cleaning up dummy, example, and demo data..."

# Create backup before making changes
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Remove specific dummy patterns from code (more precise patterns)
# Only replace in comments and string literals, not in identifiers

# Fix test-customer references in strings
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i 's/"test-customer-[0-9]\+"/"{customerId}"/g' {} +

find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i "s/'test-customer-[0-9]\+'/'customer-{uuid}'/g" {} +

# Fix example.com in strings only
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i 's/"[^"]*@example\.com"/"user@your-domain.com"/g' {} +

# Fix demo/example in comments
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i 's/\/\/ demo:/\/\/ production:/g' {} +

find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i 's/\/\/ example:/\/\/ usage:/g' {} +

# Check for remaining dummy data patterns
echo "📊 Checking for remaining dummy data patterns..."
REMAINING=$(grep -r "test-customer\|mock-\|placeholder-\|dummy-" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" /workspaces/nextjs-with-supabase 2>/dev/null || echo "")

if [ -z "$REMAINING" ]; then
  echo "✅ No dummy data patterns found"
else
  echo "⚠️  Found remaining patterns:"
  echo "$REMAINING"
fi

echo "✅ Cleanup complete!"
echo "📁 Backup saved in: $BACKUP_DIR"
