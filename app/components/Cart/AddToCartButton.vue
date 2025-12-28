<template>
    <button @click="addToCart" :disabled="isAdding"
        :class="[variantClasses, 'min-h-[44px] px-5 py-2.5 font-bold text-sm rounded-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-2 whitespace-nowrap']">
        <!-- Loading State -->
        <svg v-if="isAdding" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
        </svg>

        <!-- Success State -->
        <svg v-else-if="showSuccess" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>

        <!-- Cart Icon (Default) -->
        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>

        <!-- Button Text -->
        <span>
            {{ showSuccess ? '✓ Ditambahkan' : isAdding ? 'Menambahkan...' : buttonText }}
        </span>
    </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore, type CartItem } from '~/stores/cart'

const props = withDefaults(defineProps<{
    item: Omit<CartItem, 'id'>
    buttonText?: string
    autoOpenCart?: boolean
    variant?: 'primary' | 'soft' | 'outline'
}>(), {
    buttonText: 'Tambah ke Keranjang',
    autoOpenCart: true,
    variant: 'soft'
})

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary':
            return 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-600/50'
        case 'outline':
            return 'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100 focus-visible:ring-green-600/50'
        case 'soft':
        default:
            return 'bg-green-600/12 text-green-600 hover:bg-green-600/22 active:bg-green-600/30 focus-visible:ring-green-600/35'
    }
})

const cartStore = useCartStore()
const isAdding = ref(false)
const showSuccess = ref(false)

const addToCart = async () => {
    isAdding.value = true

    // Simulate async operation (e.g., API call)
    await new Promise(resolve => setTimeout(resolve, 300))

    // Add to cart
    cartStore.addItem(props.item)

    isAdding.value = false
    showSuccess.value = true

    // Open cart drawer if enabled
    if (props.autoOpenCart) {
        setTimeout(() => {
            cartStore.openCart()
        }, 400)
    }

    // Reset success state
    setTimeout(() => {
        showSuccess.value = false
    }, 2000)
}
</script>
