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
  <div class="flex items-center gap-3 px-4 pb-2.5 flex-wrap">
    <template v-if="show">
      <span class="text-xs text-muted">当前模型</span>
      <USelect
        :model-value="selectedModel"
        :items="modelOptions"
        :disabled="disabled"
        size="xs"
        class="w-40" />

      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-muted rounded px-1.5 py-0.5 transition-colors"
        :class="webSearch ? 'bg-primary text-white' : 'hover:bg-muted'"
        :disabled="disabled"
        @click="webSearch = !webSearch">
        <UIcon
          :name="webSearch ? 'i-lucide-globe' : 'i-lucide-globe'"
          class="text-[0.85rem]" />
        联网
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-muted rounded px-1.5 py-0.5 transition-colors"
        :class="ragEnabled ? 'bg-primary text-white' : 'hover:bg-muted'"
        :disabled="disabled"
        @click="ragEnabled = !ragEnabled">
        <UIcon
          :name="ragEnabled ? 'i-lucide-database' : 'i-lucide-database'"
          class="text-[0.85rem]" />
        RAG
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-muted rounded px-1.5 py-0.5 hover:bg-muted disabled:opacity-30"
        :disabled="disabled">
        <UIcon name="i-lucide-at-sign" class="text-[0.85rem]" />
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-muted rounded px-1.5 py-0.5 hover:bg-muted disabled:opacity-30"
        :disabled="disabled">
        <UIcon name="i-lucide-paperclip" class="text-[0.85rem]" />
      </button>
    </template>

    <div class="flex-1" />
    <slot name="send" />
  </div>
</template>
