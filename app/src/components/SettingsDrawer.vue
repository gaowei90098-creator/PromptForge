<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { X, Download, Trash2 } from 'lucide-vue-next';
import { usePromptStore, type ThemePref, type Language } from '../stores/promptforge';

const store = usePromptStore();

interface Provider {
  label: string;
  baseUrl: string;
  models: { value: string; label: string }[];
}

const PROVIDERS: Record<string, Provider> = {
  openai: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'o1-mini', label: 'o1 mini' },
    ],
  },
  anthropic: {
    label: 'Claude (Anthropic)',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
  },
  deepseek: {
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat (V3)' },
      { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1)' },
    ],
  },
  zhipu: {
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { value: 'glm-4-flash', label: 'GLM-4 Flash（免费）' },
      { value: 'glm-4-air', label: 'GLM-4 Air' },
      { value: 'glm-4-plus', label: 'GLM-4 Plus' },
    ],
  },
  siliconflow: {
    label: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
      { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen2.5 72B' },
      { value: 'Pro/deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1' },
    ],
  },
  ollama: {
    label: 'Ollama（本地）',
    baseUrl: 'http://localhost:11434/v1',
    models: [
      { value: 'llama3.2', label: 'Llama 3.2' },
      { value: 'qwen2.5', label: 'Qwen 2.5' },
      { value: 'deepseek-r1', label: 'DeepSeek R1' },
    ],
  },
  custom: {
    label: '自定义',
    baseUrl: '',
    models: [],
  },
};

function detectProvider(baseUrl: string): string {
  for (const [key, p] of Object.entries(PROVIDERS)) {
    if (key !== 'custom' && baseUrl.startsWith(p.baseUrl)) return key;
  }
  return 'custom';
}

const form = reactive({
  apiBaseUrl: store.apiBaseUrl,
  apiKey: store.apiKey,
  model: store.model,
  language: store.language,
  theme: store.theme,
  provider: detectProvider(store.apiBaseUrl),
});

const currentModels = computed(() => PROVIDERS[form.provider]?.models ?? []);

function pickProvider(key: string) {
  form.provider = key;
  const p = PROVIDERS[key];
  if (p.baseUrl) form.apiBaseUrl = p.baseUrl;
  if (p.models.length > 0) form.model = p.models[0].value;
}

watch(
  () => store.settingsOpen,
  (open) => {
    if (open) {
      form.apiBaseUrl = store.apiBaseUrl;
      form.apiKey = store.apiKey;
      form.model = store.model;
      form.language = store.language;
      form.theme = store.theme;
      form.provider = detectProvider(store.apiBaseUrl);
    }
  },
);

const overlayVisible = computed(() => store.settingsOpen);

function save() {
  store.saveSettings({
    apiBaseUrl: form.apiBaseUrl,
    apiKey: form.apiKey,
    model: form.model,
  });
  store.setLanguage(form.language);
  store.setTheme(form.theme);
  store.closeSettings();
}

function pickTheme(t: ThemePref) {
  form.theme = t;
}
function pickLang(l: Language) {
  form.language = l;
}

function clearHistory() {
  if (!confirm('确认清除所有历史？')) return;
  localStorage.removeItem('promptforge:v1');
  store.todayCount = 0;
  store.persist();
}
</script>

<template>
  <div
    class="drawer-overlay"
    :style="{ display: overlayVisible ? 'block' : 'none' }"
    @click="store.closeSettings()"
  ></div>

  <div :class="['drawer', { open: store.settingsOpen }]">
    <div class="drawer-header">
      <p style="font-size:13px;font-weight:600;color:var(--text-primary)">设置</p>
      <button class="icon-btn" style="padding:5px" @click="store.closeSettings()">
        <X :size="14" />
      </button>
    </div>

    <div class="drawer-body">
      <div class="setting-section">
        <div class="setting-label">服务商</div>
        <div class="provider-grid">
          <button
            v-for="(p, key) in PROVIDERS"
            :key="key"
            :class="['provider-btn', { active: form.provider === key }]"
            @click="pickProvider(key)"
          >{{ p.label }}</button>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-label">API 配置</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div>
            <label>Base URL</label>
            <input type="text" v-model="form.apiBaseUrl" placeholder="https://api.openai.com/v1" />
          </div>
          <div>
            <label>API Key</label>
            <input type="password" v-model="form.apiKey" placeholder="sk-···" />
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-label">模型</div>
        <select v-model="form.model">
          <template v-if="currentModels.length > 0">
            <option v-for="m in currentModels" :key="m.value" :value="m.value">{{ m.label }}</option>
          </template>
          <template v-else>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o mini</option>
          </template>
        </select>
        <input
          v-if="form.provider === 'custom' || !currentModels.find(m => m.value === form.model)"
          type="text"
          v-model="form.model"
          placeholder="输入模型名称，如 gpt-4o"
          style="margin-top:6px"
        />
      </div>

      <div class="setting-section">
        <div class="setting-label">语言</div>
        <div style="display:flex;gap:6px">
          <button :class="['theme-choice', { active: form.language === 'zh' }]" @click="pickLang('zh')">中文</button>
          <button :class="['theme-choice', { active: form.language === 'en' }]" @click="pickLang('en')">English</button>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-label">主题</div>
        <div style="display:flex;gap:6px">
          <button :class="['theme-choice', { active: form.theme === 'dark' }]" @click="pickTheme('dark')">深色</button>
          <button :class="['theme-choice', { active: form.theme === 'light' }]" @click="pickTheme('light')">浅色</button>
          <button :class="['theme-choice', { active: form.theme === 'auto' }]" @click="pickTheme('auto')">系统</button>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-label">数据</div>
        <button class="setting-btn" disabled>
          <Download :size="13" />
          导出历史记录
        </button>
        <button class="setting-btn danger" @click="clearHistory">
          <Trash2 :size="13" />
          清除所有历史
        </button>
      </div>

      <div class="setting-section">
        <div class="setting-label">快捷键</div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:11px;color:var(--text-muted)">
          <div style="display:flex;justify-content:space-between"><span>提交 / 生成</span><kbd>⌘↵</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>新对话</span><kbd>⌘K</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>打开设置</span><kbd>⌘,</kbd></div>
        </div>
      </div>
    </div>

    <div class="drawer-footer">
      <button class="btn-primary" style="width:100%;font-size:12px" @click="save">保存并关闭</button>
    </div>
  </div>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}
.drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 280px;
  z-index: 50;
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 200ms ease-out;
  box-shadow: var(--shadow-md);
}
.drawer.open { transform: translateX(0); }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.drawer-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.setting-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
  margin-bottom: 4px;
}
label {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.setting-btn {
  font-family: inherit;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}
.setting-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
  background: var(--bg-hover);
}
.setting-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.setting-btn.danger {
  color: var(--red-error);
  border-color: rgba(239, 68, 68, 0.25);
}
.setting-btn.danger:hover {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.06);
}

.theme-choice {
  flex: 1;
  font-family: inherit;
  font-size: 11px;
  padding: 6px 0;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
}
.theme-choice:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
}
.theme-choice.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.provider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.provider-btn {
  font-family: inherit;
  font-size: 11px;
  padding: 7px 6px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.provider-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
}
.provider-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
</style>
