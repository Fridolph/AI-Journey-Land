<script setup lang="ts">
const route = useRoute()
const demoId = computed(() => String(route.params.id ?? ''))

const { selectedDemo, form, mode, output, errorMessage, isRunning, loadDemo, runDemo, streamDemo } =
  useDemoRunner()

const pageErrorMessage = shallowRef('')
const isLoadingDemo = shallowRef(true)
const keyLogicItems = [
  {
    icon: 'i-lucide-list-checks',
    title: '输入契约',
    description: '共享 Zod schema 校验表单输入，前端字段和后端 DTO 从同一份类型推导。',
  },
  {
    icon: 'i-lucide-braces',
    title: 'Prompt Template',
    description: '后端 demo service 将业务字段填入周报模板，生成稳定的模型调用 prompt。',
  },
  {
    icon: 'i-lucide-radio',
    title: '运行链路',
    description: '普通运行返回完整文本，流式运行通过 SSE 输出 meta、token、done、error 事件。',
  },
]

const sourceFilename = computed(() => {
  if (!selectedDemo.value?.sourceUrl) {
    return 'source'
  }

  return selectedDemo.value.sourceUrl.split('/').at(-1) ?? 'source'
})

async function loadCurrentDemo() {
  if (!demoId.value) {
    pageErrorMessage.value = '缺少 demo id。'
    isLoadingDemo.value = false
    return
  }

  isLoadingDemo.value = true
  pageErrorMessage.value = ''

  try {
    await loadDemo(demoId.value)
  } catch (error) {
    pageErrorMessage.value = error instanceof Error ? error.message : 'Demo 信息加载失败'
  } finally {
    isLoadingDemo.value = false
  }
}

onMounted(() => {
  void loadCurrentDemo()
})
</script>

<template>
  <UContainer as="main" class="demo-page">
    <section v-if="pageErrorMessage" class="demo-page__state">
      <UAlert
        icon="i-lucide-circle-alert"
        color="error"
        variant="soft"
        title="Demo 加载失败"
        :description="pageErrorMessage"
      />
    </section>

    <section v-else-if="isLoadingDemo" class="demo-page__state" aria-label="正在加载">
      <UIcon name="i-lucide-loader-circle" class="demo-page__loading-icon" />
      <span>正在加载 demo 配置...</span>
    </section>

    <section v-else-if="selectedDemo" class="demo-page__workspace">
      <UPageHeader :title="selectedDemo.title" :description="selectedDemo.description">
        <template #headline>
          <div class="demo-page__badges">
            <UBadge color="primary" variant="soft">{{ selectedDemo.category }}</UBadge>
            <UBadge v-if="selectedDemo.supportsStreaming" icon="i-lucide-radio" color="primary">
              支持流式输出
            </UBadge>
            <UBadge color="neutral" variant="soft">{{ selectedDemo.displayMode }}</UBadge>
          </div>
        </template>

        <template #links>
          <UButton to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral"
            >返回橱窗</UButton
          >
          <UButton
            v-if="selectedDemo.sourceUrl"
            :to="selectedDemo.sourceUrl"
            target="_blank"
            rel="noreferrer"
            icon="i-lucide-code-2"
            color="neutral"
            variant="outline"
          >
            原始源码
          </UButton>
        </template>
      </UPageHeader>

      <section class="demo-page__body">
        <div class="demo-page__primary">
          <UCard>
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-file-input" />
                <span>输入参数</span>
              </div>
            </template>
            <DemoInputForm
              :model-value="form"
              :fields="selectedDemo.inputFields"
              :is-running="isRunning"
              @update:model-value="Object.assign(form, $event)"
              @run="runDemo"
              @stream="streamDemo"
            />
          </UCard>

          <UCard>
            <DemoOutputPanel :mode="mode" :output="output" :error-message="errorMessage" />
          </UCard>
        </div>

        <aside class="demo-page__side">
          <UCard>
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-waypoints" />
                <span>关键代码业务逻辑</span>
              </div>
            </template>

            <ul class="demo-page__logic-list">
              <li v-for="item in keyLogicItems" :key="item.title" class="demo-page__logic-item">
                <span class="demo-page__logic-icon">
                  <UIcon :name="item.icon" />
                </span>
                <span>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.description }}</small>
                </span>
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-target" />
                <span>学习目标</span>
              </div>
            </template>
            <p class="demo-page__learning-goal">{{ selectedDemo.learningGoal }}</p>
          </UCard>

          <UCard>
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-link" />
                <span>来源与上下文</span>
              </div>
            </template>
            <DemoSourceLinks
              :source-url="selectedDemo.sourceUrl"
              :docs-url="selectedDemo.docsUrl"
              :draft-url="selectedDemo.draftUrl"
              :known-limits="selectedDemo.knownLimits"
            />
          </UCard>

          <UCard v-if="selectedDemo.sourceCode" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-file-code-2" />
                <span>原始源码对照</span>
              </div>
            </template>
            <DemoSourceCode
              :code="selectedDemo.sourceCode"
              :language="selectedDemo.sourceLanguage"
              :filename="sourceFilename"
            />
          </UCard>
        </aside>
      </section>
    </section>
  </UContainer>
</template>

<style scoped>
.demo-page {
  --ui-container: 1920px;
  padding-block: 1rem 4rem;
}

.demo-page__state {
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

.demo-page__loading-icon {
  color: #0f766e;
  font-size: 2rem;
  animation: spin 900ms linear infinite;
}

.demo-page__workspace {
  display: grid;
  gap: 1rem;
}

.demo-page__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.demo-page__learning-goal {
  color: #64748b;
  line-height: 1.7;
}

.demo-page__body {
  display: grid;
  align-items: start;
  gap: 1rem;
}

.demo-page__primary,
.demo-page__side {
  display: grid;
  gap: 1rem;
}

.demo-page__section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
}

.demo-page__logic-list {
  display: grid;
  gap: 0.9rem;
}

.demo-page__logic-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
}

.demo-page__logic-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 0.45rem;
  background: color-mix(in oklab, var(--ui-primary) 14%, transparent);
  color: var(--ui-primary);
}

.demo-page__logic-item strong,
.demo-page__logic-item small {
  display: block;
}

.demo-page__logic-item strong {
  color: var(--ui-text-highlighted);
}

.demo-page__logic-item small {
  margin-top: 0.2rem;
  color: var(--ui-text-muted);
  line-height: 1.6;
}

@media (min-width: 1024px) {
  .demo-page__body {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .demo-page__primary {
    grid-column: span 7;
  }

  .demo-page__side {
    grid-column: span 5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
