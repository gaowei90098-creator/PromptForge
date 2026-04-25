<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Copy, RefreshCw, Bookmark, Info, ChevronDown, Wand2, Plus } from 'lucide-vue-next';
import { usePromptStore } from '../stores/promptforge';
import { useApi } from '../composables/useApi';
import StatusBar from '../components/StatusBar.vue';

const store = usePromptStore();
const api = useApi();

const rawContent = ref('');
const loading = ref(false);
const streaming = ref(false);
const copyLabel = ref('复制');
const copyGreen = ref(false);
const explainOpen = ref(false);

const { promptBody, explainBody } = splitOutput(rawContent.value);
const promptRef = ref(promptBody);
const explainRef = ref(explainBody);

function splitOutput(raw: string) {
  const parts = raw.split(/\n-{3,}\n/);
  if (parts.length >= 2) {
    return {
      promptBody: parts[0].trim(),
      explainBody: parts.slice(1).join('\n---\n').trim(),
    };
  }
  return { promptBody: raw, explainBody: '' };
}

watch(rawContent, (v) => {
  const { promptBody, explainBody } = splitOutput(v);
  promptRef.value = promptBody;
  explainRef.value = explainBody;
});

let abortCtrl: AbortController | null = null;

async function runGeneration() {
  if (loading.value || streaming.value) return;
  if (!store.hasApiKey) {
    store.openSettings();
    return;
  }

  abortCtrl?.abort();
  abortCtrl = new AbortController();

  loading.value = true;
  streaming.value = false;
  rawContent.value = '';
  store.clearError();

  const qa = store.questions.map((q) => ({
    question: q.title,
    answer: store.answers[q.id] ?? '',
  }));

  try {
    await api.generateStreaming(store.userInput, qa, (chunk) => {
      if (!streaming.value) {
        streaming.value = true;
        loading.value = false;
      }
      rawContent.value += chunk;
    }, store.taskType, abortCtrl.signal);
    store.optimizedPrompt = rawContent.value;
    store.incrementToday();
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      store.showError((err as Error).message);
    }
  } finally {
    loading.value = false;
    streaming.value = false;
  }
}

onMounted(() => {
  if (!rawContent.value) runGeneration();
});

function renderMd(text: string): string {
  if (!text) return '';
  const raw = marked.parse(text, { async: false }) as string;
  return DOMPurify.sanitize(raw);
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(promptRef.value);
    copyLabel.value = '已复制';
    copyGreen.value = true;
    setTimeout(() => {
      copyLabel.value = '复制';
      copyGreen.value = false;
    }, 1600);
  } catch {
    store.showError('复制失败，请手动选择文本');
  }
}

function regenerate() { runGeneration(); }

function backToAsk() {
  store.goTo('ask');
}
function newConv() {
  store.newConversation();
}

defineExpose({ regenerate });
</script>

<template>
  <div class="result-wrap">
    <div class="row">
      <div class="left-col">
        <p class="col-title">原始需求</p>
        <div class="card-subtle orig-box">{{ store.userInput }}</div>
      </div>

      <div class="right-col">
        <div class="right-header">
          <p class="col-title">优化后的提示词</p>
          <div class="toolbar">
            <button class="icon-btn tool" @click="copyResult" :disabled="!promptRef">
              <Copy :size="13" :style="{ color: copyGreen ? 'var(--green-success)' : undefined }" />
              <span :style="{ color: copyGreen ? 'var(--green-success)' : undefined }">{{ copyLabel }}</span>
            </button>
            <button class="icon-btn" style="padding:5px 8px" title="重新生成" @click="regenerate" :disabled="loading || streaming">
              <RefreshCw :size="13" />
            </button>
            <button class="icon-btn" style="padding:5px 8px" title="保存" disabled>
              <Bookmark :size="13" />
            </button>
          </div>
        </div>

        <div class="result-area">
          <div v-if="loading && !streaming" class="skeleton">
            <div class="shimmer" style="width:65%"></div>
            <div class="shimmer" style="width:100%"></div>
            <div class="shimmer" style="width:82%"></div>
            <div class="shimmer" style="width:100%;margin-top:4px"></div>
            <div class="shimmer" style="width:57%"></div>
            <div class="shimmer" style="width:90%"></div>
            <div class="shimmer" style="width:74%;margin-top:4px"></div>
          </div>
          <div
            v-else
            class="result-md"
            :class="{ 'cursor-blink': streaming }"
            v-html="renderMd(promptRef)"
          ></div>
        </div>
      </div>
    </div>

    <div class="explain-box" v-if="explainRef">
      <button class="explain-toggle" @click="explainOpen = !explainOpen">
        <Info :size="12" />
        为什么这样设计
        <ChevronDown
          :size="12"
          :style="{ marginLeft: 'auto', transform: explainOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }"
        />
      </button>
      <div :class="['explain-body', { open: explainOpen }]">
        <div class="explain-inner" v-html="renderMd(explainRef)"></div>
      </div>
    </div>

    <div class="cta-row">
      <button class="btn-secondary" style="flex:1" @click="backToAsk" :disabled="loading || streaming">
        <Wand2 :size="13" />
        再优化一次
      </button>
      <button class="btn-primary" style="flex:1" @click="newConv" :disabled="loading || streaming">
        <Plus :size="13" />
        开始新对话
        <kbd>⌘K</kbd>
      </button>
    </div>

    <StatusBar show-count />
  </div>
</template>

<style scoped>
.result-wrap {
  display: flex;
  flex-direction: column;
  padding: 12px 20px 52px;
  gap: 10px;
  overflow: hidden;
  height: 100%;
  position: relative;
}
.row {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}
.col-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
}
.left-col {
  width: 188px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.orig-box {
  flex: 1;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.65;
  overflow-y: auto;
}
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.toolbar {
  display: flex;
  gap: 2px;
}
.tool {
  padding: 5px 8px;
  font-size: 11px;
  gap: 5px;
  display: flex;
  align-items: center;
}
.result-area {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
}
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.explain-box {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.explain-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  color: var(--text-muted);
  text-align: left;
  transition: background 150ms, color 150ms;
}
.explain-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.explain-inner {
  padding: 10px 16px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.7;
  border-top: 1px solid var(--border-subtle);
}

.cta-row {
  display: flex;
  gap: 8px;
}
</style>
