<template>
  <div class="iias-container">
    <div class="iias-setup">
      <h1 class="iias-title">IIAS 初期設定</h1>
      <p class="iias-subtitle">IIAS Core の API アドレスを入力してください。</p>

      <form @submit.prevent="save">
        <label class="iias-label" for="api-url">API ベース URL</label>
        <input
          id="api-url"
          v-model="apiUrl"
          class="iias-input"
          type="url"
          placeholder="https://kyosserver.sakura.ne.jp/iias-core/api"
          required
        />

        <div v-if="error" class="iias-error">{{ error }}</div>

        <button class="iias-button" type="submit" :disabled="testing">{{ testing ? '確認中...' : '保存して進む' }}</button>
      </form>

      <p class="iias-note">例: https://kyosserver.sakura.ne.jp/iias-core/api</p>
    </div>
  </div>
</template>

<script setup>
const apiUrl = ref('')
const error = ref('')
const testing = ref(false)

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('iias_api_base_url')
    if (saved) {
      apiUrl.value = saved
    }
  }
})

async function save() {
  error.value = ''
  testing.value = true

  try {
    let url = apiUrl.value.trim()
    if (!url) {
      throw new Error('URL を入力してください')
    }
    url = url.replace(/\/$/, '')

    const res = await $fetch(`${url}/sanctum/csrf-cookie`, { method: 'GET' }).catch(() => null)
    if (res === null) {
      // csrf-cookie エンドポイントがなくても可：API ルートが応答できれば OK
    }

    await $fetch(`${url}/user`, {
      headers: { Accept: 'application/json' },
    }).catch((err) => {
      if (err?.statusCode === 401) {
        return
      }
      throw new Error(`接続確認に失敗しました: ${err?.statusMessage || err?.message || 'unknown'}`)
    })

    if (import.meta.client) {
      localStorage.setItem('iias_api_base_url', url)
    }
    await navigateTo('/login')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '接続に失敗しました'
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.iias-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  color: #ff8a1c;
  padding: 1rem;
}
.iias-setup {
  width: 100%;
  max-width: 480px;
  border: 1px solid #ff8a1c;
  background: #0a0a0a;
  padding: 2rem;
}
.iias-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}
.iias-subtitle {
  margin: 0 0 1.5rem;
  opacity: 0.85;
}
.iias-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}
.iias-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ff8a1c;
  background: #050505;
  color: #ff8a1c;
  margin-bottom: 1rem;
}
.iias-button {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ff8a1c;
  background: #050505;
  color: #ff8a1c;
  cursor: pointer;
  font-weight: bold;
}
.iias-button:hover:not(:disabled) {
  background: #ff8a1c;
  color: #050505;
}
.iias-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.iias-error {
  color: #ff3333;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.iias-note {
  margin-top: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
