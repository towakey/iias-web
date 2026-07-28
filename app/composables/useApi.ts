export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const token = useState<string | null>('api-token', () => null)

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

  async function get<T = unknown>(path: string) {
    return $fetch<T>(`${baseURL}${path}`, { headers: headers.value })
  }

  async function post<T = unknown>(path: string, body?: unknown) {
    return $fetch<T>(`${baseURL}${path}`, {
      method: 'POST',
      body,
      headers: headers.value,
    })
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
    const res = await $fetch<{ url: string }>(`${baseURL}/images`, {
      method: 'POST',
      body: formData,
      headers: h,
    })
    return res.url
  }

  async function del<T = unknown>(path: string) {
    return $fetch<T>(`${baseURL}${path}`, {
      method: 'DELETE',
      headers: headers.value,
    })
  }

  function setToken(value: string | null) {
    token.value = value
    if (value) {
      localStorage.setItem('iias_token', value)
    } else {
      localStorage.removeItem('iias_token')
    }
  }

  function loadToken() {
    if (import.meta.client) {
      token.value = localStorage.getItem('iias_token')
    }
  }

  return { get, post, del, uploadImage, token, setToken, loadToken }
}
