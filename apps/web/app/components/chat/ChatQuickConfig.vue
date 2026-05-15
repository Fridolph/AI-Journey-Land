<script setup lang="ts">
const props = defineProps<{
  disabled: boolean
}>()

const enabled = ref(false)

const modelOptions = ref(['deepseek-v4-flash', 'qwen-plus'])
const selectedModel = ref(modelOptions.value[0] ?? '')
const webSearch = ref(false)
const ragEnabled = ref(false)
</script>

<template>
  <div>
    <div class="flex items-center gap-2 px-4 pb-2">
      <UToggle
        :model-value="enabled"
        :disabled="disabled"
        size="xs"
        @update:model-value="enabled = $event"
      />
      <span class="text-xs text-muted cursor-pointer select-none" @click="enabled = !enabled">
        高级功能
      </span>

      <template v-if="enabled">
        <span class="text-muted">·</span>
        <USelect
          :model-value="selectedModel"
          :items="modelOptions"
          :disabled="disabled"
          size="xs"
          class="w-32"
        />

        <span class="text-muted">·</span>
        <UToggle :model-value="webSearch" :disabled="disabled" size="xs" @update:model-value="webSearch = $event" />
        <span class="text-xs text-muted cursor-pointer select-none">联网</span>

        <span class="text-muted">·</span>
        <UToggle :model-value="ragEnabled" :disabled="disabled" size="xs" @update:model-value="ragEnabled = $event" />
        <span class="text-xs text-muted cursor-pointer select-none">RAG</span>

        <span class="flex-1" />

        <UButton icon="i-lucide-at-sign" color="neutral" variant="ghost" size="xs" :disabled="disabled" />
        <UButton icon="i-lucide-paperclip" color="neutral" variant="ghost" size="xs" :disabled="disabled" />
      </template>
    </div>
  </div>
</template>
