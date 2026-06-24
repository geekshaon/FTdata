"use client";

import { useState, useRef } from "react";
import {
  Download, Upload, FileJson, Shield, AlertCircle, CheckCircle2, X,
  ChevronDown, PackageOpen, ToggleLeft, ToggleRight,
} from "lucide-react";
import { DataPoint } from "@/lib/types";
import {
  exportAlpacaJSON, exportAlpacaJSONL, exportBackupJSON,
  parseImportFile, alpacaToDataPoints, ParsedImport,
} from "@/lib/exporters";
import { getTagColor } from "@/lib/utils";
import { toast } from "sonner";

interface ImportExportProps {
  data: DataPoint[];
  tags: string[];
  onImport: (items: DataPoint[], mode: "append" | "replace") => void;
}

interface ExportCardProps {
  label: string;
  desc: string;
  ext: string;
  accent: "emerald" | "cyan" | "violet";
  onClick: () => void;
}

function ExportCard({ label, desc, ext, accent, onClick }: ExportCardProps) {
  const map = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20 hover:border-emerald-500/50", icon: "text-emerald-400", hover: "hover:bg-emerald-500/10", badge: "bg-emerald-500/20 text-emerald-300" },
    cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20 hover:border-cyan-500/50",    icon: "text-cyan-400",    hover: "hover:bg-cyan-500/10",    badge: "bg-cyan-500/20 text-cyan-300" },
    violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20 hover:border-violet-500/50",  icon: "text-violet-400",  hover: "hover:bg-violet-500/10",  badge: "bg-violet-500/20 text-violet-300" },
  }[accent];

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col gap-2.5 p-3.5 rounded-xl border ${map.border} bg-white/[0.03] ${map.hover} transition-all text-left`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg ${map.bg}`}>
          <FileJson className={`w-4 h-4 ${map.icon}`} />
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${map.badge}`}>{ext}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${map.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
        <Download className="w-3 h-3" /> Export
      </div>
    </button>
  );
}

export default function ImportExport({ data, tags, onImport }: ImportExportProps) {
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [pendingImport, setPendingImport] = useState<ParsedImport | null>(null);
  const [defaultTag, setDefaultTag] = useState("");
  const [tagDropOpen, setTagDropOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────────────────────
  const guard = (fn: () => void) => {
    if (data.length === 0) { toast.error("No data to export."); return; }
    fn();
  };

  // ── Import ──────────────────────────────────────────────────────────────
  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const parsed = await parseImportFile(file);
      if (parsed.type === "alpaca") {
        setPendingImport(parsed);
        setDefaultTag(tags[0] ?? "");
      } else {
        const mergedTags = Array.from(new Set([...tags, ...(parsed.tags ?? [])]));
        onImport(parsed.data, importMode);
        toast.success(`Imported ${parsed.data.length} entries.`);
        if (parsed.tags?.length) toast.info(`${mergedTags.length} tags restored.`);
      }
    } catch {
      toast.error("Invalid file. Must be JSON or JSONL.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleConfirmAlpacaImport = () => {
    if (!pendingImport || pendingImport.type !== "alpaca") return;
    if (!defaultTag) { toast.error("Please assign a tag first."); return; }
    const items = alpacaToDataPoints(pendingImport.data, defaultTag);
    onImport(items, importMode);
    toast.success(`Imported ${items.length} items with tag "${defaultTag}".`);
    setPendingImport(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/20">
          <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-white">Data I/O</span>
        <span className="ml-auto text-xs text-slate-500">{data.length} entries</span>
      </div>

      {/* ── Export ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Export</p>

        {/* 2-column grid for training formats */}
        <div className="grid grid-cols-2 gap-2">
          <ExportCard
            label="Alpaca JSON"
            desc="Array format for training"
            ext=".json"
            accent="emerald"
            onClick={() => guard(() => { exportAlpacaJSON(data); toast.success(`Exported ${data.length} items.`); })}
          />
          <ExportCard
            label="Alpaca JSONL"
            desc="One entry per line"
            ext=".jsonl"
            accent="cyan"
            onClick={() => guard(() => { exportAlpacaJSONL(data); toast.success(`Exported ${data.length} items.`); })}
          />
        </div>

        {/* Full backup — full width */}
        <button
          onClick={() => guard(() => { exportBackupJSON(data, tags); toast.success("Full backup exported."); })}
          className="group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-violet-500/20 hover:border-violet-500/50 bg-violet-500/[0.06] hover:bg-violet-500/10 transition-all text-left"
        >
          <div className="p-1.5 rounded-lg bg-violet-500/15">
            <Shield className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Full Backup</p>
            <p className="text-[11px] text-slate-500">Includes IDs, tags & metadata</p>
          </div>
          <Download className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition shrink-0" />
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-white/8" />

      {/* ── Import ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Import</p>

        {/* Import mode toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/8">
          <div>
            <p className="text-xs font-medium text-slate-300">Import Mode</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {importMode === "append" ? "Add to existing entries" : "⚠️ Replaces all data"}
            </p>
          </div>
          <button
            onClick={() => setImportMode((m) => m === "append" ? "replace" : "append")}
            className="flex items-center gap-1.5 transition-all"
          >
            {importMode === "append" ? (
              <><ToggleLeft className="w-8 h-8 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">Append</span></>
            ) : (
              <><ToggleRight className="w-8 h-8 text-rose-400" /><span className="text-xs font-semibold text-rose-400">Replace</span></>
            )}
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? "border-violet-500/70 bg-violet-500/10 scale-[1.01]"
              : "border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className={`p-2.5 rounded-xl transition-all ${isDragging ? "bg-violet-500/30" : "bg-white/5"}`}>
            <Upload className={`w-5 h-5 transition-colors ${isDragging ? "text-violet-300" : "text-slate-500"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {isProcessing ? "Processing…" : isDragging ? "Drop file here" : "Click or drag & drop"}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              .json · .jsonl · Alpaca or Backup format
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.jsonl"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* ── Alpaca tag assignment ───────────────────────────────────────── */}
      {pendingImport?.type === "alpaca" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Alpaca file detected</p>
              <p className="text-xs text-amber-300/70 mt-0.5">
                {pendingImport.data.length} items · assign a tag:
              </p>
            </div>
            <button onClick={() => setPendingImport(null)} className="text-slate-500 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tag picker */}
          <div className="relative">
            <button
              onClick={() => setTagDropOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm"
            >
              {defaultTag
                ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(defaultTag)}`}>{defaultTag}</span>
                : <span className="text-slate-500">Select tag…</span>
              }
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${tagDropOpen ? "rotate-180" : ""}`} />
            </button>
            {tagDropOpen && (
              <div className="absolute z-30 top-full mt-1 w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
                {tags.length === 0
                  ? <div className="px-3 py-3 text-xs text-slate-400 italic">No tags — add some first.</div>
                  : tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setDefaultTag(tag); setTagDropOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition ${defaultTag === tag ? "bg-violet-500/10" : ""}`}
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}>{tag}</span>
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmAlpacaImport}
            disabled={!defaultTag}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-semibold transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Import {pendingImport.data.length} items
          </button>
        </div>
      )}
    </div>
  );
}
