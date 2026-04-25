import { defineStore } from 'pinia';

export type AppView = 'input' | 'ask' | 'result';
export type ThemePref = 'dark' | 'light' | 'auto';
export type Language = 'zh' | 'en';
export type TaskType = 'code' | 'copy' | 'analysis' | 'creative' | 'design' | 'other';

export interface Question {
  id: number;
  title: string;
  options: string[];
}

interface State {
  currentView: AppView;
  theme: ThemePref;
  language: Language;

  userInput: string;

  questions: Question[];
  answers: Record<number, string>;
  currentQuestion: number;
  taskType: TaskType;

  optimizedPrompt: string;
  isLoading: boolean;
  streamingActive: boolean;

  apiKey: string;
  apiBaseUrl: string;
  model: string;

  todayCount: number;
  countDate: string;
  apiConnected: boolean;
  errorMessage: string | null;
  settingsOpen: boolean;
}

const STORAGE_KEY = 'promptforge:v1';

function loadPersisted(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export const usePromptStore = defineStore('promptforge', {
  state: (): State => {
    const persisted = loadPersisted();
    return {
      currentView: 'input',
      theme: (persisted.theme as ThemePref) ?? 'dark',
      language: (persisted.language as Language) ?? 'zh',

      userInput: '',

      questions: [],
      answers: {},
      currentQuestion: 1,
      taskType: 'other' as TaskType,

      optimizedPrompt: '',
      isLoading: false,
      streamingActive: false,

      apiKey: '',
      apiBaseUrl: persisted.apiBaseUrl ?? 'https://api.openai.com/v1',
      model: persisted.model ?? 'gpt-4o-mini',

      todayCount: persisted.todayCount ?? 0,
      countDate: persisted.countDate ?? '',
      apiConnected: false,
      errorMessage: null,
      settingsOpen: false,
    };
  },

  getters: {
    hasApiKey: (s) => s.apiKey.trim().length > 0,
    allAnswered: (s) =>
      s.questions.length > 0 &&
      s.questions.every((q) => (s.answers[q.id] ?? '').trim().length > 0),
  },

  actions: {
    persist() {
      const snapshot = {
        theme: this.theme,
        language: this.language,
        apiBaseUrl: this.apiBaseUrl,
        model: this.model,
        todayCount: this.todayCount,
        countDate: this.countDate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    },

    goTo(view: AppView) {
      this.currentView = view;
    },

    setTheme(pref: ThemePref) {
      this.theme = pref;
      this.persist();
    },

    setLanguage(lang: Language) {
      this.language = lang;
      this.persist();
    },

    saveSettings(patch: Partial<Pick<State, 'apiKey' | 'apiBaseUrl' | 'model'>>) {
      Object.assign(this, patch);
      this.persist();
    },

    setQuestions(qs: Question[], type: TaskType = 'other') {
      this.questions = qs;
      this.answers = {};
      this.currentQuestion = qs.length > 0 ? qs[0].id : 1;
      this.taskType = type;
    },

    answer(id: number, value: string) {
      this.answers = { ...this.answers, [id]: value };
    },

    incrementToday() {
      const today = new Date().toLocaleDateString();
      if (this.countDate !== today) {
        this.todayCount = 0;
        this.countDate = today;
      }
      this.todayCount += 1;
      this.persist();
    },

    newConversation() {
      this.userInput = '';
      this.questions = [];
      this.answers = {};
      this.currentQuestion = 1;
      this.taskType = 'other';
      this.optimizedPrompt = '';
      this.isLoading = false;
      this.streamingActive = false;
      this.errorMessage = null;
      this.currentView = 'input';
    },

    showError(msg: string) {
      this.errorMessage = msg;
    },
    clearError() {
      this.errorMessage = null;
    },
    openSettings() {
      this.settingsOpen = true;
    },
    closeSettings() {
      this.settingsOpen = false;
    },
  },
});
