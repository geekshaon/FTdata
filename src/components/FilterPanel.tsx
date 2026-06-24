"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Filter, X, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw,
  Download, FileJson, Shield, Star,
} from "lucide-react";
import { DataPoint } from "@/lib/types";
import { getTagColor } from "@/lib/utils";
import { exportAlpacaJSON, exportAlpacaJSONL, exportBackupJSON } from "@/lib/exporters";
import { toast } from "sonner";

export type SortField = "createdAt" | "updatedAt" | "instruction" | "output" | "tag" | "rating";
export type SortDir   = "asc" | "desc";

export interface FilterState {
  tags: string[];
  sortField: SortField;
  sortDir: SortDir;
  dateFrom: string;
  dateTo: string;
  searchField: "all" | "instruction" | "input" | "output";
  minRating: 0 | 1 | 2 | 3 | 4 | 5;  // 0 = all
}

export const DEFAULT_FILTERS: FilterState = {
  tags: [],
  sortField: "createdAt",
  sortDir: "desc",
  dateFrom: "",
  dateTo: "",
  searchField: "all",
  minRating: 0,
};

interface FilterPanelProps {
  allTags: string[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  resultCount: number;
  totalCount: number;
  filteredData: DataPoint[];           // for "Export visible"
  tags: string[];                      // for backup export
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt",   label: "Date Created" },
  { value: "updatedAt",   label: "Date Updated" },
  { value: "rating",      label: "Rating ⭐" },
  { value: "instruction", label: "Instruction" },
  { value: "output",      label: "Output" },
  { value: "tag",         label: "Tag" },
];

const SEARCH_FIELD_OPTIONS: { value: FilterState["searchField"]; label: string }[] = [
  { value: "all",         label: "All fields" },
  { value: "instruction", label: "Instruction only" },
  { value: "input",       label: "Input only" },
  { value: "output",      label: "Output only" },
];

const RATING_OPTIONS = [
  { value: 0 as const, label: "All" },
  { value: 1 as const, label: "1★+" },
  { value: 2 as const, label: "2★+" },
  { value: 3 as const, label: "3★+" },
  { value: 4 as const, label: "4★+" },
  { value: 5 as const, label: "5★" },
];

export default function FilterPanel({
  allTags, filters, onChange, resultCount, totalCount, filteredData, tags,
}: FilterPanelProps) {
  const [open, setOpen]         = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Click outside to close export dropdown
  useEffect(() => {
    if (!exportOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [exportOpen]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.tags.length > 0) n++;
    if (filters.dateFrom || filters.dateTo) n++;
    if (filters.sortField !== DEFAULT_FILTERS.sortField || filters.sortDir !== DEFAULT_FILTERS.sortDir) n++;
    if (filters.searchField !== "all") n++;
    if (filters.minRating > 0) n++;
    return n;
  }, [filters]);

  const reset = () => onChange(DEFAULT_FILTERS);

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  };

  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  // Export visible handlers
  const handleExportVisible = (format: "json" | "jsonl" | "backup") => {
    if (filteredData.length === 0) { toast.error("No entries to export."); return; }
    if (format === "json")   exportAlpacaJSON(filteredData);
    if (format === "jsonl")  exportAlpacaJSONL(filteredData);
    if (format === "backup") exportBackupJSON(filteredData, tags);
    toast.success(`Exported ${filteredData.length} visible entries.`);
    setExportOpen(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm relative z-20">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-violet-400" />
          Filters &amp; Sort
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-violet-500 text-white text-[10px] font-bold leading-none">
              {activeCount}
            </span>
          )}
          {open
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Result count */}
        <span className="ml-auto text-xs text-slate-500">
          <span className="text-slate-300 font-medium">{resultCount}</span>
          {" "}of{" "}
          <span className="text-slate-300 font-medium">{totalCount}</span>
          {" "}entries
        </span>

        {/* Export visible */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-all"
            title="Export visible entries"
          >
            <Download className="w-3 h-3" />
            Export ({resultCount})
          </button>
          {exportOpen && (
            <div className="absolute z-20 top-full mt-1 right-0 w-44 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
              {[
                { label: "Alpaca JSON",  icon: FileJson, format: "json"   as const, cls: "text-emerald-400" },
                { label: "Alpaca JSONL", icon: FileJson, format: "jsonl"  as const, cls: "text-cyan-400" },
                { label: "Full Backup",  icon: Shield,   format: "backup" as const, cls: "text-violet-400" },
              ].map(({ label, icon: Icon, format, cls }) => (
                <button
                  key={format}
                  onClick={() => handleExportVisible(format)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  <Icon className={`w-3.5 h-3.5 ${cls}`} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            title="Clear all filters"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-white/8 px-4 py-4 space-y-5">

          {/* Tag filter */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Filter by Tag</p>
            {allTags.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? `${getTagColor(tag)} ring-1 ring-white/30 scale-105`
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                      }`}
                    >
                      {active && <span>✓</span>}
                      {tag}
                    </button>
                  );
                })}
                {filters.tags.length > 0 && (
                  <button
                    onClick={() => set("tags", [])}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-slate-500 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all"
                  >
                    <X className="w-2.5 h-2.5" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-400" />
              Min Rating
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("minRating", opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    filters.minRating === opt.value
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sort</p>
            <div className="flex gap-1 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (filters.sortField === opt.value) {
                      set("sortDir", filters.sortDir === "asc" ? "desc" : "asc");
                    } else {
                      onChange({ ...filters, sortField: opt.value, sortDir: "desc" });
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    filters.sortField === opt.value
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-300 hover:border-white/20"
                  }`}
                >
                  {opt.label}
                  {filters.sortField === opt.value && (
                    filters.sortDir === "asc"
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search scope */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Search Scope</p>
            <div className="flex gap-1.5 flex-wrap">
              {SEARCH_FIELD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("searchField", opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    filters.searchField === opt.value
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</p>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="text-[10px] text-slate-600 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => set("dateFrom", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition [color-scheme:dark]"
                />
              </div>
              <span className="text-slate-600 text-xs mt-4">→</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-600 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => set("dateTo", e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition [color-scheme:dark]"
                />
              </div>
              {(filters.dateFrom || filters.dateTo) && (
                <button
                  onClick={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
                  className="mt-4 p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Clear dates"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active summary */}
          {activeCount > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/8">
              <Filter className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-slate-400">
                {activeCount} active filter{activeCount > 1 ? "s" : ""} · showing {resultCount} of {totalCount} entries
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
