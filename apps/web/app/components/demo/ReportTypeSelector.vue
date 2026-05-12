<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  presets: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const typeIcons: Record<string, string> = {
  '日报': 'i-lucide-sun',
  '周报': 'i-lucide-calendar-days',
  '月报': 'i-lucide-calendar-range',
  '季度总结': 'i-lucide-trending-up',
  '年度总结': 'i-lucide-globe',
}
</script>

<template>
  <div class="report-type-selector">
    <div class="report-type-selector__header">
      <UIcon name="i-lucide-layers" class="report-type-selector__icon" />
      <span class="report-type-selector__label">第二步：选择报告类型</span>
      <span class="report-type-selector__hint">从日报到年度总结，时间粒度和输出结构逐级递进</span>
    </div>

    <div class="report-type-selector__presets">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="report-type-selector__preset"
        :class="{ 'report-type-selector__preset--active': modelValue === preset }"
        :disabled="isRunning"
        @click="emit('update:modelValue', preset)"
      >
        <UIcon
          :name="typeIcons[preset] ?? 'i-lucide-file-text'"
          class="report-type-selector__preset-icon"
        />
        <span class="report-type-selector__preset-label">{{ preset }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.report-type-selector {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.72);
}

.report-type-selector__header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}

.report-type-selector__icon {
  color: var(--ui-primary);
}

.report-type-selector__label {
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
  font-weight: 800;
}

.report-type-selector__hint {
  color: var(--ui-text-muted);
  font-size: 0.78rem;
}

.report-type-selector__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.report-type-selector__preset {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid color-mix(in oklab, var(--ui-primary) 28%, transparent);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--ui-primary);
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 650;
  padding: 0.45rem 0.8rem;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.report-type-selector__preset:hover:not(:disabled) {
  background: color-mix(in oklab, var(--ui-primary) 9%, transparent);
}

.report-type-selector__preset:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}

.report-type-selector__preset--active {
  border-color: var(--ui-primary);
  background: var(--ui-primary);
  color: #fff;
  box-shadow: 0 2px 10px color-mix(in oklab, var(--ui-primary) 35%, transparent);
}

.report-type-selector__preset-icon {
  font-size: 0.95rem;
}

.report-type-selector__preset-label {
  white-space: nowrap;
}
</style>
