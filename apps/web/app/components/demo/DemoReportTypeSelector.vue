<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  dateRange: string
  presets: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:dateRange': [value: string]
}>()

function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeDateRange(type: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()

  switch (type) {
    case '日报':
      return fmt(now)
    case '周报': {
      const day = now.getDay() || 7
      const mon = new Date(now)
      mon.setDate(now.getDate() - day + 1)
      const fri = new Date(mon)
      fri.setDate(mon.getDate() + 4)
      return `${fmt(mon)} ~ ${fmt(fri)}`
    }
    case '月报': {
      const first = new Date(y, mo, 1)
      const last = new Date(y, mo + 1, 0)
      return `${fmt(first)} ~ ${fmt(last)}`
    }
    case '季度总结': {
      const q = Math.floor(mo / 3)
      const first = new Date(y, q * 3, 1)
      const last = new Date(y, q * 3 + 3, 0)
      return `${fmt(first)} ~ ${fmt(last)}`
    }
    case '半年总结': {
      const firstHalf = mo < 6
      const first = new Date(y, firstHalf ? 0 : 6, 1)
      const last = new Date(y, firstHalf ? 6 : 12, 0)
      return `${fmt(first)} ~ ${fmt(last)}`
    }
    case '年度总结':
      return `${y}-01-01 ~ ${y}-12-31`
    default:
      return ''
  }
}

function onTypeChange(type: string) {
  emit('update:modelValue', type)
  emit('update:dateRange', computeDateRange(type))
}
</script>

<template>
  <div class="meta-bar">
    <span class="meta-bar__label">报告类型</span>
    <USelect
      :model-value="modelValue"
      :items="presets"
      :disabled="isRunning"
      size="sm"
      class="meta-bar__select"
      @update:model-value="onTypeChange(String($event))"
    />
    <div v-if="dateRange" class="meta-bar__date">
      <UIcon name="i-lucide-calendar-range" />
      <span>{{ dateRange }}</span>
    </div>
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

.meta-bar__date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>
