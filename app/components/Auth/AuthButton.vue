<template>
  <button :type="type" :disabled="disabled || loading" :class="[
    'w-full flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
    variantClasses,
    disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
  ]">
    <!-- Loading Spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
      </path>
    </svg>

    <!-- Icon -->
    <component v-if="icon && !loading" :is="icon" class="h-5 w-5 mr-2" />

    <!-- Text -->
    <span>{{ loading ? loadingText : text }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  icon?: any
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
  loadingText: 'Loading...'
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-[#4CAF50] text-white hover:bg-[#45a049] focus:ring-[#4CAF50]/20 shadow-lg',
    secondary: 'bg-gray-100 text-[#333] hover:bg-gray-200 focus:ring-gray-300/20',
    outline: 'border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50]/5 focus:ring-[#4CAF50]/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20 shadow-lg'
  }
  return variants[props.variant]
})
</script>
