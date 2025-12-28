<template>
  <div id="panorama-container" class="w-full h-full relative" ref="panoContainer">
    <!-- Pannellum injects here -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { mapTourToPannellum } from '~/utils/pannellumMapper'
import { prefetchScenes } from '~/utils/scenePrefetch'
import type { Scene, Hotspot } from '~/types/virtual-tour'

const props = defineProps<{
  scenes: Record<string, Scene>
  config: any // Tour defaults
  initialSceneId?: string
}>()

const emit = defineEmits<{
  (e: 'scene:change', sceneId: string): void
  (e: 'product:click', hotspot: Hotspot): void
}>()

const panoContainer = ref<HTMLElement | null>(null)
const viewer = ref<any>(null)
const error = ref<string | null>(null)

// Ensure we access window safely
const getPannellum = () => (window as any).pannellum

// Initialize Viewer
const initViewer = () => {
  const pannellum = getPannellum()
  if (!pannellum || !panoContainer.value) {
    console.error('Pannellum lib not loaded or container missing')
    return
  }

  try {
    // 1. Map Config
    const viewerConfig = mapTourToPannellum(props.scenes, props.config, {
      onProductClick: (hotspot) => {
        emit('product:click', hotspot)
      }
    })

    // 2. Set Initial Scene
    const firstScene = props.initialSceneId || props.config.firstScene
    if (firstScene && viewerConfig.scenes[firstScene]) {
      // Override default if prop provided
      viewerConfig.default.firstScene = firstScene
    }

    // 3. Destroy if exists
    if (viewer.value) {
      viewer.value.destroy()
    }

    // 4. Create Viewer
    viewer.value = pannellum.viewer('panorama-container', viewerConfig)

    // 5. Attach Event Listeners
    viewer.value.on('scenechange', (newSceneId: string) => {
      // Emit event
      emit('scene:change', newSceneId)

      // Prefetch neighbors
      const sceneData = props.scenes[newSceneId]
      if (sceneData?.adjacentScenes) {
        prefetchScenes(sceneData.adjacentScenes, props.scenes)
      }
    })

    viewer.value.on('error', (err: any) => {
      console.error('Pannellum error:', err)
      error.value = 'Failed to load panorama.'
    })

  } catch (e: any) {
    console.error('Error initializing tour:', e)
    error.value = e.message
  }
}

onMounted(() => {
  // Check if script is loaded, if not wait or retry (simplified here assuming head script load)
  const checkLib = setInterval(() => {
    if (getPannellum()) {
      clearInterval(checkLib)
      initViewer()
    }
  }, 100)

  // Safety timeout
  setTimeout(() => clearInterval(checkLib), 5000)
})

onBeforeUnmount(() => {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
})

// Watch for config changes? Usually tour config is static, but if it changes dynamically:
watch(() => props.scenes, () => {
  // Re-init if scenes change drastically
  // For simple updates, maybe unnecessary. 
  // Assuming simple case: static config.
}, { deep: true })
</script>

<style>
/* Custom hotspot styles */
.pnlm-hotspot.custom-hotspot-product {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='white' class='size-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' /%3E%3C/svg%3E");
  background-color: #fca5a5;
  /* red-300 */
  border-radius: 50%;
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid white;
  width: 32px;
  height: 32px;
}

.pnlm-hotspot.custom-hotspot-product:hover {
  transform: scale(1.2);
  background-color: #ef4444;
  /* red-500 */
  z-index: 100;
}

/* Hide default Pannellum Title */
.pnlm-title-box {
  display: none !important;
}
</style>
