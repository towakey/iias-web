type RefreshResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token?: string
}

function getBaseURL(): string {
  if (import.meta.client) {
    const saved = localStorage.getItem('iias_api_base_url')
    if (saved) return saved.replace(/\/$/, '')
  }
  const config = useRuntimeConfig()
  return (config.public.apiBaseUrl as string || '').replace(/\/$/, '')
}

export function useApi() {
  const baseURL = getBaseURL()

  const token = useState<string | null>('api-token', () => null)
  const refreshToken = useState<string | null>('api-refresh-token', () => null)
  let isRefreshing = false
  let refreshQueue: Array<(token: string) => void> = []

  const headers = computed(() => {
    const h: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Service': 'iias-web',
    }
    if (token.value) {
      h.Authorization = `Bearer ${token.value}`
    }
    return h
  })

  function authHeader(value: string | null) {
    const h: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Service': 'iias-web',
    }
    if (value) {
      h.Authorization = `Bearer ${value}`
    }
    return h
  }

  async function doRefresh(): Promise<string> {
    if (!refreshToken.value) {
      throw new Error('No refresh token')
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(resolve)
      })
    }

    isRefreshing = true
    try {
      const res = await $fetch<RefreshResponse>(`${baseURL}/refresh`, {
        method: 'POST',
        headers: authHeader(refreshToken.value),
      })
      const access = res.access_token || res.token || ''
      const refresh = res.refresh_token || ''
      token.value = access
      refreshToken.value = refresh
      if (import.meta.client) {
        localStorage.setItem('iias_token', access)
        localStorage.setItem('iias_refresh_token', refresh)
      }
      refreshQueue.forEach((resolve) => resolve(access))
      return access
    } finally {
      isRefreshing = false
      refreshQueue = []
    }
  }

  async function request<T>(path: string, options?: any): Promise<T> {
    try {
      return await $fetch<T>(`${baseURL}${path}`, { ...options, headers: headers.value })
    } catch (err: any) {
      if (err?.statusCode === 401 && refreshToken.value) {
        await doRefresh()
        return await $fetch<T>(`${baseURL}${path}`, { ...options, headers: headers.value })
      }
      throw err
    }
  }

  async function get<T = unknown>(path: string) {
    return request<T>(path)
  }

  async function post<T = unknown>(path: string, body?: unknown) {
    return request<T>(path, { method: 'POST', body })
  }

  async function del<T = unknown>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const h: Record<string, string> = {
      Accept: 'application/json',
      'X-Service': 'iias-web',
    }
    if (token.value) {
      h.Authorization = `Bearer ${token.value}`
    }

    const doUpload = async (auth: string | null) => {
      const uploadHeaders: Record<string, string> = {
        Accept: 'application/json',
        'X-Service': 'iias-web',
      }
      if (auth) uploadHeaders.Authorization = `Bearer ${auth}`
      const res = await $fetch<{ url: string }>(`${baseURL}/images`, {
        method: 'POST',
        body: formData,
        headers: uploadHeaders,
      })
      return res.url
    }

    try {
      return await doUpload(token.value)
    } catch (err: any) {
      if (err?.statusCode === 401 && refreshToken.value) {
        await doRefresh()
        return await doUpload(token.value)
      }
      throw err
    }
  }

  function setToken(value: string | null) {
    token.value = value
    if (value) {
      localStorage.setItem('iias_token', value)
    } else {
      localStorage.removeItem('iias_token')
    }
  }

  function setRefreshToken(value: string | null) {
    refreshToken.value = value
    if (value) {
      localStorage.setItem('iias_refresh_token', value)
    } else {
      localStorage.removeItem('iias_refresh_token')
    }
  }

  function loadTokens() {
    if (import.meta.client) {
      token.value = localStorage.getItem('iias_token')
      refreshToken.value = localStorage.getItem('iias_refresh_token')
    }
  }

  return { get, post, del, uploadImage, token, setToken, setRefreshToken, loadTokens }
}
