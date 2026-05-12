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
  <div class="grid gap-2 grid-cols-2">
    <label class="grid gap-1.5 min-w-0">
      <span class="text-[0.82rem] font-bold text-[#334155]">报告类型</span>
      <USelect
        :model-value="modelValue"
        :items="presets"
        :disabled="isRunning"
        size="sm"
        @update:model-value="onTypeChange(String($event))"
      />
    </label>

    <label class="grid gap-1.5 min-w-0">
      <span class="text-[0.82rem] font-bold text-[#334155]">汇报时间</span>
      <span v-if="dateRange" class="flex items-center gap-1 text-sm text-[var(--ui-primary)] font-semibold min-h-[36px]">
        <UIcon name="i-lucide-calendar-range" />
        {{ dateRange }}
      </span>
      <span v-else class="text-sm text-[var(--ui-text-muted)] min-h-[36px] flex items-center">
        选择报告类型后自动填入
      </span>
    </label>
  </div>
</template>
