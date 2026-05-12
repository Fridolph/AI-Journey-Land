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
  <label class="select-field">
    <span class="select-field__label">角色</span>
    <USelect
      :model-value="modelValue"
      :items="presets"
      :disabled="isRunning"
      size="sm"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </label>
</template>

<style scoped>
.select-field {
  display: grid;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.select-field__label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}
</style>
