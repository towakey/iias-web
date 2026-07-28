<template>
  <div>
    <header class="iias-header">
      <h2 class="iias-title">定番商品</h2>
    </header>

    <div class="iias-card iias-form" style="margin-bottom: 1rem;">
      <h3 class="iias-card-title">定番商品登録</h3>
      <label class="iias-label">商品名</label>
      <input v-model="form.name" class="iias-input" type="text" placeholder="例：牛乳" />
      <label class="iias-label">価格（円）</label>
      <input v-model="form.price" class="iias-input" type="number" placeholder="例：200" />
      <label class="iias-label">メモ</label>
      <input v-model="form.memo" class="iias-input" type="text" placeholder="確認用メモ" />
      <button class="iias-btn" style="width: 100%;" :disabled="!form.name" @click="add">登録</button>
      <p v-if="message" class="iias-message">{{ message }}</p>
    </div>

    <div class="iias-shopping-list">
      <article v-for="item in items" :key="item.id" class="iias-shopping-item">
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.price">{{ item.price }} 円</p>
          <p v-if="item.memo">{{ item.memo }}</p>
        </div>
        <button class="iias-btn" @click="addToShopping(item)">購買リストに追加</button>
      </article>
    </div>

    <div v-if="items.length === 0" class="iias-card" style="opacity: 0.7;">
      定番商品がありません。
    </div>
  </div>
</template>

<script setup lang="ts">
const shopping = useShopping()
const items = ref<any[]>([])
const form = ref({ name: '', price: '', memo: '' })
const message = ref('')

async function load() {
  try {
    items.value = await shopping.getRegularItems()
  } catch (e) {
    items.value = []
  }
}

async function add() {
  if (!form.value.name) return
  try {
    await shopping.createRegularItem({
      name: form.value.name,
      price: form.value.price ? parseInt(form.value.price, 10) : undefined,
      memo: form.value.memo || undefined,
    })
    form.value = { name: '', price: '', memo: '' }
    message.value = '登録しました'
    await load()
  } catch (e) {
    message.value = '登録に失敗しました'
  }
}

async function addToShopping(item: any) {
  try {
    await shopping.addRegularToShopping(item.id)
    message.value = '購買リストに追加しました'
  } catch (e) {
    message.value = '追加に失敗しました'
  }
}

onMounted(() => load())
</script>
