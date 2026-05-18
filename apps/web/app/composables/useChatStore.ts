import { shallowRef } from 'vue'
import type { ChatMessage } from './useChat'

export interface ChatSessionRecord {
  id: string
  title: string
  config?: Record<string, unknown>
  createdAt: string
  lastActiveAt: string
}

const DB_NAME = 'ai-journey-land-chat'
const DB_VERSION = 2
const SESSION_STORE = 'chat-sessions'
const MESSAGE_STORE = 'chat-messages'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const store = db.createObjectStore(SESSION_STORE, { keyPath: 'id' })
        store.createIndex('lastActiveAt', 'lastActiveAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
        const store = db.createObjectStore(MESSAGE_STORE, { keyPath: 'sessionId' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

interface MessageRecord {
  sessionId: string
  messages: ChatMessage[]
  updatedAt: string
}

export function useChatStore() {
  const sessions = shallowRef<ChatSessionRecord[]>([])
  const isLoading = shallowRef(false)

  async function loadAll(): Promise<void> {
    isLoading.value = true
    try {
      const db = await openDB()
      const tx = db.transaction(SESSION_STORE, 'readonly')
      const store = tx.objectStore(SESSION_STORE)
      const records = await new Promise<ChatSessionRecord[]>((resolve, reject) => {
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
      sessions.value = records.sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
      )
    } finally {
      isLoading.value = false
    }
  }

  async function save(record: ChatSessionRecord): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(SESSION_STORE, 'readwrite')
    const store = tx.objectStore(SESSION_STORE)
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
    await loadAll()
  }

  async function remove(id: string): Promise<void> {
    const db = await openDB()
    const tx = db.transaction([SESSION_STORE, MESSAGE_STORE], 'readwrite')
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const req = tx.objectStore(SESSION_STORE).delete(id)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
      new Promise<void>((resolve, reject) => {
        const req = tx.objectStore(MESSAGE_STORE).delete(id)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
    ])
    await loadAll()
  }

  async function saveMessages(sessionId: string, messages: ChatMessage[]): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(MESSAGE_STORE, 'readwrite')
    const store = tx.objectStore(MESSAGE_STORE)
    const record: MessageRecord = {
      sessionId,
      messages,
      updatedAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function loadMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = await openDB()
    const tx = db.transaction(MESSAGE_STORE, 'readonly')
    const store = tx.objectStore(MESSAGE_STORE)
    const record = await new Promise<MessageRecord | undefined>((resolve, reject) => {
      const req = store.get(sessionId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return record?.messages ?? []
  }

  async function loadSessionConfig(sessionId: string): Promise<Record<string, unknown> | undefined> {
    const db = await openDB()
    const tx = db.transaction(SESSION_STORE, 'readonly')
    const store = tx.objectStore(SESSION_STORE)
    const record = await new Promise<ChatSessionRecord | undefined>((resolve, reject) => {
      const req = store.get(sessionId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return record?.config as Record<string, unknown> | undefined
  }

  async function saveSessionConfig(sessionId: string, config: Record<string, unknown>): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(SESSION_STORE, 'readwrite')
    const store = tx.objectStore(SESSION_STORE)
    const existing = await new Promise<ChatSessionRecord | undefined>((resolve, reject) => {
      const req = store.get(sessionId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    const record: ChatSessionRecord = {
      id: sessionId,
      title: existing?.title ?? '新对话',
      config,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  return { sessions, isLoading, loadAll, save, remove, saveMessages, loadMessages, loadSessionConfig, saveSessionConfig }
}
