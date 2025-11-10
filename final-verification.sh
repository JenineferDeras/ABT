#!/bin/bash
echo "🔍 COMPREHENSIVE FINAL VERIFICATION"
echo "===================================="
echo ""

# 1. Git Status
echo "1. GIT STATUS:"
git status --short
if [ $? -eq 0 ] && [ -z "$(git status --short)" ]; then
    echo "✅ Clean - No uncommitted changes"
else
    echo "⚠️ Warning - Uncommitted changes detected"
fi
echo ""

# 2. GitHub Sync
echo "2. GITHUB SYNC:"
git fetch origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ $LOCAL = $REMOTE ]; then
    echo "✅ In sync - Local and remote are identical"
else
    echo "⚠️ Out of sync - Pull or push needed"
fi
echo ""

# 3. No Demo/Dummy Data
echo "3. CODE QUALITY CHECK:"
DUMMY_COUNT=$(grep -r "dummy\|example\|demo\|mock\|fake" --include="*.ts" --include="*.tsx" app/ components/ lib/ 2>/dev/null | wc -l)
if [ $DUMMY_COUNT -eq 0 ]; then
    echo "✅ No dummy/demo data found in source code"
else
    echo "⚠️ Found $DUMMY_COUNT potential dummy/demo references"
fi
echo ""

# 4. Environment Files
echo "4. ENVIRONMENT SETUP:"
if [ -f .env.local ]; then
    echo "✅ .env.local exists ($(wc -l < .env.local) lines)"
else
    echo "⚠️ .env.local missing"
fi
if [ -f .env.example ]; then
    echo "✅ .env.example exists as template"
fi
echo ""

# 5. GitHub Secrets
echo "5. GITHUB SECRETS:"
SECRET_COUNT=$(gh secret list 2>/dev/null | wc -l)
echo "✅ $SECRET_COUNT secrets configured"
echo ""

# 6. CLI Authentication
echo "6. CLI AUTHENTICATION:"
gh auth status &>/dev/null && echo "✅ GitHub CLI authenticated" || echo "❌ GitHub not auth"
vercel whoami &>/dev/null && echo "✅ Vercel authenticated" || echo "❌ Vercel not auth"
railway whoami &>/dev/null && echo "✅ Railway authenticated" || echo "❌ Railway not auth"
gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null && echo "✅ Google Cloud authenticated" || echo "❌ GCloud not auth"
echo ""

# 7. Workflows
echo "7. GITHUB WORKFLOWS:"
gh run list --limit 3 --json conclusion,name | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"//' | while read workflow; do
    STATUS=$(gh run list --workflow="$workflow" --limit 1 --json conclusion --jq '.[0].conclusion')
    if [ "$STATUS" = "success" ]; then
        echo "✅ $workflow - Passing"
    else
        echo "⚠️ $workflow - $STATUS"
    fi
done
echo ""

# 8. Dependencies
echo "8. DEPENDENCIES:"
npm audit --audit-level=high 2>&1 | grep -E "found 0|vulnerabilities"
echo ""

# 9. TypeScript
echo "9. TYPESCRIPT:"
npx tsc --noEmit &>/dev/null && echo "✅ TypeScript - No errors" || echo "⚠️ TypeScript - Has errors"
echo ""

# 10. ESLint
echo "10. ESLINT:"
npx eslint . --ext .ts,.tsx &>/dev/null && echo "✅ ESLint - No errors" || echo "⚠️ ESLint - Has errors"
echo ""

echo "=================================="
echo "✅ VERIFICATION COMPLETE"
