<script setup lang="ts">
import { ref, computed } from 'vue';
import { Sparkles, Zap, Key } from 'lucide-vue-next';
import { usePromptStore } from '../stores/promptforge';
import { useApi } from '../composables/useApi';
import StatusBar from '../components/StatusBar.vue';

const store = usePromptStore();
const api = useApi();

const input = ref(store.userInput);
const analyzing = ref(false);

const charCount = computed(() => input.value.length);
const canOptimize = computed(() => input.value.trim().length >= 3);

async function goOptimize() {
  if (!canOptimize.value || analyzing.value) return;
  if (!store.hasApiKey) {
    store.openSettings();
    return;
  }

  store.userInput = input.value.trim();
  store.clearError();
  analyzing.value = true;
  try {
    const result = await api.analyze(store.userInput);
    store.setQuestions(result.questions, result.taskType);
    store.goTo('ask');
  } catch (err) {
    store.showError((err as Error).message);
  } finally {
    analyzing.value = false;
  }
}

async function goDirect() {
  if (!canOptimize.value) return;
  if (!store.hasApiKey) {
    store.openSettings();
    return;
  }
  store.userInput = input.value.trim();
  store.setQuestions([]);
  store.goTo('result');
}

defineExpose({ goOptimize, goDirect });
</script>

<template>
  <div class="input-wrap">
    <div v-if="!store.hasApiKey" class="warn-card">
      <Key :size="15" class="warn-icon" />
      <div>
        <div class="warn-title">尚未配置 API Key</div>
        <div class="warn-sub">配置后即可开始优化提示词</div>
      </div>
      <button class="warn-action" @click="store.openSettings()">去设置 →</button>
    </div>

    <p class="hint">
      支持中文 / English &nbsp;·&nbsp;
      <kbd>⌘K</kbd> 新对话
    </p>

    <div class="textarea-wrap">
      <textarea
        v-model="input"
        rows="6"
        placeholder="描述你想让 AI 做什么…（例如：帮我写一段小红书爆款文案）"
      ></textarea>
      <span class="char-count">{{ charCount }}</span>
    </div>

    <div class="actions">
      <button class="btn-primary" :disabled="!canOptimize || analyzing" @click="goOptimize">
        <Sparkles :size="13" />
        {{ analyzing ? '分析中…' : '优化提示词' }}
        <kbd>⌘↵</kbd>
      </button>
      <button class="btn-secondary" :disabled="!canOptimize" @click="goDirect">
        <Zap :size="13" />
        直接生成
      </button>
    </div>

    <StatusBar show-count />
  </div>
</template>

<style scoped>
.input-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 40px 52px;
  height: 100%;
  position: relative;
}

.warn-card {
  background: rgba(245, 158, 11, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 480px;
  width: 100%;
  margin-bottom: 20px;
}
.warn-icon {
  color: var(--amber-warning);
  flex-shrink: 0;
  margin-top: 1px;
}
.warn-title {
  font-size: 12px;
  font-weight: 500;
  color: #FCD34D;
}
.warn-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.warn-action {
  margin-left: auto;
  font-size: 11px;
  color: #FCD34D;
  white-space: nowrap;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  padding: 4px 10px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms;
}
.warn-action:hover { background: rgba(245, 158, 11, 0.1); }

.hint {
  font-size: 11px;
  color: var(--text-faint);
  margin-bottom: 14px;
  letter-spacing: 0.04em;
}

.textarea-wrap {
  position: relative;
  max-width: 520px;
  width: 100%;
}
.char-count {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 10px;
  color: var(--text-faint);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
</style>
