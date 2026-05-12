<script setup lang="ts">
import type { DemoListItem } from '@ai-journey-land/shared'

const props = defineProps<{
  demo: DemoListItem
  index: number
}>()

const displayModeLabel = computed(() =>
  props.demo.displayMode === 'custom-page' ? 'Custom Page' : 'Generic Runner',
)
</script>

<template>
  <NuxtLink class="catalog-card-link" :to="demo.routePath">
    <UCard
      as="article"
      class="catalog-card"
      :style="{ '--delay': `${index * 60}ms` }"
      :ui="{ body: 'p-0 sm:p-0', footer: 'p-4 sm:px-5 sm:py-4' }"
    >
      <div class="catalog-card__media" aria-hidden="true">
        <img
          v-if="demo.coverImageUrl"
          class="catalog-card__image"
          :src="demo.coverImageUrl"
          :alt="demo.coverAlt ?? demo.title"
        />
        <div v-else class="catalog-card__media-placeholder">
          <UIcon name="i-lucide-sparkles" />
          <UIcon name="i-lucide-brain" class="catalog-card__media-placeholder-icon" />
          <UIcon name="i-lucide-zap" class="catalog-card__media-placeholder-icon" />
        </div>
      </div>

      <div class="catalog-card__content">
        <div class="catalog-card__topline">
          <UBadge :inert="true" color="neutral" variant="subtle" size="xs">
            {{ demo.category }}
          </UBadge>
          <UBadge
            v-if="demo.supportsStreaming"
            icon="i-lucide-radio"
            color="primary"
            variant="soft"
            size="xs"
          >
            SSE
          </UBadge>
        </div>

        <h2 class="catalog-card__title">{{ demo.title }}</h2>
        <p class="catalog-card__description">{{ demo.description }}</p>

        <div class="catalog-card__techs" aria-label="使用到的 AI 技术">
          <span
            v-for="tag in demo.tags"
            :key="tag"
            class="catalog-card__tech-tag"
          >
            <UIcon
              :name="tag === 'Streaming' ? 'i-lucide-radio' : tag === 'LangChain' ? 'i-lucide-link-2' : 'i-lucide-file-text'"
              class="catalog-card__tech-icon"
            />
            {{ tag }}
          </span>
        </div>

        <div class="catalog-card__goal">
          <UIcon name="i-lucide-bullseye" class="catalog-card__goal-icon" />
          <span>{{ demo.learningGoal }}</span>
        </div>

        <p v-if="demo.knownLimits.length > 0" class="catalog-card__limit">
          <UIcon name="i-lucide-info" />
          <span>{{ demo.knownLimits[0] }}</span>
        </p>
      </div>

      <template #footer>
        <div class="catalog-card__footer">
          <div class="catalog-card__capabilities">
            <UBadge icon="i-lucide-panels-top-left" color="neutral" variant="soft" size="sm">
              {{ displayModeLabel }}
            </UBadge>
          </div>
          <span class="catalog-card__action">
            打开 demo
            <UIcon name="i-lucide-arrow-up-right" />
          </span>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>

<style scoped>
.catalog-card-link {
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.catalog-card {
  --delay: 0ms;
  position: relative;
  overflow: hidden;
  transform: translateY(10px);
  animation: card-enter 420ms ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transition:
    box-shadow 200ms ease,
    transform 200ms ease;
}

.catalog-card-link:hover .catalog-card,
.catalog-card-link:focus-visible .catalog-card {
  box-shadow: 0 10px 36px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}

.catalog-card__media {
  height: 6.5rem;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(13, 148, 136, 0.16), rgba(15, 23, 42, 0.04)),
    radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.2), transparent 9rem);
}

.catalog-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-card__media-placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--ui-primary);
  opacity: 0.48;
}

.catalog-card__media-placeholder > .i-lucide-sparkles {
  font-size: 2rem;
}

.catalog-card__media-placeholder-icon {
  font-size: 1.35rem;
}

.catalog-card__content {
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
}

.catalog-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.catalog-card__title {
  max-width: 22rem;
  color: var(--ui-text-highlighted);
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.25;
}

.catalog-card__description {
  color: var(--ui-text-muted);
  font-size: 0.865rem;
  line-height: 1.6;
}

.catalog-card__techs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.catalog-card__tech-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.4rem;
  background: color-mix(in oklab, var(--ui-primary) 7%, transparent);
  color: var(--ui-primary);
  font-size: 0.78rem;
  font-weight: 750;
  padding: 0.3rem 0.55rem;
}

.catalog-card__tech-icon {
  font-size: 0.88rem;
}

.catalog-card__goal {
  display: flex;
  gap: 0.4rem;
  color: var(--ui-text-muted);
  font-size: 0.81rem;
  line-height: 1.6;
}

.catalog-card__goal-icon {
  flex-shrink: 0;
  margin-top: 0.22rem;
  color: var(--ui-primary);
  opacity: 0.7;
}

.catalog-card__limit {
  display: flex;
  gap: 0.4rem;
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  opacity: 0.72;
  line-height: 1.5;
}

.catalog-card__limit svg {
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.catalog-card__footer,
.catalog-card__capabilities {
  display: flex;
  align-items: center;
}

.catalog-card__footer {
  justify-content: space-between;
  gap: 0.5rem;
}

.catalog-card__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.3rem;
  color: var(--ui-primary);
  font-size: 0.85rem;
  font-weight: 800;
}

@media (max-width: 639px) {
  .catalog-card__title {
    font-size: 1.05rem;
  }
}

@keyframes card-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
