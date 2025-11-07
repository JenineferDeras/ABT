# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup Environment

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
```

### Step 2: Start Development

```bash
# Option 1: Auto-find available port
bash scripts/find-port.sh

# Option 2: Use default port (3000)
npm run dev

# Option 3: Use specific port
PORT=3001 npm run dev
```

### Step 3: Open in Browser
