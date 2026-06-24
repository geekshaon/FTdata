"use client";

import { useState, useMemo } from "react";
import {
  Database, FolderPlus, Sparkles, LayoutGrid, List,
  FileText, TrendingUp, Edit2,
} from "lucide-react";
import { Dataset } from "@/lib/types";
import DatasetCard from "./DatasetCard";
import CreateDatasetModal from "./CreateDatasetModal";

interface HomeViewProps {
  datasets: Dataset[];
  entryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  totalEntries: number;
  onOpenDataset: (id: string) => void;
  onCreateDataset: (name: string, desc: string, color: string) => void;
  onUpdateDataset: (id: string, fields: Partial<Pick<Dataset, "name" | "description" | "color">>) => void;
  onDeleteDataset: (id: string) => void;
}

export default function HomeView({
  datasets, entryCounts, tagCounts, totalEntries,
  onOpenDataset, onCreateDataset, onUpdateDataset, onDeleteDataset,
}: HomeViewProps) {
  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState<Dataset | null>(null);
  const [gridView, setGridView]       = useState(true);

  const totalTags = useMemo(
    () => Object.values(tagCounts).reduce((s, n) => s + n, 0),
    [tagCounts]
  );

  return (
    <>
      <CreateDatasetModal
        open={createOpen || !!editTarget}
        editDataset={editTarget}
        onSave={(name, desc, color) => {
          if (editTarget) {
            onUpdateDataset(editTarget.id, { name, description: desc, color });
          } else {
            onCreateDataset(name, desc, color);
          }
          setEditTarget(null);
          setCreateOpen(false);
        }}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
      />

      <div className="min-h-screen flex flex-col">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#080c14]/80 backdrop-blur-xl">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-sm font-bold text-white tracking-tight">FTdata</span>
                <span className="text-[10px] text-slate-500">AI Dataset Curator</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">
                {datasets.length} datasets · {totalEntries} entries
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  onClick={() => setGridView(true)}
                  className={`p-1.5 rounded-lg transition-all ${gridView ? "bg-violet-500/20 text-violet-400" : "text-slate-500 hover:text-slate-300"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={`p-1.5 rounded-lg transition-all ${!gridView ? "bg-violet-500/20 text-violet-400" : "text-slate-500 hover:text-slate-300"}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Dataset
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

          {/* ── Global stats bar ──────────────────────────────────────── */}
          {datasets.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Database,   label: "Datasets",      value: datasets.length,  accent: "violet" },
                { icon: FileText,   label: "Total Entries", value: totalEntries,      accent: "cyan" },
                { icon: TrendingUp, label: "Total Tags",    value: totalTags,         accent: "emerald" },
              ].map(({ icon: Icon, label, value, accent }) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 p-4 rounded-2xl border bg-white/[0.03] border-${accent}-500/20 bg-gradient-to-br from-${accent}-500/[0.08] to-transparent`}
                >
                  <div className={`p-2.5 rounded-xl bg-${accent}-500/15`}>
                    <Icon className={`w-5 h-5 text-${accent}-400`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
                    <p className={`text-2xl font-bold text-${accent}-300 tabular-nums`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Datasets ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Your Datasets
              </h2>
              {datasets.length > 0 && (
                <span className="text-xs text-slate-600">{datasets.length} datasets</span>
              )}
            </div>

            {datasets.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-5xl">📂</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">No Datasets Yet</h1>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                    Create your first dataset to start curating AI fine-tuning data in Alpaca format.
                  </p>
                </div>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-violet-500/20 transition-all active:scale-95"
                >
                  <FolderPlus className="w-5 h-5" />
                  Create First Dataset
                </button>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Alpaca Format", "JSONL Export", "IndexedDB Storage", "Bengali Support"].map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-slate-500">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            ) : gridView ? (
              /* Grid view */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {datasets.map((ds) => (
                  <DatasetCard
                    key={ds.id}
                    dataset={ds}
                    entryCount={entryCounts[ds.id] ?? 0}
                    tagCount={tagCounts[ds.id] ?? 0}
                    onOpen={() => onOpenDataset(ds.id)}
                    onEdit={() => setEditTarget(ds)}
                    onDelete={() => onDeleteDataset(ds.id)}
                  />
                ))}

                {/* New dataset card */}
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 p-8 transition-all group min-h-[160px]"
                >
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-violet-500/20 transition-all">
                    <FolderPlus className="w-6 h-6 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-500 group-hover:text-violet-300 font-medium transition-colors">New Dataset</p>
                </button>
              </div>
            ) : (
              /* List view */
              <div className="space-y-2 rounded-2xl border border-white/10 overflow-hidden">
                {datasets.map((ds, i) => {
                  const style = {
                    violet:  "text-violet-400  bg-violet-500/20",
                    indigo:  "text-indigo-400  bg-indigo-500/20",
                    cyan:    "text-cyan-400    bg-cyan-500/20",
                    emerald: "text-emerald-400 bg-emerald-500/20",
                    amber:   "text-amber-400   bg-amber-500/20",
                    rose:    "text-rose-400    bg-rose-500/20",
                  }[ds.color] ?? "text-violet-400 bg-violet-500/20";

                  return (
                    <div
                      key={ds.id}
                      onClick={() => onOpenDataset(ds.id)}
                      className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors group ${i > 0 ? "border-t border-white/8" : ""}`}
                    >
                      <div className={`p-2 rounded-lg ${style}`}>
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{ds.name}</p>
                        {ds.description && <p className="text-xs text-slate-500 truncate">{ds.description}</p>}
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500">
                        <span><span className="text-white font-medium">{entryCounts[ds.id] ?? 0}</span> entries</span>
                        <span><span className="text-white font-medium">{tagCounts[ds.id] ?? 0}</span> tags</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setEditTarget(ds); }} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2 text-xs text-slate-600">
            <span>FTdata — AI Dataset Curator · All data stored locally in IndexedDB</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Client-side · No server · No tracking
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
