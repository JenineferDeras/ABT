# Environment Setup Guide

## Prerequisites

- Node.js 20.x
- npm 10.x
- Git
- Supabase account

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/Jeninefer/nextjs-with-supabase.git
cd nextjs-with-supabase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - ML Features
GROK_API_KEY=your-grok-key

# Optional - Google Drive Integration
GDRIVE_FOLDER_ID=your-folder-id
GDRIVE_SERVICE_ACCOUNT={"type":"service_account",...}

# Optional - SonarQube
SONARQUBE_TOKEN=your-token

# Port (optional)
PORT=3000
```

### 4. Verify Setup

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build

# All checks
npm run quality-check
```

### 5. Start Development

```bash
npm run dev
```

Server should start on `http://localhost:3000` (or available port)

## Environment Variables Explained

### Required (Supabase)

| Variable                        | Purpose                | Where to Find                       |
| ------------------------------- | ---------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL   | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key   | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side access key | Supabase Dashboard → Settings → API |

### Optional

| Variable                 | Purpose                      | Setup                                |
| ------------------------ | ---------------------------- | ------------------------------------ |
| `GROK_API_KEY`           | xAI Grok API access          | [xAI Platform](https://console.x.ai) |
| `GDRIVE_FOLDER_ID`       | Google Drive folder ID       | Google Drive → Folder → URL          |
| `GDRIVE_SERVICE_ACCOUNT` | Google Cloud service account | Google Cloud Console                 |
| `SONARQUBE_TOKEN`        | SonarQube analysis token     | SonarCloud → Organization Settings   |
| `PORT`                   | Development server port      | Default: 3000                        |

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys
4. Add to `.env.local`

### 2. Run Database Migrations

```bash
# If migrations exist in /supabase directory
supabase db push
```

### 3. Configure Authentication

1. Go to Supabase Dashboard
2. Auth → Providers
3. Enable desired providers
4. Set redirect URLs

### 4. Set Row Level Security (RLS)

1. Go to SQL Editor
2. Run RLS policy commands
3. Verify policies are active

## Development Workflow

### Start Development Server

```bash
npm run dev
```

### Run Quality Checks

```bash
# Type checking
npm run type-check

# ESLint
npm run lint

# All checks
npm run quality-check
```

### Build for Production

```bash
npm run build
npm run start
```

### Run SonarQube Analysis

```bash
export SONARQUBE_TOKEN=your-token
npm run sonar
```

## Troubleshooting Setup

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev

# Or kill existing process
lsof -nP -iTCP:3000 -sTCP:LISTEN | grep LISTEN
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run type-check
npm run build
```

### Environment Variables Not Loading

```bash
# Verify .env.local exists
ls -la .env.local

# Check values are correct
cat .env.local

# Restart dev server after changes
# (Press Ctrl+C and run npm run dev again)
```

## Production Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

## Next Steps

1. ✅ Setup complete
2. ✅ Review [Copilot Instructions](./.github/copilot-instructions.md)
3. ✅ Read [Project Summary](./PROJECT_SUMMARY.md)
4. ✅ Start development: `npm run dev`
5. ✅ Make changes following guidelines
6. ✅ Run `npm run quality-check` before committing

---

**Need help?** Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
