<div align="center">

<img src="./app/src-tauri/icons/128x128@2x.png" width="96" alt="PromptForge" />

# PromptForge

**把模糊的想法变成高质量 AI 提示词 — 秒级完成**

Turn vague ideas into high-quality AI prompts, in seconds.

<br/>

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/gaowei90098-creator/PromptForge?style=flat-square)](https://github.com/gaowei90098-creator/PromptForge/stargazers)

</div>

---

<div align="center">
<img src="./app/src/assets/hero.png" alt="PromptForge Screenshot" width="85%" />
</div>

---

## 工作原理 / How it works

```
你的模糊想法
      ↓
  2–3 个关键追问（AI 按任务类型定制，非通用模板）
      ↓
  注入提示词工程技术的高质量成品提示词（流式输出，可直接使用）
```

1. **输入** — 随意描述你的需求，哪怕很粗糙
2. **追问** — PromptForge 识别任务类型，只问真正影响质量的维度，一键 chip 作答
3. **生成** — 结构化、技术感知的提示词实时流出，粘贴进任意 AI 即用

---

## 提示词工程技术矩阵

PromptForge 根据任务类型自动选择并注入最合适的技术：

| 任务类型 | 应用的技术 |
|---------|-----------|
| 💻 代码 | Chain-of-Thought · Few-shot · Program-Aided Reasoning |
| ✍️ 文案 | Directional Stimulus · Generate Knowledge · Few-shot |
| 📊 分析 | Self-Consistency · Chain-of-Thought · Tree of Thoughts |
| 🎨 创意 | Directional Stimulus · Generate Knowledge · Zero-shot CoT |
| 🖼️ 设计 | Few-shot · Chain-of-Thought · Directional Stimulus |

> 技术体系参考 [Prompt Engineering Guide](https://www.promptingguide.ai/) — 18 种技术，按场景精准投放

---

## 核心特性

- 🧠 **Meta Prompt 引擎** — 任务类型检测 + 技术矩阵注入，非套模板
- ⚡ **流式输出** — 实时 token 生成，支持随时中止
- 🪟 **无边框 UI** — 原生透明窗口，深色 / 浅色主题
- 🔒 **密钥零持久化** — API Key 仅存内存，从不写入磁盘或 localStorage
- 📅 **每日用量统计** — 自动在零点重置
- 🔌 **兼容任意 OpenAI 协议** — OpenAI、Claude 代理、本地 LLM 均可接入

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 + TypeScript + Pinia + Vite |
| 桌面壳 | Tauri v2 (Rust) |
| Markdown 渲染 | marked + DOMPurify（XSS 安全） |
| 图标 | lucide-vue-next |

---

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) — 仅打包桌面应用时需要

### 开发模式

```bash
cd app
npm install
npm run dev
```

### 打包桌面应用

```bash
cd app
npm run build                        # 构建前端
source ~/.cargo/env                  # 加载 Rust 工具链
npx @tauri-apps/cli build            # 打包 .app + .dmg
```

**产物：**
```
src-tauri/target/release/bundle/macos/PromptForge.app   (~8 MB)
src-tauri/target/release/bundle/dmg/PromptForge_*.dmg   (~3 MB)
```

---

## 配置

点击右上角 ⚙️ 齿轮图标打开设置：

| 字段 | 说明 |
|------|------|
| API Key | 任意 OpenAI 兼容密钥（`sk-...`） |
| Base URL | 接口地址，默认 `https://api.openai.com/v1` |
| 模型 | `gpt-4o`、`gpt-4o-mini`、`claude-3-5-sonnet` 等 |

> API Key 仅保存在内存中，不会写入 localStorage 或磁盘。

---

## 项目结构

```
app/
├── src/
│   ├── views/          # InputView · AskView · ResultView
│   ├── components/     # TitleBar · SettingsDrawer · ErrorBanner · StatusBar
│   ├── stores/         # Pinia store
│   ├── composables/    # useApi · useTheme · useKeyboard
│   ├── lib/            # metaPrompt.ts — 引擎核心
│   └── styles/         # 设计 token + 全局 CSS
└── src-tauri/          # Rust / Tauri 后端
```
