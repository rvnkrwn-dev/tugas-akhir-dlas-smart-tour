<template>
    <div class="tour-hud">
        <!-- Top Bar -->
        <div class="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-10">
            <!-- Left: Location Info -->
            <div class="flex items-center gap-3">
                <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                    <h2 class="text-white font-black text-lg sm:text-xl drop-shadow-md">
                        {{ tourStore.currentScene?.name || 'Virtual Tour' }}
                    </h2>
                    <p class="text-white/80 text-xs font-medium flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live 360° View
                        <span v-if="tourStore.currentScene?.location" class="ml-2">
                            📍 {{ tourStore.currentScene.location }}
                        </span>
                    </p>
                </div>
            </div>

            <!-- Right: Exit Button -->
            <button @click="handleExit"
                class="group bg-white/10 backdrop-blur-md hover:bg-white/20 p-2.5 rounded-full border border-white/20 transition-all hover:rotate-90">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Gradient Overlay for readability -->
        <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tour'

const tourStore = useTourStore()
const router = useRouter()

const handleExit = () => {
    router.push('/')
}
</script>

<style scoped>
.tour-hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.tour-hud button {
    pointer-events: auto;
}

.tour-hud>div {
    pointer-events: auto;
}
</style>
