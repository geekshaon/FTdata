import type { DataPoint, AlpacaItem } from "./types";
import { downloadFile } from "./utils";

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportAlpacaJSON(data: DataPoint[]) {
  const cleaned: AlpacaItem[] = data.map((d) => ({
    instruction: d.instruction,
    input: d.input,
    output: d.output,
  }));
  downloadFile(JSON.stringify(cleaned, null, 2), "dataset_alpaca.json", "application/json");
}

export function exportAlpacaJSONL(data: DataPoint[]) {
  const lines = data
    .map((d) =>
      JSON.stringify({ instruction: d.instruction, input: d.input, output: d.output })
    )
    .join("\n");
  downloadFile(lines, "dataset_alpaca.jsonl", "application/x-ndjson");
}

export function exportBackupJSON(data: DataPoint[], tags: string[]) {
  const backup = { version: 1, tags, data, exportedAt: new Date().toISOString() };
  downloadFile(JSON.stringify(backup, null, 2), "dataset_backup.json", "application/json");
}

// ─── Import ───────────────────────────────────────────────────────────────────

export type ParsedImport =
  | { type: "backup"; tags: string[]; data: DataPoint[] }
  | { type: "alpaca"; data: AlpacaItem[] };

export async function parseImportFile(file: File): Promise<ParsedImport> {
  const text = await file.text();
  const trimmed = text.trim();

  // Try JSONL first (multiple lines, each a JSON object)
  if (trimmed.startsWith("{")) {
    const lines = trimmed.split("\n").filter((l) => l.trim());
    const parsed = lines.map((l) => JSON.parse(l));
    // Check if it looks like alpaca format
    if (parsed[0] && "instruction" in parsed[0] && !("id" in parsed[0])) {
      return { type: "alpaca", data: parsed as AlpacaItem[] };
    }
  }

  // Try JSON array / backup object
  const json = JSON.parse(trimmed);

  // Backup format: { version, tags, data }
  if (json.version !== undefined && Array.isArray(json.data)) {
    return { type: "backup", tags: json.tags ?? [], data: json.data as DataPoint[] };
  }

  // Plain JSON array of alpaca items
  if (Array.isArray(json)) {
    if (json[0] && "instruction" in json[0] && !("id" in json[0])) {
      return { type: "alpaca", data: json as AlpacaItem[] };
    }
    // Array with IDs — treat as backup data
    return { type: "backup", tags: [], data: json as DataPoint[] };
  }

  throw new Error("Unrecognized file format.");
}

export function alpacaToDataPoints(items: AlpacaItem[], defaultTag: string): DataPoint[] {
  const now = Date.now();
  return items.map((item, i) => ({
    id:          (now + i).toString(36),
    datasetId:   "",                   // stamped by useDataset.importItems
    instruction: item.instruction ?? "",
    input:       item.input ?? "",
    output:      item.output ?? "",
    tag:         defaultTag,
    createdAt:   now + i,
    updatedAt:   now + i,
  }));
}
