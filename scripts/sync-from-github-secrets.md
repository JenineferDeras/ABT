# Sync GitHub Secrets to Local .env.local

## Quick Reference: GitHub Secret → .env.local Mapping

Open your GitHub Secrets page in browser:
**https://github.com/JenineferDeras/ABT/settings/secrets/actions**

Then copy each secret value and update `.env.local`:

| GitHub Secret Name          | →   | .env.local Variable Name                                  |
| --------------------------- | --- | --------------------------------------------------------- |
| `FIGMA_TOKEN`               | →   | `FIGMA_TOKEN`                                             |
| `GEMINI_API_KEY`            | →   | `GEMINI_API_KEY`                                          |
| `GOOGLE_KEY`                | →   | `GOOGLE_API_KEY`                                          |
| `GROK_API_KEY`              | →   | `GROK_API_KEY`, `XAI_API_KEY`, `NEXT_PUBLIC_GROK_API_KEY` |
| `HUBSPOT_TOKEN`             | →   | `HUBSPOT_PRIVATE_APP_TOKEN`                               |
| `HUGGING_TOKEN`             | →   | `HUGGINGFACE_TOKEN`                                       |
| `META_ABACO`                | →   | `META_ACCESS_TOKEN`                                       |
| `OPEN_AI`                   | →   | `OPENAI_API_KEY`                                          |
| `RAILWAY_TOKEN`             | →   | `RAILWAY_TOKEN`                                           |
| `SLACK_TOKEN`               | →   | `SLACK_BOT_TOKEN`                                         |
| `SONARQUBE_KEY`             | →   | `SONARQUBE_TOKEN`                                         |
| `SOURCERY_TOKEN`            | →   | `SOURCERY_TOKEN`                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | →   | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY`       |
| `VERCEL_KEY`                | →   | `VERCEL_TOKEN`                                            |

## Additional Variables (Not in GitHub Secrets)

Get these from service dashboards:

### Supabase

- **NEXT_PUBLIC_SUPABASE_URL**: https://supabase.com/dashboard/project/_/settings/api
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Same page as above
- **SUPABASE_JWT_SECRET**: Same page as above

### Vercel

- **VERCEL_ORG_ID**: https://vercel.com/account/settings
- **VERCEL_PROJECT_ID**: https://vercel.com/dashboard → Your Project → Settings

## Instructions

### Option 1: Interactive Script (Recommended)

```bash
./scripts/sync-secrets.sh
```

Follow the prompts to enter each secret.

### Option 2: Manual Edit

1. Open `.env.local` in your editor
2. Open GitHub Secrets page in browser
3. Copy each secret from GitHub and paste into corresponding `.env.local` variable
4. Save the file

### Option 3: Command Line (One at a time)

```bash
# Example for OpenAI
# 1. Copy OPEN_AI value from GitHub Secrets page
# 2. Run:
sed -i '' 's|^OPENAI_API_KEY=.*|OPENAI_API_KEY=sk-your-actual-key-here|' .env.local
```

## Verification

After syncing, verify the keys are set:

```bash
# Should show actual keys (first 10 chars), not placeholders
grep -E "OPENAI_API_KEY|GROK_API_KEY|HUGGINGFACE_TOKEN" .env.local | head -3
```

## Test Integrations

```bash
# Test TypeScript integrations (Grok, OpenAI, Copilot)
npx tsx scripts/test-ai-integrations.ts

# Test Python integrations (Hugging Face)
python3 scripts/test-huggingface.py
```

## Security Note

`.env.local` is gitignored - your API keys are safe and will NOT be committed to the repository! 🔒
