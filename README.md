<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
<img src="https://img.shields.io/badge/Dexie.js-IndexedDB-F4A261?style=for-the-badge" alt="Dexie.js" />
<img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
<img src="https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare Pages" />

<br /><br />

# 🤖 FTdata — AI Fine-Tuning Dataset Curator

**A beautiful, fully client-side web app for creating and managing Alpaca-format datasets for LLM fine-tuning.**  
No server. No account. No tracking. Your data stays on your device.

[**Live Demo →**](https://ftdataset.pages.dev/) &nbsp;·&nbsp; [Report Bug](../../issues) &nbsp;·&nbsp; [Request Feature](../../issues)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📂 **Multi-Dataset** | Create and manage multiple datasets. Switch between them from a home dashboard |
| ⭐ **Quality Ratings** | Rate each entry 1–5 stars and filter/export by minimum rating |
| ☑️ **Bulk Operations** | Select multiple rows → bulk delete, retag, or export in one click |
| ⌨️ **Keyboard Shortcuts** | `N` new entry, `Ctrl+A` select all, `?` shortcuts help, and more |
| 🔍 **Advanced Filtering** | Filter by tag, rating, date range, and scoped text search |
| 📊 **Export Visible** | Export only the currently filtered entries — not the whole dataset |
| 🗂️ **Alpaca Format** | Export/import in Alpaca JSON, JSONL, or full backup format |
| 🏷️ **Tag Manager** | Color-coded tags with per-tag entry counts and easy management |
| 📈 **Live Statistics** | Dataset stats: entries today, this week, tag distribution |
| 🌐 **Bengali Support** | Full Unicode support with Hind Siliguri font for Bangla text |
| 💾 **IndexedDB Storage** | Powered by Dexie.js — handles large datasets efficiently |
| 🔒 **100% Client-Side** | No server, no backend, no data ever leaves your browser |

---

## 🖥️ Screenshots

> _(Add screenshots of the home dashboard and workspace view here)_

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ftdata.git
cd ftdata/ftdata-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static output is in the `out/` directory. Deploy it anywhere that serves static files.

---

## 📦 Deployment

### Cloudflare Pages *(Recommended)*

1. Push your repository to GitHub
2. Log in to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create a new project → Connect to GitHub → Select your repo
4. Set the build configuration:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. Click **Save and Deploy**

### GitHub Pages

1. In `next.config.ts`, confirm `output: 'export'` is set
2. Add a GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: ftdata-app
      - run: npm run build
        working-directory: ftdata-app
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ftdata-app/out
```

---

## 📋 Data Format

FTdata uses the **Alpaca instruction-tuning format**:

```json
[
  {
    "instruction": "Translate the following sentence to Bengali.",
    "input": "The weather is nice today.",
    "output": "আজ আবহাওয়া সুন্দর।"
  }
]
```

| Field | Required | Description |
|---|---|---|
| `instruction` | ✅ | The task description / prompt |
| `input` | ❌ | Additional context (empty string if not needed) |
| `output` | ✅ | The expected model response |

### Export Formats

| Format | Use Case |
|---|---|
| **Alpaca JSON** | Standard fine-tuning — clean `[{instruction, input, output}]` |
| **Alpaca JSONL** | Line-by-line format for tools like Axolotl, LLaMA-Factory |
| **Full Backup** | Includes tags, ratings, timestamps — for restoring the app |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | New entry |
| `?` | Show / hide shortcuts overlay |
| `Escape` | Close modal / clear row selection |
| `Ctrl + F` | Focus search bar |
| `Ctrl + A` | Select all visible rows |

> Shortcuts are disabled when focus is inside a text input or textarea.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with static export |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Dexie.js](https://dexie.org/) | IndexedDB wrapper for client-side storage |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |
| [Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri) | Bengali script support |
| Vanilla CSS + Tailwind | Styling |

---

## 🤝 Contributing

Contributions are welcome! Please read through the following before opening a pull request.

### Development Setup

```bash
git clone https://github.com/your-username/ftdata.git
cd ftdata/ftdata-app
npm install
npm run dev
```

### Guidelines

- **Code style**: TypeScript strict mode. Run `npm run lint` before pushing.
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- **New features**: Open an issue first to discuss the feature before building it.
- **Tests**: Currently no test suite — contributions adding tests are very welcome.

### Roadmap / Ideas

- [ ] Entry duplicate detection
- [ ] Chat-bubble preview mode (renders entries as conversation UI)
- [ ] Token/character counter with configurable limits
- [ ] Dataset merge (combine entries from multiple datasets)
- [ ] Hugging Face dataset export format
- [ ] Offline PWA support

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose, including commercial use.

---

## 🙏 Acknowledgements

- [Alpaca](https://github.com/tatsu-lab/stanford_alpaca) by Stanford — for the instruction-tuning format
- [Dexie.js](https://dexie.org/) — for making IndexedDB actually pleasant to work with
- [Lucide](https://lucide.dev/) — beautiful open-source icons

---

<div align="center">
  <sub>Built with ❤️ for the open-source AI community</sub>
</div>
