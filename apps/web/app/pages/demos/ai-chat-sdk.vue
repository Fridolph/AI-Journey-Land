<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'

const chat = new Chat({
  api: '/api/ai-chat',
  initialMessages: [],
})

const input = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')

function handleSubmit(e: Event) {
  e.preventDefault()
  if (!input.value.trim()) return
  chat.sendMessage({ text: input.value })
  input.value = ''
}

watch(() => chat.messages, () => {
  nextTick().then(() => {
    setTimeout(() => {
      chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
    }, 300)
  })
}, { deep: true })
</script>

<template>
  <UContainer as="main" class="py-8">
    <div class="max-w-2xl mx-auto">
      <UPageHeader title="Chat Demo (AI SDK)" description="@ai-sdk/vue Chat + @ai-sdk/openai streamText" class="mb-4">
        <template #links>
          <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral">返回</UButton>
        </template>
      </UPageHeader>

      <UCard :ui="{ body: 'p-0 sm:p-0 flex flex-col' }">
        <div ref="chatContainer" class="flex-1 overflow-auto p-4 grid gap-3 content-start min-h-[20rem] max-h-[32rem]">
          <div v-if="chat.messages.length === 0" class="text-center text-muted py-8">AI SDK 流式对话</div>

          <div v-for="m in chat.messages" :key="m.id" class="flex" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
            <div class="max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed" :class="m.role === 'user' ? 'bg-primary text-white' : 'bg-muted text-highlighted'">
              <template v-for="(part, i) in m.parts" :key="i">
                <template v-if="part.type === 'text'">{{ part.text }}</template>
              </template>
            </div>
          </div>
        </div>

        <form class="flex gap-2 p-4 border-t border-default" @submit="handleSubmit">
          <UInput v-model="input" placeholder="输入消息..." :disabled="chat.status === 'streaming'" class="flex-1" />
          <UButton type="submit" icon="i-lucide-send" :disabled="chat.status === 'streaming' || !input.trim()">发送</UButton>
        </form>
      </UCard>
    </div>
  </UContainer>
</template>
