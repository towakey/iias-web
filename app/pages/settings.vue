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
    </div>
  </div>
</template>

<script setup>
const viewMode = ref('dashboard')
const syncInterval = ref('60')
</script>
