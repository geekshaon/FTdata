"use client";

import { useState } from "react";
import {
  Trash2, Tag, Download, X, CheckSquare, ChevronDown,
  FileJson, Shield,
} from "lucide-react";
import { DataPoint } from "@/lib/types";
import { getTagColor } from "@/lib/utils";
import { exportAlpacaJSON, exportAlpacaJSONL, exportBackupJSON } from "@/lib/exporters";
import { toast } from "sonner";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  allData: DataPoint[];           // full dataset to resolve selected items
  tags: string[];
  onBulkDelete: (ids: string[]) => void;
  onBulkRetag: (ids: string[], tag: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionBar({
  selectedIds, allData, tags,
  onBulkDelete, onBulkRetag, onClearSelection,
}: BulkActionBarProps) {
  const [retagOpen, setRetagOpen]       = useState(false);
  const [exportOpen, setExportOpen]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedIds.size === 0) return null;

  const selectedItems = allData.filter((d) => selectedIds.has(d.id));
  const count = selectedIds.size;

  const handleExport = (format: "json" | "jsonl" | "backup") => {
    if (format === "json")   exportAlpacaJSON(selectedItems);
    if (format === "jsonl")  exportAlpacaJSONL(selectedItems);
    if (format === "backup") exportBackupJSON(selectedItems, tags);
    toast.success(`Exported ${count} selected entries.`);
    setExportOpen(false);
  };

  const handleDelete = () => {
    onBulkDelete([...selectedIds]);
    toast.success(`Deleted ${count} entries.`);
    setConfirmDelete(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-2xl px-4">
      <div className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl border border-violet-500/30 bg-[#0d1220]/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10 animate-in slide-in-from-bottom-4 fade-in">

        {/* Count badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-white tabular-nums">
            {count} <span className="text-slate-400 font-normal">selected</span>
          </span>
        </div>

        <div className="flex-1 h-px bg-white/8 mx-1" />

        {/* Retag */}
        <div className="relative">
          <button
            onClick={() => { setRetagOpen((o) => !o); setExportOpen(false); setConfirmDelete(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-all"
          >
            <Tag className="w-3.5 h-3.5" />
            Retag
            <ChevronDown className={`w-3 h-3 transition-transform ${retagOpen ? "rotate-180" : ""}`} />
          </button>
          {retagOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-44 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
              {tags.length === 0
                ? <p className="px-3 py-2.5 text-xs text-slate-500 italic">No tags available</p>
                : tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { onBulkRetag([...selectedIds], tag); toast.success(`Retagged ${count} entries as "${tag}".`); setRetagOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition"
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}>{tag}</span>
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Export selected */}
        <div className="relative">
          <button
            onClick={() => { setExportOpen((o) => !o); setRetagOpen(false); setConfirmDelete(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className={`w-3 h-3 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
          </button>
          {exportOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-48 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
              {[
                { label: "Alpaca JSON",  icon: FileJson,  format: "json"   as const, cls: "text-emerald-400" },
                { label: "Alpaca JSONL", icon: FileJson,  format: "jsonl"  as const, cls: "text-cyan-400" },
                { label: "Full Backup",  icon: Shield,    format: "backup" as const, cls: "text-violet-400" },
              ].map(({ label, icon: Icon, format, cls }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  <Icon className={`w-3.5 h-3.5 ${cls}`} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-rose-300">Delete {count}?</span>
            <button onClick={handleDelete} className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition">Yes</button>
            <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs transition">No</button>
          </div>
        ) : (
          <button
            onClick={() => { setConfirmDelete(true); setRetagOpen(false); setExportOpen(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-sm text-rose-400 hover:text-rose-300 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}

        {/* Clear */}
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all shrink-0"
          title="Clear selection (Escape)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
