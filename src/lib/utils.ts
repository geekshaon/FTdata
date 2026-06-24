import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, maxLength: number = 80): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getTagColor(tag: string): string {
  const colors = [
    "bg-violet-500/20 text-violet-300 border-violet-500/30",
    "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "bg-rose-500/20 text-rose-300 border-rose-500/30",
    "bg-pink-500/20 text-pink-300 border-pink-500/30",
    "bg-teal-500/20 text-teal-300 border-teal-500/30",
    "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
