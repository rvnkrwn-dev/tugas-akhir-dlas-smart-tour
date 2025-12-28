<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isVisible"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                @click.self="handleBackdropClick">

                <Transition enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-4"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-4">
                    <div v-if="isVisible" class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        @click.stop>

                        <!-- Icon & Content -->
                        <div class="p-6 text-center">
                            <!-- Icon -->
                            <div class="mx-auto mb-4 flex items-center justify-center" :class="iconContainerClass">
                                <component :is="iconComponent" class="w-8 h-8" :class="iconClass" />
                            </div>

                            <!-- Title -->
                            <h3 class="text-xl font-bold text-[#333] mb-2">{{ title }}</h3>

                            <!-- Message -->
                            <p class="text-sm text-[#666] leading-relaxed" v-html="message"></p>
                        </div>

                        <!-- Actions -->
                        <div class="px-6 pb-6 flex gap-3" :class="actionsClass">
                            <button v-if="showCancel" @click="handleCancel"
                                class="flex-1 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer">
                                {{ cancelText }}
                            </button>
                            <button @click="handleConfirm"
                                class="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-md cursor-pointer"
                                :class="confirmButtonClass">
                                {{ confirmText }}
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'

export interface AlertOptions {
    type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    onConfirm?: () => void | Promise<void>
    onCancel?: () => void
}

const isVisible = ref(false)
const currentOptions = ref<AlertOptions>({
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
})

// Icons as inline SVG components
const SuccessIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
])

const ErrorIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 18L18 6M6 6l12 12' })
])

const WarningIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
])

const InfoIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const QuestionIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const iconComponent = computed(() => {
    const icons = {
        success: SuccessIcon,
        error: ErrorIcon,
        warning: WarningIcon,
        info: InfoIcon,
        confirm: QuestionIcon
    }
    return icons[currentOptions.value.type || 'info']
})

const iconContainerClass = computed(() => {
    const classes = {
        success: 'w-16 h-16 bg-green-100 rounded-full',
        error: 'w-16 h-16 bg-red-100 rounded-full',
        warning: 'w-16 h-16 bg-orange-100 rounded-full',
        info: 'w-16 h-16 bg-blue-100 rounded-full',
        confirm: 'w-16 h-16 bg-[#4CAF50]/10 rounded-full'
    }
    return classes[currentOptions.value.type || 'info']
})

const iconClass = computed(() => {
    const classes = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-orange-600',
        info: 'text-blue-600',
        confirm: 'text-[#4CAF50]'
    }
    return classes[currentOptions.value.type || 'info']
})

const confirmButtonClass = computed(() => {
    const classes = {
        success: 'bg-green-600 hover:bg-green-700',
        error: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-orange-600 hover:bg-orange-700',
        info: 'bg-blue-600 hover:bg-blue-700',
        confirm: 'bg-[#4CAF50] hover:bg-[#45a049]'
    }
    return classes[currentOptions.value.type || 'info']
})

const actionsClass = computed(() => {
    return currentOptions.value.showCancel ? 'justify-center' : 'justify-center'
})

const title = computed(() => currentOptions.value.title)
const message = computed(() => currentOptions.value.message)
const confirmText = computed(() => currentOptions.value.confirmText || 'OK')
const cancelText = computed(() => currentOptions.value.cancelText || 'Cancel')
const showCancel = computed(() => currentOptions.value.showCancel || false)

const show = (options: AlertOptions) => {
    currentOptions.value = { ...options }
    isVisible.value = true
    document.body.style.overflow = 'hidden'
}

const hide = () => {
    isVisible.value = false
    document.body.style.overflow = ''
}

const handleConfirm = async () => {
    if (currentOptions.value.onConfirm) {
        await currentOptions.value.onConfirm()
    }
    hide()
}

const handleCancel = () => {
    if (currentOptions.value.onCancel) {
        currentOptions.value.onCancel()
    }
    hide()
}

const handleBackdropClick = () => {
    if (currentOptions.value.showCancel) {
        handleCancel()
    }
}

defineExpose({
    show,
    hide
})
</script>
