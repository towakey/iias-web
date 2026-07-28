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

export function useShopping() {
  const api = useApi()

  async function list(status?: ShoppingItem['status']) {
    const query = status ? `?status=${status}` : ''
    return api.get<ShoppingItem[]>(`/shopping-items${query}`)
  }

  async function create(body: Partial<ShoppingItem>, file?: File) {
    const payload = { ...body }
    if (file) {
      payload.image_path = await api.uploadImage(file)
    }
    return api.post<ShoppingItem>('/shopping-items', payload)
  }

  async function update(id: number, body: Partial<ShoppingItem>) {
    return api.post<ShoppingItem>(`/shopping-items/${id}`, { ...body, _method: 'PUT' })
  }

  async function remove(id: number) {
    return api.del(`/shopping-items/${id}`)
  }

  async function restore(id: number) {
    return api.post<ShoppingItem>(`/shopping-items/${id}/restore`)
  }

  async function stats() {
    return api.get<ShoppingStats>('/shopping-items/stats')
  }

  return { list, create, update, remove, restore, stats }
}
