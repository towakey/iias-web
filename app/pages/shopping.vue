<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">買い物リスト</h2>
    </header>

    <div class="iias-shopping-list">
      <article
        v-for="item in visibleItems"
        :key="item.id"
        :class="['iias-shopping-item', { purchased: item.status === 'purchased' }]"
      >
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.memo }}</p>
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
  </div>
</template>

<script setup>
const items = ref([
  { id: 1, name: '牛乳', memo: '1L', status: 'active' },
  { id: 2, name: '食パン', memo: '6枚切り', status: 'active' },
  { id: 3, name: 'コーヒー豆', memo: '深煎り', status: 'active' },
])

const visibleItems = computed(() =>
  items.value.filter(i => i.status !== 'archived')
)

const purchase = (item) => {
  item.status = 'purchased'
}

const undo = (item) => {
  item.status = 'active'
}
</script>
