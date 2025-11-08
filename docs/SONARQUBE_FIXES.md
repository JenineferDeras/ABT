# Common SonarQube Issues & Fixes

## 1. Code Smells (Most Common)

### Unused Variables

**Problem**: Variables declared but never used

```typescript
// ❌ WRONG
const unusedVariable = getValue();
console.log("Something else");

// ✅ CORRECT
const value = getValue();
console.log(value);
```

### Empty Catch Blocks

**Problem**: Error handling without logging

```typescript
// ❌ WRONG
try {
  await someOperation();
} catch (error) {
  // Silent failure
}

// ✅ CORRECT
try {
  await someOperation();
} catch (error) {
  console.error("Operation failed:", error);
  throw new Error(
    `Operation failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`,
  );
}
```

### Unused Parameters

**Problem**: Function params that aren't used

```typescript
// ❌ WRONG
const handleClick = (event: React.MouseEvent, unused: string) => {
  console.log("Clicked");
};

// ✅ CORRECT
const handleClick = (event: React.MouseEvent) => {
  console.log("Clicked");
};

// Or prefix with underscore if intentionally unused
const handleClick = (_event: React.MouseEvent, _unused: string) => {
  console.log("Clicked");
};
```

## 2. Security Issues

### Hardcoded Credentials

**Problem**: Secrets in source code

```typescript
// ❌ WRONG
const API_KEY = "abc123def456";

// ✅ CORRECT
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is required");
}
```

### Missing Input Validation

**Problem**: No validation of user input

```typescript
// ❌ WRONG
export async function processData(data: any) {
  return await database.save(data);
}

// ✅ CORRECT
import { z } from "zod";

const DataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  value: z.number(),
});

type Data = z.infer<typeof DataSchema>;

export async function processData(data: unknown) {
  const validatedData = DataSchema.parse(data);
  return await database.save(validatedData);
}
```

## 3. Bugs

### Missing Error Handling

**Problem**: Unhandled promise rejections

```typescript
// ❌ WRONG
export default async function Page() {
  const data = await fetch("/api/data");
  return <div>{data}</div>;
}

// ✅ CORRECT
export default async function Page() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return <div>{data}</div>;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return <div>Error loading data</div>;
  }
}
```

### Type Mismatches

**Problem**: Using wrong types

```typescript
// ❌ WRONG
const value: string = 123;

// ✅ CORRECT
const value: number = 123;
// or
const value = 123; // Type inference
```

## 4. Maintainability

### High Cognitive Complexity

**Problem**: Too many nested conditions

```typescript
// ❌ WRONG (Complex)
if (condition1) {
  if (condition2) {
    if (condition3) {
      if (condition4) {
        doSomething();
      }
    }
  }
}

// ✅ CORRECT (Simplified)
if (!condition1 || !condition2 || !condition3 || !condition4) {
  return;
}
doSomething();
```

### Long Functions

**Problem**: Functions doing too much

```typescript
// ❌ WRONG (200+ lines)
export async function processUserData(user: User) {
  // Validate data
  // Transform data
  // Save to DB
  // Send email
  // Update cache
  // Log analytics
  // ... 200 more lines
}

// ✅ CORRECT (Decomposed)
async function validateUserData(user: User): Promise<User> {
  // Validation logic
  return validatedUser;
}

async function transformUserData(user: User): Promise<TransformedUser> {
  // Transformation logic
  return transformed;
}

async function saveUserData(user: TransformedUser): Promise<void> {
  // Save logic
}

export async function processUserData(user: User): Promise<void> {
  const validated = await validateUserData(user);
  const transformed = await transformUserData(validated);
  await saveUserData(transformed);
}
```

## Quick Fixes Checklist

- [ ] Run `npm run lint` and fix all ESLint errors
- [ ] Run `npm run type-check` and fix all TypeScript errors
- [ ] Remove all `// @ts-ignore` comments
- [ ] Replace `any` types with proper types
- [ ] Add error handling to all try-catch blocks
- [ ] Validate all external input (API calls, user input)
- [ ] Remove unused variables and imports
- [ ] Break down complex functions
- [ ] Add JSDoc comments to public APIs
- [ ] Check for hardcoded values (use env vars)

## Running Local Checks

```bash
# Check for issues before SonarQube
npm run lint
npm run type-check
npm run build

# Then run SonarQube
npm run sonar
```

## References

- [SonarQube JavaScript Plugin Rules](https://rules.sonarsource.com/javascript)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Copilot Code Quality Standards](./.github/copilot-instructions.md)
