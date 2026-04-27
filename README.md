<div align="center">

<img src="./app/src-tauri/icons/128x128@2x.png" width="96" alt="PromptForge icon" />

# PromptForge

**Turn vague ideas into high-quality AI prompts — in seconds.**

A lightweight desktop app (macOS / Windows) powered by a **Meta Prompt Engine** built on 18+ prompt engineering techniques.

<br/>

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## How it works

```
Your rough idea
      ↓
  2–3 targeted clarifying questions  (AI-generated, task-specific)
      ↓
  Technique-aware optimized prompt   (ready to paste into any AI)
```

1. **Input** — Describe what you want, as rough as you like
2. **Ask** — PromptForge detects the task type and asks the 2–3 questions that actually matter, with one-click chip answers
3. **Result** — A fully structured, technique-injected prompt, streamed in real time

---

## Prompt Engineering Techniques

PromptForge selects techniques automatically based on task type:

| Task | Techniques Applied |
|------|--------------------|
| 💻 Code | Chain-of-Thought · Few-shot · Program-Aided Reasoning |
| ✍️ Copywriting | Directional Stimulus · Generate Knowledge · Few-shot |
| 📊 Analysis | Self-Consistency · Chain-of-Thought · Tree of Thoughts |
| 🎨 Creative | Directional Stimulus · Generate Knowledge · Zero-shot CoT |
| 🖼️ Design | Few-shot · Chain-of-Thought · Directional Stimulus |

> Inspired by the [Prompt Engineering Guide](https://www.promptingguide.ai/) — 18 techniques, applied where they matter most.

---

## Features

- 🧠 **Meta Prompt Engine** — task-type detection + technique matrix injection
- ⚡ **Streaming output** — real-time generation with abort support
- 🪟 **Frameless UI** — native transparent window, dark / light theme
- 🔒 **Zero secret persistence** — API key lives in memory only, never written to disk
- 📅 **Daily usage counter** — auto-resets at midnight
- 🔌 **OpenAI-compatible** — works with OpenAI, Anthropic proxies, local LLMs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + TypeScript + Pinia + Vite |
| Desktop | Tauri v2 (Rust) |
| Rendering | marked + DOMPurify (XSS-safe) |
| Icons | lucide-vue-next |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) — only needed for desktop build

### Dev mode

```bash
cd app
npm install
npm run dev
```

### Build desktop app

```bash
cd app
npm run build                        # build frontend
source ~/.cargo/env                  # load Rust toolchain
npx @tauri-apps/cli build            # package .app + .dmg
```

**Output:**
```
src-tauri/target/release/bundle/macos/PromptForge.app   (~8 MB)
src-tauri/target/release/bundle/dmg/PromptForge_*.dmg   (~3 MB)
```

---

## Configuration

Click the ⚙️ gear icon to open Settings:

| Field | Description |
|-------|-------------|
| API Key | Any OpenAI-compatible key (`sk-...`) |
| Base URL | API endpoint — default `https://api.openai.com/v1` |
| Model | `gpt-4o`, `gpt-4o-mini`, `claude-3-5-sonnet`, … |

> The API key is held **in memory only** and is never written to localStorage or disk.

---

## Project Structure

```
app/
├── src/
│   ├── views/          # InputView · AskView · ResultView
│   ├── components/     # TitleBar · SettingsDrawer · ErrorBanner · StatusBar
│   ├── stores/         # Pinia store
│   ├── composables/    # useApi · useTheme · useKeyboard
│   ├── lib/            # metaPrompt.ts — engine core
│   └── styles/         # design tokens + global CSS
└── src-tauri/          # Rust / Tauri backend
```
