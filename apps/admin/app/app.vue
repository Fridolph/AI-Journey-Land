<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const open = useLocalStorage('admin-sidebar-open', true)

const items: NavigationMenuItem[] = [{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/'
}, {
  label: 'Demo 管理',
  icon: 'i-lucide-blocks',
  to: '/demos',
  active: useRoute().path.startsWith('/demos')
}, {
  label: 'Card 管理',
  icon: 'i-lucide-credit-card',
  to: '/cards',
  active: useRoute().path.startsWith('/cards')
}, {
  label: '系统设置',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  children: [{
    label: '数据库',
    icon: 'i-lucide-database',
    to: '/settings/database'
  }, {
    label: 'API 服务',
    icon: 'i-lucide-cloud',
    to: '/settings/api'
  }]
}]

const user = ref({
  name: 'Admin',
  avatar: { src: 'https://github.com/nuxt.png', alt: 'Admin' }
})

const userItems = computed<DropdownMenuItem[][]>(() => [[{
  label: '个人设置',
  icon: 'i-lucide-user'
}, {
  label: '关于',
  icon: 'i-lucide-info'
}], [{
  label: '退出',
  icon: 'i-lucide-log-out'
}]])
</script>

<template>
  <div class="flex flex-1">
    <USidebar
      v-model:open="open"
      collapsible="icon"
      rail
      title="AI Journey"
      description="Admin Dashboard"
      :ui="{ container: 'h-full', body: 'py-0' }"
    >
      <template #header>
        <UIcon name="i-lucide-terminal" class="size-8 text-primary" />
      </template>

      <UNavigationMenu
        :items="items"
        orientation="vertical"
        :ui="{ link: 'p-1.5 overflow-hidden' }"
      />

      <template #footer>
        <UDropdownMenu
          :items="userItems"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
        >
          <UButton
            v-bind="user"
            :label="user.name"
            trailing-icon="i-lucide-chevrons-up-down"
            color="neutral"
            variant="ghost"
            square
            class="w-full data-[state=open]:bg-elevated overflow-hidden"
            :ui="{ trailingIcon: 'text-dimmed ms-auto' }"
          />
        </UDropdownMenu>
      </template>
    </USidebar>

    <div class="flex-1 flex flex-col">
      <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
        <UBreadcrumb
          :items="[{ label: 'Dashboard' }]"
          class="ml-4"
        />
      </div>

      <div class="flex-1 overflow-auto">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
