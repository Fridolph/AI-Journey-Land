<script setup lang="ts">
definePageMeta({ layout: 'chat' })

import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

const chat = new Chat({ transport: new DefaultChatTransport({ api: '/api/ai-chat' }) })
const input = ref('')
const chatContainer = useTemplateRef<HTMLElement>('chatContainer')

function handleSubmit(e: Event) {
  e.preventDefault()
  if (!input.value.trim() || chat.status === 'streaming') return
  chat.sendMessage({ text: input.value })
  input.value = ''
}

watch(() => chat.messages, () => {
  nextTick(() => {
    setTimeout(() => {
      chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
    }, 300)
  })
}, { deep: true })
</script>

<template>
  <div class="flex-1 flex flex-col min-w-0">
    <header class="h-14 shrink-0 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
      <h1 class="text-sm font-semibold">AI Journey Chat</h1>
    </header>

    <div ref="chatContainer" class="flex-1 overflow-auto">
      <div class="max-w-3xl mx-auto py-4 px-4 grid gap-4">
        <div v-if="chat.messages.length === 0" class="text-center py-16">
          <UIcon name="i-lucide-sparkles" class="text-4xl text-primary mx-auto mb-4" />
          <h2 class="text-lg font-semibold mb-2">开始对话</h2>
          <p class="text-sm text-muted">使用 AI SDK 流式输出，支持多轮对话</p>
        </div>

        <div v-for="m in chat.messages" :key="m.id" class="flex" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
          <div v-if="m.role === 'assistant'" class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs mt-1 mr-2 shrink-0">AI</div>
          <div class="max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed" :class="m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-highlighted'">
            <template v-for="(part, i) in m.parts" :key="i">
              <template v-if="part.type === 'text'">{{ part.text }}</template>
            </template>
          </div>
          <div v-if="m.role === 'user'" class="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs mt-1 ml-2 shrink-0">U</div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 dark:border-gray-800">
      <form class="max-w-3xl mx-auto flex gap-2 p-4" @submit="handleSubmit">
        <UInput v-model="input" placeholder="输入消息..." :disabled="chat.status === 'streaming'" class="flex-1" size="lg" />
        <UButton type="submit" icon="i-lucide-send" :disabled="chat.status === 'streaming' || !input.trim()" size="lg" />
      </form>
      <p class="text-center text-xs text-muted pb-3">AI Journey Chat · 基于 Vercel AI SDK + Nuxt UI</p>
    </div>
  </div>
</template>
