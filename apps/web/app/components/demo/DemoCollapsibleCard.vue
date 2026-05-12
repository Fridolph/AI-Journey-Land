<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    icon: string
    defaultOpen?: boolean
  }>(),
  { defaultOpen: true },
)

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <UCard>
    <template #header>
      <button
        type="button"
        class="flex items-center justify-between gap-2 w-full cursor-pointer"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-2 font-extrabold">
          <UIcon :name="icon" />
          <span>{{ title }}</span>
        </div>
        <UIcon
          :name="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-[var(--ui-text-muted)] flex-shrink-0"
        />
      </button>
    </template>
    <div v-show="isOpen">
      <slot />
    </div>
  </UCard>
</template>
