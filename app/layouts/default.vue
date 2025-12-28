<template>
  <div class="min-h-screen bg-white">
    <!-- Header/Navbar Component -->
    <AppHeader />

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer Component -->
    <AppFooter />

    <!-- Global Cart Components -->
    <CartButton />
    <CartDrawer />

    <!-- Virtual Tour FAB Button -->
    <VirtualTourFab />
  </div>
</template>

<script setup lang="ts">
// Layout untuk halaman utama aplikasi
</script>
