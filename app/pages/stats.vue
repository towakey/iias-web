<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">購買統計</h2>
    </header>

    <div class="iias-card" style="margin-bottom: 1rem;">
      <h3 class="iias-card-title">今月の状況</h3>
      <p class="iias-card-meta">今月合計: {{ stats?.total_this_month ?? 0 }} 円</p>
      <p class="iias-card-meta">予算: {{ stats?.monthly_budget ?? 0 }} 円</p>
      <p v-if="stats?.budget_alert" style="color: #ff4444;">予算超過アラート</p>
    </div>

    <div class="iias-card iias-form" style="margin-bottom: 1rem;">
      <h3 class="iias-card-title">月次予算設定</h3>
      <label class="iias-label">予算（円）</label>
      <input v-model="budgetInput" class="iias-input" type="number" placeholder="例：10000" />
      <button class="iias-btn" style="width: 100%;" @click="saveBudget">保存</button>
      <p v-if="message" class="iias-message">{{ message }}</p>
    </div>

    <h3 class="iias-card-title" style="margin-bottom: 0.5rem;">商品別統計</h3>
    <div class="iias-shopping-list">
      <article v-for="[name, item] in entries" :key="name" class="iias-card">
        <h3>{{ name }}</h3>
        <p class="iias-card-meta">購入回数: {{ item.count }}</p>
        <p class="iias-card-meta">最終購入: {{ item.last_purchased_at ? new Date(item.last_purchased_at).toLocaleString('ja-JP') : '-' }}</p>
        <p class="iias-card-meta">平均間隔: {{ item.avg_interval_days != null ? `${item.avg_interval_days} 日` : '-' }}</p>
      </article>
    </div>

    <div v-if="entries.length === 0" class="iias-card" style="opacity: 0.7;">
      購入済みアイテムがありません。
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingStats } from '~/composables/useShopping'

const shopping = useShopping()
const settings = useSettings()
const stats = ref<ShoppingStats | null>(null)
const budgetInput = ref('')
const message = ref('')

const entries = computed(() => {
  if (!stats.value?.by_name) return []
  return Object.entries(stats.value.by_name)
})

async function load() {
  try {
    stats.value = await shopping.stats()
    budgetInput.value = String(stats.value.monthly_budget || 0)
  } catch (e) {
    stats.value = null
  }
}

async function saveBudget() {
  try {
    await settings.save([{ key: 'monthly_budget_amount', value: parseInt(budgetInput.value, 10) || 0, type: 'integer' }])
    message.value = '保存しました'
    await load()
  } catch (e) {
    message.value = '保存に失敗しました'
  }
}

onMounted(() => load())
</script>
