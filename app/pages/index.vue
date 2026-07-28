<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">タイムライン / 検索</h2>
      <input
        v-model="query"
        type="search"
        class="iias-search"
        placeholder="アーカイブを検索..."
        @input="refresh"
      />
    </header>

    <div v-if="pending" class="iias-card" style="opacity: 0.7;">読み込み中...</div>

    <div class="iias-timeline">
      <article v-for="item in archives" :key="item.id" class="iias-card">
        <h3 class="iias-card-title">{{ item.title || '(タイトルなし)' }}</h3>
        <p v-if="item.url" class="iias-card-meta">{{ item.url }}</p>
        <p v-if="item.memo" class="iias-card-meta">{{ item.memo }}</p>
        <p class="iias-card-meta">{{ formatDate(item.recorded_at) }}</p>
      </article>
    </div>

    <div v-if="!pending && archives.length === 0" class="iias-card" style="opacity: 0.7;">
      アーカイブがありません。
    </div>
  </div>
</template>

<script setup>
const archivesApi = useArchives()
const query = ref('')
const archives = ref([])
const pending = ref(false)

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleString('ja-JP')
}

async function refresh() {
  pending.value = true
  try {
    const res = await archivesApi.list({ search: query.value })
    archives.value = res.data || []
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  refresh()
})
</script>
