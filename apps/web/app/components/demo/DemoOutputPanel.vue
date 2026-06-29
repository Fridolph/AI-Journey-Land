<script setup lang="ts">
const props = defineProps<{
  mode: 'idle' | 'loading' | 'streaming' | 'done' | 'error'
  output: string
  errorMessage: string
}>()

const outputContentRef = useTemplateRef<HTMLElement>('outputContent')

const copied = ref(false)

async function copyOutput() {
  if (!props.output) return
  await navigator.clipboard.writeText(props.output)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1800)
}

let streamScrollTimer: ReturnType<typeof setInterval> | undefined
let lastStreamScrollAt = 0

function scrollOutputToBottom() {
  const outputContent = outputContentRef.value
  if (!outputContent) return
  outputContent.scrollTo({
    top: outputContent.scrollHeight,
    behavior: 'smooth',
  })
}

function stopStreamAutoScroll() {
  if (!streamScrollTimer) return
  clearInterval(streamScrollTimer)
  streamScrollTimer = undefined
}

watch(
  () => props.mode,
  async (mode) => {
    stopStreamAutoScroll()
    if (mode === 'done') {
      await nextTick()
      scrollOutputToBottom()
      return
    }
    if (mode !== 'streaming') return
    lastStreamScrollAt = 0
    await nextTick()
    scrollOutputToBottom()
    streamScrollTimer = setInterval(() => {
      scrollOutputToBottom()
    }, 3000)
  },
  { immediate: true },
)

watch(
  () => props.output,
  async () => {
    if (props.mode !== 'streaming') return
    const now = Date.now()
    if (now - lastStreamScrollAt < 3000) return
    lastStreamScrollAt = now
    await nextTick()
    scrollOutputToBottom()
  },
)

onBeforeUnmount(() => {
  stopStreamAutoScroll()
})
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p
          class="text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-land-primary">
          Model Output
        </p>
        <h3 class="mt-0.5 text-xl font-extrabold">运行结果</h3>
      </div>
      <UBadge v-if="mode === 'streaming'" color="primary" variant="soft"
        >Streaming</UBadge
      >
      <UBadge v-else-if="mode === 'loading'" color="warning" variant="soft"
        >Running</UBadge
      >
      <UBadge v-else-if="mode === 'done'" color="success" variant="soft">Done</UBadge>
      <UBadge v-else-if="mode === 'error'" color="error" variant="soft">Error</UBadge>
      <UBadge v-else color="neutral" variant="soft">Idle</UBadge>
    </div>

    <UAlert
      v-if="errorMessage"
      icon="i-lucide-circle-alert"
      color="error"
      variant="soft"
      title="运行失败"
      :description="errorMessage" />

    <div v-if="mode === 'loading'" class="output-panel__loading">
      <div class="output-panel__loading-orbit">
        <UIcon name="i-lucide-loader-circle" class="output-panel__loading-icon" />
      </div>
      <div>
        <p class="font-extrabold text-land-ink">模型正在生成...</p>
        <p class="mt-1.5 max-w-lg text-sm text-land-muted leading-relaxed">
          普通运行会等待完整响应返回；流式运行会继续使用 SSE 逐步展示 token。
        </p>
      </div>
      <div class="output-panel__skeleton">
        <span />
        <span />
        <span />
      </div>
    </div>

    <div v-if="output" class="relative">
      <button
        class="output-panel__copy-btn"
        :class="{ 'output-panel__copy-btn--done': copied }"
        @click="copyOutput">
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
      </button>
      <pre
        ref="outputContent"
        class="min-h-72 max-h-[33.75rem] overflow-auto whitespace-pre-wrap rounded-lg border border-black/10 bg-[#101816] px-4 py-4 text-[0.9rem] leading-relaxed text-[#d7fff4]"
        >{{ output }}</pre
      >
    </div>

    <div v-else-if="mode !== 'loading'" class="output-panel__empty">
      <UIcon name="i-lucide-terminal-square" class="text-2xl text-land-primary" />
      <span class="text-land-muted">等待一次真实模型调用。</span>
    </div>
  </section>
</template>

<style scoped>
/* BEM: loading/skeleton states exceed 9-class threshold */
.output-panel__loading {
  display: grid;
  min-height: 18rem;
  align-content: center;
  justify-items: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 0.5rem;
  background:
    linear-gradient(135deg, rgba(13, 148, 136, 0.1), rgba(15, 23, 42, 0.04)),
    rgba(255, 255, 255, 0.7);
  color: #334155;
  gap: 0.9rem;
  padding: 1.25rem;
  text-align: center;
}

.output-panel__loading-orbit {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}

.output-panel__loading-icon {
  font-size: 1.65rem;
  animation: spin 900ms linear infinite;
}

.output-panel__skeleton {
  display: grid;
  width: min(100%, 28rem);
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.output-panel__skeleton span {
  height: 0.65rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(15, 118, 110, 0.12),
    rgba(15, 118, 110, 0.28),
    rgba(15, 118, 110, 0.12)
  );
  animation: pulse 1.25s ease-in-out infinite;
}

.output-panel__skeleton span:nth-child(2) {
  width: 84%;
  animation-delay: 120ms;
}

.output-panel__skeleton span:nth-child(3) {
  width: 62%;
  animation-delay: 240ms;
}

/* BEM: copy button needs hover/position logic */
.output-panel__copy-btn {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 2;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid rgba(215, 255, 244, 0.18);
  border-radius: 0.35rem;
  background: rgba(215, 255, 244, 0.06);
  color: rgba(215, 255, 244, 0.6);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 140ms ease,
    background 120ms ease,
    color 120ms ease;
}

.output-panel__copy-btn--done {
  background: color-mix(in oklab, var(--ui-primary) 28%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  opacity: 1;
}

/* BEM: empty state */
.output-panel__empty {
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

/* hover show copy button */
.output-panel__copy-btn {
  opacity: 0;
}

.relative:hover .output-panel__copy-btn,
.output-panel__copy-btn--done {
  opacity: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  50% {
    opacity: 0.42;
  }
}
</style>
