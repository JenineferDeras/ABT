/**
 * Environment variable validation and access
 * 
 * Variables marked as:
 * - PUBLIC: Safe to expose to browser (prefixed with NEXT_PUBLIC_)
 * - PRIVATE: Server-only, must never be sent to client
 */

function getEnvVar(key: string, isPublic = false): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env.local or deployment configuration.`
    );
  }

  if (!isPublic && key.startsWith("NEXT_PUBLIC_")) {
    console.warn(
      `Warning: PUBLIC variable ${key} accessed in private context. ` +
      `Consider using a private variable instead.`
    );
  }

  return value;
}

function getEnvVarOptional(key: string, isPublic = false): string | undefined {
  const value = process.env[key];

  if (!isPublic && key.startsWith("NEXT_PUBLIC_") && value) {
    console.warn(
      `Warning: PUBLIC variable ${key} accessed in private context. ` +
      `Consider using a private variable instead.`
    );
  }

  return value;
}

/**
 * Public environment variables (safe for browser)
 */
const publicEnv = {
  get SUPABASE_URL() {
    return getEnvVar("NEXT_PUBLIC_SUPABASE_URL", true);
  },
  get SUPABASE_ANON_KEY() {
    return getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true);
  },
} as const;

/**
 * Private environment variables (server-only)
 */
const privateEnv = {
  get SUPABASE_SERVICE_KEY() {
    return getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
  },
  GROK_API_KEY: getEnvVarOptional("GROK_API_KEY"),
} as const;

export const env = {
  public: publicEnv,
  private: privateEnv,
} as const;

export type Env = typeof env;
