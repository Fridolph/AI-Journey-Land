<script setup lang="ts">
interface CodeToken {
  type: 'plain' | 'comment' | 'keyword' | 'number' | 'punctuation' | 'string'
  value: string
}

const props = defineProps<{
  code: string
  language?: string
  filename?: string
}>()

const copied = shallowRef(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const keywords = new Set([
  'await',
  'const',
  'for',
  'from',
  'if',
  'import',
  'in',
  'new',
  'of',
])

const lines = computed(() => splitTokensByLine(tokenizeCode(props.code)))
const languageLabel = computed(() => props.language ?? 'code')

function tokenizeCode(code: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0

  while (index < code.length) {
    const char = code[index] ?? ''
    const next = code[index + 1] ?? ''

    if (!char) {
      break
    }

    if (char === '/' && next === '/') {
      const end = code.indexOf('\n', index)
      const tokenEnd = end === -1 ? code.length : end
      tokens.push({ type: 'comment', value: code.slice(index, tokenEnd) })
      index = tokenEnd
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      const quote = char
      let cursor = index + 1

      while (cursor < code.length) {
        if (code[cursor] === '\\') {
          cursor += 2
          continue
        }

        if (code[cursor] === quote) {
          cursor += 1
          break
        }

        cursor += 1
      }

      tokens.push({ type: 'string', value: code.slice(index, cursor) })
      index = cursor
      continue
    }

    if (/\d/.test(char)) {
      const match = code.slice(index).match(/^\d+(?:\.\d+)?/)
      const value = match?.[0] ?? char
      tokens.push({ type: 'number', value })
      index += value.length
      continue
    }

    if (/[A-Za-z_$]/.test(char)) {
      const match = code.slice(index).match(/^[A-Za-z_$][\w$]*/)
      const value = match?.[0] ?? char
      tokens.push({ type: keywords.has(value) ? 'keyword' : 'plain', value })
      index += value.length
      continue
    }

    if (/[{}()[\].,;:+*=<>-]/.test(char)) {
      tokens.push({ type: 'punctuation', value: char })
      index += 1
      continue
    }

    tokens.push({ type: 'plain', value: char })
    index += 1
  }

  return tokens
}

function splitTokensByLine(tokens: CodeToken[]): CodeToken[][] {
  const rows: CodeToken[][] = [[]]

  for (const token of tokens) {
    const parts = token.value.split('\n')

    parts.forEach((part, partIndex) => {
      if (partIndex > 0) {
        rows.push([])
      }

      if (part.length > 0) {
        rows.at(-1)?.push({ ...token, value: part })
      }
    })
  }

  return rows
}

async function copyCode() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true

  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }

  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 1600)
}

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
})
</script>

<template>
  <section class="source-code">
    <div class="source-code__toolbar">
      <div class="source-code__meta">
        <UIcon name="i-lucide-file-code-2" />
        <span>{{ filename ?? 'source' }}</span>
        <UBadge color="neutral" variant="subtle" size="sm">{{ languageLabel }}</UBadge>
      </div>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        @click="copyCode">
        {{ copied ? '已复制' : '复制' }}
      </UButton>
    </div>

    <div class="source-code__scroller">
      <pre
        class="source-code__pre"
        :aria-label="`${filename ?? 'source'} 源码`"><code><span
        v-for="(line, lineIndex) in lines"
        :key="lineIndex"
        class="source-code__line"
      ><span class="source-code__line-number">{{ lineIndex + 1 }}</span><span class="source-code__line-content"><span
        v-for="(token, tokenIndex) in line"
        :key="`${lineIndex}-${tokenIndex}`"
        :class="`source-code__token source-code__token--${token.type}`"
      >{{ token.value }}</span></span></span></code></pre>
    </div>
  </section>
</template>

<style scoped>
.source-code {
  overflow: hidden;
  background: #0f172a;
}

.source-code__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.92);
  color: #dbeafe;
  padding: 0.65rem 0.85rem;
}

.source-code__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.source-code__scroller {
  max-height: 42rem;
  overflow: auto;
}

.source-code__pre {
  min-width: max-content;
  margin: 0;
  color: #cbd5e1;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.65;
  padding: 0.45rem 0;
  tab-size: 2;
}

.source-code__line {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  min-height: 1.35rem;
}

.source-code__line-number {
  user-select: none;
  color: #64748b;
  padding: 0 0.9rem;
  text-align: right;
}

.source-code__line-content {
  padding-right: 1rem;
  white-space: pre;
}

.source-code__token--comment {
  color: #7dd3fc;
  font-style: italic;
}

.source-code__token--keyword {
  color: #c4b5fd;
  font-weight: 800;
}

.source-code__token--number {
  color: #fbbf24;
}

.source-code__token--punctuation {
  color: #94a3b8;
}

.source-code__token--string {
  color: #86efac;
}
</style>
