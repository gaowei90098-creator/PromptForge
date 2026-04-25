<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronRight, Sparkles } from 'lucide-vue-next';
import { usePromptStore } from '../stores/promptforge';
import StatusBar from '../components/StatusBar.vue';

const store = usePromptStore();

const origOpen = ref(false);
const visibleCount = ref(1);

const visibleQuestions = computed(() =>
  store.questions.slice(0, visibleCount.value),
);

const totalQuestions = computed(() => store.questions.length);

function isSelected(qid: number, option: string) {
  return store.answers[qid] === option;
}

function selectOption(qid: number, option: string, index: number) {
  store.answer(qid, option);
  const nextIndex = index + 1;
  if (nextIndex < totalQuestions.value) {
    setTimeout(() => {
      if (visibleCount.value < totalQuestions.value) {
        visibleCount.value = nextIndex + 1;
      }
    }, 280);
  }
}

function setCustom(qid: number, value: string) {
  store.answer(qid, value);
}

function skipQuestion(index: number) {
  const q = store.questions[index];
  if (q && !store.answers[q.id]) {
    store.answer(q.id, '（用户跳过）');
  }
  if (index + 1 < totalQuestions.value) {
    visibleCount.value = Math.max(visibleCount.value, index + 2);
  }
}

const canGenerate = computed(() => {
  if (store.questions.length === 0) return true;
  return store.questions.every((q) => (store.answers[q.id] ?? '').trim().length > 0);
});

function generate() {
  if (!canGenerate.value) return;
  store.goTo('result');
}

defineExpose({ generate });
</script>

<template>
  <div class="ask-wrap">
    <div>
      <button class="orig-toggle" @click="origOpen = !origOpen">
        <ChevronRight :size="11" :style="{ transform: origOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }" />
        原始输入
      </button>
      <div v-if="origOpen" class="orig-text">{{ store.userInput }}</div>
    </div>

    <div class="progress">
      <span
        v-for="(q, idx) in store.questions"
        :key="q.id"
        :class="['prog-dot', { active: idx < visibleCount }]"
      ></span>
      <span class="prog-label">{{ visibleCount }} / {{ totalQuestions }}</span>
      <button class="skip-btn" @click="skipQuestion(visibleCount - 1)">跳过此问题 →</button>
    </div>

    <div
      v-for="(q, idx) in visibleQuestions"
      :key="q.id"
      class="card q-card"
    >
      <p class="q-title">{{ q.title }}</p>
      <div class="chips">
        <button
          v-for="opt in q.options"
          :key="opt"
          :class="['chip', { selected: isSelected(q.id, opt) }]"
          @click="selectOption(q.id, opt, idx)"
        >
          {{ opt }}
        </button>
      </div>
      <input
        type="text"
        :placeholder="'或自定义输入…'"
        :value="isSelected(q.id, store.answers[q.id] || '') ? '' : (store.answers[q.id] || '')"
        @input="(e) => setCustom(q.id, (e.target as HTMLInputElement).value)"
      />
    </div>

    <div v-if="store.questions.length === 0" class="empty-hint">
      无需追问，可直接生成。
    </div>

    <div class="generate-wrap">
      <button class="btn-primary" :disabled="!canGenerate" style="width:100%" @click="generate">
        <Sparkles :size="13" />
        生成优化后的提示词
      </button>
    </div>

    <StatusBar />
  </div>
</template>

<style scoped>
.ask-wrap {
  display: flex;
  flex-direction: column;
  padding: 14px 24px 64px;
  gap: 12px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.orig-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-faint);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 150ms;
}
.orig-toggle:hover { color: var(--text-muted); }

.orig-text {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 10px 12px;
  max-width: 540px;
  line-height: 1.6;
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prog-label {
  font-size: 11px;
  color: var(--text-faint);
  margin-left: 4px;
}
.skip-btn {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-faint);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: color 150ms;
}
.skip-btn:hover { color: var(--text-muted); }

.q-card {
  animation: fadeIn 220ms ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.q-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
  text-align: center;
}

.generate-wrap {
  padding-top: 4px;
}
</style>
