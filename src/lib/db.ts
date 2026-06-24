/**
 * src/lib/db.ts
 * Dexie (IndexedDB) database for FTdata — Schema v2 (multi-dataset).
 *
 * Tables
 * ──────
 *   datasets    – dataset metadata (name, color, description)
 *   datapoints  – all entries, indexed by datasetId + tag + createdAt
 *   settings    – key/value store; tags stored as "tags_<datasetId>"
 *
 * Migration
 * ─────────
 *   v1 → v2  (Dexie upgrade): creates "Default Dataset", stamps all existing
 *             datapoints with datasetId = "default", moves global "tags" key
 *             to "tags_default".
 *
 *   localStorage → v2: handled by migrateFromLocalStorage() on first load;
 *             also creates the "default" dataset and stamps datasetId.
 */

import Dexie, { type Table } from "dexie";
import type { DataPoint, Dataset } from "./types";

// ── Internal shapes ───────────────────────────────────────────────────────────
interface SettingRow {
  key: string;
  value: unknown;
}

// ── Database class ────────────────────────────────────────────────────────────
class FTDataDB extends Dexie {
  datasets!:   Table<Dataset,   string>;
  datapoints!: Table<DataPoint, string>;
  settings!:   Table<SettingRow, string>;

  constructor() {
    super("FTDataDB");

    // ── v1: original single-dataset schema (never change this block) ──────────
    this.version(1).stores({
      datapoints: "id, tag, createdAt",
      settings:   "key",
    });

    // ── v2: multi-dataset schema ──────────────────────────────────────────────
    this.version(2)
      .stores({
        datasets:   "id, name, createdAt",
        datapoints: "id, datasetId, tag, createdAt",
        settings:   "key",
      })
      .upgrade(async (tx) => {
        // 1. Create the "default" dataset to house existing entries
        const now = Date.now();
        await tx.table("datasets").put({
          id:          "default",
          name:        "Default Dataset",
          description: "Migrated from previous version",
          color:       "violet",
          createdAt:   now,
          updatedAt:   now,
        } satisfies Dataset);

        // 2. Stamp every existing datapoint with datasetId = "default"
        await tx.table("datapoints").toCollection().modify({ datasetId: "default" });

        // 3. Move global tags key → per-dataset tags key
        const tagsRow = await tx.table("settings").get("tags");
        if (tagsRow) {
          await tx.table("settings").put({ key: "tags_default", value: tagsRow.value });
          await tx.table("settings").delete("tags");
        }
      });
  }
}

export const db = new FTDataDB();

// ── Constants ─────────────────────────────────────────────────────────────────
export const DEFAULT_DATASET_ID = "default";
export const DEFAULT_TAGS       = ["হিমু", "মিসির আলি", "সংলাপ", "General"];

export const DATASET_COLORS = [
  "violet", "indigo", "cyan", "emerald", "amber", "rose",
] as const;
export type DatasetColor = (typeof DATASET_COLORS)[number];

// ── Dataset helpers ───────────────────────────────────────────────────────────
export async function getDatasets(): Promise<Dataset[]> {
  return db.datasets.orderBy("createdAt").toArray();
}

export async function getDataset(id: string): Promise<Dataset | undefined> {
  return db.datasets.get(id);
}

export async function saveDataset(ds: Dataset): Promise<void> {
  await db.datasets.put(ds);
}

export async function deleteDatasetAndEntries(id: string): Promise<void> {
  await db.transaction("rw", [db.datasets, db.datapoints, db.settings], async () => {
    await db.datasets.delete(id);
    await db.datapoints.where("datasetId").equals(id).delete();
    await db.settings.delete(`tags_${id}`);
  });
}

export async function getDatasetEntryCounts(): Promise<Record<string, number>> {
  const all = await db.datapoints.toArray();
  return all.reduce<Record<string, number>>((acc, d) => {
    acc[d.datasetId] = (acc[d.datasetId] ?? 0) + 1;
    return acc;
  }, {});
}

// ── Per-dataset tag helpers ───────────────────────────────────────────────────
export async function getTags(datasetId: string): Promise<string[]> {
  const row = await db.settings.get(`tags_${datasetId}`);
  return Array.isArray(row?.value) ? (row!.value as string[]) : DEFAULT_TAGS;
}

export async function saveTags(datasetId: string, tags: string[]): Promise<void> {
  await db.settings.put({ key: `tags_${datasetId}`, value: tags });
}

// ── One-time LocalStorage → IndexedDB v2 migration ───────────────────────────
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  const rawData = window.localStorage.getItem("ft_dataset");
  const rawTags = window.localStorage.getItem("ft_tags");
  if (!rawData && !rawTags) return;

  try {
    // Ensure default dataset exists
    const existing = await db.datasets.get(DEFAULT_DATASET_ID);
    if (!existing) {
      const now = Date.now();
      await db.datasets.put({
        id:          DEFAULT_DATASET_ID,
        name:        "Default Dataset",
        description: "Imported from previous version",
        color:       "violet",
        createdAt:   now,
        updatedAt:   now,
      });
    }

    // Migrate entries
    if (rawData) {
      const parsed: Omit<DataPoint, "datasetId">[] = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingCount = await db.datapoints
          .where("datasetId").equals(DEFAULT_DATASET_ID).count();
        if (existingCount === 0) {
          const stamped: DataPoint[] = parsed.map((p) => ({
            ...p,
            datasetId: DEFAULT_DATASET_ID,
          }));
          await db.datapoints.bulkPut(stamped);
          console.info(`[FTdata] Migrated ${stamped.length} entries from LocalStorage → IndexedDB`);
        }
      }
    }

    // Migrate tags
    if (rawTags) {
      const parsedTags: string[] = JSON.parse(rawTags);
      if (Array.isArray(parsedTags) && parsedTags.length > 0) {
        const currentTags = await getTags(DEFAULT_DATASET_ID);
        const merged = Array.from(new Set([...parsedTags, ...currentTags]));
        await saveTags(DEFAULT_DATASET_ID, merged);
      }
    }

    window.localStorage.removeItem("ft_dataset");
    window.localStorage.removeItem("ft_tags");
  } catch (err) {
    console.warn("[FTdata] LocalStorage migration failed:", err);
  }
}
