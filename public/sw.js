const CACHE_NAME = 'iias-v1'
const SHELL = ['/', '/shopping', '/stats', '/regular', '/mindmap', '/settings']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // API リクエストは Service Worker 経由のキャッシュ対象外（メインスレッドの IndexedDB キューで処理）
  if (request.url.includes('/api/')) return

  // ナビゲーションはキャッシュされたシェルにフォールバック
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      return cached || fetchPromise
    })
  )
})
