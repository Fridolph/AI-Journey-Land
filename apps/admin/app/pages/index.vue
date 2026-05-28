<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)
const dbStatus = ref<'loading' | 'ok' | 'error'>('loading')
const cardCount = ref(0)

async function checkDB() {
  dbStatus.value = 'loading'
  try {
    await $fetch(`${apiBase.value}/health`)
    dbStatus.value = 'ok'
  } catch {
    dbStatus.value = 'error'
  }
}
async function loadStats() {
  try {
    const res = await $fetch<any>(`${apiBase.value}/cards?pageSize=1`)
    cardCount.value = res.data?.pagination?.total ?? 0
  } catch {}
}
onMounted(async () => {
  await checkDB()
  await loadStats()
})
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">Dashboard</h2>
    <div class="grid grid-cols-2 gap-4">
      <UCard>
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="dbStatus === 'ok' ? 'bg-green-500' : 'bg-yellow-500'" />
          <span class="font-semibold">PostgreSQL</span>
        </div>
        <p class="text-2xl font-bold mt-2">
          {{ dbStatus === 'ok' ? '已连接' : '检测中' }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-gray-500">Cards 总数</p>
        <p class="text-2xl font-bold">{{ cardCount }}</p>
      </UCard>
    </div>
  </div>
</template>
