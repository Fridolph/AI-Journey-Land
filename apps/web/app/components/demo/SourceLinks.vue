<script setup lang="ts">
import type { DemoSourceFiles } from '@ai-journey-land/shared'

defineProps<{
  demoId?: string
  sourceFiles?: DemoSourceFiles
  sourceUrl?: string
  docsUrl?: string
  draftUrl?: string
  knownLimits: string[]
}>()
</script>

<template>
  <section class="source-links">
    <div v-if="demoId" class="source-links__demo-id">
      <UIcon name="i-lucide-folder-git-2" class="source-links__demo-id-icon" />
      <span>{{ demoId }}</span>
    </div>

    <div v-if="sourceFiles" class="source-links__files">
      <div class="source-links__files-group">
        <span class="source-links__files-label">API</span>
        <p class="source-links__files-path">{{ sourceFiles.apiDir }}</p>
        <ul class="source-links__files-list">
          <li v-for="f in sourceFiles.apiFiles" :key="f">{{ f }}</li>
        </ul>
      </div>
      <div class="source-links__files-group">
        <span class="source-links__files-label">Web</span>
        <p class="source-links__files-path">{{ sourceFiles.webDir }}</p>
        <ul class="source-links__files-list">
          <li v-for="f in sourceFiles.webFiles" :key="f">{{ f }}</li>
        </ul>
      </div>
    </div>

    <div class="source-links__actions">
      <UButton
        v-if="sourceUrl"
        :to="sourceUrl"
        target="_blank"
        rel="noreferrer"
        icon="i-lucide-code-2"
        variant="subtle"
        color="neutral"
        size="xs">
        原始源码
      </UButton>
    </div>

    <div v-if="knownLimits.length > 0" class="source-links__limits">
      <span class="source-links__limits-label">已知限制</span>
      <ul class="source-links__limit-list">
        <li v-for="limit in knownLimits" :key="limit">{{ limit }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.source-links {
  display: grid;
  gap: 0.8rem;
}

.source-links__demo-id {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--ui-primary);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
}

.source-links__demo-id-icon {
  font-size: 0.9rem;
}

.source-links__files {
  display: grid;
  gap: 0.6rem;
}

.source-links__files-group {
  display: grid;
  gap: 0.25rem;
}

.source-links__files-label {
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.source-links__files-path {
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  font-family: ui-monospace, monospace;
}

.source-links__files-list {
  display: grid;
  gap: 0.15rem;
  padding-left: 0.8rem;
  border-left: 1px solid rgba(15, 23, 42, 0.12);
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-family: ui-monospace, monospace;
}

.source-links__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.source-links__limits {
  border-left: 3px solid #0f766e;
  padding-left: 0.8rem;
}

.source-links__limits-label {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
}

.source-links__limit-list {
  margin-top: 0.35rem;
  display: grid;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.86rem;
}
</style>
