<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, X } from 'lucide-vue-next';
import { usePromptStore } from '../stores/promptforge';

const store = usePromptStore();
const show = computed(() => !!store.errorMessage);
</script>

<template>
  <div :class="['error-banner', { show }]">
    <AlertCircle :size="13" style="flex-shrink:0" />
    <span>{{ store.errorMessage }}</span>
    <button class="icon-btn" style="margin-left:auto;padding:2px" @click="store.clearError()">
      <X :size="13" />
    </button>
  </div>
</template>

<style scoped>
.error-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: rgba(239, 68, 68, 0.08);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--red-error);
  transform: translateY(-100%);
  transition: transform 200ms ease-out;
}
.error-banner.show { transform: translateY(0); }
</style>
