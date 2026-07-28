export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const auth = useAuth()
  await auth.init()

  const publicPaths = ['/login']
  const isLoggedIn = !!auth.user.value

  if (!isLoggedIn && !publicPaths.includes(to.path)) {
    return navigateTo('/login')
  }

  if (isLoggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})
