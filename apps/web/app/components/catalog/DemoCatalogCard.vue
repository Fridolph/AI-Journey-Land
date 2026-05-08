<script setup lang="ts">
import type { DemoListItem } from '@ai-journey-land/shared'

const props = defineProps<{
  demo: DemoListItem
  index: number
}>()

const displayModeLabel = computed(() =>
  props.demo.displayMode === 'custom-page' ? 'Custom Page' : 'Generic Runner',
)

const limitSummary = computed(() => props.demo.knownLimits[0] ?? '暂无已知限制。')
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
          <span>{{ demo.category }}</span>
        </div>
      </div>

      <div class="catalog-card__content">
        <div class="catalog-card__topline">
          <span>{{ demo.category }}</span>
          <UBadge
            :color="demo.displayMode === 'custom-page' ? 'primary' : 'neutral'"
            variant="soft"
          >
            {{ displayModeLabel }}
          </UBadge>
        </div>

        <div class="catalog-card__body">
          <h2 class="catalog-card__title">{{ demo.title }}</h2>
          <p class="catalog-card__description">{{ demo.description }}</p>
        </div>

        <div class="catalog-card__tags" aria-label="使用到的 AI 技术">
          <UBadge
            v-for="tag in demo.tags"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="sm"
            icon="i-lucide-cpu"
          >
            {{ tag }}
          </UBadge>
        </div>

        <div class="catalog-card__details">
          <p class="catalog-card__detail-text">{{ demo.learningGoal }}</p>
          <div class="catalog-card__detail-grid">
            <UTooltip text="后端 API namespace">
              <span class="catalog-card__namespace">
                <UIcon name="i-lucide-route" />
                {{ demo.apiNamespace }}
              </span>
            </UTooltip>
          </div>
          <p class="catalog-card__limit">
            <UIcon name="i-lucide-info" />
            <span>{{ limitSummary }}</span>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="catalog-card__footer">
          <div class="catalog-card__capabilities">
            <UBadge
              v-if="demo.supportsStreaming"
              icon="i-lucide-radio"
              color="primary"
              variant="soft"
            >
              Streaming
            </UBadge>
            <UBadge icon="i-lucide-panels-top-left" color="neutral" variant="soft">
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
  height: 24.5rem;
  overflow: hidden;
  transform: translateY(10px);
  animation: card-enter 420ms ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;
}

.catalog-card-link:hover .catalog-card,
.catalog-card-link:focus-visible .catalog-card {
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.13);
  transform: translateY(-3px);
}

.catalog-card__media {
  height: 8.75rem;
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
  align-items: flex-end;
  justify-content: space-between;
  color: var(--ui-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  padding: 1rem;
  text-transform: uppercase;
}

.catalog-card__media-placeholder svg {
  font-size: 2.25rem;
}

.catalog-card__content {
  padding: 1rem;
}

.catalog-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--ui-primary);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-card__body {
  margin-top: 0.8rem;
}

.catalog-card__title {
  max-width: 22rem;
  color: var(--ui-text-highlighted);
  font-size: 1.125rem;
  font-weight: 800;
  line-height: 1.22;
}

.catalog-card__description {
  margin-top: 0.65rem;
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.catalog-card__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  gap: 0.35rem;
}

.catalog-card__details {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: grid;
  height: 50%;
  align-content: start;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(2, 6, 23, 0.94);
  box-shadow: 0 -18px 42px rgba(2, 6, 23, 0.28);
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  overflow: auto;
  padding: 1rem;
  pointer-events: none;
  transform: translateY(100%);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.catalog-card-link:hover .catalog-card__details,
.catalog-card-link:focus-visible .catalog-card__details {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.catalog-card__detail-text,
.catalog-card__limit {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.86rem;
  line-height: 1.6;
}

.catalog-card__detail-grid,
.catalog-card__footer,
.catalog-card__capabilities {
  display: flex;
  align-items: center;
}

.catalog-card__detail-grid {
  flex-wrap: wrap;
  gap: 0.4rem;
}

.catalog-card__namespace {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.2;
  padding: 0.3rem 0.55rem;
}

.catalog-card__namespace svg {
  flex-shrink: 0;
  color: rgba(45, 212, 191, 0.96);
}

.catalog-card__limit {
  display: flex;
  gap: 0.4rem;
}

.catalog-card__limit svg {
  flex-shrink: 0;
  margin-top: 0.2rem;
  color: rgba(45, 212, 191, 0.94);
}

.catalog-card__footer {
  justify-content: space-between;
  gap: 1rem;
}

.catalog-card__capabilities {
  flex-wrap: wrap;
  gap: 0.4rem;
}

.catalog-card__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.35rem;
  color: var(--ui-primary);
  font-size: 0.86rem;
  font-weight: 800;
}

@media (max-width: 639px), (hover: none) {
  .catalog-card {
    height: 30rem;
  }

  .catalog-card__details {
    height: 50%;
    overflow: auto;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    -webkit-overflow-scrolling: touch;
  }
}

@keyframes card-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
