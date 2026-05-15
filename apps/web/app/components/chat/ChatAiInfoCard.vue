<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelName: string
  messageCount: number
  estimatedTokens: number
}>()

const maxTokens = computed(() => {
  const m = props.modelName.toLowerCase()
  if (m.includes('deepseek')) return 1_000_000
  if (m.includes('qwen')) return 131_072
  return 8192
})

const remainingTokens = computed(() => Math.max(0, maxTokens.value - props.estimatedTokens))

const usagePct = computed(() => {
  const pct = (props.estimatedTokens / maxTokens.value) * 100
  return Math.min(100, pct)
})

const usageDisplay = computed(() => {
  if (usagePct.value < 0.1) return '<0.1%'
  if (usagePct.value < 1) return `${usagePct.value.toFixed(1)}%`
  return `${Math.round(usagePct.value)}%`
})

const usageBarPct = computed(() => Math.max(0.5, usagePct.value))

const usageColor = computed(() => {
  if (usagePct.value > 80) return '#dc2626'
  if (usagePct.value > 50) return '#f59e0b'
  return '#0f766e'
})

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
</script>

<template>
  <div class="grid gap-3">
    <div class="grid grid-cols-2 gap-x-3 gap-y-2">
      <div>
        <span class="text-xs text-muted">模型</span>
        <p class="text-sm font-semibold truncate">{{ modelName || '-' }}</p>
      </div>
      <div>
        <span class="text-xs text-muted">上下文</span>
        <p class="text-sm font-semibold">{{ fmtNum(maxTokens) }}</p>
      </div>
      <div>
        <span class="text-xs text-muted">消息数</span>
        <p class="text-sm font-semibold">{{ messageCount }}</p>
      </div>
      <div>
        <span class="text-xs text-muted">用量</span>
        <p class="text-sm font-semibold">{{ usageDisplay }}</p>
      </div>
      <div class="col-span-2">
        <span class="text-xs text-muted">预估 / 剩余</span>
        <p class="text-sm font-semibold">~{{ fmtNum(estimatedTokens) }} / ~{{ fmtNum(remainingTokens) }}</p>
      </div>
    </div>

    <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :style="{ width: `${usageBarPct}%`, background: usageColor }"
      />
    </div>
  </div>
</template>
