"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Save, X, ChevronDown } from "lucide-react";
import { DataPoint } from "@/lib/types";
import { getTagColor } from "@/lib/utils";
import { toast } from "sonner";
import StarRating from "./StarRating";

interface AddEditModalProps {
  open: boolean;
  tags: string[];
  editItem: DataPoint | null;
  onSave: (fields: Omit<DataPoint, "id" | "datasetId" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, fields: Partial<Omit<DataPoint, "id" | "datasetId" | "createdAt">>) => void;
  onClose: () => void;
}

const EMPTY_FORM = { instruction: "", input: "", output: "", tag: "", rating: 0 };

export default function AddEditModal({
  open, tags, editItem, onSave, onUpdate, onClose,
}: AddEditModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagOpen, setTagOpen] = useState(false);
  const [errors, setErrors] = useState<{ instruction?: string; output?: string; tag?: string }>({});

  const isEditing = !!editItem;

  // Sync form with editItem
  useEffect(() => {
    if (editItem) {
      setForm({
        instruction: editItem.instruction,
        input:       editItem.input,
        output:      editItem.output,
        tag:         editItem.tag,
        rating:      editItem.rating ?? 0,
      });
    } else {
      setForm((f) => ({ ...EMPTY_FORM, tag: tags[0] ?? "", rating: f.rating }));
    }
    setErrors({});
    setTagOpen(false);
  }, [editItem, open, tags]);

  // Default tag
  useEffect(() => {
    if (!form.tag && tags.length > 0) {
      setForm((f) => ({ ...f, tag: tags[0] }));
    }
  }, [tags, form.tag]);

  // Escape key
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

  const validate = () => {
    const e: typeof errors = {};
    if (!form.instruction.trim()) e.instruction = "Instruction is required.";
    if (!form.output.trim()) e.output = "Output is required.";
    if (!form.tag) e.tag = "Please select a tag.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) { toast.error("Please fix the errors before saving."); return; }
    if (isEditing) {
      onUpdate(editItem!.id, form);
      toast.success("Entry updated successfully!");
    } else {
      onSave(form);
      toast.success("Entry saved to dataset!");
      setForm((f) => ({ ...f, instruction: "", input: "", output: "" }));
    }
    setErrors({});
    if (isEditing) onClose();
  };

  const accent = isEditing ? "amber" : "violet";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d1220]/95 backdrop-blur-xl shadow-2xl shadow-black/60 animate-in zoom-in-95 fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
            <div className={`p-2 rounded-xl ${isEditing ? "bg-amber-500/20" : "bg-violet-500/20"}`}>
              {isEditing
                ? <Save className="w-4 h-4 text-amber-400" />
                : <PlusCircle className="w-4 h-4 text-violet-400" />}
            </div>
            <h2 className="font-semibold text-white flex-1">
              {isEditing ? "Edit Entry" : "Add New Entry"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">
            {/* Instruction */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Instruction <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={form.instruction}
                onChange={(e) => { setForm((f) => ({ ...f, instruction: e.target.value })); setErrors((er) => ({ ...er, instruction: undefined })); }}
                placeholder="Write the instruction for the AI model…"
                rows={3}
                className={`w-full rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-none ${errors.instruction ? "border-rose-500/60" : "border-white/10"}`}
              />
              {errors.instruction && <p className="text-xs text-rose-400">{errors.instruction}</p>}
            </div>

            {/* Input (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Input <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                value={form.input}
                onChange={(e) => setForm((f) => ({ ...f, input: e.target.value }))}
                placeholder="Optional context or input data for the model…"
                rows={2}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-none"
              />
            </div>

            {/* Output */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Output <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={form.output}
                onChange={(e) => { setForm((f) => ({ ...f, output: e.target.value })); setErrors((er) => ({ ...er, output: undefined })); }}
                placeholder="The expected model output / response…"
                rows={6}
                className={`w-full rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition resize-y ${errors.output ? "border-rose-500/60" : "border-white/10"}`}
              />
              {errors.output && <p className="text-xs text-rose-400">{errors.output}</p>}
            </div>

            {/* Tag selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Tag <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTagOpen((o) => !o)}
                  className={`w-full flex items-center justify-between rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition ${errors.tag ? "border-rose-500/60" : "border-white/10"}`}
                >
                  {form.tag ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(form.tag)}`}>
                      {form.tag}
                    </span>
                  ) : (
                    <span className="text-slate-500">Select a tag…</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${tagOpen ? "rotate-180" : ""}`} />
                </button>

                {tagOpen && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
                    {tags.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-400 italic">No tags yet. Add them in Tag Manager.</div>
                    ) : tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => { setForm((f) => ({ ...f, tag })); setTagOpen(false); setErrors((er) => ({ ...er, tag: undefined })); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition text-left ${form.tag === tag ? "bg-violet-500/10" : ""}`}
                      >
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}>{tag}</span>
                        {form.tag === tag && <span className="ml-auto text-violet-400 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.tag && <p className="text-xs text-rose-400">{errors.tag}</p>}
            </div>

            {/* Quality rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                Quality Rating <span className="text-slate-600">(optional)</span>
              </label>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/8">
                <StarRating
                  value={form.rating ?? 0}
                  onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
                  size="md"
                />
                <span className="text-xs text-slate-500">
                  {form.rating ? `${form.rating} star${form.rating > 1 ? "s" : ""}` : "Unrated"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-white/8 shrink-0 bg-white/[0.02]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                isEditing
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
              }`}
            >
              {isEditing ? <><Save className="w-4 h-4" /> Update Entry</> : <><PlusCircle className="w-4 h-4" /> Save Entry</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
