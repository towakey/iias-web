import { openDB, type IDBPDatabase } from 'idb'
import type { ShoppingItem } from './useShopping'

const DB_NAME = 'iias-web'
const DB_VERSION = 1

type LocalItem = ShoppingItem & { server_id?: number; pending?: boolean }

interface SyncQueueItem {
  id?: number
  method: string
  path: string
  body: any
  created_at: string
}

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null

export function useOfflineDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('shopping_items')) {
          db.createObjectStore('shopping_items', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
        }
      },
    })
  }

  async function getDB() {
    return dbPromise!
  }

  async function allItems(): Promise<LocalItem[]> {
    const db = await getDB()
    return db.getAll('shopping_items')
  }

  async function listItems(status: ShoppingItem['status']): Promise<LocalItem[]> {
    const all = await allItems()
    return all.filter((item: any) => item.status === status)
  }

  async function getItem(id: number): Promise<LocalItem | undefined> {
    const db = await getDB()
    return db.get('shopping_items', id)
  }

  async function putItem(item: LocalItem) {
    const db = await getDB()
    if (!item.id || item.id < 0) {
      if (!item.id) item.id = -Date.now()
    }
    if (!item.created_at) item.created_at = new Date().toISOString()
    item.updated_at = new Date().toISOString()
    await db.put('shopping_items', item)
    return item
  }

  async function deleteItem(id: number) {
    const db = await getDB()
    await db.delete('shopping_items', id)
  }

  async function syncItems(items: ShoppingItem[], status: ShoppingItem['status']) {
    const db = await getDB()
    const tx = db.transaction('shopping_items', 'readwrite')
    const store = tx.objectStore('shopping_items')
    const existing = await store.getAll()
    const existingMap = new Map(existing.map((i: any) => [i.id, i]))

    // 新しいサーバーアイテムを反映、保留中のローカルアイテムは保持
    for (const item of items) {
      const merged: LocalItem = { ...(existingMap.get(item.id) || {}), ...item, pending: false }
      await store.put(merged)
    }
    // サーバーに存在しない保留中アイテム以外を削除しない（現状はマージのみ）
    await tx.done
  }

  async function addQueue(item: SyncQueueItem) {
    const db = await getDB()
    item.created_at = new Date().toISOString()
    await db.add('sync_queue', item)
  }

  async function getQueue(): Promise<SyncQueueItem[]> {
    const db = await getDB()
    return db.getAll('sync_queue')
  }

  async function deleteQueueItem(id: number) {
    const db = await getDB()
    await db.delete('sync_queue', id)
  }

  return { allItems, listItems, getItem, putItem, deleteItem, syncItems, addQueue, getQueue, deleteQueueItem }
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}
