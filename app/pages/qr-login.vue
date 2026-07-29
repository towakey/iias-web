<template>
  <div class="page-container">
    <h1 class="page-title">QR ログイン</h1>
    <p class="iias-text" style="margin-bottom: 1rem;">
      この QR コードを Android / Desktop アプリで読み取ると、そのデバイスでログインできます。
    </p>
    <div v-if="token" style="margin-bottom: 1rem;">
      <canvas ref="qrCanvas" style="border: 2px solid #ff8a1c; border-radius: 8px;" />
      <p class="iias-text" style="font-size: 0.75rem; word-break: break-all; margin-top: 0.5rem;">
        {{ token }}
      </p>
    </div>
    <div v-else class="iias-text" style="margin-bottom: 1rem;">
      QR コードは発行されていません。
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <button class="iias-btn" @click="generate">{{ token ? '再発行' : '発行' }}</button>
      <button v-if="token" class="iias-btn" style="background: #444;" @click="revoke">無効化</button>
    </div>
    <p v-if="message" class="iias-message" style="margin-top: 1rem;">{{ message }}</p>
  </div>
</template>

<script setup>
const { get, post, del } = useApi()
const qrCanvas = ref(null)
const token = ref('')
const message = ref('')

async function fetchQr() {
  try {
    const res = await get('/qr-login')
    token.value = res.token || ''
  } catch {
    token.value = ''
  }
}

async function generate() {
  try {
    const res = await post('/qr-login/generate')
    token.value = res.token || ''
    message.value = 'QR コードを再発行しました。以前の QR コードは使えなくなります。'
  } catch (e) {
    message.value = 'QR コードの発行に失敗しました'
  }
}

async function revoke() {
  try {
    await del('/qr-login')
    token.value = ''
    message.value = 'QR コードを無効化しました'
  } catch {
    message.value = 'QR コードの無効化に失敗しました'
  }
}

async function renderQr() {
  if (!token.value || !qrCanvas.value || !import.meta.client) {
    return
  }
  const QRCode = await import('qrcode')
  await QRCode.toCanvas(qrCanvas.value, token.value, {
    width: 256,
    margin: 2,
    color: {
      dark: '#050505',
      light: '#ff8a1c',
    },
  })
}

onMounted(async () => {
  await fetchQr()
  await nextTick()
  await renderQr()
})

watch(token, async () => {
  await nextTick()
  await renderQr()
})
</script>
