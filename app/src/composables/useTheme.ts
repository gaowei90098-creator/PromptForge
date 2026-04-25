import { watchEffect } from 'vue';
import { usePromptStore } from '../stores/promptforge';

export function useTheme() {
  const store = usePromptStore();

  const apply = () => {
    const pref = store.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = pref === 'dark' || (pref === 'auto' && prefersDark);

    if (useDark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  };

  watchEffect(apply);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', apply);

  const toggle = () => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    store.setTheme(next);
  };

  return { toggle };
}
