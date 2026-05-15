<script setup lang="ts">
const { sessionId, messages, mode, errorMessage, isRunning, createSession, loadHistory, deleteSession: deleteChatSession, sendMessage } = useChat()
const chatStore = useChatStore()

const inputMessage = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')

onMounted(async () => {
  await chatStore.loadAll()
  if (chatStore.sessions.value.length > 0) {
    // Load most recent session
    const recent = chatStore.sessions.value[0]
    if (recent) await loadHistory(recent.id)
  } else {
    await createSession()
    await chatStore.save({
      id: sessionId.value!,
      title: '新对话',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    })
  }
})

async function handleNewSession() {
  const sid = await createSession()
  await chatStore.save({
    id: sid,
    title: '新对话',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  })
}

async function handleSelectSession(sid: string) {
  await loadHistory(sid)
}

async function handleDeleteSession(sid: string) {
  await deleteChatSession(sid)
  await chatStore.remove(sid)
}

async function handleSend() {
  const msg = inputMessage.value.trim()
  if (!msg || isRunning.value) return
  inputMessage.value = ''

  await sendMessage(msg)

  if (sessionId.value) {
    const firstUserMsg = messages.value.find(m => m.role === 'user')
    await chatStore.save({
      id: sessionId.value,
      title: firstUserMsg?.content?.slice(0, 30) || '新对话',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    })
  }
}

watch(messages, async () => {
  await nextTick()
  chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
}, { deep: true })

const pipelineSteps = [
  { icon: 'i-lucide-message-square', label: '用户输入', detail: 'Vue v-model 绑定输入框 → Enter/点击发送 → useChat.sendMessage() 触发', color: '#0f766e' },
  { icon: 'i-lucide-shield-check', label: 'Schema 校验', detail: 'Zod chatMessageSchema 校验 sessionId + message + 可选 systemPrompt/temperature', color: '#0891b2' },
  { icon: 'i-lucide-brain', label: '上下文组装', detail: 'ChatService 从 SessionManager 读取历史 → SystemMessage + 最近20条 Human/AI → HumanMessage', color: '#0d9488' },
  { icon: 'i-lucide-link-2', label: 'LangChain 调用', detail: 'model.stream(messages) → ChatOpenAI → OpenAI-compatible API', color: '#6366f1' },
  { icon: 'i-lucide-radio', label: 'SSE 流式返回', detail: 'DemosController prepareSseResponse → writeSseEvent token/done/error → 前端 ReadableStream 逐帧解析', color: '#dc2626' },
]

const codeAnalysisItems = [
  { file: 'schema.ts', title: 'Zod 校验', desc: 'chatMessageSchema：sessionId + message 必填，systemPrompt 可选覆盖默认角色设定，temperature 0-2 可选。' },
  { file: 'chat.service.ts', title: '对话服务', desc: '实现 DemoRunner 接口。run() 走完整响应，stream() 逐 token yield。buildHistoryMessages() 读取最近 20 条消息注入上下文。系统 prompt 通过 defaultPrompt 参数传入，支持用户自定义覆盖。' },
  { file: 'useChat.ts', title: '前端状态机', desc: '管理 sessionId / messages / mode 状态。sendMessage() 调用 POST /stream + fetch ReadableStream 解析 SSE 帧。mode 流转：idle→streaming→done/error。loadHistory() 从 API 恢复历史。' },
  { file: 'useChatStore.ts', title: 'IndexedDB 会话列表', desc: '独立 DB（ai-journey-land-chat），存 session 元信息（id/title/createdAt/lastActiveAt）。lastActiveAt 索引用于倒序排列会话列表。save() 自动 upsert。' },
]

const techTags = [
  { name: 'Multi-turn Chat', desc: '多轮对话' },
  { name: 'System Prompt', desc: '角色设定' },
  { name: 'Memory/Context', desc: '上下文记忆' },
  { name: 'SSE Streaming', desc: '流式输出' },
  { name: 'Session Manager', desc: '会话管理' },
]
</script>

<template>
  <UContainer as="main" class="demo-page">
    <UPageHeader title="多轮对话 · AI 助手" description="与 AI 进行连续多轮对话，AI 保持上下文记忆并流式返回">
      <template #headline>
        <div class="flex flex-wrap gap-[0.45rem]">
          <UBadge color="primary" variant="soft">Conversational AI</UBadge>
          <UBadge icon="i-lucide-radio" color="primary">Streaming</UBadge>
          <UBadge color="neutral" variant="soft">custom-page</UBadge>
        </div>
      </template>
      <template #links>
        <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral">返回橱窗</UButton>
      </template>
    </UPageHeader>

    <section class="demo-page__body">
      <div class="demo-page__primary">
        <UCard class="flex-1 flex flex-col" :ui="{ body: 'p-0 sm:p-0 flex-1 flex flex-col' }">
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-black/5">
            <div class="flex items-center gap-2 font-extrabold">
              <UIcon name="i-lucide-message-circle" />
              <span>对话</span>
            </div>
            <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" :disabled="isRunning" @click="handleNewSession">新会话</UButton>
          </div>

          <div ref="chatContainer" class="flex-1 overflow-auto p-4 grid gap-3 content-start min-h-[24rem] max-h-[28rem]">
            <div v-if="messages.length === 0" class="text-center text-[var(--ui-text-muted)] py-8">
              <UIcon name="i-lucide-message-circle" class="text-3xl mb-2 opacity-30" />
              <p>开始对话吧</p>
            </div>

            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed"
                :class="msg.role === 'user'
                  ? 'bg-[var(--ui-primary)] text-white'
                  : 'bg-[var(--ui-bg-muted)] text-[var(--ui-text-highlighted)]'"
              >
                {{ msg.content }}
              </div>
            </div>

            <div v-if="mode === 'streaming'" class="flex items-center gap-2 text-[var(--ui-text-muted)] text-sm px-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--ui-primary)] animate-pulse" />
              正在回复...
            </div>

            <UAlert
              v-if="errorMessage"
              icon="i-lucide-circle-alert"
              color="error"
              variant="soft"
              :description="errorMessage"
            />
          </div>

          <div class="border-t border-black/5 px-4 py-3">
            <form class="flex gap-2" @submit.prevent="handleSend">
              <UInput
                v-model="inputMessage"
                placeholder="输入消息，Enter 发送..."
                :disabled="isRunning"
                class="flex-1"
                size="sm"
              />
              <UButton type="submit" icon="i-lucide-send" color="primary" :disabled="isRunning || !inputMessage.trim()" size="sm">
                发送
              </UButton>
            </form>
          </div>
        </UCard>

        <UCard v-if="chatStore.sessions.value.length > 0">
          <template #header>
            <div class="flex items-center gap-2 font-extrabold">
              <UIcon name="i-lucide-history" />
              <span>会话历史</span>
              <UBadge color="neutral" variant="subtle" size="xs">{{ chatStore.sessions.value.length }}</UBadge>
            </div>
          </template>

          <div class="grid gap-1">
            <div
              v-for="s in chatStore.sessions.value"
              :key="s.id"
              class="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-[var(--ui-bg-muted)] cursor-pointer"
              :class="{ 'bg-[var(--ui-bg-muted)]': s.id === sessionId }"
              @click="handleSelectSession(s.id)"
            >
              <span class="text-sm truncate flex-1 min-w-0">{{ s.title }}</span>
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click.stop="handleDeleteSession(s.id)" />
            </div>
          </div>
        </UCard>
      </div>

      <DemoInsightPanel
        :demo="{
          id: 'chat',
          title: '多轮对话 · AI 助手',
          description: '',
          learningGoal: '理解多轮对话核心：System Prompt 角色设定、Chat History 上下文管理、Session 生命周期、SSE Streaming 流式输出。',
          category: 'Conversational AI',
          tags: [],
          routePath: '',
          apiNamespace: '',
          displayMode: 'custom-page',
          ownerPackage: '',
          supportsStreaming: true,
          inputFields: [],
          knownLimits: ['服务端内存会话，重启丢失', 'RAG 待实现'],
        }"
        :pipeline-steps="pipelineSteps"
        :code-analysis-items="codeAnalysisItems"
        :tech-tags="techTags"
      />
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

@media (min-width: 1024px) {
  .demo-page__body {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .demo-page__primary {
    grid-column: span 7;
  }
}
</style>
