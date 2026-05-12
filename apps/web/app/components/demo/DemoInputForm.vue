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
  <form class="grid gap-4" @submit.prevent="emit('run')">
    <div class="grid gap-3.5 grid-cols-2 max-sm:grid-cols-1">
      <label
        v-for="field in fields"
        :key="field.name"
        class="grid gap-1.5"
        :class="{ 'col-span-full': field.name === 'teamGoal' }"
      >
        <span class="text-[0.82rem] font-bold text-[#334155]">{{ field.label }}</span>
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

    <div class="flex flex-wrap gap-3">
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
