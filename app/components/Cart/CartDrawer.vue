<template>
    <!-- Overlay -->
    <Transition name="fade">
        <div v-if="cartStore.isOpen" @click="cartStore.closeCart()"
            class="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
        <div v-if="cartStore.isOpen"
            class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col sm:rounded-l-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Keranjang Belanja</h2>
                    <div
                        class="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-100">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-xs font-bold text-green-700">{{ cartStore.itemCount }} item</span>
                    </div>
                </div>
                <button @click="cartStore.closeCart()"
                    class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Items List (Scrollable) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <!-- Empty State -->
                <div v-if="!cartStore.hasItems"
                    class="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Keranjang Kosong</h3>
                    <p class="text-sm text-gray-500 mb-8 max-w-[200px]">Belum ada tiket liburan di keranjang Anda</p>
                    <button @click="cartStore.closeCart()"
                        class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-600/20">
                        Mulai Jelajah
                    </button>
                </div>

                <!-- Cart Items -->
                <div v-else class="pb-6">
                    <!-- Grouped by Type -->
                    <div v-if="cartStore.groupedItems.entrance.length > 0" class="mb-4">
                        <div class="px-5 py-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-50">
                            <div
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                <span class="text-xs">🎫</span>
                                <h3 class="text-xs font-bold uppercase tracking-wide">Tiket Masuk</h3>
                            </div>
                        </div>
                        <div class="px-2">
                            <CartItem v-for="item in cartStore.groupedItems.entrance" :key="item.id" :item="item" />
                        </div>
                    </div>

                    <div v-if="cartStore.groupedItems.attractions.length > 0">
                        <div class="px-5 py-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-50">
                            <div
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100">
                                <span class="text-xs">🎡</span>
                                <h3 class="text-xs font-bold uppercase tracking-wide">Wahana</h3>
                            </div>
                        </div>
                        <div class="px-2">
                            <CartItem v-for="item in cartStore.groupedItems.attractions" :key="item.id" :item="item" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer (Total & Actions) -->
            <div v-if="cartStore.hasItems"
                class="border-t border-gray-100 bg-white p-5 space-y-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <!-- Total -->
                <div class="flex items-end justify-between">
                    <div class="flex flex-col">
                        <span class="text-xs font-medium text-gray-500 mb-0.5">Total Pembayaran</span>
                        <span class="text-sm text-gray-400">{{ cartStore.itemCount }} item terpilih</span>
                    </div>
                    <span class="text-2xl font-black text-green-600 tracking-tight">{{ formatPrice(cartStore.totalPrice)
                        }}</span>
                </div>

                <!-- Actions -->
                <div class="space-y-3">
                    <NuxtLink to="/checkout" @click="cartStore.closeCart()"
                        class="block w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-center font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-600/35 hover:-translate-y-0.5">
                        Checkout Sekarang
                    </NuxtLink>

                    <button @click="cartStore.closeCart()"
                        class="block w-full py-3.5 bg-green-50 hover:bg-green-100 text-green-700 text-center font-bold rounded-xl transition-all duration-200">
                        Lanjut Belanja
                    </button>
                </div>

                <!-- Clear Cart -->
                <div class="text-center pt-1">
                    <button @click="confirmClearCart"
                        class="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1 px-3 rounded-lg hover:bg-red-50">
                        Kosongkan Keranjang
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const { alert } = useAlert()
const cartStore = useCartStore()

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price)
}

const confirmClearCart = async () => {
    const confirmed = await alert.confirm(
        'Kosongkan Keranjang',
        'Apakah Anda yakin ingin mengosongkan keranjang?',
        'Ya, Kosongkan',
        'Batal'
    )
    if (confirmed) {
        await cartStore.clearCart()
        alert.success('Berhasil', 'Keranjang berhasil dikosongkan')
    }
}
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Slide transition for drawer */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
