<script setup lang="ts">
const props = defineProps<{
  sessions: { id: string; title: string; createdAt: string; lastActiveAt: string }[]
  currentSessionId: string | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
  create: []
}>()

const MAX_SESSIONS = 10
const atLimit = computed(() => props.sessions.length >= MAX_SESSIONS)

const deletePopoverOpen = ref<string | null>(null)

function closePopover() {
  deletePopoverOpen.value = null
}

function confirmDelete(id: string) {
  emit('delete', id)
  closePopover()
}
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
        <UPopover :open="deletePopoverOpen === s.id" placement="bottom-end" @update:open="(v: boolean) => { if (!v) closePopover() }">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click.stop="deletePopoverOpen = s.id"
          />

          <template #content>
            <div class="grid gap-3 p-2">
              <p class="text-sm whitespace-nowrap">确定删除此会话？</p>
              <div class="flex gap-2 justify-end">
                <UButton color="neutral" variant="ghost" size="xs" @click="closePopover">否</UButton>
                <UButton color="error" variant="solid" size="xs" @click="confirmDelete(s.id)">是</UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <UButton
        block
        icon="i-lucide-plus"
        size="xs"
        variant="ghost"
        color="neutral"
        :disabled="atLimit"
        @click="emit('create')"
      >
        {{ atLimit ? '暂只支持 10 个会话' : '新会话' }}
      </UButton>
    </div>
  </DemoCollapsibleCard>
</template>
