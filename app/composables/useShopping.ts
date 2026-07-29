import { useOfflineDB, isOnline } from './useOfflineDB'

export type ShoppingItem = {
  id: number
  name: string
  image_path: string | null
  price: number | null
  memo: string | null
  status: 'active' | 'purchased' | 'archived'
  purchased_at: string | null
  archived_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type ShoppingStats = {
  monthly_budget: number
  total_this_month: number
  budget_alert: boolean
  by_name: Record<string, {
    count: number
    last_purchased_at: string | null
    avg_interval_days: number | null
  }>
}

type ApiLike = {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, body?: unknown) => Promise<T>
  del: <T>(path: string) => Promise<T>
  uploadImage: (file: File) => Promise<string>
}

export function useShopping() {
  const api = useApi() as ApiLike
  const db = useOfflineDB()

  async function list(status?: ShoppingItem['status']) {
    const target = status || 'active'
    if (isOnline()) {
      try {
        const items = await api.get<ShoppingItem[]>(`/shopping-items?status=${target}`)
        await db.syncItems(items, target)
        return items
      } catch (e) {
        return db.listItems(target)
      }
    }
    return db.listItems(target)
  }

  async function create(body: Partial<ShoppingItem>, file?: File) {
    const payload: any = { ...body, status: 'active', sort_order: 0 }
    if (isOnline()) {
      if (file) payload.image_path = await api.uploadImage(file)
      const item = await api.post<ShoppingItem>('/shopping-items', payload)
      await db.syncItems([item], item.status)
      return item
    }
    // オフライン時はローカル保存と同期キュー（画像は一旦保留）
    if (file) payload.image_path = null
    const local = await db.putItem({ ...payload } as any)
    await db.addQueue({ method: 'POST', path: '/shopping-items', body: payload })
    return local as ShoppingItem
  }

  async function update(id: number, body: Partial<ShoppingItem>) {
    if (isOnline()) {
      const item = await api.post<ShoppingItem>(`/shopping-items/${id}`, { ...body, _method: 'PUT' })
      await db.syncItems([item], item.status)
      return item
    }
    const local = await db.getItem(id)
    if (local) {
      await db.putItem({ ...local, ...body })
      if (id > 0) {
        await db.addQueue({ method: 'POST', path: `/shopping-items/${id}`, body: { ...body, _method: 'PUT' } })
      }
    }
    return local as ShoppingItem | undefined
  }

  async function remove(id: number) {
    if (isOnline() && id > 0) {
      await api.del(`/shopping-items/${id}`)
    } else if (!isOnline() && id > 0) {
      await db.addQueue({ method: 'DELETE', path: `/shopping-items/${id}`, body: null })
    }
    await db.deleteItem(id)
  }

  async function restore(id: number) {
    if (isOnline()) {
      const item = await api.post<ShoppingItem>(`/shopping-items/${id}/restore`)
      await db.syncItems([item], 'active')
      return item
    }
    const local = await db.getItem(id)
    if (local) {
      await db.putItem({ ...local, status: 'active' })
      if (id > 0) {
        await db.addQueue({ method: 'POST', path: `/shopping-items/${id}/restore`, body: null })
      }
    }
    return local as ShoppingItem | undefined
  }

  async function stats() {
    return api.get<ShoppingStats>('/shopping-items/stats')
  }

  async function getRegularItems() {
    return api.get<any[]>('/regular-items')
  }

  async function createRegularItem(body: Partial<ShoppingItem>) {
    return api.post<any>('/regular-items', body)
  }

  async function addRegularToShopping(id: number) {
    return api.post<any>(`/regular-items/${id}/add-to-shopping`)
  }

  async function processQueue() {
    const queue = await db.getQueue()
    for (const item of queue) {
      try {
        if (item.method === 'POST' && item.path === '/shopping-items') {
          const created = await api.post<ShoppingItem>(item.path, item.body)
          await db.syncItems([created], created.status)
        } else if (item.method === 'POST') {
          const updated = await api.post<ShoppingItem>(item.path, item.body)
          await db.syncItems([updated], updated.status)
        } else if (item.method === 'DELETE') {
          await api.del(item.path)
        }
        if (item.id) await db.deleteQueueItem(item.id)
      } catch (e) {
        // 失敗したらキューに残す
      }
    }
    // キュー処理後にサーバーと再同期
    await list('active')
    await list('purchased')
  }

  return { list, create, update, remove, restore, stats, getRegularItems, createRegularItem, addRegularToShopping, processQueue }
}
