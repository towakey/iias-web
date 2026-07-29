type User = {
  id: number
  name: string
  email: string
}

type AuthResponse = {
  user: User
  token: string
  access_token: string
  refresh_token: string
  expires_in: number
}

export function useAuth() {
  const api = useApi()
  const user = useState<User | null>('auth-user', () => null)
  const isReady = useState<boolean>('auth-ready', () => false)

  async function init() {
    api.loadTokens()
    if (api.token.value) {
      try {
        user.value = await api.get<User>('/user')
      } catch {
        api.setToken(null)
        api.setRefreshToken(null)
      }
    }
    isReady.value = true
  }

  function setSession(res: AuthResponse) {
    const access = res.access_token || res.token
    api.setToken(access)
    api.setRefreshToken(res.refresh_token)
    user.value = res.user
  }

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>('/login', {
      email,
      password,
    })
    setSession(res)
    return res.user
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const res = await api.post<AuthResponse>('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    setSession(res)
    return res.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // ignore
    }
    api.setToken(null)
    api.setRefreshToken(null)
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
