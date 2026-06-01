<script setup lang="ts">
const navigationItems = [
  {
    label: 'Demo Hub',
    icon: 'i-lucide-store',
    to: '/',
  },
  {
    label: 'AI Chat',
    icon: 'i-lucide-message-circle',
    to: '/chat',
  },
  {
    label: 'Docs',
    icon: 'i-lucide-book-open',
    to: 'https://github.com/Fridolph/AI-Journey-Land/tree/main/docs',
    target: '_blank',
  },
  {
    label: 'Fighting',
    icon: 'i-lucide-git-branch',
    to: 'https://github.com/Fridolph/AI-Journey-Fighting',
    target: '_blank',
  },
]
</script>

<template>
  <UHeader title="AI-Journey-Land" to="/" :ui="{ container: '[--ui-container:1920px]' }">
    <template #title>
      <span class="app-header__brand-mark">
        <UIcon name="i-lucide-sparkles" />
      </span>
      <span>AI-Journey-Land</span>
    </template>

    <UNavigationMenu
      :items="navigationItems"
      color="neutral"
      variant="link"
      highlight
      highlight-color="primary" />

    <template #right>
      <UBadge color="primary" variant="soft" class="hidden sm:inline-flex"
        >Nuxt UI</UBadge
      >
    </template>

    <template #body>
      <UNavigationMenu
        :items="navigationItems"
        orientation="vertical"
        color="neutral"
        variant="link"
        class="w-full" />
    </template>
  </UHeader>
</template>

<style scoped>
.app-header__brand-mark {
  display: inline-grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border-radius: 0.45rem;
  background: var(--ui-primary);
  color: var(--ui-bg);
  font-size: 1rem;
}
</style>
