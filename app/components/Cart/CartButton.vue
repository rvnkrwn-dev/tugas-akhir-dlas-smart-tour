<template>
    <button @click="cartStore.toggleCart()"
        class="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group">
        <!-- Cart Icon -->
        <svg class="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>

        <!-- Badge Count -->
        <ClientOnly>
            <span v-if="cartStore.itemCount > 0"
                class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
            </span>

            <!-- Pulse Animation when items added -->
            <span v-if="cartStore.hasItems"
                class="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span>
        </ClientOnly>
    </button>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
</script>
