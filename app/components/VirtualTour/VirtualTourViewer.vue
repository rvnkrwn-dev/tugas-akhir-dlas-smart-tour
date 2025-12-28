<template>
    <div class="virtual-tour-viewer">
        <!-- Panorama Container (Base Layer) -->
        <div id="panorama" ref="panoramaContainer" class="panorama-layer"></div>

        <!-- Loading Overlay -->
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="tourStore.isLoading"
                class="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <p class="text-white font-semibold">Loading panorama...</p>
                </div>
            </div>
        </Transition>

        <!-- Error Overlay -->
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="tourStore.error"
                class="absolute inset-0 flex items-center justify-center z-[100] bg-black/90 backdrop-blur-sm">
                <div class="bg-white rounded-3xl p-8 max-w-md mx-4 text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-black text-gray-900 mb-2">Failed to Load</h3>
                    <p class="text-gray-600 mb-6">{{ tourStore.error }}</p>
                    <div class="flex gap-3">
                        <button @click="handleExit"
                            class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                            Exit
                        </button>
                        <button @click="handleRetry"
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Premium Top Overlay (z-10) -->
        <TourOverlay v-if="!tourStore.isLoading && !tourStore.error" />

        <!-- Tour Controls (Bottom) (z-20) -->
        <TourControls v-if="!tourStore.isLoading && !tourStore.error" />

        <!-- Hotspot Panel (z-9999) -->
        <HotspotPanel />

        <!-- Locations Panel (z-9998) -->
        <LocationsPanel />

        <!-- Fullscreen Overlay (z-30) -->
        <FullscreenOverlay :show="tourStore.showFullscreenOverlay" @enter-fullscreen="tourStore.toggleFullscreen(true)"
            @exit="handleExit" />

        <!-- Global Cart Drawer (z-9997) -->
        <CartDrawer />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTourStore } from '~/stores/tour'
import { usePannellum } from '~/composables/VirtualTour/usePannellum'

// Components
import TourOverlay from './TourOverlay.vue'
import TourControls from './TourControls.vue'
import HotspotPanel from './HotspotPanel.vue'
import LocationsPanel from './LocationsPanel.vue'
import FullscreenOverlay from './FullscreenOverlay.vue'
import CartDrawer from '~/components/Cart/CartDrawer.vue'

const tourStore = useTourStore()
const router = useRouter()
const panoramaContainer = ref<HTMLElement | null>(null)

// Initialize Pannellum
const { initViewer, destroyViewer } = usePannellum(panoramaContainer)

// Initialize viewer when scene is loaded
watch(() => tourStore.currentScene, async (newScene) => {
    if (newScene) {
        // If container is not ready (unlikely after mount), wait valid tick
        if (!panoramaContainer.value) return
        await initViewer(newScene)
    }
})

onMounted(async () => {
    // Initial load if scene exists
    if (tourStore.currentScene) {
        await initViewer(tourStore.currentScene)
    }
})

// Handle exit
const handleExit = () => {
    tourStore.exitTour()
    router.push('/')
}

// Handle retry
const handleRetry = async () => {
    tourStore.clearError()
    if (tourStore.currentSceneId) {
        await tourStore.loadScene(tourStore.currentSceneId)
    }
}

// Cleanup on unmount
onUnmounted(() => {
    destroyViewer()
})
</script>

<style scoped>
.virtual-tour-viewer {
    position: relative;
    width: 100%;
    height: 100vh;
    background: black;
    overflow: hidden;
}

.panorama-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
}
</style>
