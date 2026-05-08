<template>
  <UApp>
    <div class="app-shell">
      <AppHeader />
      <main class="app-shell__main">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__main {
  min-height: calc(100vh - var(--ui-header-height));
}
</style>
