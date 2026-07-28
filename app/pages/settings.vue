<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">設定</h2>
    </header>

    <div class="iias-card" style="max-width: 480px;">
      <div class="iias-form-row">
        <label class="iias-label">トップ画面の表示モード</label>
        <select v-model="viewMode" class="iias-select">
          <option value="dashboard">ダッシュボード</option>
          <option value="hierarchy">階層メニュー</option>
        </select>
      </div>

      <div class="iias-form-row">
        <label class="iias-label">ブラウザ履歴の取得間隔</label>
        <select v-model="syncInterval" class="iias-select">
          <option value="30">30秒</option>
          <option value="60">1分</option>
          <option value="300">5分</option>
          <option value="900">15分</option>
          <option value="1800">30分</option>
        </select>
      </div>

      <button class="iias-btn" style="width: 100%;" @click="save" :disabled="saving">
        {{ saving ? '保存中...' : '保存' }}
      </button>

      <p v-if="message" style="margin-top: 0.75rem; font-size: 0.85rem; color: #ff8a1c;">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
const settingsApi = useSettings()
const viewMode = ref('dashboard')
const syncInterval = ref('60')
const saving = ref(false)
const message = ref('')

async function load() {
  try {
    const data = await settingsApi.get()
    if (data.view_mode) viewMode.value = String(data.view_mode)
    if (data.sync_interval) syncInterval.value = String(data.sync_interval)
  } catch {
    // 初回や未取得時はデフォルトのまま
  }
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    await settingsApi.save([
      { key: 'view_mode', value: viewMode.value, type: 'string' },
      { key: 'sync_interval', value: syncInterval.value, type: 'string' },
    ])
    message.value = '設定を保存しました'
  } catch (e) {
    message.value = e?.data?.message || '保存に失敗しました'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  load()
})
</script>
