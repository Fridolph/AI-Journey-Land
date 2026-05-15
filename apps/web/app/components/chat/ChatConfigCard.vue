<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled: boolean
  variant: 'global' | 'session'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:advancedEnabled': [value: boolean]
  'update:showAvatar': [value: boolean]
}>()

function useLocalBool(key: string, def: boolean) {
  const val = ref(def)
  if (import.meta.client) {
    const stored = localStorage.getItem(key)
    if (stored !== null) val.value = stored === 'true'
  }
  watch(val, (v) => {
    if (import.meta.client) localStorage.setItem(key, String(v))
  })
  return val
}

const enableCustom = useLocalBool('chat-config-custom-prompt', false)
const advancedEnabled = useLocalBool('chat-config-advanced', false)
const showAvatar = useLocalBool('chat-config-avatar', false)

watch(enableCustom, (v) => {
  if (!v) emit('update:modelValue', '')
})

watch(advancedEnabled, (v) => {
  emit('update:advancedEnabled', v)
})

watch(showAvatar, (v) => {
  emit('update:showAvatar', v)
})

const DEFAULT_PROMPT = `你是一个智能 AI 助手，可以回答用户的各种问题。`
</script>

<template>
  <DemoCollapsibleCard
    :title="variant === 'global' ? '公共配置' : '当前对话配置'"
    icon="i-lucide-settings-2"
    :default-open="variant === 'session' ? true : false"
  >
    <div class="grid gap-3">
      <!-- Global: 高级功能 + 编辑扩展 -->
      <template v-if="variant === 'global'">
        <label class="flex items-center justify-between gap-2 cursor-pointer pt-2 border-t border-black/5">
          <span class="text-sm font-semibold text-highlighted">启用高级功能</span>
          <UButton
            :icon="advancedEnabled ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left'"
            :color="advancedEnabled ? 'primary' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="disabled"
            @click="advancedEnabled = !advancedEnabled"
          />
        </label>

        <label class="flex items-center justify-between gap-2 cursor-pointer">
          <span class="text-sm font-semibold text-highlighted">编辑与扩展</span>
          <UButton
            :icon="showAvatar ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left'"
            :color="showAvatar ? 'primary' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="disabled"
            @click="showAvatar = !showAvatar"
          />
        </label>
      </template>

      <!-- Session: AI 人设 -->
      <template v-if="variant === 'session'">
        <label class="flex items-center justify-between gap-2 cursor-pointer">
          <span class="text-sm font-semibold text-highlighted">自定义 AI 人设</span>
          <UButton
            :icon="enableCustom ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left'"
            :color="enableCustom ? 'primary' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="disabled"
            @click="enableCustom = !enableCustom"
          />
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
      </template>
    </div>
  </DemoCollapsibleCard>
</template>
