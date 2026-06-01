<script setup lang="ts">
import { useChatLayoutStore } from '~/stores/chatStore'
import { useUserStore } from '~/stores/userStore'
import type { ChatSession } from '~/stores/chatStore'

const store = useChatLayoutStore()
const userStore = useUserStore()
const route = useRoute()

const planModalOpen = ref(false)

onMounted(() => {
  const config = useRuntimeConfig()
  store.apiBase = config.public.apiBase as string
  store.loadMockData()
})

watch(
  () => route.query.session,
  (id) => {
    if (id && typeof id === 'string') {
      store.setActiveSession(id)
    }
  },
  { immediate: true },
)

const sidebarOpen = ref(true)
const searchQuery = ref('')

const filteredSessions = computed(() => {
  const pinned = store.pinnedSessions ?? []
  const unpinned = store.unpinnedSessions ?? []
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return { pinned, unpinned }
  return {
    pinned: pinned.filter((s: ChatSession) => s.title.toLowerCase().includes(q)),
    unpinned: unpinned.filter((s: ChatSession) => s.title.toLowerCase().includes(q)),
  }
})

const uiMessages = computed(() => {
  return store.currentMessages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    parts: [{ type: 'text' as const, text: m.content }],
    createdAt: m.createdAt,
  }))
})

function onSubmit() {
  const content = store.input
  if (!content.trim()) return
  store.sendMessage(content)
  store.input = ''
}

function handleRename(session: ChatSession) {
  const name = prompt('重命名会话', session.title)
  if (name && name.trim()) {
    store.renameSession(session.id, name.trim())
  }
}

function handleDelete(session: ChatSession) {
  store.deleteSession(session.id)
}

const planBadgeColor = computed(() => {
  const map: Record<string, 'secondary' | 'primary' | 'warning'> = {
    free: 'secondary',
    pro: 'primary',
    max: 'warning',
  }
  return map[userStore.user.currentPlan] ?? 'secondary'
})

const userMenuItems = computed(() => [
  {
    label: `${userStore.user.name} · ${userStore.currentPlanInfo.label}`,
    icon: 'i-lucide-badge-check',
    type: 'label' as const,
  },
  {
    label: '管理套餐',
    icon: 'i-lucide-zap',
    onSelect: () => { planModalOpen.value = true },
  },
  {
    type: 'separator' as const,
  },
  {
    label: '中文',
    icon: 'i-lucide-languages',
    checked: userStore.user.language === 'zh-CN',
    onSelect: () => { userStore.setLanguage('zh-CN') },
  },
  {
    label: 'English',
    checked: userStore.user.language === 'en',
    onSelect: () => { userStore.setLanguage('en') },
  },
  {
    type: 'separator' as const,
  },
  {
    label: '设置',
    icon: 'i-lucide-settings',
    onSelect: () => {},
  },
  {
    label: '退出登录',
    icon: 'i-lucide-log-out',
    color: 'error' as const,
    onSelect: () => { userStore.logout() },
  },
])
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <aside
      class="flex flex-col w-[260px] min-w-[260px] border-r border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] transition-[margin-left] duration-200"
      :class="sidebarOpen ? 'ml-0' : '-ml-[260px]'"
    >
      <div class="flex items-center gap-1 px-2.5 py-3 border-b border-[var(--ui-border)]">
        <UButton block icon="i-lucide-plus" size="sm" @click="store.createSession()">
          新建对话
        </UButton>
        <UButton
          icon="i-lucide-panel-left-close"
          size="xs"
          variant="ghost"
          color="neutral"
          square
          class="shrink-0"
          @click="sidebarOpen = false"
        />
      </div>

      <div class="flex-1 overflow-y-auto pt-2">
        <div class="px-2.5 pb-2">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="搜索会话..."
            variant="none"
            size="sm"
            class="rounded-lg bg-[var(--ui-bg-muted)]/50"
          />
        </div>

        <div v-if="filteredSessions.pinned.length > 0" class="py-1">
          <p class="pt-2 pb-1 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            置顶
          </p>
          <div
            v-for="session in filteredSessions.pinned"
            :key="session.id"
            class="chat-sidebar__item group"
            :class="{ 'bg-[var(--ui-bg-elevated-hover)]': session.id === store.activeSessionId }"
            role="button"
            tabindex="0"
            @click="store.setActiveSession(session.id)"
          >
            <span class="text-[var(--ui-text-muted)] text-base opacity-60 shrink-0 i-lucide-pin" />
            <span class="flex-1 truncate">{{ session.title }}</span>
            <div class="flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <UTooltip text="取消置顶">
                <UButton
                  icon="i-lucide-pin-off"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  square
                  @click.stop="store.togglePin(session.id)"
                />
              </UTooltip>
              <UDropdownMenu
                :items="[
                  { label: '重命名', icon: 'i-lucide-pencil', onSelect: () => handleRename(session) },
                  { label: session.isFavorited ? '取消收藏' : '收藏', icon: session.isFavorited ? 'i-lucide-star-off' : 'i-lucide-star', onSelect: () => store.toggleFavorite(session.id) },
                  { label: '删除', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => handleDelete(session) },
                ]"
              >
                <UButton
                  icon="i-lucide-ellipsis"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  square
                  @click.stop
                />
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <div v-if="filteredSessions.unpinned.length > 0" class="py-1">
          <p class="pt-2 pb-1 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            {{ filteredSessions.pinned.length > 0 ? '历史记录' : '全部会话' }}
          </p>
          <div
            v-for="session in filteredSessions.unpinned"
            :key="session.id"
            class="chat-sidebar__item group"
            :class="{ 'bg-[var(--ui-bg-elevated-hover)]': session.id === store.activeSessionId }"
            role="button"
            tabindex="0"
            @click="store.setActiveSession(session.id)"
          >
            <span class="text-[var(--ui-text-muted)] text-base opacity-60 shrink-0 i-lucide-message-square-text" />
            <span class="flex-1 truncate">{{ session.title }}</span>
            <div class="flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <UTooltip text="置顶">
                <UButton
                  icon="i-lucide-pin"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  square
                  @click.stop="store.togglePin(session.id)"
                />
              </UTooltip>
              <UDropdownMenu
                :items="[
                  { label: '重命名', icon: 'i-lucide-pencil', onSelect: () => handleRename(session) },
                  { label: session.isFavorited ? '取消收藏' : '收藏', icon: session.isFavorited ? 'i-lucide-star-off' : 'i-lucide-star', onSelect: () => store.toggleFavorite(session.id) },
                  { label: '删除', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => handleDelete(session) },
                ]"
              >
                <UButton
                  icon="i-lucide-ellipsis"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  square
                  @click.stop
                />
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <div
          v-if="searchQuery && !filteredSessions.pinned.length && !filteredSessions.unpinned.length"
          class="px-4 py-6 text-center text-[13px] text-[var(--ui-text-muted)]"
        >
          没有找到匹配的会话
        </div>
      </div>

      <div class="shrink-0 border-t border-[var(--ui-border)] p-2">
        <UDropdownMenu
          :items="userMenuItems"
          :ui="{ content: 'w-56' }"
        >
          <div
            class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--ui-bg-elevated-hover)] transition-colors"
            role="button"
            tabindex="0"
          >
            <span
              class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--ui-primary)]/15 text-[var(--ui-primary)] text-sm font-semibold shrink-0"
            >
              {{ userStore.user.name.charAt(0) }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium truncate">{{ userStore.user.name }}</p>
              <p class="text-[11px] text-[var(--ui-text-muted)] truncate">{{ userStore.user.email }}</p>
            </div>
            <UBadge
              :color="planBadgeColor"
              variant="soft"
              size="sm"
              class="text-[10px] px-1.5 shrink-0"
            >
              {{ userStore.currentPlanInfo.label }}
            </UBadge>
          </div>
        </UDropdownMenu>
      </div>
    </aside>

    <button
      v-if="!sidebarOpen"
      class="chat-sidebar__open-btn"
      @click="sidebarOpen = true"
    >
      <span class="i-lucide-panel-left-open" />
    </button>

    <div class="flex-1 flex flex-col min-w-0 bg-[var(--ui-bg)]">
      <template v-if="store.activeSession">
        <div class="flex-1 overflow-y-auto pt-2">
          <UChatMessages
            :messages="uiMessages"
            :should-auto-scroll="true"
            :should-scroll-to-bottom="true"
            :assistant="({ avatar: { icon: 'i-lucide-bot' } } as Record<string, unknown>)"
            :user="({ variant: 'soft', side: 'right' } as Record<string, unknown>)"
          />
        </div>

        <div class="shrink-0 border-t border-[var(--ui-border)] bg-[var(--ui-bg)]">
          <UChatPrompt
            v-model="store.input"
            variant="outline"
            placeholder="输入消息... (Enter 发送)"
            :disabled="store.chatStatus === 'streaming' || store.chatStatus === 'submitted'"
            @submit="onSubmit"
          >
            <UChatPromptSubmit
              :status="store.chatStatus"
              @stop="store.stopGenerating()"
              @reload="store.continueGenerating()"
            />
          </UChatPrompt>
        </div>
      </template>

      <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--ui-text-muted)]">
        <span class="i-lucide-message-circle text-6xl opacity-40" />
        <h2 class="text-lg font-semibold text-[var(--ui-text)] m-0">选择一个对话开始</h2>
        <p class="text-sm m-0 mb-2">或创建一个新对话</p>
        <UButton icon="i-lucide-plus" @click="store.createSession()">
          新建对话
        </UButton>
      </div>
    </div>
  </div>

  <UModal v-model:open="planModalOpen" title="管理套餐" :ui="{ content: 'max-w-xl' }">
    <template #body>
      <div class="flex gap-4">
        <div
          v-for="plan in userStore.allPlans"
          :key="plan.id"
          class="flex-1 rounded-xl border p-4"
          :class="[
            userStore.user.currentPlan === plan.id
              ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)]/5 ring-1 ring-[var(--ui-primary)]/30'
              : 'border-[var(--ui-border)] hover:border-[var(--ui-primary)]/50',
          ]"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg font-bold">{{ plan.label }}</span>
            <UBadge
              v-if="userStore.user.currentPlan === plan.id"
              color="primary"
              variant="soft"
              size="sm"
            >
              当前
            </UBadge>
          </div>
          <ul class="space-y-1.5 mb-4">
            <li
              v-for="feat in plan.features"
              :key="feat"
              class="flex items-center gap-2 text-[13px] text-[var(--ui-text-muted)]"
            >
              <span class="i-lucide-check text-[var(--ui-primary)] shrink-0" />
              {{ feat }}
            </li>
          </ul>
          <div class="text-[12px] text-[var(--ui-text-muted)] mb-3">
            {{ plan.maxContext }} 上下文 · {{ plan.maxSessions }} 会话
          </div>
          <UButton
            block
            :variant="userStore.user.currentPlan === plan.id ? 'outline' : 'solid'"
            :disabled="userStore.user.currentPlan === plan.id"
            @click="userStore.switchPlan(plan.id)"
          >
            {{ userStore.user.currentPlan === plan.id ? '当前套餐' : `切换到 ${plan.label}` }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@reference "tailwindcss";

.chat-sidebar__item {
  @apply flex items-center gap-2 px-2.5 py-2 m-1 rounded-lg cursor-pointer transition-colors text-[13px] leading-relaxed;
}

.chat-sidebar__item:hover {
  @apply bg-[var(--ui-bg-elevated-hover)];
}

.chat-sidebar__open-btn {
  @apply fixed left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center
         w-7 h-12 border border-r-0 border-[var(--ui-border)] rounded-e-lg
         bg-[var(--ui-bg-elevated)] cursor-pointer text-[var(--ui-text-muted)] text-base
         transition-colors;
}

.chat-sidebar__open-btn:hover {
  @apply bg-[var(--ui-bg-elevated-hover)];
}
</style>
