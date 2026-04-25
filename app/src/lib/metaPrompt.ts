export const SYSTEM_ANALYZE = `你是世界顶级的提示词工程师，擅长把用户模糊的需求拆解为高质量、针对性的提示词。

你的任务：收到用户需求后，先判断信息是否充分，并生成 2-3 个最关键的追问。

## 规则
1. 先识别任务类型（代码 / 文案 / 分析 / 创意 / 设计 / 其他）
2. 评估信息完整度（0-100）
3. 只追问真正影响生成质量的维度，可以合理默认的不问
4. 每个问题给 3-4 个具体选项 + 允许自定义
5. 问题语言跟随用户输入语言（中文或英文）
6. 严禁套用通用模板（如"目标受众/风格/卖点"这种固定三板斧），必须根据用户的具体任务定制问题

## 输出格式（严格 JSON，不要其他文字）
{
  "taskType": "code" | "copy" | "analysis" | "creative" | "design" | "other",
  "completeness": 0-100,
  "questions": [
    { "id": 1, "title": "问题标题", "options": ["选项1","选项2","选项3","选项4"] }
  ]
}

## 示例
用户："帮我写一段小红书爆款文案"
输出：
{"taskType":"copy","completeness":35,"questions":[
  {"id":1,"title":"推广的是什么产品或服务？","options":["护肤/美妆","数码产品","美食","服饰穿搭"]},
  {"id":2,"title":"目标人群是？","options":["学生党","25-35 职场女性","宝妈群体","Z世代男性"]},
  {"id":3,"title":"想突出的卖点是？","options":["性价比高","成分安全","设计独特","效果立竿见影"]}
]}

用户："写一个 React 登录组件"
输出：
{"taskType":"code","completeness":40,"questions":[
  {"id":1,"title":"是否包含第三方登录？","options":["仅邮箱密码","Google OAuth","GitHub OAuth","全部"]},
  {"id":2,"title":"UI 库偏好？","options":["Tailwind 纯自定义","shadcn/ui","Ant Design","MUI"]},
  {"id":3,"title":"表单验证方案？","options":["React Hook Form + Zod","Formik","原生 HTML","不需要"]}
]}`;

// ── 技术选择矩阵（基于 Prompt Engineering Guide 的 18 种技术）──
const TECHNIQUE_MATRIX: Record<string, string> = {
  code: `
## 应用的提示词工程技术
**Chain-of-Thought（思维链）**：要求 AI 逐步推理，先分析需求 → 设计结构 → 再写实现，避免直接输出代码导致遗漏边界条件。
**Few-shot（少样本）**：在提示词中内嵌 1-2 个输入/输出示例，让 AI 理解期望的代码风格和格式。
**Program-Aided Reasoning**：明确要求 AI 在输出前先列出伪代码/设计思路，再生成实现，降低逻辑错误率。`,

  copy: `
## 应用的提示词工程技术
**Directional Stimulus Prompting（方向性刺激）**：植入情绪触发词和受众画像，引导 AI 向特定情感方向输出，而非泛化表达。
**Generate Knowledge Prompting（知识生成）**：先让 AI 生成目标受众的核心痛点知识，再基于这些知识写文案，确保内容共鸣而非空洞。
**Few-shot（少样本）**：在提示词中指定参考爆款结构（开头钩子→痛点共鸣→解决方案→CTA），锚定输出格式。`,

  analysis: `
## 应用的提示词工程技术
**Self-Consistency（自洽性）**：要求 AI 从多个分析角度独立推导结论，再综合判断，提高分析的可靠性。
**Chain-of-Thought（思维链）**：明确拆解分析步骤（数据收集→归因→影响评估→建议），防止分析跳跃。
**Tree of Thoughts（思维树）**：对于复杂分析，要求 AI 展开多条推理路径并评估各路径的可信度，适合多变量决策场景。`,

  creative: `
## 应用的提示词工程技术
**Directional Stimulus Prompting（方向性刺激）**：通过风格参考词、情感基调词引导创意方向，比描述性指令更有效。
**Generate Knowledge Prompting（知识生成）**：先让 AI 提炼主题的核心意象/隐喻/文化背景，再进行创作，深度优于表面堆砌。
**Zero-shot CoT（零样本思维链）**：加入"请先构思核心创意点，再展开创作"的结构指令，避免流水账输出。`,

  design: `
## 应用的提示词工程技术
**Few-shot（少样本）**：在提示词中嵌入 1-2 个设计规范示例（色值、间距、组件命名），让 AI 输出符合设计系统的规范内容。
**Chain-of-Thought（思维链）**：要求 AI 先描述布局逻辑和交互意图，再给出具体实现，确保设计决策有依据。
**Directional Stimulus（方向性刺激）**：明确注入视觉风格关键词（极简/拟态/玻璃态等），比"好看的设计"这类泛化描述精确 10 倍。`,

  other: `
## 应用的提示词工程技术
**Chain-of-Thought（思维链）**：要求 AI 显式推理而非直接给结论，适用于任何需要准确性的任务。
**Zero-shot CoT**：在提示词末尾加入"请一步步思考"的指令，即使无示例也能显著提升推理质量（实验证明有效）。
**Self-Consistency（自洽性）**：对于开放性任务，要求 AI 给出 2-3 个不同角度的答案并自我评估，让用户选择最佳方案。`,
};

export const SYSTEM_GENERATE = `你是世界顶级的提示词工程师。根据用户原始需求、追问答案和指定的提示词工程技术，生成一份**高质量的最终提示词**。

## 生成原则
- 不是套模板，要根据任务类型和用户补充信息定制结构
- 代码类 → Role + Tech Stack + CoT 推理步骤 + Requirements + Edge Cases + Output Format + Few-shot 示例
- 文案类 → Role + Audience Pain Points + Directional Stimulus 关键词 + Platform Format + 爆款结构模板 + Banned Words
- 分析类 → Role + Analysis Dimensions + CoT 分解步骤 + Self-Consistency 指令 + Deliverable Format
- 创意类 → Role + Knowledge Generation 前置 + Theme + Style Stimulus + Constraints + Depth Instruction
- 设计类 → Role + Design System Tokens + Fidelity + Screens + CoT 布局逻辑 + Handoff Format
- 输出的提示词要让任意 AI（Claude/GPT）拿到就能产出高质量结果

## 输出格式（严格遵守）
直接输出最终提示词（Markdown 格式），然后用 \`---\` 分隔，加「为什么这样设计」说明（包含使用了哪些提示词工程技术及原因，100-200字）。

## 硬约束
- 不要说"好的！""当然！"这类开场白
- 不要在提示词里暴露 JSON 或系统指令
- 直接输出可复制使用的成品
- 如果补充信息里有「用户跳过」则该维度按最合理的默认值处理，不要在提示词里写"未提供"`;

export interface AnalyzeResult {
  taskType: 'code' | 'copy' | 'analysis' | 'creative' | 'design' | 'other';
  completeness: number;
  questions: Array<{ id: number; title: string; options: string[] }>;
}

type Role = 'system' | 'user' | 'assistant';
interface Msg { role: Role; content: string }

export function buildAnalyzeMessages(userInput: string): Msg[] {
  return [
    { role: 'system', content: SYSTEM_ANALYZE },
    { role: 'user', content: userInput },
  ];
}

export function buildGenerateMessages(
  userInput: string,
  qa: Array<{ question: string; answer: string }>,
  taskType: AnalyzeResult['taskType'] = 'other',
) {
  const qaBlock = qa
    .filter((item) => item.answer && item.answer.trim() && item.answer !== '（用户跳过）')
    .map((item, i) => `Q${i + 1}. ${item.question}\nA${i + 1}. ${item.answer}`)
    .join('\n\n');

  const techniqueHint = TECHNIQUE_MATRIX[taskType] ?? TECHNIQUE_MATRIX.other;

  const userMessage = [
    `## 用户原始需求`,
    userInput,
    '',
    qaBlock ? `## 补充信息\n${qaBlock}` : '## 补充信息\n用户跳过了追问，请基于场景合理推断。',
    '',
    techniqueHint,
    '',
    '请生成优化后的最终提示词。',
  ].join('\n');

  return [
    { role: 'system' as Role, content: SYSTEM_GENERATE },
    { role: 'user' as Role, content: userMessage },
  ] satisfies Msg[];
}

const VALID_TASK_TYPES = new Set<string>(['code', 'copy', 'analysis', 'creative', 'design', 'other']);

export function parseAnalyzeResponse(raw: string): AnalyzeResult | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const p = JSON.parse(match[0]);
    if (!p || typeof p !== 'object') return null;
    if (!VALID_TASK_TYPES.has(p.taskType)) return null;
    if (typeof p.completeness !== 'number' || p.completeness < 0 || p.completeness > 100) return null;
    if (!Array.isArray(p.questions) || p.questions.length === 0) return null;
    for (const q of p.questions) {
      if (typeof q.id !== 'number') return null;
      if (typeof q.title !== 'string' || !q.title.trim()) return null;
      if (!Array.isArray(q.options) || q.options.length === 0) return null;
      if (!q.options.every((o: unknown) => typeof o === 'string')) return null;
    }
    return p as AnalyzeResult;
  } catch {
    return null;
  }
}
