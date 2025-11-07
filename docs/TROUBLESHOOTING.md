# Troubleshooting Guide

## Common Issues

### Port Already in Use

If you see "EADDRINUSE" error:

```bash
PORT=3001 npm run dev
```

Or on Alpine Linux:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill -9 <PID>
```

### DevContainer User Issues

If your devcontainer fails with 'unable to find user codespace':

```bash
# Check your devcontainer.json configuration
# Ensure base image supports current user mapping
```

### NextAuth Session Issues

Ensure `.env.local` has proper values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Performance Tips

- Minimize client-side JavaScript by preferring Server Components
- Use Next.js Image component for images
- Implement proper loading states with Suspense

---

## Alpine Linux Notes

This workspace is running in a dev container on Alpine Linux v3.22.

Available commands: `apk`, `git`, `curl`, `lsof`, `netstat`, `ps`

Use `"$BROWSER" <url>` to open a webpage in the host's default browser.
