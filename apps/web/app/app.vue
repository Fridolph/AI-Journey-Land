<template>
  <UApp>
    <template v-if="isChatRoute">
      <NuxtPage />
    </template>
    <div v-else class="app-shell">
      <AppHeader />
      <main class="app-shell__main">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()
const isChatRoute = computed(() => route.path.startsWith('/chat'))
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__main {
  min-height: calc(100vh - var(--ui-header-height));
}
</style>
