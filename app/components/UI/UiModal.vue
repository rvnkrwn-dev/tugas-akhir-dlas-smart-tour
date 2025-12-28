<template>
    <!-- Modal Backdrop -->
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="modelValue"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click.self="closeOnBackdrop && close()">

                <!-- Modal Container -->
                <Transition enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95">
                    <div v-if="modelValue" :class="[
                        'bg-white rounded-2xl shadow-2xl w-full',
                        sizeClasses[size],
                        'max-h-[90vh] flex flex-col overflow-hidden'
                    ]" @click.stop>

                        <!-- Header -->
                        <div class="flex items-center justify-between p-5 border-b border-gray-200">
                            <div>
                                <h3 class="text-lg font-semibold text-[#333]">{{ title }}</h3>
                                <p v-if="subtitle" class="text-sm text-[#666] mt-0.5">{{ subtitle }}</p>
                            </div>
                            <button @click="close"
                                class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                aria-label="Close modal">
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Body (Scrollable) -->
                        <div class="flex-1 overflow-y-auto p-5">
                            <slot></slot>
                        </div>

                        <!-- Footer with Actions -->
                        <div v-if="$slots.footer || showDefaultFooter" class="p-5 border-t border-gray-200 bg-gray-50">
                            <slot name="footer">
                                <div class="flex items-center justify-end gap-3">
                                    <button v-if="showCancel" @click="handleCancel" type="button"
                                        class="px-4 py-2 text-sm font-medium text-[#666] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                                        {{ cancelText }}
                                    </button>
                                    <button v-if="showSubmit" @click="handleSubmit" :disabled="submitDisabled"
                                        type="button"
                                        class="px-4 py-2 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                        {{ submitText }}
                                    </button>
                                </div>
                            </slot>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
    modelValue: boolean
    title: string
    subtitle?: string
    size?: ModalSize
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
    showDefaultFooter?: boolean
    showCancel?: boolean
    showSubmit?: boolean
    cancelText?: string
    submitText?: string
    submitDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    closeOnBackdrop: true,
    closeOnEsc: true,
    showDefaultFooter: true,
    showCancel: true,
    showSubmit: true,
    cancelText: 'Cancel',
    submitText: 'Submit',
    submitDisabled: false
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'close': []
    'cancel': []
    'submit': []
}>()

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
}

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}

const handleCancel = () => {
    emit('cancel')
    close()
}

const handleSubmit = () => {
    emit('submit')
}

// Handle ESC key
const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.closeOnEsc && props.modelValue) {
        close()
    }
}

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
})

onMounted(() => {
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
})
</script>
