<template>
    <button @click="handleClick"
        class="fixed bottom-24 right-6 z-[60] w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Masuk Tur Virtual 360">

        <!-- 360 Icon -->
        <svg class="w-7 h-7 transition-transform group-hover:rotate-180 duration-700" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <!-- Tooltip -->
        <span
            class="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
            🌐 Tur Virtual 360°
        </span>

        <!-- Pulse Animation -->
        <span class="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping duration-1000"></span>
    </button>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tour'

const tourStore = useTourStore()
const router = useRouter()

const handleClick = async () => {
    // Initialize tour if not already done
    if (tourStore.scenes.length === 0) {
        await tourStore.initTour()
    }

    // Navigate to virtual tour page
    await router.push('/virtual-tour')
}
</script>
