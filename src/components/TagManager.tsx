"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, X, Tag, AlertCircle } from "lucide-react";
import { getTagColor } from "@/lib/utils";

interface TagManagerProps {
  tags: string[];
  tagStats: Record<string, number>;
  onAddTag: (tag: string) => boolean;
  onRemoveTag: (tag: string) => void;
}

export default function TagManager({ tags, tagStats, onAddTag, onRemoveTag }: TagManagerProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const maxCount = Math.max(...Object.values(tagStats), 1);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) { setError("Tag cannot be empty."); return; }
    const ok = onAddTag(trimmed);
    if (!ok) { setError("Tag already exists."); }
    else { setInput(""); setError(""); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  // Extract a color class for the dot swatch
  const getDotColor = (tag: string): string => {
    const colors = [
      "bg-violet-400", "bg-indigo-400", "bg-cyan-400",
      "bg-emerald-400", "bg-amber-400", "bg-rose-400",
      "bg-pink-400", "bg-teal-400", "bg-blue-400", "bg-orange-400",
    ];
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  };

  const getBarColor = (tag: string): string => {
    const colors = [
      "from-violet-500 to-violet-400",
      "from-indigo-500 to-indigo-400",
      "from-cyan-500 to-cyan-400",
      "from-emerald-500 to-emerald-400",
      "from-amber-500 to-amber-400",
      "from-rose-500 to-rose-400",
      "from-pink-500 to-pink-400",
      "from-teal-500 to-teal-400",
      "from-blue-500 to-blue-400",
      "from-orange-500 to-orange-400",
    ];
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-violet-500/20">
          <Tag className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <span className="text-sm font-semibold text-white">Tag Manager</span>
        <span className="ml-auto text-xs text-slate-500">{tags.length} tags</span>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="New tag… (e.g. হিমু)"
            className={`flex-1 min-w-0 rounded-xl bg-white/5 border px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition ${
              error ? "border-rose-500/60" : "border-white/10"
            }`}
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-rose-400">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
      </div>

      {/* Tag list */}
      {tags.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <div className="text-4xl">🏷️</div>
          <p className="text-sm text-slate-500">No tags yet.</p>
          <p className="text-xs text-slate-600">Add a tag above to get started.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tags.map((tag) => {
            const count = tagStats[tag] ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div
                key={tag}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-white/8 hover:bg-white/[0.03] transition-all"
              >
                {/* Color dot */}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDotColor(tag)}`} />

                {/* Tag name + bar */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{tag}</span>
                    <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">{count}</span>
                  </div>
                  {/* Mini bar */}
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getBarColor(tag)} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Remove tag"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hint */}
      {tags.length > 0 && (
        <p className="text-[10px] text-slate-600 text-center">
          Hover a tag to reveal the delete button
        </p>
      )}
    </div>
  );
}
