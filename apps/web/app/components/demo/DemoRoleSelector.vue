<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  presets: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="grid gap-1.5 flex-1 min-w-0">
    <span class="text-[0.82rem] font-bold text-land-ink">角色</span>
    <USelect
      :model-value="modelValue"
      :items="presets"
      :disabled="isRunning"
      size="sm"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </label>
</template>
