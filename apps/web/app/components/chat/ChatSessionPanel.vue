<script setup lang="ts">
defineProps<{
  sessions: { id: string; title: string; createdAt: string; lastActiveAt: string }[]
  currentSessionId: string | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
  create: []
}>()
</script>

<template>
  <DemoCollapsibleCard title="会话历史" icon="i-lucide-history">
    <div class="grid gap-1">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer"
        :class="{ 'bg-muted': s.id === currentSessionId }"
        @click="emit('select', s.id)"
      >
        <span class="text-sm truncate flex-1 min-w-0">{{ s.title }}</span>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click.stop="emit('delete', s.id)"
        />
      </div>

      <UButton
        block
        icon="i-lucide-plus"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="emit('create')"
      >
        新会话
      </UButton>
    </div>
  </DemoCollapsibleCard>
</template>
