type User = {
  id: number
  name: string
  email: string
}

export function useAuth() {
  const api = useApi()
  const user = useState<User | null>('auth-user', () => null)
  const isReady = useState<boolean>('auth-ready', () => false)

  async function init() {
    api.loadToken()
    if (api.token.value) {
      try {
        user.value = await api.get<User>('/user')
      } catch {
        api.setToken(null)
      }
    }
    isReady.value = true
  }

  async function login(email: string, password: string) {
    const res = await api.post<{ user: User; token: string }>('/login', {
      email,
      password,
    })
    api.setToken(res.token)
    user.value = res.user
    return res.user
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const res = await api.post<{ user: User; token: string }>('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    api.setToken(res.token)
    user.value = res.user
    return res.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // ignore
    }
    api.setToken(null)
    user.value = null
  }

  return {
    user,
    isReady,
    init,
    login,
    register,
    logout,
  }
}
