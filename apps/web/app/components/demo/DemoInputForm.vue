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

const validationError = ref('')

function updateField(name: string, value: string) {
  validationError.value = ''
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}

function validateBeforeRun(): boolean {
  const devActivities = (props.modelValue.devActivities ?? '').trim()

  if (devActivities.length < 15) {
    validationError.value = `主要内容至少需要 15 个字（当前 ${devActivities.length} 字）`
    return false
  }

  validationError.value = ''
  return true
}

function handleRun() {
  if (!validateBeforeRun()) return
  emit('run')
}

function handleStream() {
  if (!validateBeforeRun()) return
  emit('stream')
}

const requiredFields = ['devActivities']
</script>

<template>
  <form class="grid gap-4" @submit.prevent="handleRun">
    <div class="grid gap-3.5 grid-cols-2 max-sm:grid-cols-1">
      <label
        v-for="field in fields"
        :key="field.name"
        class="grid gap-1.5"
        :class="{
          'col-span-full': field.name === 'teamGoal' || field.name === 'devActivities' || field.name === 'reportTemplate',
        }"
      >
        <span class="text-[0.82rem] font-bold text-[#334155]">
          {{ field.label }}
          <span v-if="requiredFields.includes(field.name)" class="text-red-500">*</span>
        </span>
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

    <UAlert
      v-if="validationError"
      icon="i-lucide-circle-alert"
      color="error"
      variant="soft"
      :description="validationError"
    />

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
        @click="handleStream"
      >
        流式运行
      </UButton>
    </div>
  </form>
</template>
