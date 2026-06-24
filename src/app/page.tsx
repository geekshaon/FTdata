"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database, ExternalLink, Plus, Settings2, ArrowLeft, Sparkles,
} from "lucide-react";
import { useDatasets } from "@/hooks/useDatasets";
import { useDataset } from "@/hooks/useDataset";
import { DataPoint, Dataset } from "@/lib/types";
import { db } from "@/lib/db";
import HomeView from "@/components/HomeView";
import TagManager from "@/components/TagManager";
import QuickStats from "@/components/QuickStats";
import DataTable from "@/components/DataTable";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ImportExport from "@/components/ImportExport";
import ViewDataModal from "@/components/ViewDataModal";
import AddEditModal from "@/components/AddEditModal";
import FilterPanel, { FilterState, DEFAULT_FILTERS } from "@/components/FilterPanel";
import SidePanel from "@/components/SidePanel";
import BulkActionBar from "@/components/BulkActionBar";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// ── Hash routing helpers ──────────────────────────────────────────────────────
function readHash(): { view: "home" | "workspace"; datasetId: string | null } {
  if (typeof window === "undefined") return { view: "home", datasetId: null };
  const hash = window.location.hash;
  if (hash.startsWith("#ds/")) return { view: "workspace", datasetId: hash.slice(4) };
  return { view: "home", datasetId: null };
}

function pushHash(view: "home" | "workspace", datasetId?: string) {
  if (view === "workspace" && datasetId) {
    window.location.hash = `#ds/${datasetId}`;
  } else {
    window.location.hash = "#home";
  }
}

// ── Workspace sub-view ────────────────────────────────────────────────────────
function WorkspaceView({
  activeDataset,
  onGoHome,
  onRefreshCounts,
}: {
  activeDataset: Dataset;
  onGoHome: () => void;
  onRefreshCounts: () => void;
}) {
  const {
    data, tags, isHydrated,
    addItem, updateItem, removeItem, importItems,
    addTag, removeTag,
    tagStats, totalCount,
  } = useDataset(activeDataset.id);

  const [editItem, setEditItem]             = useState<DataPoint | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<DataPoint | null>(null);
  const [viewItem, setViewItem]             = useState<DataPoint | null>(null);
  const [addEditOpen, setAddEditOpen]       = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [shortcutsOpen, setShortcutsOpen]   = useState(false);
  const [query, setQuery]                   = useState("");
  const [filters, setFilters]               = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set());
  const [filteredData, setFilteredData]     = useState<DataPoint[]>([]);

  // Clear selection when data changes
  useEffect(() => { setSelectedIds(new Set()); }, [activeDataset.id]);

  // Refresh home counts when leaving workspace
  useEffect(() => {
    return () => { onRefreshCounts(); };
  }, [onRefreshCounts]);

  useEffect(() => {
    const handle = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Handlers
  const openAddModal  = useCallback(() => { setEditItem(null); setAddEditOpen(true); }, []);
  const openEditModal = useCallback((item: DataPoint) => { setEditItem(item); setAddEditOpen(true); }, []);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    ids.forEach((id) => removeItem(id));
    clearSelection();
  }, [removeItem, clearSelection]);

  const handleBulkRetag = useCallback((ids: string[], tag: string) => {
    ids.forEach((id) => updateItem(id, { tag }));
    clearSelection();
  }, [updateItem, clearSelection]);

  const handleRatingChange = useCallback((id: string, rating: number) => {
    updateItem(id, { rating: rating || undefined });
  }, [updateItem]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: "n",   description: "New entry",             action: openAddModal },
    { key: "?",   description: "Keyboard shortcuts",    action: () => setShortcutsOpen((o) => !o) },
    { key: "f",   ctrl: true, description: "Focus search",         action: () => { /* handled by DataTable */ } },
    { key: "a",   ctrl: true, description: "Select all",           action: () => setSelectedIds(new Set(filteredData.map((d) => d.id))) },
    { key: "Escape", description: "Clear selection",   action: clearSelection },
  ], isHydrated);



  const handleDeleteConfirm = () => {
    if (deleteTarget) { removeItem(deleteTarget.id); setDeleteTarget(null); }
  };

  // Loading skeleton
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center animate-pulse">
              <Database className="w-6 h-6 text-violet-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 animate-ping" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Loading {activeDataset.name}…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <AddEditModal
        open={addEditOpen}
        tags={tags}
        editItem={editItem}
        onSave={addItem}
        onUpdate={updateItem}
        onClose={() => { setAddEditOpen(false); setEditItem(null); }}
      />
      <ViewDataModal
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={(item) => { setViewItem(null); openEditModal(item); }}
        onDelete={(item) => { setViewItem(null); setDeleteTarget(item); }}
      />
      <DeleteConfirmDialog
        item={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#080c14]/80 backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-medium hidden sm:inline">Datasets</span>
            </button>

            <span className="text-slate-700">/</span>

            {/* Dataset name */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full bg-${activeDataset.color}-400 shrink-0`} />
              <span className="text-sm font-semibold text-white truncate max-w-[200px]">{activeDataset.name}</span>
            </div>

            {/* Center badge */}
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">
                {totalCount} entries · {tags.length} tags
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Add Entry */}
              <button
                onClick={openAddModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Entry
              </button>

              {/* Tools sidebar toggle */}
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label="Toggle tools panel"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6">
            {/* Right tools panel */}
            <aside
              className={`
                fixed lg:relative top-0 right-0 inset-y-0 z-40 lg:z-auto
                w-80 xl:w-[340px] shrink-0
                ${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0
                transition-transform duration-300 ease-in-out lg:transition-none
                bg-[#080c14] lg:bg-transparent
                pt-14 lg:pt-0 px-4 lg:px-0 pb-6 lg:pb-0
                lg:sticky lg:top-[72px] lg:h-[calc(100vh-80px)]
              `}
            >
              <SidePanel
                totalCount={totalCount}
                tagCount={tags.length}
                datasetName={activeDataset.name}
                datasetColor={activeDataset.color}
              >
                {{
                  tags: (
                    <TagManager
                      tags={tags}
                      tagStats={tagStats}
                      onAddTag={addTag}
                      onRemoveTag={removeTag}
                    />
                  ),
                  stats: (
                    <QuickStats
                      totalCount={totalCount}
                      tagStats={tagStats}
                      tags={tags}
                      data={data}
                    />
                  ),
                  data: (
                    <ImportExport
                      data={data}
                      tags={tags}
                      onImport={importItems}
                    />
                  ),
                }}
              </SidePanel>
            </aside>

            {/* Main table panel */}
            <section className="flex-1 min-w-0 space-y-4">
              {totalCount === 0 && (
                <div className="gradient-card p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 mx-auto">
                    <span className="text-4xl">🤖</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{activeDataset.name}</h1>
                    <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                      {activeDataset.description || "Add tags in the tools panel, then click + Add Entry to create your first entry."}
                    </p>
                  </div>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add First Entry
                  </button>
                </div>
              )}

              {totalCount > 0 && (
                <FilterPanel
                  allTags={tags}
                  filters={filters}
                  onChange={setFilters}
                  resultCount={filteredData.length}
                  totalCount={totalCount}
                  filteredData={filteredData}
                  tags={tags}
                />
              )}

              <DataTable
                data={data}
                query={query}
                onQueryChange={setQuery}
                filters={filters}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
                onView={setViewItem}
                onRatingChange={handleRatingChange}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onFilteredData={setFilteredData}
              />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <span>FTdata · {activeDataset.name} · All data stored locally (IndexedDB)</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Client-side only · No server · No tracking
            </span>
          </div>
        </footer>
      </div>

      {/* FAB — mobile */}
      <button
        onClick={openAddModal}
        className="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/40 flex items-center justify-center transition-all active:scale-95"
        aria-label="Add entry"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        allData={data}
        tags={tags}
        onBulkDelete={handleBulkDelete}
        onBulkRetag={handleBulkRetag}
        onClearSelection={clearSelection}
      />
    </>
  );
}

// ── Root page — view router ───────────────────────────────────────────────────
export default function RootPage() {
  const {
    datasets, entryCounts, totalEntries, isHydrated,
    createDataset, updateDataset, deleteDataset, refreshCounts,
  } = useDatasets();

  const [view, setView]                 = useState<"home" | "workspace">("home");
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  // Tag counts per dataset (load lazily from settings)
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    async function loadTagCounts() {
      const counts: Record<string, number> = {};
      for (const ds of datasets) {
        const row = await db.settings.get(`tags_${ds.id}`);
        counts[ds.id] = Array.isArray(row?.value) ? (row!.value as string[]).length : 0;
      }
      setTagCounts(counts);
    }
    if (datasets.length > 0) loadTagCounts();
  }, [datasets]);

  // Sync with URL hash on mount
  useEffect(() => {
    const { view: v, datasetId } = readHash();
    if (v === "workspace" && datasetId) {
      setActiveDatasetId(datasetId);
      setView("workspace");
    }

    const handleHashChange = () => {
      const { view: nv, datasetId: nid } = readHash();
      setView(nv);
      setActiveDatasetId(nid);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const openDataset = useCallback((id: string) => {
    pushHash("workspace", id);
    setActiveDatasetId(id);
    setView("workspace");
  }, []);

  const goHome = useCallback(() => {
    pushHash("home");
    setView("home");
    setActiveDatasetId(null);
    refreshCounts();
  }, [refreshCounts]);

  // Global loading screen
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center animate-pulse">
              <Database className="w-6 h-6 text-violet-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 animate-ping" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Loading FTdata…</p>
        </div>
      </div>
    );
  }

  // Workspace view
  if (view === "workspace" && activeDatasetId) {
    const activeDataset = datasets.find((d) => d.id === activeDatasetId);
    if (!activeDataset) {
      // Dataset deleted or invalid hash — redirect home
      goHome();
      return null;
    }
    return (
      <WorkspaceView
        activeDataset={activeDataset}
        onGoHome={goHome}
        onRefreshCounts={refreshCounts}
      />
    );
  }

  // Home view
  return (
    <HomeView
      datasets={datasets}
      entryCounts={entryCounts}
      tagCounts={tagCounts}
      totalEntries={totalEntries}
      onOpenDataset={openDataset}
      onCreateDataset={createDataset}
      onUpdateDataset={updateDataset}
      onDeleteDataset={deleteDataset}
    />
  );
}
