<template>
  <div class="iias-login">
    <div class="iias-card" style="max-width: 420px; width: 100%;">
      <h2 class="iias-title" style="margin-bottom: 1rem;">IIAS 認証</h2>

      <div class="iias-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button
          class="iias-btn"
          :style="mode === 'login' ? 'background: rgba(255,138,28,0.2)' : ''"
          @click="mode = 'login'"
        >ログイン</button>
        <button
          class="iias-btn"
          :style="mode === 'register' ? 'background: rgba(255,138,28,0.2)' : ''"
          @click="mode = 'register'"
        >新規登録</button>
      </div>

      <form @submit.prevent="submit">
        <div v-if="mode === 'register'" class="iias-form-row">
          <label class="iias-label">名前</label>
          <input v-model="form.name" type="text" class="iias-input" required />
        </div>
        <div class="iias-form-row">
          <label class="iias-label">メールアドレス</label>
          <input v-model="form.email" type="email" class="iias-input" required />
        </div>
        <div class="iias-form-row">
          <label class="iias-label">パスワード</label>
          <input v-model="form.password" type="password" class="iias-input" required />
        </div>
        <div v-if="mode === 'register'" class="iias-form-row">
          <label class="iias-label">パスワード（確認）</label>
          <input v-model="form.password_confirmation" type="password" class="iias-input" required />
        </div>

        <p v-if="error" style="color: #ff5555; font-size: 0.85rem; margin-bottom: 0.75rem;">{{ error }}</p>

        <button type="submit" class="iias-btn" style="width: 100%;">
          {{ mode === 'login' ? 'ログイン' : '登録' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const auth = useAuth()
const mode = ref('login')
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

watch(mode, () => {
  error.value = ''
})

async function submit() {
  error.value = ''
  try {
    if (mode.value === 'login') {
      await auth.login(form.email, form.password)
    } else {
      await auth.register(form.name, form.email, form.password, form.password_confirmation)
    }
    await navigateTo('/')
  } catch (e) {
    error.value = e?.data?.message || '認証に失敗しました'
  }
}
</script>

<style scoped>
.iias-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #050505;
}
</style>
