<template>
    <div
        class="bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-colors duration-300 overflow-hidden flex flex-col h-full">
        <!-- Media Section -->
        <NuxtLink :to="`/wahana/${slug}`" class="relative bg-gray-50 aspect-[4/3] overflow-hidden group">
            <!-- Image -->
            <img :src="image" :alt="name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

            <!-- Image -->
            <img :src="image" :alt="name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

        </NuxtLink>

        <!-- Content Section -->
        <div class="p-4 flex flex-col flex-grow">
            <!-- Title -->

            <!-- Title -->
            <NuxtLink :to="`/wahana/${slug}`">
                <h3
                    class="text-base font-bold text-gray-900 mb-3 line-clamp-2 leading-tight hover:text-green-600 transition-colors">
                    {{ name }}
                </h3>
            </NuxtLink>

            <!-- Footer Row (Price + CTA) -->
            <div class="mt-auto flex items-center justify-between gap-3">
                <!-- Price Block -->
                <div class="flex flex-col">
                    <div v-if="priceLabel" class="text-[10px] text-gray-400 mb-0.5">
                        {{ priceLabel }}
                    </div>
                    <div class="text-xl font-black text-green-600">
                        {{ price }}
                    </div>
                </div>

                <!-- CTA Button -->
                <button v-if="!isFree" @click="addToCart" :disabled="isAdding"
                    class="min-h-[44px] px-4 py-2.5 bg-green-600/12 hover:bg-green-600/20 active:bg-green-600/28 disabled:bg-gray-100 text-green-600 disabled:text-gray-400 font-semibold text-sm rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0">
                    <svg v-if="isAdding" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <svg v-else-if="showSuccess" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{{ showSuccess ? 'Ditambahkan' : isAdding ? 'Menambah...' : 'Tambah' }}</span>
                </button>

                <!-- Free Badge -->
                <div v-else class="px-4 py-2.5 bg-blue-600/12 text-blue-700 text-sm font-bold rounded-xl">
                    Gratis
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'

const props = withDefaults(defineProps<{
    id: number | string
    name: string
    description: string
    image: string
    price: string
    slug: string
    category?: string
    badge?: string
    priceLabel?: string
}>(), {
    priceLabel: 'Harga-tiket'
})

const cartStore = useCartStore()
const isAdding = ref(false)
const showSuccess = ref(false)

// Parse price to number
const parsedPrice = computed(() => {
    if (props.price.toLowerCase().includes('gratis')) return 0
    let priceStr = props.price.replace(/Rp|\.|\s/g, '')
    if (priceStr.includes('K')) {
        return parseInt(priceStr.replace('K', '')) * 1000
    }
    return parseInt(priceStr) || 0
})

// Check if item is free
const isFree = computed(() => parsedPrice.value === 0)

// Cart item data
const cartItem = computed(() => ({
    type: 'attraction' as const,
    itemId: String(props.id),
    name: props.name,
    price: parsedPrice.value,
    quantity: 1,
    image: props.image,
    metadata: {
        category: props.category,
    }
}))

// Add to cart function
const addToCart = async () => {
    isAdding.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    cartStore.addItem(cartItem.value)
    isAdding.value = false
    showSuccess.value = true

    setTimeout(() => {
        cartStore.openCart()
    }, 400)

    setTimeout(() => {
        showSuccess.value = false
    }, 2000)
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
