"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Save, X, ChevronDown } from "lucide-react";
import { DataPoint } from "@/lib/types";
import { getTagColor } from "@/lib/utils";
import { toast } from "sonner";

interface DataEntryFormProps {
  tags: string[];
  onSave: (fields: Omit<DataPoint, "id" | "datasetId" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, fields: Partial<Omit<DataPoint, "id" | "datasetId" | "createdAt">>) => void;
  editItem: DataPoint | null;
  onCancelEdit: () => void;
}

const EMPTY_FORM = { instruction: "", input: "", output: "", tag: "" };

export default function DataEntryForm({
  tags,
  onSave,
  onUpdate,
  editItem,
  onCancelEdit,
}: DataEntryFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagOpen, setTagOpen] = useState(false);
  const [errors, setErrors] = useState<{ instruction?: string; output?: string; tag?: string }>({});

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setForm({
        instruction: editItem.instruction,
        input: editItem.input,
        output: editItem.output,
        tag: editItem.tag,
      });
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editItem]);

  // Set default tag if none selected and tags available
  useEffect(() => {
    if (!form.tag && tags.length > 0) {
      setForm((f) => ({ ...f, tag: tags[0] }));
    }
  }, [tags, form.tag]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.instruction.trim()) newErrors.instruction = "Instruction is required.";
    if (!form.output.trim()) newErrors.output = "Output is required.";
    if (!form.tag) newErrors.tag = "Please select a tag.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    if (editItem) {
      onUpdate(editItem.id, form);
      toast.success("Entry updated successfully!");
      onCancelEdit();
    } else {
      onSave(form);
      toast.success("Entry saved to dataset!");
      setForm((f) => ({ ...f, instruction: "", input: "", output: "" }));
    }
    setErrors({});
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onCancelEdit();
  };

  const isEditing = !!editItem;

  return (
    <div className={`rounded-2xl border backdrop-blur-sm p-5 space-y-4 transition-all duration-300 ${isEditing ? "border-amber-500/40 bg-amber-500/5" : "border-white/10 bg-white/5"}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${isEditing ? "bg-amber-500/20" : "bg-violet-500/20"}`}>
          {isEditing ? (
            <Save className="w-4 h-4 text-amber-400" />
          ) : (
            <PlusCircle className="w-4 h-4 text-violet-400" />
          )}
        </div>
        <h2 className="font-semibold text-white">
          {isEditing ? "Edit Entry" : "Add New Entry"}
        </h2>
        {isEditing && (
          <button
            onClick={handleCancel}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {/* Instruction */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">
          Instruction <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={form.instruction}
          onChange={(e) => { setForm((f) => ({ ...f, instruction: e.target.value })); setErrors((er) => ({ ...er, instruction: undefined })); }}
          placeholder="Write the instruction for the AI model…"
          className={`w-full rounded-xl bg-white/5 border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition ${errors.instruction ? "border-rose-500/60" : "border-white/10"}`}
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
          rows={5}
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
                <div className="px-3 py-3 text-sm text-slate-400 italic">No tags available. Add them in Tag Manager.</div>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, tag })); setTagOpen(false); setErrors((er) => ({ ...er, tag: undefined })); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition text-left ${form.tag === tag ? "bg-violet-500/10" : ""}`}
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                    {form.tag === tag && <span className="ml-auto text-violet-400 text-xs">✓</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {errors.tag && <p className="text-xs text-rose-400">{errors.tag}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
          isEditing
            ? "bg-amber-600 hover:bg-amber-500 text-white"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
        }`}
      >
        {isEditing ? (
          <><Save className="w-4 h-4" /> Update Entry</>
        ) : (
          <><PlusCircle className="w-4 h-4" /> Save Entry</>
        )}
      </button>
    </div>
  );
}
