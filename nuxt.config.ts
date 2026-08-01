// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  css: [
    '~/assets/css/ndma-ui.css',
    '~/assets/css/iias.css',
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    },
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
  nitro: {
    preset: process.env.NUXT_NITRO_PRESET || 'node-server',
  },
})
