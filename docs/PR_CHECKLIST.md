# Pull Request Checklist

Before submitting a PR, ensure all items are completed following CodeRabbit and Copilot guidelines.

## Pre-Submission Checklist

### Code Quality

- [ ] Ran `npm run type-check` - all types valid
- [ ] Ran `npm run lint` - no ESLint errors or warnings
- [ ] Ran `npm run build` - production build succeeds
- [ ] No `any` types used (use `unknown` or proper types)
- [ ] All functions have explicit return types
- [ ] All props properly typed

### TypeScript

- [ ] Using TypeScript strict mode
- [ ] No implicit `any` types
- [ ] Proper interface/type definitions
- [ ] Path aliases (@/) used correctly
- [ ] Imports organized (longest to shortest)

### React Components

- [ ] Server Components by default
- [ ] `"use client"` only when needed
- [ ] PascalCase component names
- [ ] kebab-case file names
- [ ] Proper prop types defined
- [ ] No prop spreading without types

### Security

- [ ] No hardcoded credentials
- [ ] No API keys in code
- [ ] Environment variables used
- [ ] Input validation implemented
- [ ] User data properly sanitized

### Performance

- [ ] No unnecessary re-renders
- [ ] Suspense boundaries implemented
- [ ] Next.js Image component used for images
- [ ] Server Components prioritized
- [ ] Bundle impact considered

### Error Handling

- [ ] Try-catch blocks have proper handling
- [ ] Errors are logged appropriately
- [ ] User-friendly error messages
- [ ] No silent failures
- [ ] Unhandled promises resolved

### Testing

- [ ] Manually tested locally: `npm run dev`
- [ ] Tested in both light and dark modes
- [ ] Tested on multiple screen sizes
- [ ] No console warnings or errors
- [ ] Accessibility tested (keyboard navigation)

### Documentation

- [ ] JSDoc comments on public APIs
- [ ] README updated if needed
- [ ] Environment variables documented
- [ ] Complex logic explained
- [ ] Breaking changes documented

### Git

- [ ] Commits follow conventional commits
- [ ] No merge conflicts
- [ ] Branch is up to date with main
- [ ] No sensitive data committed
- [ ] `.gitignore` updated if needed

### CodeRabbit Review

- [ ] Addressed all CodeRabbit suggestions
- [ ] Fixed all flagged issues
- [ ] Resolved conflicts if any
- [ ] Code follows Copilot guidelines

## PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue

Fixes #(issue number)

## Testing

Describe testing performed

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Completed pre-submission checklist above
- [ ] CodeRabbit review passed
- [ ] All tests passing
- [ ] Documentation updated
```

## Common Issues & Solutions

### Issue: `any` types flagged by CodeRabbit

**Solution**:

```typescript
// ❌ WRONG
function process(data: any): any {
  return data;
}

// ✅ CORRECT
interface DataInput {
  id: string;
  value: number;
}

interface DataOutput {
  result: number;
}

function process(data: DataInput): DataOutput {
  return { result: data.value * 2 };
}
```

### Issue: Client component without `"use client"`

**Solution**:

```typescript
// ❌ WRONG - Uses useState but no "use client"
export default function Component() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// ✅ CORRECT
("use client");

export default function Component() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

### Issue: Hardcoded values

**Solution**:

```typescript
// ❌ WRONG
const API_URL = "https://api.example.com";

// ✅ CORRECT
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("API_URL environment variable is required");
}
```

## CodeRabbit Integration

CodeRabbit will automatically:

1. ✅ Check TypeScript types
2. ✅ Verify security practices
3. ✅ Validate React patterns
4. ✅ Review error handling
5. ✅ Suggest improvements
6. ✅ Praise good practices

## Approval Requirements

PR can be merged when:

- ✅ All automated checks pass (GitHub Actions)
- ✅ CodeRabbit gives approval
- ✅ At least one human review approved
- ✅ All conversations resolved
- ✅ No merge conflicts
- ✅ Code follows Copilot guidelines

## Questions?

Refer to:

- [Copilot Instructions](./.github/copilot-instructions.md)
- [Code Review Standards](./CODE_REVIEW_STANDARDS.md)
- [CodeRabbit Guide](./CODERABBIT_REVIEW_GUIDE.md)
