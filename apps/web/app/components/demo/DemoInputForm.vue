<script setup lang="ts">
import type { DemoInputField } from '@ai-journey-land/shared'

const props = defineProps<{
  fields: DemoInputField[]
  modelValue: Record<string, string>
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
  run: []
  stream: []
}>()

function updateField(name: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}
</script>

<template>
  <form class="demo-form" @submit.prevent="emit('run')">
    <div class="demo-form__grid">
      <label v-for="field in fields" :key="field.name" class="demo-form__field">
        <span class="demo-form__label">{{ field.label }}</span>
        <UTextarea
          v-if="field.component === 'textarea'"
          :model-value="modelValue[field.name] ?? ''"
          :placeholder="field.placeholder"
          :rows="field.name === 'devActivities' ? 7 : 4"
          autoresize
          :disabled="isRunning"
          @update:model-value="updateField(field.name, String($event ?? ''))"
        />
        <UInput
          v-else
          :model-value="modelValue[field.name] ?? ''"
          :placeholder="field.placeholder"
          :disabled="isRunning"
          @update:model-value="updateField(field.name, String($event ?? ''))"
        />
      </label>
    </div>

    <div class="demo-form__actions">
      <UButton
        type="submit"
        icon="i-lucide-play"
        color="primary"
        :loading="isRunning"
        :disabled="isRunning"
      >
        普通运行
      </UButton>
      <UButton
        type="button"
        icon="i-lucide-radio"
        color="neutral"
        variant="subtle"
        :loading="isRunning"
        :disabled="isRunning"
        @click="emit('stream')"
      >
        流式运行
      </UButton>
    </div>
  </form>
</template>

<style scoped>
.demo-form {
  display: grid;
  gap: 1rem;
}

.demo-form__grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.demo-form__field {
  display: grid;
  gap: 0.4rem;
}

.demo-form__field:nth-last-child(-n + 2) {
  grid-column: 1 / -1;
}

.demo-form__label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}

.demo-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 720px) {
  .demo-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
