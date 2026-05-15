<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelName: string
  messageCount: number
  estimatedTokens: number
  provider: string
}>()

const maxTokens = 8192

const remainingTokens = computed(() => Math.max(0, maxTokens - props.estimatedTokens))

const usagePct = computed(() => Math.min(100, Math.round((props.estimatedTokens / maxTokens) * 100)))

const usageColor = computed(() => {
  if (usagePct.value > 80) return '#dc2626'
  if (usagePct.value > 50) return '#f59e0b'
  return '#0f766e'
})
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
          <span class="text-xs text-muted">Provider</span>
          <p class="text-sm font-semibold">{{ provider || '-' }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">消息数</span>
          <p class="text-sm font-semibold">{{ messageCount }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">预估 Tokens</span>
          <p class="text-sm font-semibold">~{{ estimatedTokens }}</p>
        </div>
        <div>
          <span class="text-xs text-muted">剩余 Tokens</span>
          <p class="text-sm font-semibold">~{{ remainingTokens }}</p>
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
