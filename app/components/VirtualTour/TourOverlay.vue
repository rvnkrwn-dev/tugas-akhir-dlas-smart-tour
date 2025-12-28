<template>
    <div class="tour-overlay pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-8">
        <!-- Top Bar -->
        <header class="flex items-start justify-between pointer-events-auto">
            <!-- Left: Back/Menu & Title -->
            <div class="flex items-center gap-4">
                <!-- Back / Exit Button -->
                <button @click="handleExit"
                    class="group relative flex h-12 w-12 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-black/40 hover:scale-105 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="h-5 w-5 transition-transform group-hover:-translate-x-0.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>

                <!-- Title (Minimal) -->
                <div
                    class="flex flex-col opacity-0 transition-opacity duration-500 animate-[fadeIn_1s_ease-out_forwards]">
                    <span class="text-[10px] uppercase tracking-widest text-white/60 font-medium">Virtual Tour</span>
                    <h1 class="text-lg font-medium text-white drop-shadow-md leading-tight">
                        {{ tourStore.currentScene?.name || 'Loading...' }}
                    </h1>
                </div>
            </div>

            <!-- Right: Menu (Future use) -->
            <!-- <button class="...">...</button> -->
        </header>
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
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
