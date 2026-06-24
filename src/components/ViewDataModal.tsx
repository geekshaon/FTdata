"use client";

import { useEffect, useCallback } from "react";
import { X, Tag, Calendar, FileText, MessageSquare, Inbox, Edit2, Trash2, Copy, Check } from "lucide-react";
import { DataPoint } from "@/lib/types";
import { getTagColor, formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface ViewDataModalProps {
  item: DataPoint | null;
  onClose: () => void;
  onEdit: (item: DataPoint) => void;
  onDelete: (item: DataPoint) => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function FieldBlock({
  icon: Icon,
  label,
  value,
  accent = "violet",
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "violet" | "cyan" | "emerald" | "amber";
  mono?: boolean;
}) {
  const accentMap = {
    violet: "bg-violet-500/20 text-violet-400",
    cyan:   "bg-cyan-500/20 text-cyan-400",
    emerald:"bg-emerald-500/20 text-emerald-400",
    amber:  "bg-amber-500/20 text-amber-400",
  };

  if (!value) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${accentMap[accent]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <CopyButton text={value} label={label} />
      </div>
      <div className="rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3">
        <p
          className={`text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ViewDataModal({ item, onClose, onEdit, onDelete }: ViewDataModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!item) return;
    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, handleKeyDown]);

  if (!item) return null;

  const handleEdit = () => {
    onEdit(item);
    onClose();
  };

  const handleDelete = () => {
    onDelete(item);
    onClose();
  };

  const copyAll = async () => {
    const text = [
      `### Instruction\n${item.instruction}`,
      item.input ? `\n### Input\n${item.input}` : "",
      `\n### Output\n${item.output}`,
    ].join("");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Full entry copied!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="
            pointer-events-auto
            w-full max-w-2xl max-h-[90vh]
            flex flex-col
            rounded-2xl border border-white/10
            bg-[#0d1220]/95 backdrop-blur-xl
            shadow-2xl shadow-black/60
            animate-in zoom-in-95 fade-in
          "
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Dataset Entry</p>
              <p className="text-sm text-white font-semibold truncate mt-0.5">
                {item.instruction.slice(0, 60)}{item.instruction.length > 60 ? "…" : ""}
              </p>
            </div>

            {/* Tag badge */}
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getTagColor(item.tag)}`}>
              {item.tag || "—"}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Meta row ────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/5 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Tag className="w-3 h-3" />
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getTagColor(item.tag)}`}>
                {item.tag || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>Created: {formatDate(item.createdAt)}</span>
            </div>
            {item.updatedAt !== item.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Updated: {formatDate(item.updatedAt)}</span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-600 font-mono bg-white/5 px-2 py-1 rounded-lg">
              ID: {item.id}
            </div>
          </div>

          {/* ── Scrollable body ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
            <FieldBlock
              icon={MessageSquare}
              label="Instruction"
              value={item.instruction}
              accent="violet"
            />

            {item.input && (
              <FieldBlock
                icon={Inbox}
                label="Input"
                value={item.input}
                accent="cyan"
              />
            )}

            <FieldBlock
              icon={FileText}
              label="Output"
              value={item.output}
              accent="emerald"
            />
          </div>

          {/* ── Footer actions ───────────────────────────────────────────── */}
          <div className="flex items-center gap-2 px-5 py-4 border-t border-white/8 shrink-0 bg-white/[0.02]">
            {/* Copy all */}
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy all
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* Edit */}
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
