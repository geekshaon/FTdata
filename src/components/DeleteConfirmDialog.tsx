"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { DataPoint } from "@/lib/types";

interface DeleteConfirmDialogProps {
  item: DataPoint | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ item, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">Delete Entry?</h3>
          <p className="text-sm text-slate-400">
            This will permanently remove this entry from your dataset. This action cannot be undone.
          </p>
          {/* Preview */}
          <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-left">
            <p className="text-xs text-slate-500 mb-1">Instruction preview:</p>
            <p className="text-xs text-slate-300 line-clamp-2">
              {item.instruction || "(no instruction)"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
