<script setup lang="ts">
const route = useRoute()
const demoId = computed(() => String(route.params.id ?? ''))

const { selectedDemo, form, mode, output, errorMessage, isRunning, loadDemo, runDemo, streamDemo } =
  useDemoRunner()

const { records: savedReports, save: saveReport, remove: deleteSavedReport, loadAll: loadSavedReports } =
  useReportStore()

const nonMetaFields = computed(() =>
  (selectedDemo.value?.inputFields ?? []).filter(
    (f) => f.name !== 'role' && f.name !== 'authorName' && f.name !== 'reportType' && f.name !== 'dateRange',
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

const deletePopoverOpen = shallowRef<string | null>(null)

function closePopover() {
  deletePopoverOpen.value = null
}

function confirmDelete(id: string) {
  deleteReport(id)
  closePopover()
}

onMounted(() => {
  void loadCurrentDemo()
  void loadSavedReports()
})

const pageErrorMessage = shallowRef('')
const isLoadingDemo = shallowRef(true)

const pipelineSteps = [
  { icon: 'i-lucide-form-input', label: '输入数据', desc: 'role × reportType × data', color: '#0f766e' },
  { icon: 'i-lucide-braces', label: 'Prompt Template', desc: '变量填充 + FewShot 注入', color: '#0d9488' },
  { icon: 'i-lucide-link-2', label: 'LangChain', desc: 'PromptTemplate → ChatOpenAI', color: '#6366f1' },
  { icon: 'i-lucide-cpu', label: 'AI 模型', desc: 'OpenAI-compatible API', color: '#f59e0b' },
  { icon: 'i-lucide-radio', label: '输出', desc: '普通 / SSE Stream', color: '#0891b2' },
]

const codeAnalysisItems = [
  { file: 'schema.ts', title: '校验层', desc: 'Zod enum 限定 role 3 种、reportType 6 种；devActivities ≥15 字强校验' },
  { file: 'prompts/report-template.ts', title: 'Prompt 模板', desc: '支持 {role}/{reportType}/{dateRange} 变量注入，可选 FewShot 示例' },
  { file: 'service.ts', title: '组装层', desc: 'GUIDE+PERSPECTIVE 映射注入，reportTemplate → FewShot；双重 Zod 校验' },
  { file: 'useDemoRunner.ts', title: '运行状态机', desc: 'idle→loading→done/error；SSE 帧解析，Stream 逐 token 实时渲染' },
  { file: 'useReportStore.ts', title: '本地持久化', desc: 'IndexedDB CRUD，离线可用，按时间倒序' },
]

const techTags = [
  { name: 'PromptTemplate', desc: '变量填充' },
  { name: 'Role Injection', desc: '角色注入' },
  { name: 'LangChain', desc: '调用链封装' },
  { name: 'SSE Streaming', desc: '流式输出' },
  { name: 'Few-Shot', desc: '示例引导' },
  { name: 'Zod', desc: 'Schema 校验' },
]

function reportTypeColor(type: string): 'primary' | 'info' | 'success' | 'warning' | 'secondary' | 'error' | 'neutral' {
  switch (type) {
    case '日报': return 'info'
    case '周报': return 'primary'
    case '月报': return 'success'
    case '季度总结': return 'warning'
    case '半年总结': return 'secondary'
    case '年度总结': return 'error'
    default: return 'neutral'
  }
}

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

            <div class="grid gap-2 grid-cols-2 mb-3">
              <label class="grid gap-1.5 min-w-0">
                <span class="text-[0.82rem] font-bold text-[#334155]">姓名</span>
                <UInput
                  :model-value="form.authorName ?? ''"
                  placeholder="你的名字"
                  size="sm"
                  :disabled="isRunning"
                  @update:model-value="form.authorName = String($event ?? '')"
                />
              </label>

              <DemoRoleSelector
                v-if="selectedDemo.rolePresets && selectedDemo.rolePresets.length > 0"
                :model-value="form.role ?? ''"
                :presets="selectedDemo.rolePresets"
                :is-running="isRunning"
                @update:model-value="form.role = $event"
              />
            </div>

            <DemoReportTypeSelector
              v-if="selectedDemo.reportTypePresets && selectedDemo.reportTypePresets.length > 0"
              :model-value="form.reportType ?? ''"
              :date-range="form.dateRange ?? ''"
              :presets="selectedDemo.reportTypePresets"
              :is-running="isRunning"
              @update:model-value="form.reportType = $event"
              @update:date-range="form.dateRange = $event"
            />

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
                  <UBadge :color="reportTypeColor(record.reportType)" variant="soft" size="sm">
                    {{ record.reportType }}
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    <UIcon name="i-lucide-users" />
                    {{ record.role }}
                  </UBadge>
                  <span class="text-sm text-[var(--ui-text-muted)] whitespace-nowrap">
                    {{ new Date(record.createdAt).toLocaleString('zh-CN') }}
                  </span>
                </div>
                <UPopover :open="deletePopoverOpen === record.id" placement="bottom-end" @update:open="(v: boolean) => { if (!v) closePopover() }">
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="deletePopoverOpen = record.id"
                  />

                  <template #content>
                    <div class="grid gap-3 p-2">
                      <p class="text-sm whitespace-nowrap">确定要删除这份报告吗？</p>
                      <div class="flex gap-2 justify-end">
                        <UButton color="neutral" variant="ghost" size="xs" @click="closePopover">否</UButton>
                        <UButton color="error" variant="solid" size="xs" @click="confirmDelete(record.id)">是</UButton>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>
          </UCard>
        </div>

        <aside class="demo-page__side">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-target" />
                <span>学习目标</span>
              </div>
            </template>
            <p class="text-[#64748b] leading-relaxed text-sm">{{ selectedDemo.learningGoal }}</p>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="tag in techTags"
                :key="tag.name"
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.04em] bg-[var(--ui-bg-muted)] text-[var(--ui-text-muted)]"
              >
                {{ tag.name }}
              </span>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-git-branch" />
                <span>AI 技术架构</span>
              </div>
            </template>

            <div class="grid gap-0 pipeline">
              <div
                v-for="(step, i) in pipelineSteps"
                :key="step.label"
                class="flex items-center gap-3"
              >
                <div
                  class="flex-shrink-0 grid w-8 h-8 place-items-center rounded-lg text-white text-sm"
                  :style="{ background: step.color }"
                >
                  <UIcon :name="step.icon" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-[var(--ui-text-highlighted)]">{{ step.label }}</p>
                  <p class="text-xs text-[var(--ui-text-muted)]">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 font-extrabold">
                <UIcon name="i-lucide-layers" />
                <span>核心逻辑拆解</span>
              </div>
            </template>

            <div class="grid gap-3">
              <div v-for="item in codeAnalysisItems" :key="item.file" class="grid gap-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-[0.65rem] font-mono font-bold uppercase tracking-[0.06em] text-[var(--ui-primary)]">{{ item.file }}</span>
                  <span class="text-xs font-bold text-[var(--ui-text-highlighted)]">{{ item.title }}</span>
                </div>
                <p class="text-xs text-[var(--ui-text-muted)] leading-relaxed">{{ item.desc }}</p>
              </div>
            </div>
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

.pipeline {
  gap: 0;
}

.pipeline > * + * {
  margin-top: 0.75rem;
}

.pipeline > * + *::before {
  content: '';
  display: block;
  width: 1px;
  height: 0.75rem;
  margin-left: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.12);
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
