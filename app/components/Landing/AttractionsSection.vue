<template>
    <section class="relative py-16 sm:py-20 bg-[#F9F9F9] overflow-hidden">
        <!-- Floating Decorations -->
        <div class="absolute top-10 right-20 w-10 h-10 text-[#FF9800] opacity-15 animate-float hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>
        <div class="absolute bottom-10 left-10 w-8 h-8 text-[#4CAF50] opacity-20 animate-float-delayed hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,22 2,22" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Section Header -->
            <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                <div
                    class="inline-block px-4 py-2 bg-[#FF9800]/10 text-[#FF9800] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                    Wahana Populer
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                    Jelajahi Wahana Kami
                </h2>
                <p class="text-base sm:text-lg text-[#666]">
                    Berbagai wahana menarik dan spot foto instagramable menanti Anda
                </p>
            </div>

            <!-- Attractions Grid -->
            <div v-if="status === 'pending'"
                class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <!-- Skeleton Loading -->
                <div v-for="i in 3" :key="i" class="bg-white rounded-2xl h-[400px] animate-pulse"></div>
            </div>

            <div v-else-if="error" class="text-center text-red-500">
                Gagal memuat wahana. Silakan coba lagi nanti.
            </div>

            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <UiAttractionCard v-for="attraction in attractions" :key="attraction.id" :id="attraction.id"
                    :name="attraction.name" :description="attraction.description || ''"
                    :image="attraction.imageUrl || '/images/placeholder-attraction.jpg'"
                    :price="formatPrice(attraction.adultPrice)" :slug="attraction.slug"
                    :category="attraction.type || 'Wahana'" :badge="attraction.priority > 5 ? '🔥 POPULER' : ''"
                    price-label="Mulai dari" />
            </div>

            <!-- View All Button -->
            <div class="text-center mt-12 sm:mt-16">
                <NuxtLink to="/wahana"
                    class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                    <span>Lihat Semua Wahana</span>
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </NuxtLink>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiResponse } from '~/types/api'
import type { AttractionListResponse } from '~/types/attraction'

const { data, status, error } = await useFetch<ApiResponse<AttractionListResponse>>('/api/attractions', {
    params: {
        limit: 3,
        isActive: true,
        sortBy: 'priority',
        sortOrder: 'desc'
    },
    lazy: true // Non-blocking navigation
})

const attractions = computed(() => data.value?.data?.attractions || [])

const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(Number(price)).replace('Rp', 'Rp ')
}
</script>

<style scoped>
@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-15px);
    }
}

@keyframes float-delayed {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-12px) rotate(5deg);
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite;
    animation-delay: 1s;
}
</style>
