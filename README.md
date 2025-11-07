# Next.js + Supabase Starter

A modern, production-ready starter template for building full-stack applications with Next.js and Supabase.

## Features

- **Next.js 15** - React framework with App Router
- **TypeScript** - Strict mode for type safety
- **Supabase** - Open source Firebase alternative
- **Tailwind CSS** - Utility-first CSS framework
- **Authentication** - Built-in Supabase auth
- **Dark Mode** - Theme switching with next-themes
- **Testing** - Vitest + React Testing Library
- **ESLint & Prettier** - Code quality tools

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account

### Installation

```bash
# Clone repository
git clone <your-repo>
cd nextjs-with-supabase

# Install dependencies
npm ci

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Development

```bash
# Development server
npm run dev

# Lint code
npm run lint

# Type checking
npm run type-check

# Format code
npm run format

# Run tests
npm run test

# Coverage
npm run test:coverage
```

## Project Structure

```
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and types
├── utils/           # Helper functions
├── public/          # Static files
├── supabase/        # Supabase config
└── middleware.ts    # Next.js middleware
```

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase SSR
- **Styling**: Tailwind CSS
- **UI Components**: Custom + shadcn/ui pattern
- **Testing**: Vitest + React Testing Library

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Other Platforms

Ensure Node.js 20+ is configured and run:

```bash
npm run build
npm run start
```

## Security

- ✅ TypeScript strict mode
- ✅ Input validation
- ✅ Environment variables
- ✅ Server-side authentication
- ✅ CSRF protection via Next.js

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT
