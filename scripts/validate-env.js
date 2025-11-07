#!/usr/bin/env node

/**
 * Validate that required environment variables are set
 * Run: npm run validate:env
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const optional = ["GDRIVE_FOLDER_ID", "GDRIVE_SERVICE_ACCOUNT", "GROK_API_KEY"];

const missing = required.filter((key) => !process.env[key]);
const configured = optional.filter((key) => process.env[key]);

for (const envVar of required) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log("✓ All required environment variables are set");
if (configured.length > 0) {
  console.log(`✅ Optional features configured: ${configured.join(", ")}`);
}
