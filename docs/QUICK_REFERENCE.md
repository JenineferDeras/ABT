# Quick Reference - ABACO Platform

## Supabase Project
- **Project ID**: `opctgnpvogxvdbixlpnc`
- **Dashboard**: https://supabase.com/dashboard/project/opctgnpvogxvdbixlpnc
- **API Settings**: https://supabase.com/dashboard/project/opctgnpvogxvdbixlpnc/settings/api
- **Database**: https://supabase.com/dashboard/project/opctgnpvogxvdbixlpnc/database/tables

## Railway Project
- **Project ID**: `e89ddeff-c5f7-4452-b720-25530570b0a5`
- **Dashboard**: https://railway.com/project/e89ddeff-c5f7-4452-b720-25530570b0a5

## Common Commands

### Local Development
```bash
npm run dev          # Start dev server
npm test            # Run tests
npm run build       # Build for production
npm run type-check  # Check TypeScript
```

### Supabase
```bash
supabase login                              # Login to Supabase
supabase link --project-ref opctgnpvogxvdbixlpnc  # Link project
supabase db push                           # Push migrations
supabase db pull                           # Pull schema changes
supabase functions deploy                  # Deploy edge functions
```

### Railway
```bash
railway login                              # Login to Railway
railway link e89ddeff-c5f7-4452-b720-25530570b0a5  # Link project
railway up                                 # Deploy
railway logs --follow                      # View logs
railway variables                          # List env vars
railway domain                             # Get deployment URL
```

## Environment Variables

### Required for Local Development
```bash
NEXT_PUBLIC_SUPABASE_URL=https://opctgnpvogxvdbixlpnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
```

### Required for Production (Railway)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://opctgnpvogxvdbixlpnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=<railway-domain>
```

## Useful Links

- **GitHub Repo**: https://github.com/Jeninefer/nextjs-with-supabase
- **Documentation**: [docs/](./docs/)
- **Railway Deployment**: [docs/RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **ML Framework**: [docs/ML_FRAMEWORK.md](./ML_FRAMEWORK.md)

## Troubleshooting

### Can't connect to Supabase
1. Check environment variables are set correctly
2. Verify project URL: `https://opctgnpvogxvdbixlpnc.supabase.co`
3. Check Supabase project is active in dashboard

### Railway deployment fails
1. Verify all environment variables are set
2. Check build logs: `railway logs`
3. Ensure database migrations are applied

### Tests failing
1. Run `npm install` to ensure dependencies are current
2. Check `.env.local` exists and has correct values
3. Run `npm test -- --verbose` for detailed output

---

**Last Updated**: 2025-01-06
**Project Status**: 🟢 Active Development
