"use client";

import { useMemo, useRef, useCallback, useEffect } from "react";
import { Search, Edit2, Trash2, FileText, Tag as TagIcon, Eye, X } from "lucide-react";
import { DataPoint } from "@/lib/types";
import { formatDate, truncate, getTagColor } from "@/lib/utils";
import { FilterState } from "./FilterPanel";
import StarRating from "./StarRating";

interface DataTableProps {
  data: DataPoint[];
  query: string;
  onQueryChange: (q: string) => void;
  filters: FilterState;
  onEdit: (item: DataPoint) => void;
  onDelete: (item: DataPoint) => void;
  onView: (item: DataPoint) => void;
  onRatingChange: (id: string, rating: number) => void;
  // Bulk selection
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  // Expose filtered data for parent
  onFilteredData?: (data: DataPoint[]) => void;
}

export default function DataTable({
  data, query, onQueryChange, filters,
  onEdit, onDelete, onView, onRatingChange,
  selectedIds, onSelectionChange, onFilteredData,
}: DataTableProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Filtering + sorting ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = (query ?? "").toLowerCase().trim();

    let result = data.filter((d) => {
      if (filters.tags.length > 0 && !filters.tags.includes(d.tag)) return false;

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).setHours(0, 0, 0, 0);
        if (d.createdAt < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).setHours(23, 59, 59, 999);
        if (d.createdAt > to) return false;
      }

      // Min rating filter
      if (filters.minRating > 0) {
        if (!d.rating || d.rating < filters.minRating) return false;
      }

      if (q) {
        const sf = filters.searchField;
        const inInstruction = d.instruction.toLowerCase().includes(q);
        const inInput       = d.input.toLowerCase().includes(q);
        const inOutput      = d.output.toLowerCase().includes(q);
        const inTag         = d.tag.toLowerCase().includes(q);

        if (sf === "instruction" && !inInstruction) return false;
        if (sf === "input"       && !inInput)       return false;
        if (sf === "output"      && !inOutput)      return false;
        if (sf === "all"         && !inInstruction && !inInput && !inOutput && !inTag) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      const sf = filters.sortField;
      if (sf === "createdAt" || sf === "updatedAt") {
        cmp = a[sf] - b[sf];
      } else if (sf === "rating") {
        cmp = (a.rating ?? 0) - (b.rating ?? 0);
      } else {
        cmp = String(a[sf]).localeCompare(String(b[sf]), "bn");
      }
      return filters.sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, filters]);

  // Sync filtered list to parent AFTER render (never during render)
  useEffect(() => {
    onFilteredData?.(filtered);
  }, [filtered, onFilteredData]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allFilteredSelected = filtered.length > 0 && filtered.every((d) => selectedIds.has(d.id));
  const someSelected = filtered.some((d) => selectedIds.has(d.id));

  const toggleAll = useCallback(() => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filtered.forEach((d) => next.delete(d.id));
    } else {
      filtered.forEach((d) => next.add(d.id));
    }
    onSelectionChange(next);
  }, [filtered, allFilteredSelected, selectedIds, onSelectionChange]);

  const toggleOne = useCallback((id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectionChange(next);
  }, [selectedIds, onSelectionChange]);

  // ── Expose search ref externally (Ctrl+F shortcut) ─────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DataTable as any).focusSearch = () => searchRef.current?.focus();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="font-semibold text-white">Dataset</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 tabular-nums">
            {filtered.length} / {data.length}
          </span>
          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300 font-medium tabular-nums">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        {/* Search */}
        <div className="sm:ml-auto relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              filters.searchField === "all"
                ? "Search all fields… (Ctrl+F)"
                : `Search ${filters.searchField}…`
            }
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty states */}
      {data.length === 0 && (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="text-5xl">🗂️</div>
          <p className="text-white font-medium">No entries yet</p>
          <p className="text-sm text-slate-400 max-w-xs">
            Click <strong className="text-violet-400">+ Add Entry</strong> to create your first dataset entry.
          </p>
        </div>
      )}
      {data.length > 0 && filtered.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">🔍</div>
          <p className="text-white font-medium">No results match your filters</p>
          <p className="text-sm text-slate-400">Try adjusting the search or filter criteria.</p>
        </div>
      )}

      {/* Desktop Table */}
      {filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs">
                  {/* Checkbox header */}
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allFilteredSelected; }}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer"
                      title="Select all visible"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Instruction</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Output preview</th>
                  <th className="text-left px-4 py-3 font-medium">
                    <span className="flex items-center gap-1"><TagIcon className="w-3 h-3" /> Tag</span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Rating</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onView(item)}
                      className={`border-b border-white/5 hover:bg-violet-500/5 cursor-pointer transition-colors group ${
                        isSelected ? "bg-violet-500/10" : i % 2 === 0 ? "" : "bg-white/[0.02]"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(item.id)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 text-white max-w-[220px]">
                        <p className="font-medium text-sm leading-snug">{truncate(item.instruction, 60)}</p>
                        {item.input && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Input: {truncate(item.input, 40)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-[260px] hidden lg:table-cell">
                        <p className="text-xs leading-relaxed line-clamp-2">{truncate(item.output, 100)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(item.tag)}`}>
                          {item.tag || "—"}
                        </span>
                      </td>
                      {/* Star rating — click stops row click */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <StarRating
                          value={item.rating ?? 0}
                          onChange={(r) => onRatingChange(item.id, r)}
                          size="xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onView(item)} className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/5">
            {filtered.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onView(item)}
                  className={`p-4 space-y-3 cursor-pointer transition-colors ${isSelected ? "bg-violet-500/10" : "hover:bg-violet-500/5"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); toggleOne(item.id); }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded border-white/20 accent-violet-500"
                      />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(item.tag)}`}>
                        {item.tag || "—"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 transition">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Instruction</p>
                      <p className="text-sm text-white leading-snug">{truncate(item.instruction, 120)}</p>
                    </div>
                    {item.input && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Input</p>
                        <p className="text-xs text-slate-400 leading-snug">{truncate(item.input, 80)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Output</p>
                      <p className="text-xs text-slate-400 leading-snug line-clamp-3">{truncate(item.output, 150)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StarRating value={item.rating ?? 0} onChange={(r) => onRatingChange(item.id, r)} size="sm" />
                    <p className="text-[10px] text-slate-600">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
