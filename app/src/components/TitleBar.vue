<script setup lang="ts">
import { Moon, Sun, Settings as SettingsIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { usePromptStore } from '../stores/promptforge';

const store = usePromptStore();

const isDark = computed(() => {
  if (store.theme === 'light') return false;
  if (store.theme === 'dark') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});

function toggleTheme() {
  store.setTheme(isDark.value ? 'light' : 'dark');
}
</script>

<template>
  <div class="titlebar" data-tauri-drag-region>
    <div class="logo" data-tauri-drag-region>
      <div class="logo-dot"></div>
      <span class="logo-text">PromptForge</span>
    </div>
    <div class="titlebar-actions">
      <button class="icon-btn" style="padding:6px" title="切换主题" @click="toggleTheme">
        <Moon v-if="isDark" :size="14" />
        <Sun v-else :size="14" />
      </button>
      <button class="icon-btn" style="padding:6px" title="设置 ⌘," @click="store.openSettings()">
        <SettingsIcon :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 0;
  flex-shrink: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: drag;
}
.logo-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
}
.logo-text {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.titlebar-actions {
  display: flex;
  gap: 2px;
  -webkit-app-region: no-drag;
}
</style>
