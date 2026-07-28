<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">購買リスト</h2>
    </header>

    <div class="iias-card iias-form" style="margin-bottom: 1rem;">
      <h3 class="iias-card-title">アイテム追加</h3>
      <label class="iias-label">商品名</label>
      <input v-model="form.name" class="iias-input" type="text" placeholder="例：牛乳 1L" />
      <label class="iias-label">画像URL</label>
      <input v-model="form.image_path" class="iias-input" type="url" placeholder="https://..." />
      <label class="iias-label">メモ</label>
      <input v-model="form.memo" class="iias-input" type="text" placeholder="確認用メモ" />
      <button class="iias-btn" style="width: 100%;" :disabled="!form.name" @click="add">追加</button>
    </div>

    <div v-if="pending" class="iias-card" style="opacity: 0.7;">読み込み中...</div>

    <div class="iias-shopping-list">
      <article
        v-for="item in visibleItems"
        :key="item.id"
        :class="['iias-shopping-item', { purchased: item.status === 'purchased' }]"
      >
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.memo">{{ item.memo }}</p>
          <img v-if="item.image_path" :src="item.image_path" alt="" style="max-width: 120px; max-height: 80px; margin-top: 0.5rem; border: 1px solid #ff8a1c;">
        </div>
        <button
          v-if="item.status !== 'purchased'"
          class="iias-btn"
          @click="purchase(item)"
        >
          購入
        </button>
        <button
          v-else
          class="iias-btn"
          @click="undo(item)"
        >
          取り消し
        </button>
      </article>
    </div>

    <div v-if="!pending && visibleItems.length === 0" class="iias-card" style="opacity: 0.7;">
      アイテムがありません。
    </div>
  </div>
</template>

<script setup>
const shopping = useShopping()
const items = ref([])
const pending = ref(false)
const form = ref({ name: '', image_path: '', memo: '' })

async function refresh() {
  pending.value = true
  try {
    items.value = await shopping.list('active')
  } finally {
    pending.value = false
  }
}

const visibleItems = computed(() =>
  items.value.filter(i => i.status !== 'archived')
)

async function add() {
  if (!form.value.name) return
  pending.value = true
  try {
    await shopping.create({
      name: form.value.name,
      image_path: form.value.image_path || undefined,
      memo: form.value.memo || undefined,
      status: 'active',
    })
    form.value = { name: '', image_path: '', memo: '' }
    await refresh()
  } finally {
    pending.value = false
  }
}

async function purchase(item) {
  item.status = 'purchased'
  await shopping.update(item.id, { status: 'purchased' })
}

async function undo(item) {
  item.status = 'active'
  await shopping.update(item.id, { status: 'active' })
}

onMounted(() => {
  refresh()
})
</script>
