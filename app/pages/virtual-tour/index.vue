<template>
  <div class="virtual-tour-page">
    <ClientOnly>
      <template #fallback>
        <div class="loading-fallback">
          <div class="loading-spinner"></div>
          <p>Loading Virtual Tour...</p>
        </div>
      </template>

      <!-- Main Virtual Tour Viewer -->
      <VirtualTourViewer v-if="tourStore.isActive" />

      <!-- Initial Loading State -->
      <div v-else-if="tourStore.isLoading" class="loading-state">
        <div class="loading-content">
          <div class="spinner"></div>
          <h2>Preparing Virtual Tour</h2>
          <p>Loading panoramic scenes...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="tourStore.error" class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2>Failed to Load Tour</h2>
          <p>{{ tourStore.error }}</p>
          <button @click="handleRetry" class="retry-btn">Retry</button>
          <button @click="handleExit" class="exit-btn">Exit</button>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTourStore } from '~/stores/tour'

const tourStore = useTourStore()
const router = useRouter()

definePageMeta({
  layout: false // Fullscreen mode
})

// Load Pannellum only for this page
useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js',
      defer: true
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
    }
  ]
})

// Initialize tour on mount
onMounted(async () => {

  try {
    // Initialize tour - fetches all scenes from API
    await tourStore.initTour()

    // Start with default scene if not already active
    if (!tourStore.isActive && tourStore.scenes.length > 0) {
      await tourStore.startTour()
    }
  } catch (error) {
    // console.error('Virtual Tour Page: Initialization failed', error)
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  // Don't exit tour here - let the viewer handle cleanup
})

// Handle retry
const handleRetry = async () => {
  tourStore.clearError()
  await tourStore.initTour()
  if (tourStore.scenes.length > 0) {
    await tourStore.startTour()
  }
}

// Handle exit
const handleExit = () => {
  tourStore.exitTour()
  router.push('/')
}
</script>

<style scoped>
.virtual-tour-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  z-index: 0;
}

/* Loading States */
.loading-fallback,
.loading-state,
.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  z-index: 10;
}

.loading-content,
.error-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.loading-spinner,
.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-content h2,
.error-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.loading-content p,
.error-content p {
  font-size: 1rem;
  opacity: 0.8;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-btn,
.exit-btn {
  margin: 0.5rem;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.retry-btn:hover {
  background: #2563eb;
}

.exit-btn {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.exit-btn:hover {
  border-color: rgba(255, 255, 255, 0.6);
}
</style>
