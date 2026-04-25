# Handoff: PromptForge — AI 提示词优化器

## Overview

PromptForge 是一款面向全用户（程序员、设计师、自媒体、小白）的桌面端 AI 提示词优化器。
核心痛点：用户不知道怎么写好提示词。PromptForge 通过三步流程（输入 → 智能追问 → 生成优化结果）帮助用户构建高质量的 AI Prompt。

目标技术栈：**Vue 3 + Tauri**（桌面端）

---

## About the Design Files

`PromptForge.html` 是用 HTML + CSS Variables + Vanilla JS 制作的**高保真设计原型**，仅作视觉与交互参考，**不要直接复制代码到生产环境**。

开发任务是：以这份原型为像素级参考，在 Vue 3 + Tauri 项目中**从零重新实现**，使用 Vue 的组件体系、响应式状态管理和 Tauri API，而非直接搬运 HTML。

---

## Fidelity

**高保真（High-fidelity）**

原型包含最终的颜色、字体、间距、动效和交互逻辑，开发者应尽可能像素级还原。

---

## 窗口规格

| 属性 | 值 |
|------|-----|
| 默认尺寸 | 900 × 640 px |
| 最小尺寸 | 720 × 520 px |
| 边框 | 无标题栏（Tauri `decorations: false`） |
| 圆角 | 系统级窗口圆角（macOS 自动处理） |

Tauri `tauri.conf.json` 参考：
```json
"windows": [{
  "width": 900,
  "height": 640,
  "minWidth": 720,
  "minHeight": 520,
  "decorations": false,
  "transparent": true
}]
```

---

## Screens / Views

### 1. 输入态（InputView）

**Purpose：** 首屏，用户描述需求。

**Layout：**
- 整体 flex column，垂直水平居中
- 顶部 padding-bottom: 52px（为底部状态栏留空）

**Components：**

| 组件 | 说明 |
|------|------|
| `<AppTitleBar>` | 极细标题栏，左侧 logo dot + 文字，右侧主题切换 + 设置按钮 |
| `<StateTabBar>` | 三个状态切换 tab（开发调试用，生产可隐藏） |
| `<NoApiWarning>` | 无 API Key 时显示的警告卡片（条件渲染） |
| `<MainTextarea>` | 多行输入框，rows=6，右下角字符计数 |
| `<PrimaryButton>` | "优化提示词"，disabled 当输入 < 3 字符 |
| `<SecondaryButton>` | "直接生成"，跳过追问直接到结果态 |
| `<StatusBar>` | 绝对定位底部：API 状态 · 今日优化次数 · 版本号 |

**Typography & Colors（见 Design Tokens 章节）**

**Interactions：**
- 输入内容 ≥ 3 字符时，`优化提示词` 按钮激活（opacity 1.0）
- `⌘↵` → 触发优化（等同点击主按钮）
- `⌘K` → 新对话（清空并回到本页）

---

### 2. 智能追问态（AskView）

**Purpose：** 收集补充信息，提升生成质量。共 3 个问题，逐步展开。

**Layout：**
- flex column，padding: 14px 24px，底部 52px 状态栏
- 垂直滚动（overflow-y: auto）

**Components：**

| 组件 | 说明 |
|------|------|
| `<OriginalInputPreview>` | 可折叠，显示用户原始输入，灰色小字 |
| `<ProgressDots>` | 3 个圆点（7×7px），当前及已完成的点为紫色 `#7C3AED` |
| `<QuestionCard>` | 问题卡片（详见下方） |
| `<GenerateButton>` | 底部主按钮，3 道题全部回答后才激活 |

**QuestionCard 结构：**
```
┌─────────────────────────────────────────┐
│ 问题标题（13px, font-weight:600）        │
│                                         │
│ [chip1] [chip2] [chip3] [chip4]         │
│                                         │
│ [自定义输入框]                           │
└─────────────────────────────────────────┘
```
- 卡片：`background: var(--bg-surface)`, `border: 1px solid var(--border)`, `border-radius: 8px`, `padding: 16px 20px`
- Chip（选项按钮）：`border-radius: 999px`, `padding: 5px 12px`, `font-size: 11px`
  - 默认：`border: 1px solid var(--border)`, `color: var(--text-secondary)`
  - hover：`border-color: rgba(124,58,237,0.4)`, `color: #7C3AED`
  - selected：`border-color: #7C3AED`, `color: #7C3AED`, `background: rgba(124,58,237,0.12)`
- 点击 chip 后 280ms 延迟自动展开下一张卡片

**问题列表（可由后端配置）：**
1. 你的目标受众是谁？→ 选项：18-25岁女性 / 25-35岁职场女性 / 学生党 / 宝妈群体
2. 希望文案的风格是？→ 选项：活泼可爱 / 专业种草 / 真实测评 / 高端优雅
3. 产品的核心卖点是？→ 选项：成分天然无添加 / 快速见效 / 性价比高 / 明星同款

**Interactions：**
- 选中 chip → 记录答案 → 延迟展开下一卡片
- 进度点同步更新
- "跳过此问题" → 直接展开下一题
- 全部回答（或全部跳过）→ 生成按钮激活

---

### 3. 结果态（ResultView）

**Purpose：** 展示优化后的 Prompt，支持复制/重生成/保存。

**Layout：**
```
┌──────────────────────────────────────────────────────┐
│ [原始需求 188px] │ [优化后提示词 flex:1]              │
│                 │  [工具栏：复制/重生成/保存]          │
│                 │  [结果内容区，可滚动]                │
├──────────────────────────────────────────────────────┤
│ [为什么这样设计 可展开]                               │
├──────────────────────────────────────────────────────┤
│ [再优化一次 flex:1]  [开始新对话 flex:1]             │
└──────────────────────────────────────────────────────┘
```

**Components：**

| 组件 | 说明 |
|------|------|
| `<OriginalCard>` | 左侧 188px，`background: var(--bg-raised)`，灰色小字 |
| `<ResultArea>` | 右侧主区域，边框卡片，内部滚动 |
| `<SkeletonLoader>` | 加载中显示 shimmer 骨架屏（7行，宽度随机 57%-100%） |
| `<StreamingText>` | 内容流式输出，末尾闪烁光标 `▋`（紫色） |
| `<ExplainSection>` | 可展开区块，max-height 动画 200ms ease-out |

**复制按钮交互：**
- 点击 → 复制 `innerText` 到剪贴板
- icon + label 变为绿色 `#10B981` + "已复制"
- 1600ms 后恢复

**骨架屏 shimmer 动画：**
```css
background: linear-gradient(90deg,
  var(--bg-raised) 25%,
  var(--bg-hover) 50%,
  var(--bg-raised) 75%
);
background-size: 1200px 100%;
animation: shimmer 1.6s infinite;
```

---

## Interactions & Behavior

### 动画规范
| 场景 | 时长 | 缓动 |
|------|------|------|
| 状态切换（opacity + translateY 6px） | 150ms | ease-out |
| 主题切换（background/color） | 200ms | ease-out |
| 设置抽屉滑入 | 200ms | ease-out |
| 追问卡片展开 | 280ms delay + 自然 | ease-out |
| 展开/折叠（max-height） | 200ms | ease-out |
| 按钮 hover | 150ms | ease-out |

### 流式输出模拟（真实接入时替换）
- 每 16ms tick，随机追加 3-7 个字符到内容
- 完成后移除光标

### 键盘快捷键
| 快捷键 | 行为 |
|--------|------|
| `⌘↵` | 当前态提交/生成 |
| `⌘K` | 新对话（清空状态，回到输入态） |
| `⌘,` | 打开设置 |

---

## State Management（Vue 3 建议）

```ts
// stores/promptforge.ts (Pinia)
interface PromptForgeState {
  // App
  currentView: 'input' | 'ask' | 'result'
  theme: 'dark' | 'light' | 'auto'

  // Input
  userInput: string

  // Ask
  currentQuestion: number  // 1-3
  answers: Record<number, string>

  // Result
  optimizedPrompt: string
  isLoading: boolean

  // Settings
  apiKey: string
  apiBaseUrl: string
  model: string
  language: 'zh' | 'en'

  // Meta
  todayCount: number
  apiConnected: boolean
  errorMessage: string | null
}
```

**State transitions：**
```
input ──[点击优化]──→ ask ──[点击生成]──→ result
  ↑                                          |
  └──────────────[新对话/再优化]─────────────┘
```

---

## Design Tokens

### Colors

```css
/* Dark Mode */
--bg-base:        #0f0f11;   /* 最底层背景 */
--bg-surface:     #18181b;   /* 卡片背景 */
--bg-raised:      #1f1f23;   /* 次级卡片/输入框 */
--bg-hover:       rgba(255,255,255,0.05);
--bg-input:       #141416;

--border:         #2d2d32;
--border-subtle:  #222226;

--text-primary:   #e4e4e7;
--text-secondary: #a1a1aa;
--text-muted:     #52525b;
--text-faint:     #3f3f46;

--code-bg:        #141416;
--dot-inactive:   #3f3f46;

/* Light Mode */
--bg-base:        #f8f8fa;
--bg-surface:     #ffffff;
--bg-raised:      #f2f2f5;
--bg-hover:       rgba(0,0,0,0.04);
--bg-input:       #ffffff;

--border:         #e2e2e8;
--border-subtle:  #ececf0;

--text-primary:   #18181b;
--text-secondary: #52525b;
--text-muted:     #71717a;
--text-faint:     #a1a1aa;

--code-bg:        #f4f4f6;
--dot-inactive:   #d4d4d8;

/* Accent（深浅模式通用） */
--accent:         #7C3AED;
--accent-dim:     #6D28D9;   /* hover */
--accent-soft:    rgba(124,58,237,0.12);  /* chip selected bg */
--accent-border:  rgba(124,58,237,0.4);  /* chip hover border */

/* Semantic */
--green-success:  #10B981;   /* 复制成功 */
--red-error:      #f87171;   /* 错误状态 */
--amber-warning:  #F59E0B;   /* 无API Key提示 */
```

### Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', 'Segoe UI', sans-serif;

/* Scale */
10px / weight 400  → 状态栏、标签、版本号
11px / weight 400  → chip、次级说明、工具提示
12px / weight 400  → 设置项、说明文字
13px / weight 400  → 正文、按钮文字
13px / weight 600  → 问题标题
10px / weight 600 uppercase tracking-wider → Section 标题
```

### Spacing

```
4px   间距最小单位
6px   chip gap、小间距
8px   行内元素间距
10px  组件内边距小
12px  组件内边距中
14px  卡片内边距（水平）
16px  卡片内边距（标准）
20px  页面水平内边距（设置抽屉）
24px  追问态页面内边距
40px  输入态页面内边距
52px  底部状态栏占位高度
```

### Border Radius

```
4px  → badge、小元素
6px  → input、设置按钮、kbd
8px  → 卡片、主按钮、textarea
999px → chip（胶囊形）
```

### Shadows

```css
/* Dark */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
--shadow-md: 0 4px 16px rgba(0,0,0,0.5);  /* 设置抽屉 */

/* Light */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);
```

---

## Settings Panel（设置抽屉）

- **触发：** 右上角齿轮图标 或 `⌘,`
- **形态：** 右侧滑入抽屉，宽 280px，全高
- **背景遮罩：** `rgba(0,0,0,0.35)` + `backdrop-filter: blur(2px)`
- **内容区：** 垂直滚动

**设置项：**

| 项目 | 类型 | 选项/默认值 |
|------|------|------------|
| Base URL | text input | `https://api.openai.com/v1` |
| API Key | password input | 空 |
| 模型 | select | GPT-4o / Claude 3.5 Sonnet / GPT-4 Turbo / 自定义 |
| 语言 | toggle | 中文 / English |
| 主题 | toggle group | 深色 / 浅色 / 系统 |
| 导出历史 | button | — |
| 清除历史 | button (danger) | 红色边框，确认弹窗 |

---

## Error & Empty States

### 无 API Key
- 在输入态顶部显示 `<NoApiWarning>` 卡片
- 背景：`rgba(245,158,11,0.07)`，边框：`rgba(245,158,11,0.2)`
- 包含"去设置 →"按钮，点击打开设置抽屉

### API 错误
- 顶部固定 error banner（绝对定位，z-index:60）
- 背景：`rgba(239,68,68,0.08)`，文字：`#f87171`
- 初始 `transform: translateY(-100%)`，显示时滑入
- 右侧关闭按钮（X icon）

### 网络异常（可扩展）
- 居中展示图标 + 说明文字 + "重试"按钮

---

## Assets & Icons

使用 **Lucide Icons**（`lucide-vue-next`）：

| 图标名 | 用途 |
|--------|------|
| `sparkles` | 优化/生成按钮 |
| `zap` | 直接生成按钮 |
| `settings` | 设置入口 |
| `moon` / `sun` | 主题切换 |
| `copy` | 复制结果 |
| `refresh-cw` | 重新生成 |
| `bookmark` | 保存 |
| `wand-2` | 再优化一次 |
| `plus` | 新对话 |
| `chevron-right` | 折叠指示 |
| `chevron-down` | 展开指示 |
| `info` | 说明 |
| `alert-circle` | 错误 |
| `x` | 关闭 |
| `key` | 无API Key提示 |
| `download` | 导出 |
| `trash-2` | 清除 |

安装：`npm install lucide-vue-next`

---

## Files

| 文件 | 说明 |
|------|------|
| `PromptForge.html` | 完整高保真原型，包含深色/浅色主题、三个状态、设置抽屉 |

---

## Vue 3 + Tauri 项目结构建议

```
src/
├── App.vue                    # 根组件，主题管理
├── main.ts
├── stores/
│   └── promptforge.ts         # Pinia store
├── views/
│   ├── InputView.vue          # 状态1
│   ├── AskView.vue            # 状态2
│   └── ResultView.vue         # 状态3
├── components/
│   ├── layout/
│   │   ├── AppTitleBar.vue    # 标题栏（含拖拽区域）
│   │   ├── StateTabBar.vue    # 状态切换 tabs
│   │   └── StatusBar.vue      # 底部状态栏
│   ├── ui/
│   │   ├── PrimaryButton.vue
│   │   ├── SecondaryButton.vue
│   │   ├── OptionChip.vue
│   │   ├── ProgressDots.vue
│   │   └── SkeletonLoader.vue
│   ├── settings/
│   │   └── SettingsDrawer.vue
│   └── result/
│       ├── ResultMarkdown.vue  # Markdown 渲染
│       └── ExplainSection.vue  # 可展开说明
├── composables/
│   ├── useTheme.ts            # 主题切换逻辑
│   ├── useKeyboard.ts         # 快捷键
│   └── useApi.ts              # API 调用（流式输出）
└── styles/
    ├── tokens.css             # CSS 变量（Design Tokens）
    └── global.css
```

**Tauri 特别注意：**
- 标题栏拖拽区域使用 `-webkit-app-region: drag`（同原型）
- API Key 存储使用 Tauri 的 `@tauri-apps/plugin-store` 加密存储，不要存 localStorage
- 流式 AI 输出通过 Tauri Command 或直接 fetch SSE 实现

---

## 交接联系

设计原型由 PromptForge Design 交付。如有视觉细节疑问，以 `PromptForge.html` 为最终参考。
