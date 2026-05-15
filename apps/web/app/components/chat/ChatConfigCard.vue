<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const enableCustom = ref(false)

watch(enableCustom, (v) => {
  if (!v) emit('update:modelValue', '')
})

const DEFAULT_PROMPT = `你是一个智能 AI 助手，可以回答用户的各种问题。`
</script>

<template>
  <DemoCollapsibleCard title="对话配置" icon="i-lucide-settings-2" :default-open="false">
    <div class="grid gap-3">
      <label class="flex items-center gap-2 cursor-pointer">
        <UToggle
          :model-value="enableCustom"
          :disabled="disabled"
          size="sm"
          @update:model-value="enableCustom = $event"
        />
        <span class="text-sm font-semibold text-highlighted">自定义 AI 人设</span>
      </label>

      <div v-if="enableCustom" class="grid gap-1.5">
        <span class="text-xs text-muted">
          修改 System Prompt，AI 将在当前会话中遵循新的人设回答问题
        </span>
        <UTextarea
          :model-value="modelValue || DEFAULT_PROMPT"
          :placeholder="DEFAULT_PROMPT"
          :rows="4"
          :disabled="disabled"
          autoresize
          size="sm"
          @update:model-value="emit('update:modelValue', String($event ?? ''))"
        />
      </div>
    </div>
  </DemoCollapsibleCard>
</template>
