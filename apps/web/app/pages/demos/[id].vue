<script setup lang="ts">
import type { ReportRecord } from '~/composables/useReportStore'

const route = useRoute()
const demoId = computed(() => String(route.params.id ?? ''))

const DEFAULT_PROMPT = `你是一名{role}，需要根据以下数据生成一份专业的 Markdown 文档。

【角色视角】{rolePerspective}

报告类型：{reportType}
{authorName}
{companyName}{teamName}{managerName}时间范围：{dateRange}

{teamGoal}

活动数据：
{devActivities}
{fewShotExample}
请生成一份格式规范的【{reportType}】，要求：
- 开头有简短的整体 summary（两三句话）
- {reportTypeGuide}
- 语气和视角贴合 {role} 的身份定位
- 适合作为给老板和团队传阅的专业文档`

const { selectedDemo, form, mode, output, errorMessage, isRunning, loadDemo, runDemo, streamDemo } =
  useDemoRunner()

const { records: savedReports, save: saveReport, remove: deleteSavedReport, loadAll: loadSavedReports } =
  useReportStore()

const customPrompt = ref(DEFAULT_PROMPT)
const showPrompt = ref(false)

function resetPrompt() {
  customPrompt.value = DEFAULT_PROMPT
}

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
    input: { ...form, customPrompt: customPrompt.value },
    output: output.value,
  })
}

async function deleteReport(id: string) {
  await deleteSavedReport(id)
}

function viewReport(record: ReportRecord) {
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, record.input)

  const savedPrompt = typeof record.input === 'object' && record.input !== null && 'customPrompt' in record.input
    ? String((record.input as Record<string, string>).customPrompt ?? DEFAULT_PROMPT)
    : DEFAULT_PROMPT
  customPrompt.value = savedPrompt

  output.value = record.output
  errorMessage.value = ''
  mode.value = 'done'
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
  {
    icon: 'i-lucide-form-input',
    label: '用户输入层',
    detail: 'UI Form 收集 role/reportType/dateRange/companyName/devActivities 等字段，Zod Schema 前端预校验 ≥15 字，通过后 POST /api/demos/:id/run（或 /stream）',
    color: '#0f766e',
  },
  {
    icon: 'i-lucide-shield-check',
    label: 'Schema 校验层',
    detail: '后端 NestJS Controller 接收 JSON body → DemosService 路由到对应 DemoRunner → parseRunRequest() 先走通用 demoRunRequestSchema，再走 demo 专属 schema（z.enum + min/max）',
    color: '#0891b2',
  },
  {
    icon: 'i-lucide-braces',
    label: 'Prompt 组装层',
    detail: 'formatPrompt() 从 prompts/ 目录加载模板 → 注入 role/reportType/dateRange → REPORT_TYPE_GUIDE 映射结构指引 → ROLE_PERSPECTIVE 映射角色视角 → 可选 FewShot 示例注入 → 返回完整 prompt 字符串',
    color: '#0d9488',
  },
  {
    icon: 'i-lucide-link-2',
    label: 'LangChain 调用层',
    detail: 'PromptTemplate.fromTemplate() 解析变量占位 → model.invoke(prompt) 普通调用 或 model.stream(prompt) 流式调用 → ChatOpenAI 底层走 OpenAI-compatible API（DashScope / DeepSeek）',
    color: '#6366f1',
  },
  {
    icon: 'i-lucide-cpu',
    label: 'AI 模型层',
    detail: 'AiService 统一管理 Provider 配置 → OpenAI / DeepSeek Adapter → ChatOpenAI 实例化 → 支持 temperature 调节输出随机性',
    color: '#f59e0b',
  },
  {
    icon: 'i-lucide-radio',
    label: '输出 & 持久化层',
    detail: '普通输出：等待完整 result → 前端展示 Markdown。流式输出：SSE event:meta/token/done/error → useDemoRunner 解析 SSE 帧 → 实时渲染 → 生成完成后自动写入 IndexedDB',
    color: '#dc2626',
  },
]

const codeAnalysisItems = [
  {
    file: 'schema.ts',
    title: 'Zod Schema 约束设计',
    desc: '定义 REPORT_ROLES 和 REPORT_TYPES 两组 const enum，导出类型供前端复用。devActivities 用 z.string().min(15) 强校验，其余字段可选（z.optional().default("")）。reportTemplate 为 Few-Shot 入口，customPrompt 为 Prompt 覆盖入口。',
  },
  {
    file: 'prompts/',
    title: 'Prompt 模板维护与管理',
    desc: '按职责拆分为独立文件：guides.ts（REPORT_TYPE_GUIDE 结构指引）、perspectives.ts（ROLE_PERSPECTIVE 角色视角）、report-template.ts（主模板）。通过 index.ts barrel 统一导出。新增 demo 参照此模式在各自目录下建 prompts/ 目录。',
  },
  {
    file: 'service.ts',
    title: '组装、校验与调度',
    desc: 'parseRunRequest() 双重检验：先走共享 demoRunRequestSchema（Record<string,string>），再走 demo 专属 schema（enum + min）。\n\nformatPrompt() 调用流程：① 若提供了 customPrompt 则用它替代默认模板 ② 注入 GUIDE+PERSPECTIVE+FewShot ③ 按需拼接可选字段（authorName/companyName 等），避免空行。\n\nrun() 和 stream() 共享同一套 prompt 逻辑，差异仅在 model.invoke() vs model.stream()。',
  },
  {
    file: 'useDemoRunner.ts',
    title: '前端运行状态机',
    desc: '管理 mode 状态：idle → loading（普通）/ streaming（流式）→ done / error。\n\nrunDemo()：$fetch POST 普通运行，解包 ApiResponse<T> 取出 data。streamDemo()：原生 fetch + ReadableStream 逐帧解析 SSE（event:/data: 分隔），buffer 累积处理粘包。\n\n滚动策略：streaming 时每 3s 自动 scrollTo bottom，避免频繁打断阅读。',
  },
  {
    file: 'useReportStore.ts',
    title: 'IndexedDB 本地持久化',
    desc: '封装 openDB() 初始化 idb（keyPath: id，索引：demoId / reportType / createdAt）。save() 自动生成 crypto.randomUUID() + ISO 时间戳，input 中携带 customPrompt。loadAll() 按 createdAt 倒序排列。remove() / removeAll() 支持单条和批量删除。\n\nviewReport() 回填：从 record.input 恢复全部表单字段 + customPrompt，设置 output 和 mode="done"，让用户无缝切换查看历史报告。\n\n浏览器端离线可用，无需后端数据库，数据完全由用户掌控。',
  },
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
              class="mb-3"
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

          <UCard :ui="{ body: showPrompt ? undefined : 'hidden' }">
            <template #header>
              <button type="button" class="flex items-center justify-between gap-2 w-full cursor-pointer" @click="showPrompt = !showPrompt">
                <div class="flex items-center gap-2 font-extrabold">
                  <UIcon name="i-lucide-braces" />
                  <span>Prompt 模板</span>
                  <span v-if="customPrompt !== DEFAULT_PROMPT" class="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div class="flex items-center gap-2">
                  <UButton v-if="customPrompt !== DEFAULT_PROMPT && !showPrompt" size="xs" variant="ghost" color="neutral" @click.stop="resetPrompt">
                    重置
                  </UButton>
                  <UIcon :name="showPrompt ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-muted" />
                </div>
              </button>
            </template>
            <div v-if="showPrompt" class="grid gap-2">
              <p class="text-sm text-muted">
                下方是即将发送给 AI 的 Prompt 模板。你可以直接修改它来调整 AI 的输出风格。变量占位（如 {role}）会在运行时自动替换。
              </p>
              <UTextarea :model-value="customPrompt" :rows="12" :disabled="isRunning" autoresize @update:model-value="customPrompt = String($event ?? '')" />
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
                  <span class="text-sm text-muted whitespace-nowrap">
                    {{ new Date(record.createdAt).toLocaleString('zh-CN') }}
                  </span>
                </div>
                <div class="flex items-center gap-0.5">
                  <UButton
                    icon="i-lucide-eye"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="viewReport(record)"
                  />
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
            </div>
          </UCard>
        </div>

        <DemoInsightPanel
          :demo="selectedDemo"
          :pipeline-steps="pipelineSteps"
          :code-analysis-items="codeAnalysisItems"
          :tech-tags="techTags"
        />
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

.demo-page__primary {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .demo-page__body {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .demo-page__primary {
    grid-column: span 7;
  }
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
