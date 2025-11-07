# Build Issues & Fixes

## Issues Found

### 1. ❌ Missing `tailwindcss-animate` Dependency

**Error**: `Can't resolve 'tailwindcss-animate'`

**Fix**:

```bash
npm install tailwindcss-animate
```

### 2. ❌ TypeScript Errors in `lib/abaco-strategy-2026.ts`

**Errors**:

- Missing `ValidationData` type
- Missing `DataRow` type
- Missing `AUMCalculationData` type
- Unused variables: `normalizeColumn`, `parseNumericValue`

**Fix**: Already implemented with proper type definitions

### 3. ❌ Invalid `next.config.ts` Configuration

**Error**: `allowedDevOrigins` is not a valid Next.js 15 config option

**Fix**: Removed from config. The CORS warning during dev is expected and doesn't affect functionality.

### 4. ❌ Missing Supabase Environment Variables

**Error**: `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`

**Fix**: Update `.env.local` with real Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Quick Fix

Run the complete fix script:

```bash
bash scripts/fix-build.sh
```

Or manually:

```bash
# 1. Install missing package
npm install tailwindcss-animate

# 2. Clear caches
rm -rf .next node_modules/.cache

# 3. Type check
npm run type-check

# 4. Fix linting
npm run lint -- --fix

# 5. Build
npm run build
```

## Verify Fixes

```bash
# Run quality checks
npm run quality-check

# Expected output:
# ✅ Type checking: PASSED
# ✅ Linting: PASSED
# ✅ Build: PASSED
# ✅ All quality checks passed!
```

## Start Development

```bash
# Update .env.local first with Supabase credentials
# Then:

# Option 1: Auto port
PORT=3001 npm run dev

# Option 2: Specific port
npm run dev:3001

# Option 3: Default port (may use 3001 if 3000 busy)
npm run dev
```

## Common Issues After Fixes

### Still getting type errors?

```bash
# Clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo
npm run type-check
```

### Still getting port errors?

```bash
# Kill process on port 3000
lsof -nP -iTCP:3000 -sTCP:LISTEN | grep LISTEN
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Supabase still showing invalid URL?

1. Check `.env.local` exists
2. Verify URL format: `https://your-project.supabase.co`
3. Verify key is not empty
4. Restart dev server after changing `.env.local`

## Architecture Notes

- ✅ All type definitions now properly declared
- ✅ No `any` types (per Copilot strict mode)
- ✅ Unused variables prefixed with `_` (ESLint compliant)
- ✅ All functions have explicit return types
- ✅ Proper error handling throughout

## References

- [Copilot Instructions](./.github/copilot-instructions.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)
