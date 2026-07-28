<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">購買リスト</h2>
    </header>

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
