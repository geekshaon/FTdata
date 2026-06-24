"use client";

import { useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";

interface Shortcut { keys: string[]; description: string }

const SHORTCUTS: Shortcut[] = [
  { keys: ["N"],         description: "New entry" },
  { keys: ["?"],         description: "Show / hide shortcuts" },
  { keys: ["Escape"],    description: "Close any modal / clear selection" },
  { keys: ["Ctrl", "F"], description: "Focus search bar" },
  { keys: ["Ctrl", "A"], description: "Select all visible rows" },
];

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/8 border border-white/15 text-slate-300 shadow-inner">
      {children}
    </kbd>
  );
}

export default function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "?") onClose(); },
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

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1220]/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 fade-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <Keyboard className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-white flex-1">Keyboard Shortcuts</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shortcuts list */}
          <div className="px-5 py-4 space-y-1">
            {SHORTCUTS.map(({ keys, description }) => (
              <div key={description} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-sm text-slate-300">{description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, i) => (
                    <span key={k} className="flex items-center gap-1">
                      {i > 0 && <span className="text-slate-600 text-xs">+</span>}
                      <Kbd>{k}</Kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-white/[0.02] border-t border-white/8">
            <p className="text-[10px] text-slate-600 text-center">Shortcuts disabled while typing in text fields</p>
          </div>
        </div>
      </div>
    </>
  );
}
