# CodeRabbit Review Guide

## Overview

This document guides CodeRabbit (AI code review assistant) on reviewing pull requests for the ABACO Financial Intelligence Platform according to Copilot standards.

## Review Focus Areas

### 1. TypeScript & Type Safety

**What CodeRabbit should check:**

✅ **Do:**

- Enforce TypeScript strict mode
- Verify all functions have explicit return types
- Check for proper type annotations
- Recommend specific types over `unknown`

❌ **Don't allow:**

- `any` types without strong justification
- Missing type annotations on public APIs
- Implicit `any` from loose inference

**Example feedback:**

```typescript
// ❌ BAD
function getData(id: any): any {
  return database.find(id);
}

// ✅ GOOD
interface DataResult {
  id: string;
  name: string;
  value: number;
}

function getData(id: string): Promise<DataResult> {
  return database.find(id);
}
```

### 2. React & Next.js Patterns

**What CodeRabbit should check:**

✅ **Do:**

- Verify Server Components are default
- Check for proper `"use client"` directive usage
- Ensure components use functional style
- Validate PascalCase naming for components

❌ **Don't allow:**

- Client components without `"use client"`
- Unnecessary client-side state
- Class components (unless special case)

**Example feedback:**

```typescript
// ❌ BAD - Missing "use client" with hooks
export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);
}

// ✅ GOOD - Proper client component marker
("use client");

export default function Dashboard() {
  const [data, setData] = useState([]);
  // ...
}
```

### 3. Security

**What CodeRabbit should check:**

✅ **Do:**

- Flag hardcoded credentials
- Verify environment variable usage
- Check for input validation
- Ensure RLS policies are implemented

❌ **Don't allow:**

- API keys in code
- Hardcoded URLs or secrets
- Unvalidated user input
- Missing RLS policies

**Example feedback:**

```typescript
// ❌ BAD - Hardcoded secret
const API_KEY = "sk-1234567890";

// ✅ GOOD - Environment variable
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is required");
}
```

### 4. Error Handling

**What CodeRabbit should check:**

✅ **Do:**

- Verify try-catch blocks have proper handling
- Check for error logging
- Ensure user-friendly error messages
- Validate error boundaries exist

❌ **Don't allow:**

- Empty catch blocks
- Silent failures
- Unhandled promise rejections
- Missing error logging

**Example feedback:**

```typescript
// ❌ BAD - Silent error
try {
  await operation();
} catch {}

// ✅ GOOD - Proper error handling
try {
  await operation();
} catch (error) {
  console.error("Operation failed:", error);
  throw new Error(
    `Operation failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`
  );
}
```

### 5. Performance

**What CodeRabbit should check:**

✅ **Do:**

- Verify use of Server Components
- Check for proper image optimization
- Ensure Suspense boundaries exist
- Validate bundle size awareness

❌ **Don't allow:**

- Unnecessary client-side JavaScript
- Unoptimized images
- Missing loading states
- Large bundle additions without justification

### 6. Code Organization

**What CodeRabbit should check:**

✅ **Do:**

- Verify proper file location
- Check path alias usage
- Ensure single-responsibility
- Validate component composition

❌ **Don't allow:**

- Relative imports when `@/` should be used
- Overly complex components
- Mixed concerns
- Poor file organization

## Automated Checks

CodeRabbit should automatically check for:

1. **Imports**

   ```regex
   ^\s*import.*from\s+['"][^@]
   ```

   Suggest using `@/` path aliases

2. **Type usage**

   ```regex
   :\s*any(?!\w)
   ```

   Flag `any` types, suggest specific types

3. **Secrets**

   ```regex
   (password|secret|api[_-]?key|token)\s*=\s*['"]
   ```

   Block hardcoded credentials

4. **Error handling**
   ```regex
   catch\s*\(\w+\)\s*\{\s*\}
   ```
   Flag empty catch blocks

## Praise for Good Practices

CodeRabbit should praise:

- ✅ Proper type annotations
- ✅ Good error handling with logging
- ✅ Correct use of Server Components
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ Clear component composition
- ✅ Proper test coverage

## Review Workflow

1. **Automatic Review** - CodeRabbit reviews immediately on PR creation
2. **Pattern Matching** - Uses configured rules to identify issues
3. **Context-Aware** - Understands Next.js, React, TypeScript patterns
4. **Feedback** - Provides specific, actionable suggestions
5. **Approval** - Can auto-approve low-risk changes (small PRs, docs)

## Configuration Files

- `.coderabbit.yaml` - Main configuration
- `.eslintrc.json` - ESLint rules
- `tsconfig.json` - TypeScript settings
- `next.config.ts` - Next.js configuration

## Examples of CodeRabbit Feedback

### Example 1: Type Safety
