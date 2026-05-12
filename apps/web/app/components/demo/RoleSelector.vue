<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  presets: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isCustom = computed(() => {
  if (!props.modelValue) return false
  return !props.presets.includes(props.modelValue)
})

function selectPreset(preset: string) {
  emit('update:modelValue', preset)
}

function onCustomInput(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="role-selector">
    <div class="role-selector__header">
      <UIcon name="i-lucide-users" class="role-selector__icon" />
      <span class="role-selector__label">第一步：选择角色</span>
      <span class="role-selector__hint">角色决定了文档的视角、语气和重心</span>
    </div>

    <div class="role-selector__presets">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="role-selector__preset"
        :class="{ 'role-selector__preset--active': modelValue === preset }"
        :disabled="isRunning"
        @click="selectPreset(preset)"
      >
        {{ preset }}
      </button>

      <button
        type="button"
        class="role-selector__preset role-selector__preset--custom"
        :class="{ 'role-selector__preset--active': isCustom }"
        :disabled="isRunning"
        @click="selectPreset('')"
      >
        <UIcon name="i-lucide-pencil" />
        自定义
      </button>
    </div>

    <div v-if="isCustom || modelValue === ''" class="role-selector__custom">
      <UInput
        :model-value="modelValue"
        placeholder="输入自定义角色名称，例如：CTO / 投资人 / 客户成功"
        :disabled="isRunning"
        size="sm"
        @update:model-value="onCustomInput(String($event ?? ''))"
      />
    </div>
  </div>
</template>

<style scoped>
.role-selector {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.72);
}

.role-selector__header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}

.role-selector__icon {
  color: var(--ui-primary);
}

.role-selector__label {
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
  font-weight: 800;
}

.role-selector__hint {
  color: var(--ui-text-muted);
  font-size: 0.78rem;
}

.role-selector__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.role-selector__preset {
  border: 1px solid color-mix(in oklab, var(--ui-primary) 28%, transparent);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--ui-primary);
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 650;
  padding: 0.45rem 0.85rem;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.role-selector__preset:hover:not(:disabled) {
  background: color-mix(in oklab, var(--ui-primary) 9%, transparent);
}

.role-selector__preset:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}

.role-selector__preset--active {
  border-color: var(--ui-primary);
  background: var(--ui-primary);
  color: #fff;
  box-shadow: 0 2px 10px color-mix(in oklab, var(--ui-primary) 35%, transparent);
}

.role-selector__preset--custom {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-style: dashed;
  color: var(--ui-text-muted);
  font-weight: 600;
}

.role-selector__preset--custom.role-selector__preset--active {
  border-style: solid;
  color: #fff;
}

.role-selector__custom {
  width: 100%;
}
</style>
