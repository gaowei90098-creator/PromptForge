import { usePromptStore } from '../stores/promptforge';
import {
  buildAnalyzeMessages,
  buildGenerateMessages,
  parseAnalyzeResponse,
  type AnalyzeResult,
} from '../lib/metaPrompt';

// cache taskType from last analyze call so generateStreaming can use it
let lastTaskType: AnalyzeResult['taskType'] = 'other';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useApi() {
  const store = usePromptStore();

  function buildUrl(): string {
    const base = store.apiBaseUrl.replace(/\/+$/, '');
    return `${base}/chat/completions`;
  }

  async function chatOnce(messages: ChatMessage[], temperature = 0.7): Promise<string> {
    if (!store.apiKey) throw new Error('未配置 API Key');

    const res = await fetch(buildUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.apiKey}`,
      },
      body: JSON.stringify({
        model: store.model,
        messages,
        temperature,
        stream: false,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }

  async function chatStream(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void,
    temperature = 0.7,
    signal?: AbortSignal,
  ): Promise<string> {
    if (!store.apiKey) throw new Error('未配置 API Key');

    const res = await fetch(buildUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.apiKey}`,
      },
      body: JSON.stringify({
        model: store.model,
        messages,
        temperature,
        stream: true,
      }),
      signal,
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let full = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          /* skip malformed chunks */
        }
      }
    }

    return full;
  }

  async function analyze(userInput: string): Promise<AnalyzeResult> {
    const raw = await chatOnce(buildAnalyzeMessages(userInput), 0.3);
    const parsed = parseAnalyzeResponse(raw);
    if (!parsed) {
      throw new Error('模型返回格式异常，请重试');
    }
    lastTaskType = parsed.taskType;
    return parsed;
  }

  async function generateStreaming(
    userInput: string,
    qa: Array<{ question: string; answer: string }>,
    onDelta: (chunk: string) => void,
    taskType?: AnalyzeResult['taskType'],
    signal?: AbortSignal,
  ): Promise<string> {
    return chatStream(
      buildGenerateMessages(userInput, qa, taskType ?? lastTaskType),
      onDelta,
      0.6,
      signal,
    );
  }

  return { analyze, generateStreaming };
}
