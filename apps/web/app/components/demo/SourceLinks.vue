<script setup lang="ts">
defineProps<{
  sourceUrl?: string
  docsUrl?: string
  draftUrl?: string
  knownLimits: string[]
}>()
</script>

<template>
  <section class="source-links">
    <div class="source-links__actions">
      <UButton
        v-if="sourceUrl"
        :to="sourceUrl"
        target="_blank"
        rel="noreferrer"
        icon="i-lucide-code-2"
        variant="subtle"
        color="neutral"
      >
        原始源码
      </UButton>
      <UButton
        v-if="docsUrl"
        :to="docsUrl"
        target="_blank"
        rel="noreferrer"
        icon="i-lucide-book-open"
        variant="subtle"
        color="neutral"
      >
        正式文档
      </UButton>
      <UButton
        v-if="draftUrl"
        :to="draftUrl"
        target="_blank"
        rel="noreferrer"
        icon="i-lucide-notebook-tabs"
        variant="subtle"
        color="neutral"
      >
        学习草稿
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
  gap: 0.9rem;
}

.source-links__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
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
