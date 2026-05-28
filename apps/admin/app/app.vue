<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-extrabold">AI Journey Admin</h1>
        <UBadge color="primary" variant="soft">v0.1</UBadge>
      </div>
      <div class="flex items-center gap-3">
        <UButton to="/" variant="ghost" size="sm" icon="i-lucide-layout-dashboard">Dashboard</UButton>
        <UButton to="/cards" variant="ghost" size="sm" icon="i-lucide-credit-card">Card 管理</UButton>
        <UButton to="/demos" variant="ghost" size="sm" icon="i-lucide-blocks">Demo 管理</UButton>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
