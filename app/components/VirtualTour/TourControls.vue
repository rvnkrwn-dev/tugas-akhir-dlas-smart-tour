<template>
    <div class="tour-controls">
        <!-- Bottom Controls Bar -->
        <!-- Bottom Controls Bar (Minimal & Right Aligned) -->
        <div class="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
            <!-- Locations Panel Toggle -->
            <button @click="tourStore.toggleLocationsPanel" :class="[
                'group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-black/40 hover:scale-105 active:scale-95',
                tourStore.showLocationsPanel ? 'bg-blue-500/40 border-blue-400/50' : ''
            ]" title="Locations">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            </button>

            <!-- Gyroscope Toggle -->
            <button v-if="gyro.isAvailable" @click="handleGyroToggle" :class="[
                'group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-black/40 hover:scale-105 active:scale-95',
                tourStore.settings.isGyroEnabled ? 'bg-yellow-500/40 border-yellow-400/50' : ''
            ]" :title="tourStore.settings.isGyroEnabled ? 'Disable Gyroscope' : 'Enable Gyroscope'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
            </button>

            <!-- Cart Toggle -->
            <button @click="cartStore.toggleCart()" :class="[
                'group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white transition-all duration-300 hover:bg-black/40 hover:scale-105 active:scale-95',
                cartStore.isOpen ? 'bg-green-500/40 border-green-400/50' : ''
            ]" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <!-- Cart Badge -->
                <span v-if="cartStore.itemCount > 0"
                    class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-black">
                    {{ cartStore.itemCount }}
                </span>
            </button>
        </div>

        <!-- Bottom Gradient -->
        <div
            class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
        </div>

        <!-- Gyroscope Permission Dialog (iOS) -->
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="showGyroPermission"
                class="absolute inset-0 flex items-center justify-center z-30 bg-black/70 backdrop-blur-sm">
                <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div class="flex flex-col items-center text-center">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-2xl font-black text-gray-900 mb-2">Enable Gyroscope?</h3>
                        <p class="text-gray-600 mb-6">
                            Allow access to your device's motion sensors to control the view by moving your device.
                        </p>
                        <div class="flex gap-3 w-full">
                            <button @click="showGyroPermission = false"
                                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button @click="handleGyroPermissionRequest"
                                class="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/50 transition-all active:scale-95">
                                Allow
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTourStore } from '~/stores/tour'
import { useCartStore } from '~/stores/cart'
import { useGyroscope } from '~/composables/VirtualTour/useGyroscope'

const tourStore = useTourStore()
const cartStore = useCartStore()
const gyro = useGyroscope()
const showGyroPermission = ref(false)

const handleGyroToggle = async () => {
    if (tourStore.settings.isGyroEnabled) {
        // Disable gyro
        gyro.disable()
        tourStore.toggleGyro(false)
    } else {
        // Check if permission needed
        if (gyro.needsPermission.value && !gyro.isPermissionGranted.value) {
            showGyroPermission.value = true
        } else {
            // Enable directly
            const success = await gyro.enable()
            if (success) {
                tourStore.toggleGyro(true)
            }
        }
    }
}

const handleGyroPermissionRequest = async () => {
    showGyroPermission.value = false
    const success = await gyro.enable()
    if (success) {
        tourStore.toggleGyro(true)
    }
}
</script>

<style scoped>
.tour-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.tour-controls button {
    pointer-events: auto;
}
</style>
