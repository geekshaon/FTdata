"use client";

/**
 * useDataset.ts
 * Per-dataset state hook — scoped to a single datasetId.
 * All DB operations are filtered/stamped with the active datasetId.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataPoint } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { db, getTags, saveTags, DEFAULT_TAGS } from "@/lib/db";

export function useDataset(datasetId: string) {
  const [data, setData]         = useState<DataPoint[]>([]);
  const [tags, setTagsState]    = useState<string[]>(DEFAULT_TAGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Load when datasetId changes ───────────────────────────────────────────
  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    setIsHydrated(false);

    async function load() {
      const [savedTags, allEntries] = await Promise.all([
        getTags(datasetId),
        db.datapoints.where("datasetId").equals(datasetId).toArray(),
      ]);

      // Sort newest first in JS (avoids compound index complexity)
      allEntries.sort((a, b) => b.createdAt - a.createdAt);

      if (!cancelled) {
        setTagsState(savedTags);
        setData(allEntries);
        setIsHydrated(true);
      }
    }

    load().catch((err) => {
      console.error("[FTdata] Failed to load dataset:", err);
      if (!cancelled) setIsHydrated(true);
    });

    return () => { cancelled = true; };
  }, [datasetId]);

  // ── Tag persistence ────────────────────────────────────────────────────────
  const persistTags = useCallback((newTags: string[]) => {
    saveTags(datasetId, newTags).catch((err) =>
      console.warn("[FTdata] Failed to save tags:", err)
    );
  }, [datasetId]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addItem = useCallback(
    (fields: Omit<DataPoint, "id" | "datasetId" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const newItem: DataPoint = {
        ...fields,
        id:        generateId(),
        datasetId,
        createdAt: now,
        updatedAt: now,
      };
      setData((prev) => [newItem, ...prev]);
      db.datapoints.put(newItem).catch((err) =>
        console.warn("[FTdata] Failed to save entry:", err)
      );
      return newItem;
    },
    [datasetId]
  );

  const updateItem = useCallback(
    (id: string, fields: Partial<Omit<DataPoint, "id" | "datasetId" | "createdAt">>) => {
      const updatedAt = Date.now();
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...fields, updatedAt } : item
        )
      );
      db.datapoints.get(id).then((existing) => {
        if (existing) return db.datapoints.put({ ...existing, ...fields, updatedAt });
      }).catch((err) => console.warn("[FTdata] Failed to update entry:", err));
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    db.datapoints.delete(id).catch((err) =>
      console.warn("[FTdata] Failed to delete entry:", err)
    );
  }, []);

  const importItems = useCallback(
    (items: DataPoint[], mode: "append" | "replace" = "append") => {
      // Always stamp the current datasetId so imports are dataset-scoped
      const stamped: DataPoint[] = items.map((i) => ({ ...i, datasetId }));

      if (mode === "replace") {
        setData(stamped);
        db.transaction("rw", db.datapoints, async () => {
          await db.datapoints.where("datasetId").equals(datasetId).delete();
          await db.datapoints.bulkPut(stamped);
        }).catch((err) => console.warn("[FTdata] Failed to replace dataset:", err));
      } else {
        setData((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const deduped = stamped.filter((i) => !existingIds.has(i.id));
          db.datapoints.bulkPut(deduped).catch((err) =>
            console.warn("[FTdata] Failed to import entries:", err)
          );
          return [...deduped, ...prev];
        });
      }
    },
    [datasetId]
  );

  // ── Tag management ────────────────────────────────────────────────────────
  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return false;
      let added = false;
      setTagsState((prev) => {
        if (prev.includes(trimmed)) return prev;
        const next = [...prev, trimmed];
        persistTags(next);
        added = true;
        return next;
      });
      return added;
    },
    [persistTags]
  );

  const removeTag = useCallback(
    (tag: string) => {
      setTagsState((prev) => {
        const next = prev.filter((t) => t !== tag);
        persistTags(next);
        return next;
      });
    },
    [persistTags]
  );

  // ── Derived stats ─────────────────────────────────────────────────────────
  const tagStats = useMemo(
    () => tags.reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = data.filter((d) => d.tag === tag).length;
      return acc;
    }, {}),
    [data, tags]
  );

  const untaggedCount = useMemo(
    () => data.filter((d) => !tags.includes(d.tag)).length,
    [data, tags]
  );

  return {
    data,
    tags,
    isHydrated,
    addItem,
    updateItem,
    removeItem,
    importItems,
    addTag,
    removeTag,
    tagStats,
    untaggedCount,
    totalCount: data.length,
  };
}
