<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChat'

const props = defineProps<{
  message: ChatMessage
  showAvatar: boolean
  isLastUser: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  copy: [content: string]
  edit: []
  quote: [content: string]
}>()
</script>

<template>
  <div class="flex gap-2 mb-4" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div v-if="showAvatar && message.role === 'assistant'" class="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mt-0.5">
      AI
    </div>

    <div class="group relative" :class="message.role === 'user' ? 'order-first' : ''">
      <div
        class="rounded-lg px-3.5 py-2.5 text-sm leading-relaxed"
        :class="message.role === 'user'
          ? 'bg-primary text-white ml-auto'
          : 'bg-muted text-highlighted'"
      >
        {{ message.content }}
      </div>

      <div
        v-if="message.role === 'user' && !disabled"
        class="flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="message.role === 'user' ? 'justify-end' : ''"
      >
        <UTooltip v-if="isLastUser" text="编辑">
          <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" @click="emit('edit')" />
        </UTooltip>
        <UTooltip text="引用">
          <UButton icon="i-lucide-quote" color="neutral" variant="ghost" size="xs" @click="emit('quote', message.content)" />
        </UTooltip>
        <UTooltip text="复制">
          <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="emit('copy', message.content)" />
        </UTooltip>
      </div>
    </div>

    <div v-if="showAvatar && message.role === 'user'" class="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-400 flex items-center justify-center text-white text-xs font-bold mt-0.5">
      U
    </div>
  </div>
</template>
