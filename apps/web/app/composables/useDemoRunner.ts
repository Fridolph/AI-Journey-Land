import { computed, reactive, shallowRef } from 'vue'
import type { ApiResponse, DemoMeta, DemoRunResponse } from '@ai-journey-land/shared'

type RunMode = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

interface SseFrame {
  event: string
  data: string
}

function parseSseFrames(buffer: string): {
  frames: SseFrame[]
  rest: string
} {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() ?? ''
  const frames = parts.flatMap((part) => {
    const eventLine = part.split('\n').find((line) => line.startsWith('event:'))
    const dataLine = part.split('\n').find((line) => line.startsWith('data:'))

    if (!eventLine || !dataLine) {
      return []
    }

    return [
      {
        event: eventLine.replace('event:', '').trim(),
        data: dataLine.replace('data:', '').trim(),
      },
    ]
  })

  return { frames, rest }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data &&
    typeof error.data.message === 'string'
  ) {
    return error.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function useDemoRunner() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => config.public.apiBase)
  const selectedDemo = shallowRef<DemoMeta | null>(null)
  const mode = shallowRef<RunMode>('idle')
  const output = shallowRef('')
  const errorMessage = shallowRef('')
  const form = reactive<Record<string, string>>({})

  const isRunning = computed(() => mode.value === 'loading' || mode.value === 'streaming')

  async function loadDemo(id: string) {
    const response = await $fetch<ApiResponse<DemoMeta>>(`${apiBase.value}/demos/${id}`)
    selectedDemo.value = response.data
    resetForm()
    resetOutput()
  }

  function resetForm() {
    Object.keys(form).forEach((key) => {
      delete form[key]
    })

    for (const field of selectedDemo.value?.inputFields ?? []) {
      form[field.name] = field.defaultValue
    }
  }

  function resetOutput() {
    output.value = ''
    errorMessage.value = ''
    mode.value = 'idle'
  }

  async function runDemo() {
    if (!selectedDemo.value) {
      return
    }

    output.value = ''
    errorMessage.value = ''
    mode.value = 'loading'

    try {
      const response = await $fetch<ApiResponse<DemoRunResponse>>(
        `${apiBase.value}/demos/${selectedDemo.value.id}/run`,
        {
          method: 'POST',
          body: {
            input: { ...form },
          },
        },
      )
      output.value = response.data?.output ?? ''
      mode.value = 'done'
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'Demo 运行失败')
      mode.value = 'error'
    }
  }

  async function streamDemo() {
    if (!selectedDemo.value) {
      return
    }

    output.value = ''
    errorMessage.value = ''
    mode.value = 'streaming'

    try {
      const response = await fetch(
        `${apiBase.value}/demos/${selectedDemo.value.id}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { ...form },
          }),
        },
      )

      if (!response.body) {
        throw new Error('当前浏览器没有返回可读流。')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const parsed = parseSseFrames(buffer)
        buffer = parsed.rest

        for (const frame of parsed.frames) {
          const data = JSON.parse(frame.data) as { text?: string; message?: string }

          if (frame.event === 'token' && data.text) {
            output.value += data.text
          }

          if (frame.event === 'error') {
            throw new Error(data.message ?? '流式运行失败')
          }
        }
      }

      mode.value = 'done'
    } catch (error) {
      errorMessage.value = getErrorMessage(error, '流式运行失败')
      mode.value = 'error'
    }
  }

  return {
    selectedDemo,
    form,
    mode,
    output,
    errorMessage,
    isRunning,
    loadDemo,
    runDemo,
    streamDemo,
  }
}
