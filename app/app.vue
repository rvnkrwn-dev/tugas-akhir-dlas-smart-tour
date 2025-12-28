<template>
  <div>
    <AppPreloader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Alert Dialog -->
    <UiAlert ref="alertRef" />
    <!-- Global Toast Notifications -->
    <UiToast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCartStore } from '~/stores/cart'

const alertRef = ref()
const { setAlertInstance } = useAlert()
const { isAuthenticated, initAuth } = useAuth()
const cartStore = useCartStore()

onMounted(async () => {
  setAlertInstance(alertRef.value)

  // Initialize Cart if authenticated
  if (isAuthenticated.value) {
    await cartStore.fetchCart()
  }
})

// Global watcher for auth state changes
watch(isAuthenticated, async (newVal) => {
  if (newVal) {
    // User logged in - Sync local items and fetch server cart
    await cartStore.syncCart()
  } else {
    // User logged out - Clear local sensitive data
    cartStore.clearCart()
  }
})
</script>
