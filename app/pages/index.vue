<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">タイムライン / 検索</h2>
      <input
        v-model="query"
        type="search"
        class="iias-search"
        placeholder="アーカイブを検索..."
      />
    </header>

    <div class="iias-timeline">
      <article v-for="item in filteredItems" :key="item.id" class="iias-card">
        <h3 class="iias-card-title">{{ item.title }}</h3>
        <p class="iias-card-meta">{{ item.url }}</p>
        <p class="iias-card-meta">{{ item.date }}</p>
      </article>
    </div>
  </div>
</template>

<script setup>
const query = ref('')

const items = ref([
  { id: 1, title: 'サンプルアーカイブ', url: 'https://example.com', date: '2026-07-28 12:00' },
  { id: 2, title: 'IIAS プロジェクト開始', url: 'https://github.com/towakey/iias-core', date: '2026-07-28 11:00' },
])

const filteredItems = computed(() => {
  if (!query.value) return items.value
  const q = query.value.toLowerCase()
  return items.value.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.url.toLowerCase().includes(q)
  )
})
</script>
