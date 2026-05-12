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
  <div class="meta-bar">
    <span class="meta-bar__label">角色</span>
    <USelect
      :model-value="modelValue"
      :items="presets"
      :disabled="isRunning"
      size="sm"
      class="meta-bar__select"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </div>
</template>

<style scoped>
.meta-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.meta-bar__label {
  color: var(--ui-text-highlighted);
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
}

.meta-bar__select {
  min-width: 140px;
  max-width: 200px;
}
</style>
