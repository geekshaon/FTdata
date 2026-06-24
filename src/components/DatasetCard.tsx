"use client";

import { useState } from "react";
import { Edit2, Trash2, ArrowRight, FileText, Tag, Calendar } from "lucide-react";
import { Dataset } from "@/lib/types";

const COLOR_STYLES: Record<string, {
  gradient: string; border: string; badge: string; arrow: string; glow: string;
}> = {
  violet:  { gradient: "from-violet-600/20 to-violet-800/10",  border: "border-violet-500/25 hover:border-violet-500/60",  badge: "bg-violet-500/20 text-violet-300",  arrow: "text-violet-400 group-hover:bg-violet-500/20", glow: "shadow-violet-500/10" },
  indigo:  { gradient: "from-indigo-600/20 to-indigo-800/10",  border: "border-indigo-500/25 hover:border-indigo-500/60",  badge: "bg-indigo-500/20 text-indigo-300",  arrow: "text-indigo-400 group-hover:bg-indigo-500/20", glow: "shadow-indigo-500/10" },
  cyan:    { gradient: "from-cyan-600/20 to-cyan-800/10",      border: "border-cyan-500/25 hover:border-cyan-500/60",      badge: "bg-cyan-500/20 text-cyan-300",      arrow: "text-cyan-400 group-hover:bg-cyan-500/20",   glow: "shadow-cyan-500/10" },
  emerald: { gradient: "from-emerald-600/20 to-emerald-800/10",border: "border-emerald-500/25 hover:border-emerald-500/60",badge: "bg-emerald-500/20 text-emerald-300",arrow: "text-emerald-400 group-hover:bg-emerald-500/20",glow: "shadow-emerald-500/10" },
  amber:   { gradient: "from-amber-600/20 to-amber-800/10",    border: "border-amber-500/25 hover:border-amber-500/60",    badge: "bg-amber-500/20 text-amber-300",    arrow: "text-amber-400 group-hover:bg-amber-500/20", glow: "shadow-amber-500/10" },
  rose:    { gradient: "from-rose-600/20 to-rose-800/10",      border: "border-rose-500/25 hover:border-rose-500/60",      badge: "bg-rose-500/20 text-rose-300",      arrow: "text-rose-400 group-hover:bg-rose-500/20",   glow: "shadow-rose-500/10" },
};

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

interface DatasetCardProps {
  dataset: Dataset;
  entryCount: number;
  tagCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DatasetCard({
  dataset, entryCount, tagCount, onOpen, onEdit, onDelete,
}: DatasetCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const style = COLOR_STYLES[dataset.color] ?? COLOR_STYLES.violet;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${style.gradient} ${style.border} shadow-lg ${style.glow} transition-all duration-200 hover:shadow-xl overflow-hidden cursor-pointer`}
      onClick={onOpen}
    >
      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${style.gradient.replace("/20", "").replace("/10", "")}`} />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{dataset.name}</h3>
            {dataset.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{dataset.description}</p>
            )}
          </div>

          {/* Action buttons — stop propagation */}
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
              title="Rename"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileText className="w-3 h-3" />
            <span className="font-semibold text-white">{entryCount}</span>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Tag className="w-3 h-3" />
            <span className="font-semibold text-white">{tagCount}</span>
            <span>tags</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
            <Calendar className="w-3 h-3" />
            {formatRelativeDate(dataset.updatedAt)}
          </div>
        </div>

        {/* Open arrow */}
        <div className={`flex items-center justify-between pt-2 border-t border-white/8`}>
          <span className={`text-xs font-semibold ${style.badge.split(" ")[1]} opacity-0 group-hover:opacity-100 transition-opacity`}>
            Click to open
          </span>
          <div className={`p-1.5 rounded-lg transition-all ${style.arrow}`}>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Delete confirm overlay */}
      {confirmDelete && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d1220]/95 backdrop-blur-sm p-4 rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-semibold text-white text-center">Delete "{dataset.name}"?</p>
          <p className="text-xs text-rose-300 text-center">
            This will permanently delete all {entryCount} entries.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs text-white font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
