export default defineNuxtRouteMiddleware((to) => {
  if (process.server || to.path === '/setup') return

  const apiBase = localStorage.getItem('iias_api_base_url')
  if (!apiBase && to.path !== '/setup') {
    return navigateTo('/setup')
  }
})
