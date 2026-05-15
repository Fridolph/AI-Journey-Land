<script setup lang="ts">
const {
  sessionId, messages, mode, errorMessage, isRunning,
  systemPrompt, temperature,
  createSession, loadHistory, deleteSession: deleteChatSession, sendMessage,
} = useChat()

const chatStore = useChatStore()

const inputMessage = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')
const modelName = ref('')
const modelProvider = ref('')
const advancedEnabled = ref(false)
const showAvatar = ref(false)
const editingMessage = ref(false)
const editContent = ref('')

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

async function loadModelInfo() {
  try {
    const res = await $fetch<{ data: { modelName: string; provider: string } }>(
      `${apiBase.value}/demos/chat/model-info`,
    )
    modelName.value = res.data.modelName
    modelProvider.value = res.data.provider
  } catch {
    modelName.value = 'unknown'
    modelProvider.value = 'unknown'
  }
}

onMounted(async () => {
  await loadModelInfo()
  await chatStore.loadAll()
  if (chatStore.sessions.value.length > 0) {
    const recent = chatStore.sessions.value[0]
    if (recent) {
      await loadHistory(recent.id)
      // 从 IndexedDB 恢复消息
      const savedMessages = await chatStore.loadMessages(recent.id)
      if (savedMessages.length > 0) messages.value = savedMessages
    }
  } else {
    await createSession()
    if (sessionId.value) {
      await chatStore.save({ id: sessionId.value, title: '新对话', createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() })
    }
  }
})

// 消息变化时自动持久化
watch(messages, () => {
  if (sessionId.value && messages.value.length > 0) {
    chatStore.saveMessages(sessionId.value, [...messages.value])
  }
}, { deep: true })

async function handleNewSession() {
  const sid = await createSession()
  await chatStore.save({ id: sid, title: '新对话', createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() })
}

async function handleSelectSession(sid: string) {
  await loadHistory(sid)
}

async function handleDeleteSession(sid: string) {
  await deleteChatSession(sid)
  await chatStore.remove(sid)
}

function getLastUserMsgIndex(): number {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]?.role === 'user') return i
  }
  return -1
}

function startEditMessage() {
  const idx = getLastUserMsgIndex()
  if (idx === -1) return
  const msg = messages.value[idx]
  if (!msg) return
  editContent.value = msg.content
  editingMessage.value = true
}

async function confirmEdit() {
  if (!editContent.value.trim()) return
  const idx = getLastUserMsgIndex()
  if (idx === -1) return
  // Remove user message and any AI response after it
  messages.value = messages.value.slice(0, idx)
  editingMessage.value = false
  inputMessage.value = editContent.value
  await handleSend()
}

function cancelEdit() {
  editingMessage.value = false
  editContent.value = ''
}

async function copyMessage(content: string) {
  await navigator.clipboard.writeText(content)
}

async function handleSend() {
  const msg = inputMessage.value.trim()
  if (!msg || isRunning.value) return
  if (msg.length > 10000) return
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

const estimatedTokens = computed(() => {
  const total = messages.value.reduce((sum, m) => sum + Math.ceil((m.content ?? '').length / 1.8), 0)
  return total
})

const pipelineSteps = [
  { icon: 'i-lucide-message-square', label: '用户输入', detail: 'Vue v-model 绑定输入框 → Enter/点击发送 → useChat.sendMessage() 触发', color: '#0f766e' },
  { icon: 'i-lucide-shield-check', label: 'Schema 校验', detail: 'Zod chatMessageSchema 校验 sessionId + message + 可选 systemPrompt/temperature', color: '#0891b2' },
  { icon: 'i-lucide-brain', label: '上下文组装', detail: 'ChatService 从 SessionManager 读取历史 → SystemMessage + 最近20条 Human/AI → HumanMessage', color: '#0d9488' },
  { icon: 'i-lucide-link-2', label: 'LangChain 调用', detail: 'model.stream(messages) → ChatOpenAI → OpenAI-compatible API', color: '#6366f1' },
  { icon: 'i-lucide-radio', label: 'SSE 流式返回', detail: 'DemosController prepareSseResponse → writeSseEvent token/done/error → 前端 ReadableStream 逐帧解析', color: '#dc2626' },
]

const codeAnalysisItems = [
  { file: 'schema.ts', title: 'Zod 校验', desc: 'chatMessageSchema：sessionId + message 必填，systemPrompt 可选覆盖默认角色设定，temperature 0-2 可选。' },
  { file: 'chat.service.ts', title: '对话服务', desc: 'prepare() 统一处理：parseInput → ensureSession（不存在即创建）→ createModel → buildHistoryMessages。run() 走 invoke，stream() 走 yield。' },
  { file: 'useChat.ts', title: '前端状态机', desc: 'sendMessage() 调用 POST /stream + fetch ReadableStream + SSE 帧解析。mode 流转 idle→streaming→done/error。systemPrompt/temperature 实时透传。' },
  { file: 'useChatStore.ts', title: 'IndexedDB 会话列表', desc: '独立 DB（ai-journey-land-chat），存 session 元信息（id/title/createdAt/lastActiveAt）。ChatConfigCard 自定义人设切换即时生效。' },
]

const techTags = [
  { name: 'Multi-turn Chat', desc: '多轮对话' },
  { name: 'System Prompt', desc: '角色设定' },
  { name: 'Memory/Context', desc: '上下文记忆' },
  { name: 'SSE Streaming', desc: '流式输出' },
  { name: 'Session Manager', desc: '会话管理' },
]

const demoMeta = {
  id: 'chat', title: '多轮对话 · AI 助手', description: '',
  learningGoal: '理解多轮对话核心：System Prompt 角色设定、Chat History 上下文管理、Session 生命周期、SSE Streaming 流式输出。',
  category: 'Conversational AI', tags: [], routePath: '', apiNamespace: '',
  displayMode: 'custom-page' as const, ownerPackage: '', supportsStreaming: true,
  inputFields: [], knownLimits: ['服务端内存会话，重启丢失', 'RAG 待实现'],
}
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
        <ChatSessionPanel
          :sessions="chatStore.sessions.value"
          :current-session-id="sessionId"
          :is-loading="chatStore.isLoading.value"
          @select="handleSelectSession"
          @delete="handleDeleteSession"
          @create="handleNewSession"
        />

        <UCard class="chat-card" :ui="{ body: 'p-0 sm:p-0 flex flex-col h-full' }">
          <div ref="chatContainer" class="flex-1 overflow-auto p-4 grid gap-3 content-start">
            <div v-if="messages.length === 0" class="text-center text-muted py-8">
              <UIcon name="i-lucide-message-circle" class="text-3xl mb-2 opacity-30" />
              <p>开始对话吧</p>
            </div>

            <div v-for="(msg, i) in messages" :key="i" class="flex gap-2" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div v-if="showAvatar && msg.role === 'assistant'" class="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>

              <div class="group relative" :class="msg.role === 'user' ? 'order-first' : ''">
                <div
                  class="max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed"
                  :class="msg.role === 'user'
                    ? 'bg-primary text-white ml-auto'
                    : 'bg-muted text-highlighted'"
                >
                  {{ msg.content }}
                </div>

                <div
                  v-if="msg.role === 'user' && i === getLastUserMsgIndex() && !isRunning"
                  class="absolute -bottom-1 left-0 translate-y-full flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <UTooltip text="编辑并重新发送">
                    <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" @click="startEditMessage" />
                  </UTooltip>
                  <UTooltip text="复制">
                    <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="copyMessage(msg.content)" />
                  </UTooltip>
                </div>
              </div>

              <div v-if="showAvatar && msg.role === 'user'" class="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-400 flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
            </div>

            <div v-if="mode === 'streaming'" class="flex items-center gap-2 text-muted text-sm px-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              正在回复...
            </div>

            <UAlert v-if="errorMessage" icon="i-lucide-circle-alert" color="error" variant="soft" :description="errorMessage" />
          </div>

          <div v-if="editingMessage" class="flex items-center gap-2 px-4 py-2 border-t border-black/5 bg-amber-50">
            <UIcon name="i-lucide-pencil" class="text-amber-600 text-sm" />
            <UTextarea v-model="editContent" :rows="1" autoresize size="xs" class="flex-1" :disabled="isRunning" />
            <UButton size="xs" color="primary" variant="solid" :disabled="isRunning" @click="confirmEdit">发送</UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="cancelEdit">取消</UButton>
          </div>

          <div class="border-t border-black/5">
            <div class="flex gap-2 p-4">
              <UTextarea
                v-model="inputMessage"
                placeholder="输入消息，Ctrl+Enter 发送 · 最多 10000 字"
                :disabled="isRunning"
                :rows="1"
                :maxlength="10000"
                autoresize
                size="sm"
                class="flex-1 chat-textarea"
                @keydown="(e: KeyboardEvent) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleSend() } }"
              />
            </div>

            <ChatQuickConfig :show="advancedEnabled" :disabled="isRunning">
              <template #send>
                <UButton type="button" icon="i-lucide-send" color="primary" :disabled="isRunning || !inputMessage.trim()" size="sm" @click="handleSend">
                  发送
                </UButton>
              </template>
            </ChatQuickConfig>
          </div>
        </UCard>

        <ChatConfigCard
          :model-value="systemPrompt"
          :disabled="isRunning"
          @update:model-value="systemPrompt = $event"
          @update:advanced-enabled="advancedEnabled = $event"
          @update:show-avatar="showAvatar = $event"
        />

        <ChatAiInfoCard
          :model-name="modelName || 'loading...'"
          :message-count="messages.length"
          :estimated-tokens="estimatedTokens"
          :provider="modelProvider || 'loading...'"
        />
      </div>

      <aside class="demo-page__side">
        <DemoInsightPanel
          :demo="demoMeta"
          :pipeline-steps="pipelineSteps"
          :code-analysis-items="codeAnalysisItems"
          :tech-tags="techTags"
        />
      </aside>
    </section>
  </UContainer>
</template>

<style scoped>
.demo-page { --ui-container: 1920px; padding-block: 1rem 4rem; }
.demo-page__body { display: grid; align-items: start; gap: 1rem; }
.demo-page__primary { display: grid; gap: 1rem; grid-template-rows: auto minmax(0, 1fr); }
.demo-page__side { display: grid; gap: 1rem; }

.chat-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(100vh - 16rem);
  max-width: 600px;
}

.chat-textarea {
  max-height: 8rem;
}

@media (min-width: 1024px) {
  .demo-page__body { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .demo-page__primary { grid-column: span 7; }
  .demo-page__side { grid-column: span 5; }
}
</style>
