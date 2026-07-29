import { useShopping } from '~/composables/useShopping'

export default defineNuxtPlugin(() => {
  if (!import.meta.client || !('serviceWorker' in navigator)) return

  const shopping = useShopping()

  navigator.serviceWorker.register('/sw.js').catch((e) => {
    console.error('[IIAS] service worker registration failed', e)
  })

  window.addEventListener('online', () => {
    shopping.processQueue().catch(() => {})
  })

  // 初回マウント時もキュー処理を試行
  shopping.processQueue().catch(() => {})
})
