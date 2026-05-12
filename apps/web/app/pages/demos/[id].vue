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

    <section v-else-if="selectedDemo" class="grid gap-4">
      <UPageHeader :title="selectedDemo.title" :description="selectedDemo.description">
        <template #headline>
          <div class="flex flex-wrap gap-[0.45rem]">
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
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-file-input" />
                <span>输入数据</span>
              </div>
            </template>

            <div class="flex gap-2 flex-wrap mb-3">
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

            <div v-if="form.dateRange" class="grid gap-1.5 mb-3">
              <span class="text-[0.82rem] font-bold text-[#334155]">汇报时间</span>
              <span class="flex items-center gap-1.5 text-[0.9rem] font-semibold text-[var(--ui-primary)]">
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

            <div v-if="isSaveEnabled" class="mt-3">
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
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-archive" />
                <span>已保存报告（本地）</span>
                <UBadge color="neutral" variant="subtle" size="xs">
                  {{ savedReports.length }}
                </UBadge>
              </div>
            </template>

            <div class="grid gap-2">
              <div
                v-for="record in savedReports"
                :key="record.id"
                class="flex items-center justify-between gap-2 py-2.5 px-3 rounded-md bg-white/65 border border-black/5"
              >
                <div class="flex flex-wrap items-center gap-[0.45rem] min-w-0">
                  <UBadge color="primary" variant="soft" size="xs">
                    {{ record.reportType }}
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">
                    <UIcon name="i-lucide-users" />
                    {{ record.role }}
                  </UBadge>
                  <span class="text-[0.76rem] text-[var(--ui-text-muted)] whitespace-nowrap">
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
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-waypoints" />
                <span>关键代码业务逻辑</span>
              </div>
            </template>

            <ul class="grid gap-[0.9rem]">
              <li v-for="item in keyLogicItems" :key="item.title" class="grid gap-3 grid-cols-[auto,minmax(0,1fr)]">
                <span class="demo-page__logic-icon">
                  <UIcon :name="item.icon" />
                </span>
                <span>
                  <strong class="block text-[var(--ui-text-highlighted)]">{{ item.title }}</strong>
                  <small class="block mt-0.5 text-[var(--ui-text-muted)] leading-relaxed">{{ item.description }}</small>
                </span>
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-target" />
                <span>学习目标</span>
              </div>
            </template>
            <p class="text-[#64748b] leading-relaxed">{{ selectedDemo.learningGoal }}</p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-extrabold">
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
              <div class="flex items-center gap-2 font-extrabold">
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
/* BEM: complex states/animations exceeding Tailwind 9-class threshold */
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

.demo-page__logic-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 0.45rem;
  background: color-mix(in oklab, var(--ui-primary) 14%, transparent);
  color: var(--ui-primary);
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
