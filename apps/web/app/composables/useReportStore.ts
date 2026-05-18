import { shallowRef } from 'vue'

export interface ReportRecord {
  id: string
  demoId: string
  reportType: string
  role: string
  input: Record<string, string>
  output: string
  createdAt: string
}

const DB_NAME = 'ai-journey-land'
const DB_VERSION = 1
const STORE_NAME = 'reports'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('demoId', 'demoId', { unique: false })
        store.createIndex('reportType', 'reportType', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function useReportStore() {
  const records = shallowRef<ReportRecord[]>([])
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')

  async function loadAll(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      records.value = await new Promise<ReportRecord[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as ReportRecord[])
        request.onerror = () => reject(request.error)
      })

      records.value.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '加载报告列表失败'
    } finally {
      isLoading.value = false
    }
  }

  async function save(record: Omit<ReportRecord, 'id' | 'createdAt'>): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    const newRecord: ReportRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.add(newRecord)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    await loadAll()
  }

  async function remove(id: string): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    await loadAll()
  }

  async function removeAll(): Promise<void> {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    await loadAll()
  }

  return {
    records,
    isLoading,
    errorMessage,
    loadAll,
    save,
    remove,
    removeAll,
  }
}
