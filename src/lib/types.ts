// Core data types for the AI Dataset Curation app

export interface Dataset {
  id: string;
  name: string;
  description: string;
  color: string;       // one of: violet | indigo | cyan | emerald | amber | rose
  createdAt: number;
  updatedAt: number;
}

export interface DataPoint {
  id: string;
  datasetId: string;
  instruction: string;
  input: string;
  output: string;
  tag: string;
  rating?: number;    // 1–5 stars; undefined = unrated
  createdAt: number;
  updatedAt: number;
}

export interface AlpacaItem {
  instruction: string;
  input: string;
  output: string;
}

export interface ExportOptions {
  mode: 'alpaca' | 'backup';
  format: 'json' | 'jsonl';
}

export type ImportMode = 'append' | 'replace';
