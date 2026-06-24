import type { Metadata, Viewport } from "next";
import { Tinos, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// ── English font: Tinos (Google Fonts · Times New Roman–compatible serif) ──
const tinos = Tinos({
  subsets: ["latin"],
  variable: "--font-tinos",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// ── Bangla font: Hind Siliguri (clean, highly legible Bengali script) ──
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  variable: "--font-hind",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FTdata — AI Fine-Tuning Dataset Curator",
  description:
    "একটি প্রফেশনাল AI ডেটাসেট কিউরেশন টুল। Alpaca ফরম্যাটে ডেটাসেট তৈরি, সম্পাদনা, রপ্তানি ও আমদানি করুন। বাংলা ট্যাগ সহ সম্পূর্ণ LocalStorage সাপোর্ট সহ।",
  keywords: [
    "AI dataset",
    "fine-tuning",
    "Alpaca format",
    "Bengali NLP",
    "বাংলা AI",
    "dataset curator",
    "JSONL export",
    "machine learning",
    "LLM training data",
  ],
  authors: [{ name: "FTdata" }],
  openGraph: {
    title: "FTdata — AI Fine-Tuning Dataset Curator",
    description:
      "Curate, manage, and export AI fine-tuning datasets in Alpaca format. Supports Bengali tags and runs entirely in your browser — no server required.",
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "FTdata — AI Fine-Tuning Dataset Curator",
    description:
      "Curate and export AI training datasets in Alpaca/JSONL format. Works offline with LocalStorage. Bengali-first design.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗂️</text></svg>"
        />
      </head>
      <body
        className={`${tinos.variable} ${hindSiliguri.variable} antialiased bg-[#080c14] text-white min-h-screen`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f1f5f9",
              backdropFilter: "blur(12px)",
              fontFamily: "var(--font-tinos), var(--font-hind), serif",
            },
          }}
        />
      </body>
    </html>
  );
}
