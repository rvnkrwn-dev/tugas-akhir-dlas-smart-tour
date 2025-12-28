<template>
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="show" class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
                <!-- Icon -->
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </div>

                <!-- Title -->
                <h2 class="text-3xl font-black text-gray-900 mb-3">
                    Fullscreen Required
                </h2>

                <!-- Description -->
                <p class="text-gray-600 mb-8 leading-relaxed">
                    Virtual Tour works best in fullscreen mode for an immersive experience. Please enable fullscreen to
                    continue.
                </p>

                <!-- Actions -->
                <div class="flex flex-col gap-3">
                    <button @click="handleEnterFullscreen"
                        class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/50 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Enable Fullscreen
                    </button>

                    <button @click="handleExit"
                        class="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                        Exit Virtual Tour
                    </button>
                </div>

                <!-- Help Text -->
                <p class="text-xs text-gray-500 mt-6">
                    💡 Tip: Press <kbd class="px-2 py-1 bg-gray-100 rounded">F11</kbd> or <kbd
                        class="px-2 py-1 bg-gray-100 rounded">Fn+F</kbd> to toggle fullscreen
                </p>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    show?: boolean
}>()

const emit = defineEmits<{
    'enter-fullscreen': []
    'exit': []
}>()

const handleEnterFullscreen = () => {
    emit('enter-fullscreen')
}

const handleExit = () => {
    emit('exit')
}
</script>

<style scoped>
kbd {
    font-family: monospace;
    font-size: 0.875rem;
}
</style>
