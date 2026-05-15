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
  <DemoCollapsibleCard title="AI 运行信息" icon="i-lucide-info" :default-open="false">
    <div class="grid gap-2.5">
      <div class="grid grid-cols-2 gap-1.5 text-sm">
        <span class="text-[var(--ui-text-muted)]">模型</span>
        <span class="font-semibold text-right">{{ modelName || 'qwen-plus' }}</span>

        <span class="text-[var(--ui-text-muted)]">Provider</span>
        <span class="font-semibold text-right">{{ provider || 'OpenAI-compatible' }}</span>

        <span class="text-[var(--ui-text-muted)]">会话消息数</span>
        <span class="font-semibold text-right">{{ messageCount }}</span>

        <span class="text-[var(--ui-text-muted)]">预估 Tokens</span>
        <span class="font-semibold text-right">~{{ estimatedTokens }}</span>

        <span class="text-[var(--ui-text-muted)]">剩余</span>
        <span class="font-semibold text-right">~{{ remainingTokens }}</span>
      </div>

      <div class="grid gap-1">
        <div class="flex justify-between text-xs text-[var(--ui-text-muted)]">
          <span>用量</span>
          <span>{{ usagePct }}%</span>
        </div>
        <div class="w-full h-1.5 rounded-full bg-[var(--ui-bg-muted)] overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{ width: `${usagePct}%`, background: usageColor }"
          />
        </div>
      </div>
    </div>
  </DemoCollapsibleCard>
</template>
