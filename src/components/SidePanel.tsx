"use client";

import { useState } from "react";
import { Tag, BarChart2, PackageOpen, Database, Sparkles } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  accent: string;
}

const TABS: Tab[] = [
  { id: "tags",  label: "Tags",   icon: Tag,         accent: "violet" },
  { id: "stats", label: "Stats",  icon: BarChart2,   accent: "indigo" },
  { id: "data",  label: "Data",   icon: PackageOpen, accent: "emerald" },
];

const accentRing: Record<string, string> = {
  violet: "border-violet-500/60 text-violet-300 bg-violet-500/10",
  indigo: "border-indigo-500/60 text-indigo-300 bg-indigo-500/10",
  emerald:"border-emerald-500/60 text-emerald-300 bg-emerald-500/10",
};
const accentIcon: Record<string, string> = {
  violet: "text-violet-400",
  indigo: "text-indigo-400",
  emerald:"text-emerald-400",
};

interface SidePanelProps {
  totalCount: number;
  tagCount: number;
  datasetName: string;
  datasetColor: string;
  children: {
    tags: React.ReactNode;
    stats: React.ReactNode;
    data: React.ReactNode;
  };
}

export default function SidePanel({ totalCount, tagCount, datasetName, datasetColor, children }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState("tags");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#0b1120]/80 backdrop-blur-sm overflow-hidden">

      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-white/8 shrink-0">
        {/* Dataset name */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className={`w-2 h-2 rounded-full bg-${datasetColor}-400 shrink-0`} />
          <p className="text-xs font-semibold text-white truncate flex-1">{datasetName}</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <Database className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-slate-300">Tools</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[11px] text-slate-500">
              <span className="text-white font-medium">{totalCount}</span> entries ·{" "}
              <span className="text-white font-medium">{tagCount}</span> tags
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? `${accentRing[tab.accent]} border shadow-sm`
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? accentIcon[tab.accent] : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content (scrollable) ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {activeTab === "tags"  && children.tags}
          {activeTab === "stats" && children.stats}
          {activeTab === "data"  && children.data}
        </div>
      </div>
    </div>
  );
}
