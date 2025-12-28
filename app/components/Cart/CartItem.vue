<template>
    <div v-if="item" class="flex gap-4 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <!-- Image -->
        <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
            <!-- Type Badge & Name -->
            <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex-1">
                    <span class="inline-block px-2 py-0.5 text-xs font-bold rounded-full mb-1"
                        :class="item.type === 'entrance' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                        {{ item.type === 'entrance' ? 'Tiket Masuk' : 'Wahana' }}
                    </span>
                    <h4 class="font-bold text-sm text-[#333] line-clamp-1">{{ item.name }}</h4>
                </div>

                <!-- Remove Button -->
                <button @click="removeItem"
                    class="flex-shrink-0 w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                    <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <!-- Price & Quantity -->
            <div class="flex items-center justify-between">
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                    <button @click="decrementQuantity"
                        class="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-[#333] rounded-lg font-bold transition-colors">
                        −
                    </button>
                    <input v-model="localQuantity" @blur="updateQuantity" @input="handleInput" type="text"
                        inputmode="numeric" pattern="[0-9]*"
                        class="w-12 h-7 text-center border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-green-500" />
                    <button @click="incrementQuantity"
                        class="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-[#333] rounded-lg font-bold transition-colors">
                        +
                    </button>
                </div>

                <!-- Subtotal -->
                <div class="text-right">
                    <div class="text-xs text-[#999]">{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
                    <div class="text-sm font-black text-green-600">{{ formatPrice(item.price * item.quantity) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore, type CartItem } from '~/stores/cart'

const props = defineProps<{
    item: CartItem
}>()

const cartStore = useCartStore()
const localQuantity = ref(String(props.item.quantity))

// Watch for external quantity changes
watch(() => props.item.quantity, (newQty) => {
    localQuantity.value = String(newQty)
})

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price)
}

// Handle input to allow only numbers
const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')
    localQuantity.value = numericValue
}

const incrementQuantity = () => {
    const currentQty = parseInt(localQuantity.value) || 1
    localQuantity.value = String(currentQty + 1)
    cartStore.updateQuantity(props.item.id, parseInt(localQuantity.value))
}

const decrementQuantity = () => {
    const currentQty = parseInt(localQuantity.value) || 1
    if (currentQty > 1) {
        localQuantity.value = String(currentQty - 1)
        cartStore.updateQuantity(props.item.id, parseInt(localQuantity.value))
    }
}

const updateQuantity = () => {
    let qty = parseInt(localQuantity.value) || 1
    if (qty < 1) {
        qty = 1
    }
    localQuantity.value = String(qty)
    cartStore.updateQuantity(props.item.id, qty)
}

const removeItem = () => {
    cartStore.removeItem(props.item.id)
}
</script>
