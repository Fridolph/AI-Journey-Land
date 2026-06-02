<script setup lang="ts">
defineProps<{}>()

const conversations = ref<{ id: string; title: string; updatedAt: string }[]>([])

function newChat() {
  navigateTo('/chat')
}
</script>

<template>
  <aside class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900">
    <div class="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
      <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" size="sm" color="neutral" class="-ml-2" />
      <span class="text-sm font-semibold flex-1 text-center">AI Journey</span>
    </div>

    <div class="p-3">
      <UButton block icon="i-lucide-plus" color="primary" @click="newChat">新对话</UButton>
    </div>

    <div class="flex-1 overflow-auto px-2">
      <div v-if="conversations.length === 0" class="text-center text-xs text-muted py-8">暂无对话历史</div>
      <div
        v-for="c in conversations"
        :key="c.id"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        <UIcon name="i-lucide-message-circle" class="text-muted shrink-0" />
        <span class="truncate flex-1">{{ c.title || '新对话' }}</span>
      </div>
    </div>

    <div class="p-3 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">U</div>
        <span class="text-sm">用户</span>
      </div>
    </div>
  </aside>
</template>
