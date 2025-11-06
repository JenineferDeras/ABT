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
    .replace(/[\s\-]+/g, "_")
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

// COMMENT OUT OR REMOVE - This requires googleapis which has version issues
// We'll implement this later when needed
/*
async function getDriveClient(config: IngestionConfig) {
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

async function downloadFile(drive: Awaited<ReturnType<typeof getDriveClient>>, fileId: string): Promise<Buffer> {
  const { data } = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(data as ArrayBuffer);
}

function parseWorkbook(buffer: Buffer, fileName: string): NormalizedRecord[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];
  const json = XLSX.utils.sheet_to_json<NormalizedRecord>(worksheet, { defval: null });
  return normaliseRecords(fileName, json);
}

async function purgeExisting(supabase: SupabaseClient, table: string, workbookName: string): Promise<void> {
  await supabase.from(table).delete().eq("workbook_name", workbookName);
}

async function insertRecords(supabase: SupabaseClient, table: string, records: NormalizedRecord[]): Promise<void> {
  if (!records.length) return;
  const { error } = await supabase.from(table).insert(records);
  if (error) throw new Error(`Supabase insert failed for ${table}: ${error.message}`);
}

function resolveTable(fileName: string): string | null {
  const mapping = FILE_PATTERNS.find(({ pattern }) => pattern.test(fileName));
  return mapping?.table ?? null;
}

export async function ingestFromDrive(): Promise<void> {
  const config = loadConfig();
  const supabase = await getSupabaseClient(config);
  const drive = await getDriveClient(config);

  const filesResponse = await drive.files.list({
    q: `'${config.driveFolderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name, mimeType)",
  });

  const files = filesResponse.data.files ?? [];

  for (const file of files) {
    if (!file.id || !file.name) continue;
    const table = resolveTable(file.name);
    if (!table) {
      console.warn(`[drive-ingest] Skipping unsupported file "${file.name}"`);
      continue;
    }

    const buffer = await downloadFile(drive, file.id);
    const records = parseWorkbook(buffer, file.name);

    await purgeExisting(supabase, table, file.name);
    await insertRecords(supabase, table, records);
    console.info(`[drive-ingest] Upserted ${records.length} rows into ${table} from ${file.name}`);
  }

  const { error } = await supabase.rpc("refresh_ml_features");
  if (error) {
    throw new Error(`Failed to refresh ml_feature_snapshots: ${error.message}`);
  }
}
*/
