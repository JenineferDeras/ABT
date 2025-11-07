# Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Error**: `Port 3000 is in use by an unknown process, using available port 3001 instead`

**Solution 1: Kill the process on port 3000**

```bash
# macOS/Linux
lsof -nP -iTCP:3000 -sTCP:LISTEN | grep LISTEN
kill -9 <PID>

# Or using fuser (Linux)
fuser -k 3000/tcp

# Or using netstat
netstat -tulpn | grep 3000
```

**Solution 2: Use different port**

```bash
PORT=3001 npm run dev
PORT=3002 npm run start
```

**Solution 3: Use port finder script**

```bash
bash scripts/find-port.sh
bash scripts/find-port.sh 3002
```

**Prevention**:

- Add to `.env.local`:
  ```
  PORT=3000
  ```

### Issue 2: CORS/Cross-Origin Errors in Development

**Error**: `Blocked cross-origin request from 127.0.0.1 to /_next/* resource`

**Solution**: Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["127.0.0.1", "localhost"],
  },
};
```

**Note**: This is a development-only warning and doesn't affect production.

### Issue 3: TypeScript Errors During Build

**Error**: Multiple TypeScript compilation errors

**Solution**:

```bash
# 1. Clear cache
rm -rf .next

# 2. Run type check
npm run type-check

# 3. Fix reported errors
# Follow the error messages and fix any type mismatches

# 4. Rebuild
npm run build
```

### Issue 4: ESLint Violations

**Error**: ESLint reports errors

**Solution**:

```bash
# 1. View all errors
npm run lint

# 2. Auto-fix what can be fixed
npm run lint -- --fix

# 3. Review and fix remaining errors manually
```

### Issue 5: Node Modules Issues

**Error**: `Cannot find module`, dependency errors

**Solution**:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Verify
npm run type-check
```

## Development Server Issues

### Server won't start

**Checklist**:

1. ✅ Check Node.js version: `node --version` (should be 20.x)
2. ✅ Check npm version: `npm --version` (should be 10.x)
3. ✅ Check dependencies: `npm install`
4. ✅ Clear cache: `rm -rf .next`
5. ✅ Check `.env.local` exists with required variables
6. ✅ Check port availability: `lsof -i :3000`

### Slow build times

**Optimization**:

```bash
# Clear webpack cache
rm -rf .next

# Rebuild
npm run build
```

**VS Code optimization**:

- Disable unnecessary extensions
- Enable "Workspace Trust" to avoid scanning time

### Memory issues

**If build fails with memory error**:

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## SonarQube / Code Quality Issues

### Viewing SonarQube findings

```bash
# 1. Run analysis with token
export SONARQUBE_TOKEN="your-token"
npm run sonar

# 2. View dashboard
open https://sonarcloud.io/dashboard?id=jenineferderas_abaco-sim-e
```

### Common SonarQube Issues

**Issue: `any` types**

```typescript
// ❌ WRONG
function getData(id: any): any {
  return data;
}

// ✅ CORRECT
function getData(id: string): DataType {
  return data;
}
```

**Issue: Hardcoded values**

```typescript
// ❌ WRONG
const API_KEY = "sk-1234567890";

// ✅ CORRECT
const API_KEY = process.env.API_KEY!;
```

**Issue: Empty catch blocks**

```typescript
// ❌ WRONG
try {
  await operation();
} catch {}

// ✅ CORRECT
try {
  await operation();
} catch (error) {
  console.error("Operation failed:", error);
}
```

## Environment Configuration

### `.env.local` not found

**Solution**:

```bash
# Copy example file
cp .env.example .env.local

# Update with your values
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Missing environment variables

**Check required variables**:

```bash
# Should be set in .env.local
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Browser Issues

### Page won't load

**Checklist**:

1. ✅ Dev server running: `npm run dev`
2. ✅ Correct URL: `http://localhost:3000`
3. ✅ Clear browser cache: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Linux)
4. ✅ Check browser console for errors
5. ✅ Check terminal for build errors

### Hydration mismatch errors

**Solution**:

- Clear `.next` cache
- Restart dev server
- Clear browser cache

## Performance Issues

### Slow page loads

**Optimization**:

1. Check Network tab in DevTools
2. Check for large bundle sizes
3. Enable Lighthouse audit
4. Profile with Chrome DevTools

### High memory usage

**Solution**:

```bash
# Monitor memory
top -p $(pgrep node)

# Kill and restart
npm run dev
```

## Database / Supabase Issues

### Connection errors

**Checklist**:

1. ✅ Supabase project is running
2. ✅ Environment variables correct
3. ✅ Network connectivity
4. ✅ RLS policies allow access

### Auth failures

**Solution**:

1. Check Supabase Auth settings
2. Verify redirect URLs
3. Check email confirmation

## Git & Deployment Issues

### Git conflicts

**Solution**:

```bash
# View conflicts
git status

# Resolve conflicts manually
# Then:
git add .
git commit -m "chore: resolve conflicts"
```

### Deployment fails

**Checklist**:

1. ✅ All tests pass: `npm run quality-check`
2. ✅ Build succeeds: `npm run build`
3. ✅ No lint errors: `npm run lint`
4. ✅ Types valid: `npm run type-check`
5. ✅ Git is clean: `git status`

## Getting Help

1. **Check documentation**: `/docs` directory
2. **Check Copilot instructions**: `.github/copilot-instructions.md`
3. **Check error messages**: Read full error output
4. **Search issues**: GitHub Issues
5. **Ask team**: For complex issues

## Useful Commands

```bash
# Complete quality check before deploy
npm run quality-check

# Run all checks sequentially
npm run type-check && npm run lint && npm run build

# Monitor dev server
npm run dev -- --debug

# Profile build
npm run build -- --profile

# Clear all caches
rm -rf .next node_modules package-lock.json && npm install
```

## Alpine Linux Specifics

Since this workspace is on Alpine/Debian:

```bash
# Find process on port
lsof -nP -iTCP:3000 -sTCP:LISTEN

# Kill process
kill -9 <PID>

# Alternative tools available
netstat -tulpn | grep 3000
ps aux | grep node
```

## References

- [Next.js Troubleshooting](https://nextjs.org/docs/pages/building-your-application/deploying)
- [Supabase Docs](https://supabase.com/docs)
- [Copilot Instructions](./.github/copilot-instructions.md)
- [Project Summary](./PROJECT_SUMMARY.md)
