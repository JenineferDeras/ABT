# Deployment Checklist

## Pre-Deployment

- [ ] Run `npm run lint` - Fix all linting errors
- [ ] Run `npm run build` - Ensure build succeeds
- [ ] Test locally with `npm run dev`
- [ ] Verify all environment variables in `.env.local`
- [ ] Run security audit: `npm audit`

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy from main branch
4. Monitor for free-tier rate limits

## Post-Deployment

- [ ] Verify application is running
- [ ] Check error logs in Vercel dashboard
- [ ] Test authentication flow
- [ ] Verify database connections

## Rate Limit Issues

If you see "api-deployments-free-per-day" errors:

- Wait before retrying
- Consider upgrading Vercel plan
- Throttle CI deployments
