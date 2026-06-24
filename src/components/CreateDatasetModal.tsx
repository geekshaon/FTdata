"use client";

import { useState, useEffect, useCallback } from "react";
import { X, FolderPlus, Save } from "lucide-react";
import { Dataset } from "@/lib/types";
import { DATASET_COLORS, DatasetColor } from "@/lib/db";
import { toast } from "sonner";

const COLOR_MAP: Record<DatasetColor, { bg: string; ring: string; label: string }> = {
  violet:  { bg: "bg-violet-500",  ring: "ring-violet-400",  label: "Violet"  },
  indigo:  { bg: "bg-indigo-500",  ring: "ring-indigo-400",  label: "Indigo"  },
  cyan:    { bg: "bg-cyan-500",    ring: "ring-cyan-400",    label: "Cyan"    },
  emerald: { bg: "bg-emerald-500", ring: "ring-emerald-400", label: "Emerald" },
  amber:   { bg: "bg-amber-500",   ring: "ring-amber-400",   label: "Amber"   },
  rose:    { bg: "bg-rose-500",    ring: "ring-rose-400",    label: "Rose"    },
};

interface CreateDatasetModalProps {
  open: boolean;
  editDataset?: Dataset | null;   // if provided → rename mode
  onSave: (name: string, description: string, color: string) => void;
  onClose: () => void;
}

export default function CreateDatasetModal({
  open, editDataset, onSave, onClose,
}: CreateDatasetModalProps) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [color, setColor]         = useState<DatasetColor>("violet");
  const [nameError, setNameError] = useState("");

  const isEditing = !!editDataset;

  useEffect(() => {
    if (open) {
      setName(editDataset?.name ?? "");
      setDesc(editDataset?.description ?? "");
      setColor((editDataset?.color as DatasetColor) ?? "violet");
      setNameError("");
    }
  }, [open, editDataset]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) { setNameError("Dataset name is required."); return; }
    onSave(name, description, color);
    toast.success(isEditing ? "Dataset updated!" : `Dataset "${name}" created!`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md flex flex-col rounded-2xl border border-white/10 bg-[#0d1220]/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-in zoom-in-95 fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
            <div className={`p-2 rounded-xl ${isEditing ? "bg-amber-500/20" : "bg-violet-500/20"}`}>
              {isEditing
                ? <Save className="w-4 h-4 text-amber-400" />
                : <FolderPlus className="w-4 h-4 text-violet-400" />}
            </div>
            <h2 className="font-semibold text-white flex-1">
              {isEditing ? "Edit Dataset" : "New Dataset"}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Bengali Dialogue Dataset"
                autoFocus
                className={`w-full rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition ${nameError ? "border-rose-500/60" : "border-white/10"}`}
              />
              {nameError && <p className="text-xs text-rose-400">{nameError}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Description <span className="text-slate-600">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What is this dataset for?"
                rows={2}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-none"
              />
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Color</label>
              <div className="flex gap-2">
                {DATASET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    title={COLOR_MAP[c].label}
                    className={`w-7 h-7 rounded-full ${COLOR_MAP[c].bg} transition-all ${
                      color === c ? `ring-2 ring-offset-2 ring-offset-[#0d1220] ${COLOR_MAP[c].ring} scale-110` : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-white/8 bg-white/[0.02]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] ${
                isEditing
                  ? "bg-amber-600 hover:bg-amber-500"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20"
              }`}
            >
              {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><FolderPlus className="w-4 h-4" /> Create Dataset</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
