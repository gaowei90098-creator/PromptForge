# PromptForge

> Turn vague ideas into high-quality AI prompts — in seconds.

PromptForge is a lightweight desktop app (macOS / Windows) that transforms rough user input into precision-crafted prompts using a **Meta Prompt Engine** built on 18+ prompt engineering techniques from the [Prompt Engineering Guide](https://www.promptingguide.ai/).

![PromptForge screenshot](./design/cover.png)

---

## How it works

```
Your idea  →  Targeted follow-up questions  →  Optimized prompt
```

1. **Input** — Describe what you want, however roughly
2. **Ask** — The engine identifies 2–3 critical dimensions and asks focused clarifying questions with one-click chip answers
3. **Result** — A fully structured, technique-aware prompt ready to paste into any AI (Claude, GPT, Gemini…)

---

## Prompt Engineering Techniques Applied

PromptForge automatically selects and applies the right techniques based on task type:

| Task | Techniques |
|------|-----------|
| Code | Chain-of-Thought · Few-shot · Program-Aided Reasoning |
| Copywriting | Directional Stimulus · Generate Knowledge · Few-shot |
| Analysis | Self-Consistency · Chain-of-Thought · Tree of Thoughts |
| Creative | Directional Stimulus · Generate Knowledge · Zero-shot CoT |
| Design | Few-shot · Chain-of-Thought · Directional Stimulus |

---

## Features

- **Meta Prompt Engine** — task-type detection + technique matrix injection
- **Streaming output** — real-time token-by-token generation with abort support
- **Frameless UI** — native-feeling transparent window, dark/light theme
- **Zero persistence of secrets** — API key is never written to disk
- **Daily usage counter** — tracks today's generations, auto-resets at midnight
- **Works with any OpenAI-compatible API** — OpenAI, Claude via proxy, local LLMs

---

## Tech Stack

- **Frontend** — Vue 3 + TypeScript + Pinia + Vite
- **Desktop shell** — Tauri v2 (Rust)
- **Markdown** — marked + DOMPurify (XSS-safe rendering)
- **Icons** — lucide-vue-next

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri desktop build)

### Run in dev mode

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

Output:
- `src-tauri/target/release/bundle/macos/PromptForge.app`
- `src-tauri/target/release/bundle/dmg/PromptForge_*.dmg`

---

## Configuration

Open **Settings** (gear icon) and enter:

| Field | Description |
|-------|-------------|
| API Key | Your OpenAI-compatible key (`sk-...`) |
| Base URL | API endpoint (default: `https://api.openai.com/v1`) |
| Model | e.g. `gpt-4o`, `gpt-4o-mini`, `claude-3-5-sonnet` |

The API key is stored **in memory only** — never written to disk or localStorage.

---

## Project Structure

```
app/
├── src/
│   ├── views/          # InputView · AskView · ResultView
│   ├── components/     # TitleBar · SettingsDrawer · ErrorBanner · StatusBar
│   ├── stores/         # Pinia store (promptforge.ts)
│   ├── composables/    # useApi · useTheme · useKeyboard
│   ├── lib/            # metaPrompt.ts — prompt engine core
│   └── styles/         # tokens.css · global.css
└── src-tauri/          # Rust/Tauri backend
```

---

## License

MIT
