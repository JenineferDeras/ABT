# Development Setup Guide

## Prerequisites

- Node.js 20.x
- npm (officially supported package manager)
- Supabase account
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd nextjs-with-supabase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env.local` in the project root:

```bash
# Supabase Configuration (Required)
# Get these from https://supabase.com/dashboard/project/[project-ref]/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Google Drive Integration (Optional)
GDRIVE_FOLDER_ID=[folder-id]
GDRIVE_SERVICE_ACCOUNT={"type":"service_account",...}

# Grok AI Features (Optional)
GROK_API_KEY=[api-key]
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Commands

### Development

```bash
# Start development server (hot reload enabled)
npm run dev

# Start on custom port
PORT=3001 npm run dev
```

### Production

```bash
# Build for production
npm run build

# Start production server (requires build first)
npm run start
```

### Code Quality

```bash
# Type checking with TypeScript
npm run type-check

# ESLint validation
npm run lint

# Build validation
npm run build
```

## Database Setup

### Option 1: Using Supabase CLI

```bash
# Link your Supabase project
npx supabase link

# Apply migrations to your database
npx supabase db push
```

### Option 2: Manual Migration

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor → New Query
3. Copy and paste migration files from `/supabase/migrations/*.sql`
4. Execute each migration in order

## Testing

Currently, no testing framework is configured. When adding tests:

- **Recommended frameworks**: Jest or Vitest with React Testing Library
- **E2E testing**: Playwright or Cypress
- Use TypeScript for all test files
- Follow the patterns documented in `.github/copilot-instructions.md`

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, Database)
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

## Project Structure
