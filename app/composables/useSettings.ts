export function useSettings() {
  const api = useApi()

  async function get() {
    return api.get<Record<string, unknown>>('/settings')
  }

  async function save(settings: { key: string; value: unknown; type?: string }[]) {
    return api.post<Record<string, unknown>>('/settings', { settings })
  }

  return { get, save }
}
