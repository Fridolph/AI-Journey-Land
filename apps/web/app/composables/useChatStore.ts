import { shallowRef } from 'vue'
import type { ChatSession } from './useChat'

export interface ChatSessionRecord {
  id: string
  title: string
  createdAt: string
  lastActiveAt: string
}

const DB_NAME = 'ai-journey-land-chat'
const DB_VERSION = 1
const STORE_NAME = 'chat-sessions'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('lastActiveAt', 'lastActiveAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function useChatStore() {
  const sessions = shallowRef<ChatSessionRecord[]>([])
  const isLoading = shallowRef(false)

  async function loadAll(): Promise<void> {
    isLoading.value = true
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
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
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    await new Promise<void>((resolve, reject) => {
      const req = store.put(record)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
    await loadAll()
  }

  async function remove(id: string): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
    await loadAll()
  }

  return { sessions, isLoading, loadAll, save, remove }
}
