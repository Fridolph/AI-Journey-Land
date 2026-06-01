import { defineStore } from 'pinia'

export interface ChatSession {
  id: string
  title: string
  isPinned: boolean
  isFavorited: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 's1',
    title: 'Vue 3 Composition API 学习笔记',
    isPinned: true,
    isFavorited: true,
    createdAt: '2026-06-01T10:30:00Z',
    updatedAt: '2026-06-01T10:35:00Z',
  },
  {
    id: 's2',
    title: '设计一个用户权限系统',
    isPinned: true,
    isFavorited: false,
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 's3',
    title: 'TypeScript 类型体操入门',
    isPinned: false,
    isFavorited: true,
    createdAt: '2026-05-31T16:00:00Z',
    updatedAt: '2026-05-31T16:30:00Z',
  },
  {
    id: 's4',
    title: '帮我写一个 REST API 接口',
    isPinned: false,
    isFavorited: false,
    createdAt: '2026-05-31T14:00:00Z',
    updatedAt: '2026-05-31T14:20:00Z',
  },
  {
    id: 's5',
    title: 'Nuxt 4 项目结构最佳实践',
    isPinned: false,
    isFavorited: false,
    createdAt: '2026-05-30T11:00:00Z',
    updatedAt: '2026-05-30T12:00:00Z',
  },
  {
    id: 's6',
    title: '数据库索引优化讨论',
    isPinned: false,
    isFavorited: false,
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-05-28T08:15:00Z',
  },
]

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  s1: [
    {
      id: 'm1',
      sessionId: 's1',
      role: 'user',
      content: 'Vue 3 的 Composition API 和 Options API 有什么区别？',
      createdAt: '2026-06-01T10:30:00Z',
    },
    {
      id: 'm2',
      sessionId: 's1',
      role: 'assistant',
      content:
        'Composition API 和 Options API 的主要区别：\n\n1. **代码组织**：Composition API 按逻辑关注点组织，Options API 按选项类型组织\n2. **逻辑复用**：Composition API 通过组合函数（composables）实现，Options API 通过 mixins\n3. **TypeScript 支持**：Composition API 对 TypeScript 支持更好\n4. **响应式**：Composition API 使用 `ref`/`reactive`，Options API 使用 `data()`\n\n推荐新项目使用 Composition API。',
      createdAt: '2026-06-01T10:30:02Z',
    },
  ],
  s2: [
    {
      id: 'm3',
      sessionId: 's2',
      role: 'user',
      content: '我需要设计一个用户权限系统，角色有 admin、editor、viewer',
      createdAt: '2026-06-01T09:00:00Z',
    },
    {
      id: 'm4',
      sessionId: 's2',
      role: 'assistant',
      content:
        '好的，我来帮你设计用户权限系统。推荐使用 **RBAC (Role-Based Access Control)** 模型：\n\n## 数据模型\n\n```sql\n-- 用户表\nCREATE TABLE users (id, name, email);\n\n-- 角色表\nCREATE TABLE roles (id, name, description);\n\n-- 权限表\nCREATE TABLE permissions (id, resource, action);\n\n-- 用户-角色关联\nCREATE TABLE user_roles (user_id, role_id);\n\n-- 角色-权限关联\nCREATE TABLE role_permissions (role_id, permission_id);\n```\n\n需要我继续详细展开吗？',
      createdAt: '2026-06-01T09:00:02Z',
    },
  ],
}

let nextId = 100

function genId(prefix: string): string {
  return `${prefix}${nextId++}`
}

export const useChatLayoutStore = defineStore('chat-layout', {
  state: () => ({
    sessions: [] as ChatSession[],
    messages: {} as Record<string, ChatMessage[]>,
    activeSessionId: null as string | null,
    input: '',
    apiBase: 'http://localhost:5044/api',
    /** 'ready' | 'submitted' | 'streaming' | 'error' — for UChatPromptSubmit status */
    chatStatus: 'ready' as 'ready' | 'submitted' | 'streaming' | 'error',
    abortController: null as AbortController | null,
  }),

  getters: {
    activeSession: (state): ChatSession | undefined => {
      return state.sessions.find((s) => s.id === state.activeSessionId)
    },

    currentMessages: (state): ChatMessage[] => {
      if (!state.activeSessionId) return []
      return state.messages[state.activeSessionId] ?? []
    },

    pinnedSessions: (state): ChatSession[] => {
      return state.sessions.filter((s) => s.isPinned)
    },

    unpinnedSessions: (state): ChatSession[] => {
      return state.sessions.filter((s) => !s.isPinned)
    },

    isEmpty: (state): boolean => {
      return state.sessions.length === 0
    },
  },

  actions: {
    loadMockData() {
      if (this.sessions.length > 0) return
      this.sessions = [...MOCK_SESSIONS]
      this.messages = { ...MOCK_MESSAGES }
      if (this.sessions.length > 0 && !this.activeSessionId) {
        const first = this.sessions[0]
        if (first) {
          this.activeSessionId = first.id
        }
      }
    },

    createSession() {
      const now = new Date().toISOString()
      const session: ChatSession = {
        id: genId('s'),
        title: '新对话',
        isPinned: false,
        isFavorited: false,
        createdAt: now,
        updatedAt: now,
      }
      this.sessions.unshift(session)
      this.messages[session.id] = []
      this.activeSessionId = session.id
    },

    deleteSession(id: string) {
      this.sessions = this.sessions.filter((s) => s.id !== id)
      delete this.messages[id]
      if (this.activeSessionId === id) {
        this.activeSessionId = this.sessions[0]?.id ?? null
      }
    },

    renameSession(id: string, title: string) {
      const session = this.sessions.find((s) => s.id === id)
      if (session) {
        session.title = title
        session.updatedAt = new Date().toISOString()
      }
    },

    togglePin(id: string) {
      const session = this.sessions.find((s) => s.id === id)
      if (session) {
        session.isPinned = !session.isPinned
      }
    },

    toggleFavorite(id: string) {
      const session = this.sessions.find((s) => s.id === id)
      if (session) {
        session.isFavorited = !session.isFavorited
      }
    },

    setActiveSession(id: string) {
      this.activeSessionId = id
    },

    async sendMessage(content: string) {
      const sid = this.activeSessionId
      if (!content.trim() || !sid) return

      const now = new Date().toISOString()
      const userMsg: ChatMessage = {
        id: genId('m'),
        sessionId: sid,
        role: 'user',
        content: content.trim(),
        createdAt: now,
      }

      if (!this.messages[sid]) {
        this.messages[sid] = []
      }
      this.messages[sid].push(userMsg)

      const session = this.sessions.find((s) => s.id === sid)
      if (session) {
        session.updatedAt = now
        if (session.title === '新对话' && this.messages[sid].length <= 2) {
          session.title = content.trim().slice(0, 30)
        }
      }

      const aiMsg: ChatMessage = {
        id: genId('m'),
        sessionId: sid,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }
      this.messages[sid].push(aiMsg)

      this.chatStatus = 'submitted'

      const abortController = new AbortController()
      this.abortController = abortController

      try {
        const apiBase = useRuntimeConfig().public.apiBase as string
        const response = await fetch(`${this.apiBase}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, message: content.trim() }),
          signal: abortController.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`)
        }

        this.chatStatus = 'streaming'

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? ''
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7)
              const dataLine = lines[i + 1]
              if (!dataLine?.startsWith('data: ')) continue

              try {
                const data = JSON.parse(dataLine.slice(6))

                if (eventType === 'token') {
                  aiMsg.content += data.text
                } else if (eventType === 'done') {
                  this.chatStatus = 'ready'
                  this.abortController = null
                } else if (eventType === 'stopped') {
                  this.chatStatus = 'ready'
                  this.abortController = null
                } else if (eventType === 'error') {
                  throw new Error(data.message)
                }
              } catch {
                // SSE parse error, skip
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          this.chatStatus = 'ready'
          this.abortController = null
        } else {
          this.chatStatus = 'error'
          this.abortController = null
          if (!aiMsg.content) {
            aiMsg.content = `请求失败：${(err as Error).message}`
          }
        }
      }
    },

    stopGenerating() {
      if (this.abortController) {
        this.abortController.abort()
        this.chatStatus = 'ready'
        this.abortController = null
      }
    },

    continueGenerating() {
      const sid = this.activeSessionId
      if (!sid) return

      const msgs = this.messages[sid]
      if (!msgs || msgs.length === 0) return

      const aiMsg: ChatMessage = {
        id: genId('m'),
        sessionId: sid,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }
      msgs.push(aiMsg)

      this.chatStatus = 'submitted'

      const abortController = new AbortController()
      this.abortController = abortController

      const run = async () => {
        try {
          const apiBase = useRuntimeConfig().public.apiBase as string
          const response = await fetch(`${this.apiBase}/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sid, continue: true }),
            signal: abortController.signal,
          })

          if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}`)
          }

          this.chatStatus = 'streaming'

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]?.trim() ?? ''
              if (line.startsWith('event: ')) {
                const eventType = line.slice(7)
                const dataLine = lines[i + 1]
                if (!dataLine?.startsWith('data: ')) continue

                try {
                  const data = JSON.parse(dataLine.slice(6))

                  if (eventType === 'token') {
                    aiMsg.content += data.text
                  } else if (eventType === 'done') {
                    this.chatStatus = 'ready'
                    this.abortController = null
                  } else if (eventType === 'stopped') {
                    this.chatStatus = 'ready'
                    this.abortController = null
                  } else if (eventType === 'error') {
                    throw new Error(data.message)
                  }
                } catch {
                  // skip
                }
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            this.chatStatus = 'ready'
            this.abortController = null
          } else {
            this.chatStatus = 'error'
            this.abortController = null
            if (!aiMsg.content) {
              aiMsg.content = `请求失败：${(err as Error).message}`
            }
          }
        }
      }

      run()
    },
  },
})
