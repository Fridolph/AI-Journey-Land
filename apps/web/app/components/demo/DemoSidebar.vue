<script setup lang="ts">
import type { DemoListItem } from '@ai-journey-land/shared'

defineProps<{
  demos: DemoListItem[]
  activeDemoId?: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <aside class="demo-sidebar">
    <div class="demo-sidebar__header">
      <p class="demo-sidebar__eyebrow">Demo Registry</p>
      <h2 class="demo-sidebar__title">AI 学习成果</h2>
    </div>

    <div class="demo-sidebar__list">
      <button
        v-for="demo in demos"
        :key="demo.id"
        class="demo-sidebar__item"
        :class="{ 'demo-sidebar__item--active': demo.id === activeDemoId }"
        type="button"
        @click="emit('select', demo.id)"
      >
        <span class="demo-sidebar__category">{{ demo.category }}</span>
        <span class="demo-sidebar__name">{{ demo.title }}</span>
        <span class="demo-sidebar__desc">{{ demo.description }}</span>
        <span class="demo-sidebar__tags">
          <UBadge v-for="tag in demo.tags" :key="tag" color="neutral" variant="soft" size="sm">
            {{ tag }}
          </UBadge>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.demo-sidebar {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 1rem;
}

.demo-sidebar__header {
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
  padding-bottom: 1rem;
}

.demo-sidebar__eyebrow {
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-sidebar__title {
  margin-top: 0.25rem;
  font-size: 1.35rem;
  font-weight: 800;
}

.demo-sidebar__list {
  display: grid;
  gap: 0.75rem;
}

.demo-sidebar__item {
  display: grid;
  gap: 0.45rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.9rem;
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.demo-sidebar__item:hover,
.demo-sidebar__item--active {
  border-color: rgba(13, 148, 136, 0.58);
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

.demo-sidebar__category {
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 700;
}

.demo-sidebar__name {
  font-weight: 800;
}

.demo-sidebar__desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
}

.demo-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
