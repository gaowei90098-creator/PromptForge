import { onMounted, onUnmounted } from 'vue';
import { usePromptStore } from '../stores/promptforge';

export function useKeyboard(handlers: {
  onSubmit?: () => void;
  onNewConversation?: () => void;
}) {
  const store = usePromptStore();

  const onKey = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === ',') {
      e.preventDefault();
      store.openSettings();
    } else if (e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handlers.onNewConversation?.();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handlers.onSubmit?.();
    }
  };

  onMounted(() => window.addEventListener('keydown', onKey));
  onUnmounted(() => window.removeEventListener('keydown', onKey));
}
