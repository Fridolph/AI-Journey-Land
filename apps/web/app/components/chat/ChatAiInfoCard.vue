<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelName: string
  messageCount: number
  estimatedTokens: number
  provider: string
}>()

const maxTokens = computed(() => {
  const m = props.modelName.toLowerCase()
  if (m.includes('deepseek')) return 1_000_000
  if (m.includes('qwen')) return 131_072
  return 8192
})

const remainingTokens = computed(() => Math.max(0, maxTokens.value - props.estimatedTokens))

const usagePct = computed(() => Math.min(100, Math.round((props.estimatedTokens / maxTokens.value) * 100)))

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
  <DemoCollapsibleCard title="AI 运行信息" icon="i-lucide-info" :default-open="true">
    <div class="grid gap-3">
      <div class="grid grid-cols-3 gap-x-4 gap-y-2">
        <div>
          <span class="text-xs text-muted">模型</span>
          <p class="text-sm font-semibold">{{ modelName || '-' }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">上下文窗口</span>
          <p class="text-sm font-semibold">{{ fmtNum(maxTokens) }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">消息数</span>
          <p class="text-sm font-semibold">{{ messageCount }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">预估 Tokens</span>
          <p class="text-sm font-semibold">~{{ fmtNum(estimatedTokens) }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">剩余 Tokens</span>
          <p class="text-sm font-semibold">~{{ fmtNum(remainingTokens) }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">用量</span>
          <p class="text-sm font-semibold">{{ usagePct }}%</p>
        </div>
      </div>

      <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{ width: `${usagePct}%`, background: usageColor }"
        />
      </div>
    </div>
  </DemoCollapsibleCard>
</template>
