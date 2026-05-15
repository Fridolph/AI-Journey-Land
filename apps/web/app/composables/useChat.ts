import { computed, reactive, shallowRef } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface ChatSession {
  sessionId: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}

type ChatMode = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

export function useChat() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => config.public.apiBase)

  const sessionId = shallowRef<string | null>(null)
  const messages = shallowRef<ChatMessage[]>([])
  const mode = shallowRef<ChatMode>('idle')
  const errorMessage = shallowRef('')
  const systemPrompt = shallowRef('')
  const temperature = shallowRef<number | undefined>(undefined)

  const isRunning = computed(() => mode.value === 'loading' || mode.value === 'streaming')

  async function createSession(): Promise<string> {
    const response = await $fetch<{ data: { sessionId: string } }>(
      `${apiBase.value}/demos/chat/sessions`,
      { method: 'POST' },
    )
    sessionId.value = response.data.sessionId
    messages.value = []
    return sessionId.value
  }

  async function loadHistory(sid: string): Promise<void> {
    sessionId.value = sid
    try {
      const response = await $fetch<{ data: ChatMessage[] }>(
        `${apiBase.value}/demos/chat/history?sessionId=${sid}`,
      )
      messages.value = response.data
    } catch {
      messages.value = []
    }
  }

  async function deleteSession(sid: string): Promise<void> {
    await $fetch(`${apiBase.value}/demos/chat/sessions/${sid}`, { method: 'DELETE' })
    if (sessionId.value === sid) {
      sessionId.value = null
      messages.value = []
    }
  }

  async function sendMessage(message: string, quotedMessage?: string) {
    if (!sessionId.value) await createSession()
    if (!message.trim() || !sessionId.value) return

    const sid = sessionId.value
    messages.value = [...messages.value, { role: 'user', content: message }]
    mode.value = 'streaming'
    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBase.value}/demos/${'chat'}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          message,
          quotedMessage: quotedMessage || undefined,
          systemPrompt: systemPrompt.value || undefined,
          temperature: temperature.value,
        }),
      })

      if (!response.body) throw new Error('浏览器不支持流式读取')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let aiContent = ''

      const assistantIdx = messages.value.length
      messages.value = [...messages.value, { role: 'assistant', content: '' }]

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const eventLine = part.split('\n').find((l) => l.startsWith('event:'))
          const dataLine = part.split('\n').find((l) => l.startsWith('data:'))

          if (eventLine?.includes('token') && dataLine) {
            const data = JSON.parse(dataLine.replace('data:', ''))
            if (data.text) {
              aiContent += data.text
              const updated = [...messages.value]
              updated[assistantIdx] = { role: 'assistant', content: aiContent }
              messages.value = updated
            }
          }

          if (eventLine?.includes('error') && dataLine) {
            const data = JSON.parse(dataLine.replace('data:', ''))
            throw new Error(data.message ?? '对话出错')
          }
        }
      }

      mode.value = 'done'
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '对话失败'
      mode.value = 'error'
    }
  }

  return {
    sessionId,
    messages,
    mode,
    errorMessage,
    isRunning,
    systemPrompt,
    temperature,
    createSession,
    loadHistory,
    deleteSession,
    sendMessage,
  }
}
