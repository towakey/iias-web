// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  css: [
    '~/assets/css/ndma-ui.css',
    '~/assets/css/iias.css',
  ],
})
