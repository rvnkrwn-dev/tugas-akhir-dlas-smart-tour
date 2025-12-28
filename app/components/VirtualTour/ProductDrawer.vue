<template>
  <div v-if="isOpen" class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-xl font-bold text-gray-900">{{ productData?.title || 'Product Details' }}</h2>
        <button @click="close" class="text-gray-400 hover:text-gray-500">
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="productData" class="space-y-6">
        <!-- Image if available (mocked or if in data) -->
        <div class="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg overflow-hidden">
            <div class="flex items-center justify-center h-48 bg-gray-200">
                 <span class="text-gray-400">Product Image</span>
            </div>
        </div>

        <!-- Ticket Options -->
        <div v-if="productData.tickets && productData.tickets.length">
            <h3 class="font-medium text-gray-900">Select Ticket</h3>
            <div class="mt-2 space-y-2">
                <div v-for="ticket in productData.tickets" :key="ticket.id" 
                    @click="selectedTicket = ticket"
                    :class="['p-3 border rounded-lg cursor-pointer flex justify-between items-center', selectedTicket?.id === ticket.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300']">
                    <div>
                        <div class="font-medium text-gray-900">{{ ticket.name }}</div>
                        <div class="text-sm text-gray-500">{{ formatPrice(ticket.price) }}</div>
                    </div>
                    <div v-if="selectedTicket?.id === ticket.id" class="text-indigo-600">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quantity -->
        <div>
            <label class="block text-sm font-medium text-gray-700">Quantity</label>
            <div class="flex items-center mt-2 border border-gray-300 rounded-md w-32">
                <button @click="quantity > 1 && quantity--" class="p-2 text-gray-600 hover:bg-gray-100">-</button>
                <input type="number" v-model="quantity" class="w-full text-center border-none focus:ring-0" min="1">
                <button @click="quantity++" class="p-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
        </div>

        <!-- Add to Cart -->
        <button @click="addToCart" :disabled="!selectedTicket"
            class="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            Add to Cart - {{ formatPrice(totalPrice) }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Backyard overlay -->
  <div v-if="isOpen" @click="close" class="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUiStore } from '~/stores/ui'
import { useCartStore } from '~/stores/cart'

const uiStore = useUiStore()
const cartStore = useCartStore()

const isOpen = computed(() => uiStore.activeDrawer === 'productQuickView')
const productData = computed(() => uiStore.drawerData)

const selectedTicket = ref<any>(null)
const quantity = ref(1)

const totalPrice = computed(() => {
    return (selectedTicket.value?.price || 0) * quantity.value
})

// Reset state when drawer opens
watch(isOpen, (val) => {
    if (val && productData.value?.tickets?.length) {
        selectedTicket.value = productData.value.tickets[0]
        quantity.value = 1
    }
})

const close = () => {
    uiStore.closeDrawer()
}

const addToCart = async () => {
    if (!selectedTicket.value) return

    await cartStore.addItem({
        type: 'attraction', // or based on ticket type
        itemId: selectedTicket.value.id,
        name: selectedTicket.value.name,
        price: selectedTicket.value.price,
        quantity: quantity.value,
        metadata: {
            category: 'virtual-tour-product'
        }
    })

    // Show success feedback (optional, assuming cart store handles it or we use alert)
    // alert('Added to cart!')
    close()
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
}
</script>
