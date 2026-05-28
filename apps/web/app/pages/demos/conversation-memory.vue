<script setup lang="ts">
const {
  sessionId,
  messages,
  mode,
  errorMessage,
  isRunning,
  systemPrompt,
  createSession,
  loadHistory,
  sendMessage,
} = useChat()
const chatStore = useChatStore()

const inputMessage = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')
const modelName = ref('')
const compressedGroups = ref<{ id: string; turns: string; summary: string }[]>([])
const maxTurns = ref(10)
const useTokenCompress = ref(false)
const showAvatar = ref(true)

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

async function saveConfig() {
  if (!sessionId.value) return
  await chatStore.saveSessionConfig(sessionId.value, {
    maxTurns: maxTurns.value,
    useTokenCompress: useTokenCompress.value,
    systemPrompt: systemPrompt.value,
  })
}

async function loadConfig(sid: string) {
  const cfg = await chatStore.loadSessionConfig(sid)
  if (cfg) {
    maxTurns.value = (cfg as Record<string, number>).maxTurns ?? 10
    useTokenCompress.value = (cfg as Record<string, boolean>).useTokenCompress ?? false
    systemPrompt.value = (cfg as Record<string, string>).systemPrompt ?? ''
  }
}

watch([maxTurns, useTokenCompress, systemPrompt], saveConfig)

async function loadModelInfo() {
  try {
    const res = await $fetch<{ data: { modelName: string } }>(
      `${apiBase.value}/demos/chat/model-info`,
    )
    modelName.value = res.data.modelName
  } catch {
    modelName.value = 'unknown'
  }
}

onMounted(async () => {
  await loadModelInfo()
  await createSession()
  if (sessionId.value) await loadConfig(sessionId.value)
})

async function handleSend() {
  const msg = inputMessage.value.trim()
  if (!msg || isRunning.value) return
  inputMessage.value = ''
  await sendMessage(msg)
}

watch(
  messages,
  async () => {
    await nextTick()
    setTimeout(() => {
      chatContainer.value?.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    }, 300)
  },
  { deep: true },
)

function getLastUserMsgIndex(): number {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]?.role === 'user') return i
  }
  return -1
}

async function copyMessage(content: string) {
  await navigator.clipboard.writeText(content)
}

const estimatedTokens = computed(() =>
  messages.value.reduce((sum, m) => sum + Math.ceil((m.content ?? '').length / 1.8), 0),
)

const trackedKeywords = computed(() => {
  const keywords: { term: string; source: 'user' | 'ai'; count: number }[] = []
  const seen = new Map<string, { source: 'user' | 'ai'; count: number }>()

  for (const msg of messages.value) {
    const terms = extractTerms(msg.content)
    for (const term of terms) {
      const existing = seen.get(term)
      if (existing) {
        existing.count++
      } else {
        seen.set(term, { source: msg.role as 'user' | 'ai', count: 1 })
      }
    }
  }

  for (const [term, data] of seen) {
    keywords.push({ term, source: data.source, count: data.count })
  }
  return keywords.sort((a, b) => b.count - a.count).slice(0, 15)
})

function extractTerms(text: string): string[] {
  const terms: string[] = []
  // Match: quotes, code blocks, proper nouns (2+ uppercase letters followed by word), tech terms
  const patterns = [
    /"([^"]+)"/g, // double-quoted
    /'([^']+)'/g, // single-quoted
    /`([^`]+)`/g, // backtick-quoted
    /\b([A-Z]{2,}[a-z]*(?:\.[A-Z][a-z]*)*)\b/g, // acronyms like API, GIL, JWT
    /\b([A-Z][a-z]+(?:[A-Z][a-z]+)+)\b/g, // CamelCase like PythonAnywhere
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].length > 1 && match[1].length < 50) {
        terms.push(match[1])
      }
    }
  }

  return [...new Set(terms)]
}

const trackedSentences = computed(() => {
  const sentences: string[] = []
  for (const msg of messages.value) {
    const sents = msg.content
      .split(/[。！？\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 100)
      .slice(0, 3)
    sentences.push(...sents)
  }
  return sentences.slice(-8)
})
</script>

<template>
  <UContainer as="main" class="demo-page">
    <UPageHeader
      title="长对话记忆 · 压缩验证"
      description="测试 AI 多轮对话记忆力，达到设定轮数/Token 后自动压缩历史为摘要">
      <template #headline>
        <div class="flex flex-wrap gap-[0.45rem]">
          <UBadge color="primary" variant="soft">Memory & Context</UBadge>
          <UBadge icon="i-lucide-radio" color="primary">Streaming</UBadge>
        </div>
      </template>
      <template #links>
        <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral"
          >返回橱窗</UButton
        >
      </template>
    </UPageHeader>

    <section class="demo-page__body">
      <div class="demo-page__primary">
        <div class="max-h-[500px] overflow-auto">
          <DemoCollapsibleCard
            title="压缩配置"
            icon="i-lucide-settings-2"
            :default-open="true">
            <div class="grid gap-3">
              <div class="flex items-center gap-4 flex-wrap">
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="text-sm text-muted">按轮次</span>
                  <UButton
                    :icon="
                      useTokenCompress ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right'
                    "
                    :color="useTokenCompress ? 'neutral' : 'primary'"
                    variant="ghost"
                    :disabled="isRunning"
                    @click="useTokenCompress = !useTokenCompress" />
                  <span class="text-sm text-muted">按 Token</span>
                </label>

                <template v-if="!useTokenCompress">
                  <span class="text-sm text-muted">压缩轮数</span>
                  <UInput
                    :model-value="String(maxTurns)"
                    type="number"
                    :min="1"
                    :max="100"
                    :step="10"
                    size="sm"
                    class="w-20"
                    :disabled="isRunning"
                    @update:model-value="
                      (v: string) => {
                        const n = Number(v)
                        if (isNaN(n)) return
                        maxTurns = Math.min(100, Math.max(1, n))
                      }
                    " />
                </template>
                <template v-else>
                  <span class="text-sm text-muted">Token 阈值: 70% 时自动压缩</span>
                </template>
              </div>

              <div class="border-t border-black/5 pt-2">
                <UTextarea
                  :model-value="systemPrompt"
                  placeholder="自定义 System Prompt（可选）"
                  :rows="3"
                  :disabled="isRunning"
                  class="w-full max-h-32 overflow-auto"
                  @update:model-value="systemPrompt = String($event ?? '')" />
              </div>
            </div>
          </DemoCollapsibleCard>
        </div>

        <UCard class="chat-card" :ui="{ body: 'p-0 sm:p-0 flex flex-col h-full' }">
          <div
            class="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-black/5">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-message-circle" />
              对话窗口
              <UBadge size="xs" variant="subtle">{{ messages.length }} 条</UBadge>
              <UBadge size="xs" color="primary" variant="soft">{{
                useTokenCompress
                  ? `~${estimatedTokens} tokens`
                  : `轮次 ${Math.ceil(messages.length / 2)}/${maxTurns}`
              }}</UBadge>
            </div>
          </div>

          <div
            ref="chatContainer"
            class="flex-1 overflow-auto p-4 grid gap-3 content-start">
            <div v-if="messages.length === 0" class="text-center text-muted py-8">
              <UIcon name="i-lucide-brain" class="text-3xl mb-2 opacity-30" />
              <p>开始多轮对话，观察 AI 记忆表现</p>
            </div>

            <div v-for="(msg, i) in messages" :key="i">
              <ChatMessageItem
                :message="msg"
                :show-avatar="showAvatar"
                :is-last-user="msg.role === 'user' && i === getLastUserMsgIndex()"
                :disabled="isRunning"
                @copy="copyMessage"
                @edit="() => {}"
                @quote="() => {}" />
            </div>

            <div
              v-if="mode === 'streaming'"
              class="flex items-center gap-2 text-muted text-sm px-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              正在回复...
            </div>
          </div>

          <div class="border-t border-black/5">
            <div class="flex gap-2 p-4">
              <UTextarea
                v-model="inputMessage"
                placeholder="输入消息，Ctrl+Enter 发送"
                :disabled="isRunning"
                :rows="1"
                autoresize
                size="sm"
                class="flex-1 chat-textarea"
                @keydown="
                  (e: KeyboardEvent) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault()
                      handleSend()
                    }
                  }
                " />
            </div>
            <div class="flex items-center gap-2 px-4 pb-2.5">
              <UButton
                icon="i-lucide-send"
                color="primary"
                :disabled="isRunning || !inputMessage.trim()"
                size="sm"
                @click="handleSend"
                >发送</UButton
              >
            </div>
          </div>
        </UCard>

        <DemoCollapsibleCard title="历史总结" icon="i-lucide-archive">
          <div v-if="compressedGroups.length === 0" class="text-sm text-muted">
            暂无压缩记录
          </div>
          <div
            v-for="g in compressedGroups"
            :key="g.id"
            class="mb-2 p-2 rounded bg-muted text-xs leading-relaxed">
            <span class="font-semibold text-primary">{{ g.turns }}</span>
            <p class="mt-0.5">
              {{ g.summary.slice(0, 200) }}{{ g.summary.length > 200 ? '...' : '' }}
            </p>
          </div>
        </DemoCollapsibleCard>

        <DemoCollapsibleCard title="关键变量追踪" icon="i-lucide-eye">
          <div v-if="trackedKeywords.length === 0" class="text-sm text-muted">
            开始对话后将自动提取关键术语
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <span
              v-for="kw in trackedKeywords"
              :key="kw.term"
              class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.75rem] font-semibold"
              :class="
                kw.source === 'user'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted'
              ">
              {{ kw.term }}
              <span class="opacity-50 text-[0.65rem]">×{{ kw.count }}</span>
            </span>
          </div>
        </DemoCollapsibleCard>

        <DemoCollapsibleCard title="关键语句" icon="i-lucide-quote">
          <div v-if="trackedSentences.length === 0" class="text-sm text-muted">
            暂无关键语句
          </div>
          <div
            v-for="(s, i) in trackedSentences"
            :key="i"
            class="text-xs text-muted leading-relaxed mb-1.5 pb-1.5 border-b border-black/5 last:border-0 last:mb-0 last:pb-0">
            {{ s }}
          </div>
        </DemoCollapsibleCard>
      </div>

      <aside class="demo-page__side">
        <DemoInsightPanel
          :demo="{
            id: 'conversation-memory',
            title: '长对话记忆 · 压缩验证',
            description: '',
            learningGoal:
              '理解长对话记忆管理核心机制：对话摘要压缩、Token-aware 上下文窗口。核心技术：Summarization Chain、Session Manager。',
            category: 'Memory & Context',
            tags: [],
            routePath: '',
            apiNamespace: '',
            displayMode: 'custom-page',
            ownerPackage: '',
            supportsStreaming: true,
            inputFields: [],
            knownLimits: ['压缩后清除完整历史', '摘要质量依赖 AI'],
          }"
          :pipeline-steps="[
            {
              icon: 'i-lucide-message-square',
              label: '用户输入',
              detail: '消息 → Schema 校验 → 轮次计数器 +1',
              color: '#0f766e',
            },
            {
              icon: 'i-lucide-brain',
              label: '上下文注入',
              detail: 'buildSystemPrompt() 将压缩历史摘要注入 System Prompt',
              color: '#0d9488',
            },
            {
              icon: 'i-lucide-link-2',
              label: 'AI 调用',
              detail: 'model.invoke/stream → OpenAI-compatible API',
              color: '#6366f1',
            },
            {
              icon: 'i-lucide-scroll-text',
              label: '自动压缩',
              detail: '达 maxTurns 后调 SUMMARIZE_PROMPT 生成摘要 → 重置计数器',
              color: '#f59e0b',
            },
            {
              icon: 'i-lucide-archive',
              label: '持久化',
              detail: '摘要存入 summaries Map，前端展示历史总结',
              color: '#dc2626',
            },
          ]"
          :code-analysis-items="[
            {
              file: 'schema.ts',
              title: 'Zod 校验',
              desc: 'maxTurns 1-100 可选压缩轮数，compressByToken 预留 Token 压缩开关。',
            },
            {
              file: 'memory-chat.service.ts',
              title: '压缩服务',
              desc: 'autoSummarize() 调 AI 生成摘要 → 注入 buildSystemPrompt() → 后续对话携带压缩上下文。',
            },
            {
              file: 'system.ts',
              title: 'Prompts',
              desc: 'SUMMARIZE_PROMPT 压缩模板：提取关键事实、按主题分段、压缩至 30% 以内。',
            },
          ]"
          :tech-tags="[
            { name: 'Memory', desc: '上下文记忆' },
            { name: 'Summarization', desc: '对话摘要' },
            { name: 'Token-aware', desc: 'Token 感知' },
            { name: 'SSE', desc: '流式输出' },
          ]" />
      </aside>
    </section>
  </UContainer>
</template>

<style scoped>
.demo-page {
  --ui-container: 1920px;
  padding-block: 1rem 4rem;
}
.demo-page__body {
  display: grid;
  align-items: start;
  gap: 1rem;
}
.demo-page__primary {
  display: grid;
  gap: 1rem;
}
.demo-page__side {
  display: grid;
  gap: 1rem;
}
.chat-card {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  max-height: 640px;
  width: 100%;
}
.chat-textarea {
  max-height: 8rem;
}
@media (min-width: 1024px) {
  .demo-page__body {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  .demo-page__primary {
    grid-column: span 7;
  }
  .demo-page__side {
    grid-column: span 5;
  }
}
</style>
