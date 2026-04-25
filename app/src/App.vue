<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePromptStore } from './stores/promptforge';
import { useTheme } from './composables/useTheme';
import { useKeyboard } from './composables/useKeyboard';

import TitleBar from './components/TitleBar.vue';
import ErrorBanner from './components/ErrorBanner.vue';
import SettingsDrawer from './components/SettingsDrawer.vue';
import InputView from './views/InputView.vue';
import AskView from './views/AskView.vue';
import ResultView from './views/ResultView.vue';

const store = usePromptStore();
useTheme();

const inputRef = ref<InstanceType<typeof InputView> | null>(null);
const askRef = ref<InstanceType<typeof AskView> | null>(null);

useKeyboard({
  onSubmit: () => {
    if (store.currentView === 'input') inputRef.value?.goOptimize();
    else if (store.currentView === 'ask') askRef.value?.generate();
  },
  onNewConversation: () => store.newConversation(),
});

const devMode = import.meta.env.DEV;

function goState(s: 'input' | 'ask' | 'result') {
  store.goTo(s);
}

const activeTab = computed(() => store.currentView);

onMounted(() => {
  document.title = 'PromptForge';
});
</script>

<template>
  <div id="window">
    <ErrorBanner />
    <TitleBar />

    <div v-if="devMode" class="state-tabs">
      <button :class="['tab-btn', { active: activeTab === 'input' }]" @click="goState('input')">输入态</button>
      <button :class="['tab-btn', { active: activeTab === 'ask' }]" @click="goState('ask')">追问态</button>
      <button :class="['tab-btn', { active: activeTab === 'result' }]" @click="goState('result')">结果态</button>
    </div>

    <div class="content-area">
      <div :class="['state-panel', activeTab === 'input' ? 'active-state' : 'hidden-state']">
        <InputView v-if="activeTab === 'input'" ref="inputRef" />
      </div>
      <div :class="['state-panel', activeTab === 'ask' ? 'active-state' : 'hidden-state']">
        <AskView v-if="activeTab === 'ask'" ref="askRef" />
      </div>
      <div :class="['state-panel', activeTab === 'result' ? 'active-state' : 'hidden-state']">
        <ResultView v-if="activeTab === 'result'" />
      </div>
    </div>

    <SettingsDrawer />
  </div>
</template>

<style scoped>
#window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
  /* frameless window: rounded corners + border */
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-base);
}

.state-tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 8px 0 0;
  flex-shrink: 0;
}
.tab-btn {
  font-size: 11px;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
  transition: color 150ms, background 150ms, border-color 150ms;
}
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn.active {
  border-color: var(--border);
  background: var(--bg-raised);
  color: var(--text-primary);
}

.content-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  margin-top: 4px;
}
</style>
