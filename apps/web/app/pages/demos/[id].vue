<script setup lang="ts">
import { demoSources } from '../../data/demo-sources'

const route = useRoute()
const demoId = computed(() => String(route.params.id ?? ''))

const { selectedDemo, form, mode, output, errorMessage, isRunning, loadDemo, runDemo, streamDemo } =
  useDemoRunner()

const { records: savedReports, save: saveReport, remove: deleteSavedReport, loadAll: loadSavedReports } =
  useReportStore()

const demoSource = computed(() => demoSources[demoId.value])

const nonMetaFields = computed(() =>
  (selectedDemo.value?.inputFields ?? []).filter(
    (f) => f.name !== 'role' && f.name !== 'reportType' && f.name !== 'dateRange',
  ),
)

const isSaveEnabled = computed(() => mode.value === 'done' && output.value.length > 0)

async function handleRun() {
  await runDemo()
  if (mode.value === 'done') {
    await saveCurrentResult()
  }
}

async function handleStream() {
  await streamDemo()
  if (mode.value === 'done') {
    await saveCurrentResult()
  }
}

async function saveCurrentResult() {
  if (!selectedDemo.value || !output.value) return

  await saveReport({
    demoId: selectedDemo.value.id,
    reportType: form.reportType ?? '',
    role: form.role ?? '',
    input: { ...form },
    output: output.value,
  })
}

async function deleteReport(id: string) {
  await deleteSavedReport(id)
}

onMounted(() => {
  void loadCurrentDemo()
  void loadSavedReports()
})

const pageErrorMessage = shallowRef('')
const isLoadingDemo = shallowRef(true)
const keyLogicItems = [
  {
    icon: 'i-lucide-list-checks',
    title: '输入契约',
    description: '共享 Zod schema 校验表单，前端字段和后端 DTO 从同一份类型推导。',
  },
  {
    icon: 'i-lucide-braces',
    title: 'Prompt Template',
    description: '模板是壳——同一套结构，填入不同角色和数据，AI 输出截然不同的专业文档。',
  },
  {
    icon: 'i-lucide-users',
    title: 'Role Injection',
    description: '角色是魂——技术 Leader、产品经理、CEO、实习生……同一份数据，四种视角。',
  },
  {
    icon: 'i-lucide-radio',
    title: '运行链路',
    description: '普通 run 返回完整文档，SSE stream 逐 token 输出——过程可观测、可对比。',
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
                <span>输入数据</span>
              </div>
            </template>

            <div class="demo-page__meta-row">
              <DemoRoleSelector
                v-if="selectedDemo.rolePresets && selectedDemo.rolePresets.length > 0"
                :model-value="form.role ?? ''"
                :presets="selectedDemo.rolePresets"
                :is-running="isRunning"
                @update:model-value="form.role = $event"
              />
              <DemoReportTypeSelector
                v-if="selectedDemo.reportTypePresets && selectedDemo.reportTypePresets.length > 0"
                :model-value="form.reportType ?? ''"
                :presets="selectedDemo.reportTypePresets"
                :is-running="isRunning"
                @update:model-value="form.reportType = $event"
                @update:date-range="form.dateRange = $event"
              />
            </div>

            <div v-if="form.dateRange" class="demo-page__date-row">
              <span class="demo-page__date-label">汇报时间</span>
              <span class="demo-page__date-value">
                <UIcon name="i-lucide-calendar-range" />
                {{ form.dateRange }}
              </span>
            </div>

            <DemoInputForm
              :model-value="form"
              :fields="nonMetaFields"
              :is-running="isRunning"
              @update:model-value="Object.assign(form, $event)"
              @run="handleRun"
              @stream="handleStream"
            />

            <div v-if="isSaveEnabled" class="demo-page__save-area">
              <UAlert
                icon="i-lucide-database"
                color="primary"
                variant="soft"
                title="已自动保存到本地"
                description="生成结果已存入浏览器 IndexedDB，可随时查看和删除。"
              />
            </div>
          </UCard>

          <UCard>
            <DemoOutputPanel :mode="mode" :output="output" :error-message="errorMessage" />
          </UCard>

          <UCard v-if="savedReports.length > 0">
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-archive" />
                <span>已保存报告（本地）</span>
                <UBadge color="neutral" variant="subtle" size="xs">
                  {{ savedReports.length }}
                </UBadge>
              </div>
            </template>

            <div class="demo-page__report-list">
              <div
                v-for="record in savedReports"
                :key="record.id"
                class="demo-page__report-item"
              >
                <div class="demo-page__report-meta">
                  <UBadge color="primary" variant="soft" size="xs">
                    {{ record.reportType }}
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">
                    <UIcon name="i-lucide-users" />
                    {{ record.role }}
                  </UBadge>
                  <span class="demo-page__report-time">
                    {{ new Date(record.createdAt).toLocaleString('zh-CN') }}
                  </span>
                </div>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="deleteReport(record.id)"
                />
              </div>
            </div>
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

          <UCard v-if="demoSource" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
              <div class="demo-page__section-title">
                <UIcon name="i-lucide-file-code-2" />
                <span>原始源码对照</span>
              </div>
            </template>
            <DemoSourceCode
              :code="demoSource.code"
              :language="demoSource.language"
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

.demo-page__meta-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.demo-page__date-row {
  display: grid;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.demo-page__date-label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}

.demo-page__date-value {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--ui-primary);
  font-size: 0.9rem;
  font-weight: 650;
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

.demo-page__save-area {
  margin-top: 0.75rem;
}

.demo-page__report-list {
  display: grid;
  gap: 0.5rem;
}

.demo-page__report-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.demo-page__report-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.demo-page__report-time {
  color: var(--ui-text-muted);
  font-size: 0.76rem;
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
