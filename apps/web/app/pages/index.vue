<script setup lang="ts">
import DemoCatalogCard from '~/components/catalog/DemoCatalogCard.vue'

const { demos, isLoading, errorMessage, loadCatalog } = useDemoCatalog()

onMounted(() => {
  void loadCatalog()
})
</script>

<template>
  <UContainer as="main" class="catalog-page">
    <header class="catalog-page__header">
      <div>
        <p class="catalog-page__eyebrow">AI-Journey-Land Demo Hub</p>
        <h1 class="catalog-page__title">把 AI 学习成果放进一个可探索的工程橱窗</h1>
        <p class="catalog-page__description">
          每个 demo 都保留来源上下文，并按独立 feature 边界沉淀接口、页面和运行契约。
        </p>
      </div>
      <div class="catalog-page__actions">
        <UBadge color="primary" variant="soft" size="lg">Nuxt 4 + NestJS</UBadge>
        <UBadge color="neutral" variant="soft" size="lg">Modular Monolith</UBadge>
      </div>
    </header>

    <section class="catalog-page__summary" aria-label="平台边界">
      <div class="catalog-page__summary-item">
        <UIcon name="i-lucide-store" />
        <span>橱窗首页</span>
      </div>
      <div class="catalog-page__summary-item">
        <UIcon name="i-lucide-route" />
        <span>独立 Demo 页面</span>
      </div>
      <div class="catalog-page__summary-item">
        <UIcon name="i-lucide-blocks" />
        <span>独立后端模块</span>
      </div>
    </section>

    <UAlert
      v-if="errorMessage"
      icon="i-lucide-circle-alert"
      color="error"
      variant="soft"
      title="Demo 列表加载失败"
      :description="errorMessage"
    />

    <section v-else-if="isLoading" class="catalog-page__loading" aria-label="正在加载">
      <UIcon name="i-lucide-loader-circle" class="catalog-page__loading-icon" />
      <span>正在读取 demo registry...</span>
    </section>

    <section v-else class="catalog-page__grid" aria-label="Demo 列表">
      <DemoCatalogCard v-for="(demo, index) in demos" :key="demo.id" :demo="demo" :index="index" />
    </section>
  </UContainer>
</template>

<style scoped>
.catalog-page {
  --ui-container: 1920px;
  padding-block: 2rem 4rem;
}

.catalog-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 0 1.5rem;
}

.catalog-page__eyebrow {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-page__title {
  max-width: 58rem;
  font-size: clamp(2rem, 5vw, 4.6rem);
  font-weight: 900;
  line-height: 0.98;
  margin-top: 0.45rem;
}

.catalog-page__description {
  margin-top: 0.5rem;
  max-width: 48rem;
  color: #64748b;
  line-height: 1.65;
}

.catalog-page__actions,
.catalog-page__summary,
.catalog-page__summary-item {
  display: flex;
  align-items: center;
}

.catalog-page__actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.catalog-page__summary {
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 1.25rem;
}

.catalog-page__summary-item {
  gap: 0.45rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.62);
  color: #334155;
  font-size: 0.88rem;
  font-weight: 750;
  padding: 0.55rem 0.75rem;
}

.catalog-page__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

.catalog-page__loading {
  display: grid;
  min-height: 18rem;
  place-items: center;
  border: 1px dashed rgba(15, 23, 42, 0.18);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.58);
  color: #64748b;
  gap: 0.65rem;
  text-align: center;
}

.catalog-page__loading-icon {
  color: #0f766e;
  font-size: 2rem;
  animation: spin 900ms linear infinite;
}

@media (max-width: 960px) {
  .catalog-page__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .catalog-page__actions {
    justify-content: flex-start;
  }
}

@media (min-width: 640px) {
  .catalog-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1120px) {
  .catalog-page__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1500px) {
  .catalog-page__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
