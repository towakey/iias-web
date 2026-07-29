<template>
  <div class="ndma-theme-ops iias-app">
    <aside v-if="user?.id" class="iias-sidebar">
      <h1 class="iias-logo">IIAS</h1>
      <nav class="iias-nav">
        <NuxtLink to="/" class="iias-nav-link">タイムライン</NuxtLink>
        <NuxtLink to="/shopping" class="iias-nav-link">購買リスト</NuxtLink>
        <NuxtLink to="/stats" class="iias-nav-link">統計</NuxtLink>
        <NuxtLink to="/regular" class="iias-nav-link">定番</NuxtLink>
        <NuxtLink to="/mindmap" class="iias-nav-link">マインドマップ</NuxtLink>
        <NuxtLink to="/settings" class="iias-nav-link">設定</NuxtLink>
        <NuxtLink to="/qr-login" class="iias-nav-link">QRログイン</NuxtLink>
      </nav>
      <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #ff8a1c;">
        <p style="font-size: 0.8rem; margin: 0 0 0.5rem;">{{ user?.name }}</p>
        <button class="iias-btn" style="width: 100%;" @click="logout">ログアウト</button>
      </div>
    </aside>
    <main class="iias-main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
const { user, logout: doLogout } = useAuth()

async function logout() {
  await doLogout()
  await navigateTo('/login')
}
</script>
