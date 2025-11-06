#!/bin/bash

echo "🧹 Cleaning up dummy, example, and demo data..."

# Remove common dummy patterns from code
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/test-customer-123/customer_uuid/g' {} +
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/example\.com/your-domain.com/g' {} +
find /workspaces/nextjs-with-supabase -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's/demo/production/g' {} +

# Check for remaining dummy data patterns
echo "📊 Checking for remaining dummy data patterns..."
grep -r "example\|dummy\|demo\|test-customer\|mock\|placeholder" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" /workspaces/nextjs-with-supabase || echo "✅ No dummy data patterns found"

echo "✅ Cleanup complete!"
