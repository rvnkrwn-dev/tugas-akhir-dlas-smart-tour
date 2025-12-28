<template>
    <Teleport to="body">
        <div class="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none p-4 max-w-sm w-full">
            <TransitionGroup enter-active-class="transform ease-out duration-300 transition"
                enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <div v-for="toast in toasts" :key="toast.id"
                    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                    @mouseenter="pauseTimer(toast.id)" @mouseleave="resumeTimer(toast.id)">
                    <div class="p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <component :is="getIcon(toast.type)" class="h-6 w-6" :class="getIconClass(toast.type)"
                                    aria-hidden="true" />
                            </div>
                            <div class="ml-3 w-0 flex-1 pt-0.5">
                                <p class="text-sm font-bold text-gray-900">{{ toast.title }}</p>
                                <p class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
                            </div>
                            <div class="ml-4 flex flex-shrink-0">
                                <button type="button" @click="removeToast(toast.id)"
                                    class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span class="sr-only">Close</span>
                                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path
                                            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Progress Bar (Optional) -->
                    <div v-if="toast.duration > 0" class="h-1 bg-gray-100 w-full overflow-hidden">
                         <div class="h-full transition-all duration-100 ease-linear"
                            :class="getProgressBarClass(toast.type)"
                             :style="{ width: `${toast.progress}%` }">
                         </div>
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useToast } from '../../composables/useToast'

const { toasts, removeToast, pauseTimer, resumeTimer } = useToast()

// Icons
const SuccessIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const ErrorIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const WarningIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
])

const InfoIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return SuccessIcon
        case 'error': return ErrorIcon
        case 'warning': return WarningIcon
        case 'info': return InfoIcon
        default: return InfoIcon
    }
}

const getIconClass = (type: string) => {
    switch (type) {
        case 'success': return 'text-green-500'
        case 'error': return 'text-red-500'
        case 'warning': return 'text-orange-500'
        case 'info': return 'text-blue-500'
        default: return 'text-gray-500'
    }
}

const getProgressBarClass = (type: string) => {
    switch (type) {
        case 'success': return 'bg-green-500'
        case 'error': return 'bg-red-500'
        case 'warning': return 'bg-orange-500'
        case 'info': return 'bg-blue-500'
        default: return 'bg-gray-500'
    }
}
</script>
