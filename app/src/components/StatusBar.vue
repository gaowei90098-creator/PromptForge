<script setup lang="ts">
import { computed } from 'vue';
import { usePromptStore } from '../stores/promptforge';

defineProps<{ showCount?: boolean }>();

const store = usePromptStore();
const connected = computed(() => store.hasApiKey);
</script>

<template>
  <div class="status-bar">
    <span style="display:flex;align-items:center;gap:6px">
      <span :class="['status-dot', connected ? 'pulse' : 'off']"></span>
      {{ connected ? 'API 已连接' : '未配置 API Key' }}
    </span>
    <span v-if="showCount">
      今日已优化 <strong style="color:var(--text-secondary)">{{ store.todayCount }}</strong> 次
    </span>
    <span style="margin-left:auto">v0.1.0</span>
  </div>
</template>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid var(--border-subtle);
  padding: 6px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 10px;
  color: var(--text-faint);
}
</style>
