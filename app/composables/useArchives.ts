export type Archive = {
  id: number
  archive_type: string
  title: string | null
  url: string | null
  body: string | null
  memo: string | null
  image_path: string | null
  recorded_at: string
  visited_at: string | null
  created_at: string
  updated_at: string
}

export type PaginatedArchives = {
  data: Archive[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function useArchives() {
  const api = useApi()

  async function list(params?: { search?: string; archive_type?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.archive_type) query.set('archive_type', params.archive_type)
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    const qs = query.toString()
    return api.get<PaginatedArchives>(`/archives${qs ? '?' + qs : ''}`)
  }

  async function create(body: Partial<Archive>) {
    return api.post<Archive>('/archives', body)
  }

  async function fetchBody(id: number) {
    return api.post<Archive>(`/archives/${id}/fetch-body`)
  }

  return { list, create, fetchBody }
}
