"use client";

import { useMemo } from "react";
import { Database, Tag, Flame, CalendarDays, BarChart2 } from "lucide-react";
import { getTagColor } from "@/lib/utils";
import { DataPoint } from "@/lib/types";

interface QuickStatsProps {
  totalCount: number;
  tagStats: Record<string, number>;
  tags: string[];
  data: DataPoint[];
}

function StatCard({
  icon: Icon, label, value, accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: "violet" | "indigo" | "emerald" | "amber";
}) {
  const map = {
    violet:  { bg: "bg-violet-500/15",  border: "border-violet-500/20",  icon: "text-violet-400",  val: "text-violet-300" },
    indigo:  { bg: "bg-indigo-500/15",  border: "border-indigo-500/20",  icon: "text-indigo-400",  val: "text-indigo-300" },
    emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/20", icon: "text-emerald-400", val: "text-emerald-300" },
    amber:   { bg: "bg-amber-500/15",   border: "border-amber-500/20",   icon: "text-amber-400",   val: "text-amber-300" },
  }[accent];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${map.bg} ${map.border}`}>
      <div className={`p-2 rounded-lg ${map.bg}`}>
        <Icon className={`w-4 h-4 ${map.icon}`} />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-xl font-bold tabular-nums ${map.val}`}>{value}</p>
      </div>
    </div>
  );
}

export default function QuickStats({ totalCount, tagStats, tags, data }: QuickStatsProps) {
  const total = totalCount;
  const totalTagCount = tags.length;

  const topTag = useMemo(() => {
    if (tags.length === 0) return null;
    return tags.reduce((a, b) => (tagStats[a] ?? 0) >= (tagStats[b] ?? 0) ? a : b);
  }, [tags, tagStats]);

  // Today's entries
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.filter((d) => d.createdAt >= today.getTime()).length;
  }, [data]);

  // This week
  const weekCount = useMemo(() => {
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return data.filter((d) => d.createdAt >= week).length;
  }, [data]);

  if (total === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white">Statistics</span>
        </div>
        <div className="text-center py-10 space-y-2">
          <div className="text-4xl">📊</div>
          <p className="text-sm text-slate-500">No data yet.</p>
          <p className="text-xs text-slate-600">Stats will appear as you add entries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/20">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-white">Statistics</span>
      </div>

      {/* Stat cards — 2 column grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Database} label="Entries"  value={total}         accent="violet" />
        <StatCard icon={Tag}      label="Tags"     value={totalTagCount} accent="indigo" />
        <StatCard icon={CalendarDays} label="Today" value={todayCount}  accent="emerald" />
        <StatCard icon={CalendarDays} label="This week" value={weekCount} accent="amber" />
      </div>

      {/* Top tag callout */}
      {topTag && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03]">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Most Active Tag</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(topTag)}`}>
                {topTag}
              </span>
              <span className="text-xs text-slate-400">{tagStats[topTag] ?? 0} entries</span>
            </div>
          </div>
        </div>
      )}

      {/* Tag distribution */}
      {tags.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tag Distribution</p>
          <div className="space-y-2.5">
            {tags
              .slice()
              .sort((a, b) => (tagStats[b] ?? 0) - (tagStats[a] ?? 0))
              .map((tag) => {
                const count = tagStats[tag] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={tag} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getTagColor(tag)}`}>
                        {tag}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-white tabular-nums">{count}</span>
                        <span className="text-[10px] text-slate-600 tabular-nums w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
