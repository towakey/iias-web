<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">購買リスト</h2>
    </header>

    <div class="iias-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <button
        class="iias-btn"
        :style="tab === 'active' ? 'background: rgba(255,138,28,0.2)' : ''"
        @click="tab = 'active'"
      >購入前</button>
      <button
        class="iias-btn"
        :style="tab === 'purchased' ? 'background: rgba(255,138,28,0.2)' : ''"
        @click="tab = 'purchased'"
      >購入済み</button>
    </div>

    <div v-if="tab === 'active'" class="iias-card iias-form" style="margin-bottom: 1rem;">
      <h3 class="iias-card-title">アイテム追加</h3>
      <label class="iias-label">商品名</label>
      <input v-model="form.name" class="iias-input" type="text" placeholder="例：牛乳 1L" />
      <label class="iias-label">価格（円）</label>
      <input v-model="form.price" class="iias-input" type="number" placeholder="例：200" />
      <label class="iias-label">画像</label>
      <input ref="fileInput" type="file" accept="image/*" class="iias-input" @change="onFileChange" />
      <label class="iias-label">メモ</label>
      <input v-model="form.memo" class="iias-input" type="text" placeholder="確認用メモ" />
      <button class="iias-btn" style="width: 100%;" :disabled="!form.name" @click="add">追加</button>
    </div>

    <div v-if="pending" class="iias-card" style="opacity: 0.7;">読み込み中...</div>

    <div class="iias-shopping-list">
      <article
        v-for="item in items"
        :key="item.id"
        :class="['iias-shopping-item', { purchased: item.status === 'purchased' }]"
      >
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.price">{{ item.price }} 円</p>
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
          @click="reactivate(item)"
        >
          再アクティブ化
        </button>
      </article>
    </div>

    <div v-if="!pending && items.length === 0" class="iias-card" style="opacity: 0.7;">
      アイテムがありません。
    </div>
  </div>
</template>

<script setup lang="ts">
const shopping = useShopping()
const items = ref([])
const pending = ref(false)
const tab = ref<'active' | 'purchased'>('active')
const form = ref({ name: '', price: '', memo: '' })
const imageFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  imageFile.value = target.files?.[0] ?? null
}

async function refresh() {
  pending.value = true
  try {
    items.value = await shopping.list(tab.value)
  } finally {
    pending.value = false
  }
}

watch(tab, () => refresh())

async function add() {
  if (!form.value.name) return
  pending.value = true
  try {
    await shopping.create({
      name: form.value.name,
      price: form.value.price ? parseInt(form.value.price, 10) : undefined,
      memo: form.value.memo || undefined,
      status: 'active',
    }, imageFile.value || undefined)
    form.value = { name: '', price: '', memo: '' }
    imageFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    tab.value = 'active'
    await refresh()
  } finally {
    pending.value = false
  }
}

async function purchase(item) {
  item.status = 'purchased'
  await shopping.update(item.id, { status: 'purchased' })
}

async function reactivate(item) {
  await shopping.restore(item.id)
  await refresh()
}

onMounted(() => {
  refresh()
})
</script>
