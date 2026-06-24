"use client";

/**
 * useDatasets.ts
 * Manages the top-level list of datasets.
 * Used by the Home view to list, create, rename and delete datasets.
 */

import { useState, useEffect, useCallback } from "react";
import { Dataset } from "@/lib/types";
import {
  db, getDatasets, saveDataset, deleteDatasetAndEntries,
  getDatasetEntryCounts, migrateFromLocalStorage, DEFAULT_DATASET_ID, DEFAULT_TAGS,
} from "@/lib/db";
import { generateId } from "@/lib/utils";

export function useDatasets() {
  const [datasets, setDatasets]       = useState<Dataset[]>([]);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated]   = useState(false);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Run LocalStorage migration (no-op if already done)
      await migrateFromLocalStorage();

      // 2. Ensure at least one dataset exists
      const count = await db.datasets.count();
      if (count === 0) {
        const now = Date.now();
        await db.datasets.put({
          id:          DEFAULT_DATASET_ID,
          name:        "Default Dataset",
          description: "",
          color:       "violet",
          createdAt:   now,
          updatedAt:   now,
        });
        // Seed default tags
        await db.settings.put({ key: `tags_${DEFAULT_DATASET_ID}`, value: DEFAULT_TAGS });
      }

      // 3. Load datasets + entry counts
      const [dsList, counts] = await Promise.all([
        getDatasets(),
        getDatasetEntryCounts(),
      ]);

      if (!cancelled) {
        setDatasets(dsList);
        setEntryCounts(counts);
        setIsHydrated(true);
      }
    }

    load().catch((err) => {
      console.error("[FTdata] Failed to load datasets:", err);
      if (!cancelled) setIsHydrated(true);
    });

    return () => { cancelled = true; };
  }, []);

  // ── Refresh counts (called after workspace exits) ─────────────────────────
  const refreshCounts = useCallback(async () => {
    const counts = await getDatasetEntryCounts();
    setEntryCounts(counts);
  }, []);

  // ── Create ───────────────────────────────────────────────────────────────────
  const createDataset = useCallback(async (
    name: string,
    description: string,
    color: string,
  ): Promise<Dataset> => {
    const now = Date.now();
    const ds: Dataset = {
      id:          generateId(),
      name:        name.trim(),
      description: description.trim(),
      color,
      createdAt:   now,
      updatedAt:   now,
    };
    await saveDataset(ds);
    // Seed default tags for the new dataset
    await db.settings.put({ key: `tags_${ds.id}`, value: DEFAULT_TAGS });
    setDatasets((prev) => [...prev, ds]);
    setEntryCounts((prev) => ({ ...prev, [ds.id]: 0 }));
    return ds;
  }, []);

  // ── Update (rename / recolor / redescribe) ────────────────────────────────
  const updateDataset = useCallback(async (
    id: string,
    fields: Partial<Pick<Dataset, "name" | "description" | "color">>,
  ) => {
    const updatedAt = Date.now();

    // Optimistic
    setDatasets((prev) =>
      prev.map((d) => d.id === id ? { ...d, ...fields, updatedAt } : d)
    );

    // Persist
    const existing = await db.datasets.get(id);
    if (existing) {
      await saveDataset({ ...existing, ...fields, updatedAt });
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteDataset = useCallback(async (id: string) => {
    // Optimistic
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    setEntryCounts((prev) => { const n = { ...prev }; delete n[id]; return n; });

    // Persist (cascade deletes all entries + tags)
    await deleteDatasetAndEntries(id);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalEntries = Object.values(entryCounts).reduce((s, n) => s + n, 0);

  return {
    datasets,
    entryCounts,
    totalEntries,
    isHydrated,
    createDataset,
    updateDataset,
    deleteDataset,
    refreshCounts,
  };
}
