<script setup lang="ts">
defineProps<{
  show: boolean
  disabled: boolean
}>()

const modelOptions = ref(['deepseek-v4-flash', 'qwen-plus'])
const selectedModel = ref(modelOptions.value[0] ?? '')
const webSearch = ref(false)
const ragEnabled = ref(false)
</script>

<template>
  <div v-if="show" class="flex items-center gap-3 px-4 pb-2.5 flex-wrap">
    <span class="text-xs text-muted">当前模型</span>
    <USelect
      :model-value="selectedModel"
      :items="modelOptions"
      :disabled="disabled"
      size="xs"
      class="w-40"
    />

    <div class="flex items-center gap-1">
      <UToggle :model-value="webSearch" :disabled="disabled" size="xs" @update:model-value="webSearch = $event" />
      <span class="text-xs text-muted">联网</span>
    </div>

    <div class="flex items-center gap-1">
      <UToggle :model-value="ragEnabled" :disabled="disabled" size="xs" @update:model-value="ragEnabled = $event" />
      <span class="text-xs text-muted">RAG</span>
    </div>

    <div class="flex-1" />

    <UButton icon="i-lucide-at-sign" color="neutral" variant="ghost" size="xs" :disabled="disabled" />
    <UButton icon="i-lucide-paperclip" color="neutral" variant="ghost" size="xs" :disabled="disabled" />
  </div>
</template>
