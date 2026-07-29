<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">{{ title }}</h2>
      <input
        v-model="query"
        type="search"
        class="iias-search"
        placeholder="アーカイブを検索..."
        @input="onSearchInput"
      />
    </header>

    <div v-if="pending" class="iias-card" style="opacity: 0.7;">読み込み中...</div>

    <template v-if="viewMode === 'hierarchy'">
      <div v-for="group in hierarchyGroups" :key="group.key" class="iias-card" style="margin-bottom: 0.75rem;">
        <button class="iias-hierarchy-toggle" @click="toggleGroup(group.key)">
          {{ group.label }} ({{ group.items.length }})
        </button>
        <div v-if="isExpanded(group.key)" class="iias-hierarchy-children">
          <article v-for="item in group.items" :key="item.id" class="iias-card" style="margin-top: 0.5rem;">
            <h3 class="iias-card-title">{{ item.title || '(タイトルなし)' }}</h3>
            <p v-if="item.url" class="iias-card-meta">{{ item.url }}</p>
            <p v-if="bodyPreview(item)" class="iias-card-meta iias-body-preview">{{ bodyPreview(item) }}</p>
            <p v-if="item.memo" class="iias-card-meta">{{ item.memo }}</p>
            <p v-if="item.tags?.length" class="iias-card-meta">タグ: {{ item.tags.map(t => t.name).join(', ') }}</p>
            <p class="iias-card-meta">{{ formatDate(item.recorded_at) }}</p>
            <button v-if="item.url && !item.body" class="iias-btn iias-btn-small" @click="onFetchBody(item)">本文取得</button>
          </article>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="iias-timeline">
        <article v-for="item in archives" :key="item.id" class="iias-card">
          <h3 class="iias-card-title">{{ item.title || '(タイトルなし)' }}</h3>
          <p v-if="item.url" class="iias-card-meta">{{ item.url }}</p>
          <p v-if="bodyPreview(item)" class="iias-card-meta iias-body-preview">{{ bodyPreview(item) }}</p>
          <p v-if="item.memo" class="iias-card-meta">{{ item.memo }}</p>
          <p v-if="item.tags?.length" class="iias-card-meta">タグ: {{ item.tags.map(t => t.name).join(', ') }}</p>
          <p class="iias-card-meta">{{ formatDate(item.recorded_at) }}</p>
          <button v-if="item.url && !item.body" class="iias-btn iias-btn-small" @click="onFetchBody(item)">本文取得</button>
        </article>
      </div>
    </template>

    <div v-if="!pending && archives.length === 0" class="iias-card" style="opacity: 0.7;">
      アーカイブがありません。
    </div>
  </div>
</template>

<script setup>
const archivesApi = useArchives()
const settingsApi = useSettings()
const query = ref('')
const archives = ref([])
const pending = ref(false)
const viewMode = ref('dashboard')
const expanded = ref(new Set())

const title = computed(() =>
  viewMode.value === 'hierarchy' ? '階層メニュー / 検索' : 'タイムライン / 検索'
)

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleString('ja-JP')
}

function bodyPreview(item) {
  if (!item.body) return ''
  return item.body.length > 160 ? item.body.slice(0, 160) + '…' : item.body
}

async function onFetchBody(item) {
  try {
    const updated = await archivesApi.fetchBody(item.id)
    item.body = updated.body || null
  } catch {
    alert('本文の取得に失敗しました')
  }
}

function groupKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const hierarchyGroups = computed(() => {
  const map = new Map()
  for (const item of archives.value) {
    const key = groupKey(item.recorded_at)
    if (!map.has(key)) {
      map.set(key, { key, label: key, items: [] })
    }
    map.get(key).items.push(item)
  }
  return Array.from(map.values())
})

function isExpanded(key) {
  return expanded.value.has(key)
}

function toggleGroup(key) {
  if (expanded.value.has(key)) {
    expanded.value.delete(key)
  } else {
    expanded.value.add(key)
  }
}

let searchTimer = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => refresh(), 250)
}

async function refresh() {
  pending.value = true
  try {
    const perPage = viewMode.value === 'hierarchy' ? 1000 : 30
    const res = await archivesApi.list({ search: query.value, per_page: perPage })
    archives.value = res.data || []
  } finally {
    pending.value = false
  }
}

async function loadSettings() {
  try {
    const data = await settingsApi.get()
    if (data.view_mode) viewMode.value = String(data.view_mode)
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadSettings()
  refresh()
})
</script>
