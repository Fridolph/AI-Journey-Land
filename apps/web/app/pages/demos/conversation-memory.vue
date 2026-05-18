<script setup lang="ts">
const { sessionId, messages, mode, errorMessage, isRunning, systemPrompt, createSession, loadHistory, deleteSession: deleteChatSession, sendMessage } = useChat()
const chatStore = useChatStore()

const inputMessage = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')
const modelName = ref('')
const advancedEnabled = ref(false)
const compressedGroups = ref<{ id: string; turns: string; summary: string }[]>([])
const maxTurns = ref(10)
const showAvatar = ref(true)

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

async function loadModelInfo() {
  try {
    const res = await $fetch<{ data: { modelName: string } }>(`${apiBase.value}/demos/chat/model-info`)
    modelName.value = res.data.modelName
  } catch { modelName.value = 'unknown' }
}

onMounted(async () => {
  await loadModelInfo()
  await createSession()
})

async function handleSend() {
  const msg = inputMessage.value.trim()
  if (!msg || isRunning.value) return
  inputMessage.value = ''
  await sendMessage(msg)
}

watch(messages, async () => {
  await nextTick()
  setTimeout(() => {
    chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
  }, 300)
}, { deep: true })

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
</script>

<template>
  <UContainer as="main" class="demo-page">
    <UPageHeader title="长对话记忆 · 压缩验证" description="测试 AI 多轮对话记忆力，达到设定轮数后自动压缩历史为摘要">
      <template #headline>
        <div class="flex flex-wrap gap-[0.45rem]">
          <UBadge color="primary" variant="soft">Memory & Context</UBadge>
          <UBadge icon="i-lucide-radio" color="primary">Streaming</UBadge>
        </div>
      </template>
      <template #links>
        <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral">返回橱窗</UButton>
      </template>
    </UPageHeader>

    <section class="demo-page__body">
      <div class="demo-page__primary">
        <UCard class="chat-card" :ui="{ body: 'p-0 sm:p-0 flex flex-col h-full' }">
          <div class="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-black/5">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-message-circle" />
              对话窗口
              <UBadge size="xs" variant="subtle">{{ messages.length }} 条</UBadge>
              <UBadge size="xs" color="primary" variant="soft">轮次 {{ Math.ceil(messages.length / 2) }}/{{ maxTurns }}</UBadge>
            </div>
          </div>

          <div ref="chatContainer" class="flex-1 overflow-auto p-4 grid gap-3 content-start">
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
                @quote="() => {}"
              />
            </div>

            <div v-if="mode === 'streaming'" class="flex items-center gap-2 text-muted text-sm px-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              正在回复...
            </div>
          </div>

          <div class="border-t border-black/5">
            <div class="flex gap-2 p-4">
              <UTextarea v-model="inputMessage" placeholder="输入消息，Ctrl+Enter 发送" :disabled="isRunning" :rows="1" autoresize size="sm" class="flex-1 chat-textarea" @keydown="(e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSend() } }" />
            </div>
            <div class="flex items-center gap-3 px-4 pb-2.5">
              <UButton icon="i-lucide-send" color="primary" :disabled="isRunning || !inputMessage.trim()" size="sm" @click="handleSend">发送</UButton>
              <span class="text-xs text-muted">每 {{ maxTurns }} 轮自动压缩对话历史</span>
            </div>
          </div>
        </UCard>
      </div>

      <aside class="demo-page__side">
        <DemoCollapsibleCard title="压缩配置" icon="i-lucide-settings-2" :default-open="true">
          <div class="grid gap-3">
            <div>
              <span class="text-xs text-muted">压缩轮数</span>
              <USelect :model-value="String(maxTurns)" :items="['5', '10', '20', '50', '100']" size="xs" class="w-full mt-1" :disabled="isRunning" @update:model-value="(v: string) => maxTurns = Number(v)" />
            </div>
          </div>
        </DemoCollapsibleCard>

        <DemoCollapsibleCard title="当前摘要" icon="i-lucide-scroll-text" :default-open="true">
          <div v-if="messages.length === 0" class="text-xs text-muted">开始对话后将自动生成摘要</div>
          <div v-else class="text-xs text-muted leading-relaxed">
            <p>当前轮次: {{ Math.ceil(messages.length / 2) }}/{{ maxTurns }}</p>
            <p class="mt-1">预估 Tokens: ~{{ estimatedTokens }}</p>
          </div>
        </DemoCollapsibleCard>

        <DemoCollapsibleCard title="历史总结" icon="i-lucide-archive" :default-open="true">
          <div v-if="compressedGroups.length === 0" class="text-xs text-muted">暂无压缩记录</div>
          <div v-for="g in compressedGroups" :key="g.id" class="mb-2 p-2 rounded bg-muted text-xs leading-relaxed">
            <span class="font-semibold text-primary">{{ g.turns }}</span>
            <p class="mt-0.5">{{ g.summary.slice(0, 200) }}{{ g.summary.length > 200 ? '...' : '' }}</p>
          </div>
        </DemoCollapsibleCard>
      </aside>
    </section>
  </UContainer>
</template>

<style scoped>
.demo-page { --ui-container: 1920px; padding-block: 1rem 4rem; }
.demo-page__body { display: grid; align-items: start; gap: 1rem; }
.demo-page__primary { display: grid; gap: 1rem; }
.demo-page__side { display: grid; gap: 1rem; }
.chat-card { display: flex; flex-direction: column; min-height: calc(100vh - 80px); max-height: 640px; width: 100%; }
.chat-textarea { max-height: 8rem; }
@media (min-width: 1024px) {
  .demo-page__body { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .demo-page__primary { grid-column: span 7; }
  .demo-page__side { grid-column: span 5; }
}
</style>
