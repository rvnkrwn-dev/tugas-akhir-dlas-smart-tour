<template>
    <!-- Hotspot Panel - Slides from bottom on mobile, from right on desktop -->
    <Transition enter-active-class="transition ease-out duration-300"
        enter-from-class="translate-y-full sm:translate-y-0 sm:translate-x-full"
        enter-to-class="translate-y-0 sm:translate-x-0" leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-y-0 sm:translate-x-0"
        leave-to-class="translate-y-full sm:translate-y-0 sm:translate-x-full">
        <div v-if="tourStore.showHotspotPanel && tourStore.selectedHotspot"
            class="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 z-[9999] bg-black/50 backdrop-blur-sm"
            @click.self="handleClose">
            <div class="bg-white h-full sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-none sm:shadow-2xl">
                <!-- Info Hotspot -->
                <div v-if="hotspot?.type === 'info'" class="p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-2xl">{{ hotspot?.icon || 'ℹ️' }}</span>
                            </div>
                            <h3 class="text-2xl font-black text-gray-900">{{ hotspot?.title }}</h3>
                        </div>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Description -->
                    <p class="text-gray-600 leading-relaxed mb-6">{{ hotspot?.description }}</p>

                    <!-- Media if available -->
                    <div v-if="hotspot?.media && hotspot.media.length > 0" class="space-y-4 mb-6">
                        <div v-for="(media, index) in hotspot.media" :key="index">
                            <img v-if="media.type === 'image'" :src="media.url" :alt="hotspot?.title || 'Image'"
                                class="w-full rounded-xl object-cover" />
                        </div>
                    </div>

                    <!-- Close Button -->
                    <button @click="handleClose"
                        class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                        Close
                    </button>
                </div>

                <!-- Loket (Ticket Booth) Hotspot -->
                <div v-else-if="hotspot?.type === 'loket'" class="p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span class="text-2xl">{{ hotspot?.icon || '🎫' }}</span>
                            </div>
                            <div>
                                <h3 class="text-2xl font-black text-gray-900">{{ hotspot?.title }}</h3>
                                <p class="text-sm text-gray-500">{{ hotspot?.description }}</p>
                            </div>
                        </div>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Tickets List -->
                    <div v-if="hotspot?.tickets && hotspot.tickets.length > 0" class="space-y-3 mb-6">
                        <div v-for="ticket in hotspot.tickets" :key="ticket.id"
                            class="border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <h4 class="font-bold text-gray-900">{{ ticket.name }}</h4>
                                    <p class="text-sm text-gray-600">{{ ticket.description }}</p>
                                    <p class="text-xs text-gray-500 mt-1">Type: {{ ticket.type }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-black text-green-600">{{ formatPrice(ticket.price) }}</p>
                                </div>
                            </div>

                            <!-- Quantity Selector -->
                            <div class="flex items-center gap-3 mt-3">
                                <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                    <button @click="decrementQuantity(ticket.id)"
                                        class="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <span class="w-12 text-center font-bold">{{ quantities[ticket.id] || 0 }}</span>
                                    <button @click="incrementQuantity(ticket.id, ticket.maxQuantity)"
                                        class="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                                <button @click="addToCart(ticket)"
                                    :disabled="!quantities[ticket.id] || quantities[ticket.id] === 0"
                                    class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors disabled:cursor-not-allowed">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Total & Checkout -->
                    <div v-if="totalItems > 0" class="border-t-2 border-gray-200 pt-4">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-gray-700 font-semibold">Total Items:</span>
                            <span class="text-2xl font-black text-gray-900">{{ totalItems }}</span>
                        </div>
                        <button @click="handleCheckout"
                            class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                            View Cart & Checkout
                        </button>
                    </div>
                </div>

                <!-- Navigate Hotspot -->
                <div v-else-if="hotspot?.type === 'navigate'" class="p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span class="text-2xl">{{ hotspot?.icon || '➡️' }}</span>
                            </div>
                            <h3 class="text-2xl font-black text-gray-900">{{ hotspot?.title }}</h3>
                        </div>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Description -->
                    <p class="text-gray-600 leading-relaxed mb-6">{{ hotspot?.description }}</p>

                    <!-- Navigate Button -->
                    <button @click="handleNavigate"
                        class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Go to Location
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTourStore } from '~/stores/tour'
import { useCartStore } from '~/stores/cart'
import type { Ticket } from '~/types/virtual-tour'

const tourStore = useTourStore()
const cartStore = useCartStore()
// Ensure explicit import if auto-import fails
import { useAlert } from '~/composables/useAlert'
const { alert } = useAlert()

const hotspot = computed(() => tourStore.selectedHotspot)

// Debug Watcher
// import { watch } from 'vue'


// Quantities for each ticket
const quantities = ref<Record<string, number>>({})

// Total items selected
const totalItems = computed(() => {
    return Object.values(quantities.value).reduce((sum, qty) => sum + qty, 0)
})

// Format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price)
}

// Increment quantity
const incrementQuantity = (ticketId: string, maxQuantity?: number) => {
    const current = quantities.value[ticketId] || 0
    if (maxQuantity && current >= maxQuantity) return
    quantities.value[ticketId] = current + 1
}

// Decrement quantity
const decrementQuantity = (ticketId: string) => {
    const current = quantities.value[ticketId] || 0
    if (current > 0) {
        quantities.value[ticketId] = current - 1
    }
}

// Add to cart
const addToCart = async (ticket: Ticket) => {
    const quantity = quantities.value[ticket.id] || 0
    if (quantity === 0) return

    try {
        await cartStore.addItem({
            itemId: ticket.productId || ticket.id,
            name: ticket.name,
            price: ticket.price,
            type: 'attraction',
            ticketType: ticket.type,
            image: tourStore.currentScene?.imageUrlLow || '',
            quantity
        })

        alert.success('Added to Cart', `${quantity}x ${ticket.name} added to cart!`)

        // Reset quantity
        quantities.value[ticket.id] = 0
    } catch (error) {
        alert.error('Error', 'Failed to add item to cart')
    }
}

// Handle navigate
const handleNavigate = async () => {
    if (!hotspot.value?.targetSceneId) return

    handleClose()
    await tourStore.loadScene(hotspot.value.targetSceneId)
}

// Handle checkout
const handleCheckout = () => {
    cartStore.toggleCart()
    handleClose()
}

// Close panel
const handleClose = () => {
    tourStore.selectHotspot(null)
    quantities.value = {}
}
</script>
