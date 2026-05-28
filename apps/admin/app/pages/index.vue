<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)

const dbStatus = ref<'loading' | 'ok' | 'error'>('loading')
const cardCount = ref(0)
const demoCount = ref(0)

async function checkDB() {
  dbStatus.value = 'loading'
  try { await $fetch(`${apiBase.value}/health`); dbStatus.value = 'ok' } catch { dbStatus.value = 'error' }
}
async function loadStats() {
  try {
    const [cardRes, demoRes] = await Promise.all([
      $fetch<any>(`${apiBase.value}/cards`),
      $fetch<any>(`${apiBase.value}/demos`),
    ])
    cardCount.value = (cardRes.data as any[])?.length ?? 0
    demoCount.value = (demoRes.data as any[])?.flatMap((g: any) => g.items).length ?? 0
  } catch {}
}

onMounted(async () => { await checkDB(); await loadStats() })
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">Dashboard</h2>
    <div class="grid grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="dbStatus === 'ok' ? 'bg-green-500' : dbStatus === 'loading' ? 'bg-yellow-500' : 'bg-red-500'" />
          <span class="font-semibold">PostgreSQL</span>
        </div>
        <p class="text-2xl font-bold mt-2">{{ dbStatus === 'ok' ? '已连接' : dbStatus === 'loading' ? '检测中' : '未连接' }}</p>
      </UCard>
      <UCard>
        <p class="text-sm text-gray-500">Cards</p>
        <p class="text-2xl font-bold">{{ cardCount }}</p>
      </UCard>
      <UCard>
        <p class="text-sm text-gray-500">Demos</p>
        <p class="text-2xl font-bold">{{ demoCount }}</p>
      </UCard>
    </div>
  </div>
</template>
