<template>
  <div class="ndma-theme-ops iias-app">
    <aside class="iias-sidebar">
      <h1 class="iias-logo">IIAS</h1>
      <nav class="iias-nav">
        <NuxtLink to="/" class="iias-nav-link">タイムライン</NuxtLink>
        <NuxtLink to="/shopping" class="iias-nav-link">買い物リスト</NuxtLink>
        <NuxtLink to="/settings" class="iias-nav-link">設定</NuxtLink>
      </nav>
    </aside>
    <main class="iias-main">
      <NuxtPage />
    </main>
  </div>
</template>
