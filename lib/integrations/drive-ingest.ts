import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

type NormalizedRecord = Record<string, unknown>;

interface IngestionConfig {
  supabaseUrl: string;
  supabaseKey: string;
  driveFolderId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

const _FILE_PATTERNS = [
  { pattern: /portfolio/i, table: "raw_portfolios" },
  { pattern: /facility/i, table: "raw_facilities" },
  { pattern: /customer/i, table: "raw_customers" },
  { pattern: /payment/i, table: "raw_payments" },
  { pattern: /risk/i, table: "raw_risk_events" },
];

const NUMERIC_CLEANER = /[\$€₡,%\s]/g;

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function _loadConfig(): IngestionConfig {
  return {
    supabaseUrl: required(
      "SUPABASE_SERVICE_ROLE_URL",
      process.env.SUPABASE_SERVICE_ROLE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    supabaseKey: required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    driveFolderId: required("GDRIVE_FOLDER_ID", process.env.GDRIVE_FOLDER_ID),
    serviceAccountEmail: required(
      "GDRIVE_SERVICE_ACCOUNT_EMAIL",
      process.env.GDRIVE_SERVICE_ACCOUNT_EMAIL
    ),
    privateKey: required(
      "GDRIVE_PRIVATE_KEY",
      process.env.GDRIVE_PRIVATE_KEY
    )?.replace(/\\n/g, "\n"),
  };
}

function snakeCase(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replaceAll(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function normaliseValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") return Number.isNaN(value) ? null : value;

  if (value instanceof Date) return value.toISOString();

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (key.includes("date")) {
      const parsed = new Date(trimmed);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }

    const numericCandidate = trimmed.replace(NUMERIC_CLEANER, "");
    if (numericCandidate && /^-?\d+(\.\d+)?$/.test(numericCandidate)) {
      const parsed = Number(numericCandidate);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return trimmed;
  }

  return value;
}

function _normaliseRecords(
  workbookName: string,
  rows: NormalizedRecord[]
): NormalizedRecord[] {
  const refreshDate = new Date().toISOString();
  return rows.map((row) => {
    const normalized: NormalizedRecord = {
      workbook_name: workbookName,
      refresh_date: refreshDate,
    };

    Object.entries(row).forEach(([key, value]) => {
      if (!key) return;
      const normalKey = snakeCase(key);
      if (!normalKey) return;
      normalized[normalKey] = normaliseValue(normalKey, value);
    });

    return normalized;
  });
}

async function _getSupabaseClient(
  config: IngestionConfig
): Promise<SupabaseClient> {
  return createSupabaseClient(config.supabaseUrl, config.supabaseKey);
}

function extractMetadata(filename: string): Record<string, string> {
  let result = filename;
  result = result.replaceAll(/\s+/g, "_");
  result = result.replaceAll(/[^\w.-]/g, "");
  result = result.replaceAll(/-+/g, "-");
  result = result.replaceAll(/_+/g, "_");
  return { processed: result };
}

export async function processDriveFile(fileId: string): Promise<void> {
  try {
    // TODO: Implement drive file processing
    const metadata = extractMetadata(fileId);
    console.log("Processing:", metadata);
  } catch (error) {
    console.error("Drive ingest error:", error);
    throw error;
  }
}
