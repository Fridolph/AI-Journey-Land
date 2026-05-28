<script setup lang="ts">
import type { DemoMeta, DemoSourceFiles } from '@ai-journey-land/shared'

defineProps<{
  demo: DemoMeta
  pipelineSteps: { icon: string; label: string; detail: string; color: string }[]
  codeAnalysisItems: { file: string; title: string; desc: string }[]
  techTags: { name: string; desc: string }[]
}>()
</script>

<template>
  <aside class="demo-page__side">
    <DemoCollapsibleCard title="学习目标" icon="i-lucide-target">
      <p class="text-[#64748b] leading-relaxed text-sm">{{ demo.learningGoal }}</p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="tag in techTags"
          :key="tag.name"
          class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.82rem] font-semibold bg-muted text-muted">
          {{ tag.name }}
        </span>
      </div>
    </DemoCollapsibleCard>

    <DemoCollapsibleCard title="AI 技术架构" icon="i-lucide-git-branch">
      <div class="grid gap-0 pipeline">
        <div
          v-for="(step, i) in pipelineSteps"
          :key="step.label"
          class="flex items-start gap-3">
          <div
            class="flex-shrink-0 grid w-7 h-7 place-items-center rounded-lg text-white text-xs mt-0.5"
            :style="{ background: step.color }">
            <span class="text-[0.6rem] font-bold">{{ i + 1 }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[0.875rem] font-bold text-highlighted">{{ step.label }}</p>
            <p class="text-[0.875rem] text-muted leading-relaxed mt-0.5">
              {{ step.detail }}
            </p>
          </div>
        </div>
      </div>
    </DemoCollapsibleCard>

    <DemoCollapsibleCard title="核心逻辑详解" icon="i-lucide-layers">
      <div class="grid gap-4">
        <div v-for="item in codeAnalysisItems" :key="item.file" class="grid gap-1">
          <div class="flex items-center gap-1.5">
            <span
              class="text-[0.82rem] font-mono font-bold text-primary bg-muted rounded px-1 py-px"
              >{{ item.file }}</span
            >
            <span class="text-[0.875rem] font-bold text-highlighted">{{
              item.title
            }}</span>
          </div>
          <p class="text-[0.875rem] text-muted leading-relaxed whitespace-pre-line">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </DemoCollapsibleCard>

    <DemoCollapsibleCard title="来源与上下文" icon="i-lucide-link">
      <DemoSourceLinks
        :demo-id="demo.id"
        :source-files="demo.sourceFiles"
        :source-url="demo.sourceUrl"
        :docs-url="demo.docsUrl"
        :draft-url="demo.draftUrl"
        :known-limits="demo.knownLimits" />
    </DemoCollapsibleCard>
  </aside>
</template>

<style scoped>
.demo-page__side {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .demo-page__side {
    grid-column: span 5;
  }
}

.pipeline {
  gap: 0;
}

.pipeline > * {
  position: relative;
}

.pipeline > * + * {
  margin-top: 1rem;
}

.pipeline > * + *::before {
  content: '';
  display: block;
  position: absolute;
  left: 0.85rem;
  top: -0.55rem;
  width: 1px;
  height: 0.55rem;
  background: rgba(15, 23, 42, 0.15);
}
</style>
