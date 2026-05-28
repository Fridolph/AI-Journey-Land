<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase)
const dbStatus = ref<'loading' | 'ok' | 'error'>('loading')

async function checkDB() {
  dbStatus.value = 'loading'
  try { await $fetch(`${apiBase.value}/health`); dbStatus.value = 'ok' } catch { dbStatus.value = 'error' }
}
onMounted(checkDB)
</script>

<template>
  <div class="p-6 grid gap-4">
    <h2 class="text-xl font-bold">数据库设置</h2>
    <UCard>
      <div class="grid gap-4 text-sm">
        <div class="flex items-center justify-between">
          <span>PostgreSQL 17</span>
          <UBadge :color="dbStatus === 'ok' ? 'success' : dbStatus === 'loading' ? 'warning' : 'error'">
            {{ dbStatus === 'ok' ? '已连接' : dbStatus === 'loading' ? '检测中...' : '未连接' }}
          </UBadge>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">Host</span>
          <span class="font-mono">localhost:15432</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">Database</span>
          <span class="font-mono">ai_journey_lab</span>
        </div>
        <UButton variant="ghost" @click="checkDB">重新检测</UButton>
      </div>
    </UCard>
  </div>
</template>
