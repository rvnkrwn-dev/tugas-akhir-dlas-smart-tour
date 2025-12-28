<template>
    <div class="min-h-screen bg-white">
        <!-- Loading State -->
        <div v-if="status === 'pending'" class="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-gray-500 font-medium">Memuat detail wahana...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div class="text-center max-w-md px-4">
                <div
                    class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Wahana Tidak Ditemukan</h3>
                <p class="text-gray-500 mb-6">Maaf, wahana yang Anda cari tidak dapat ditemukan atau sedang tidak
                    tersedia.</p>
                <NuxtLink to="/wahana"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Daftar Wahana
                </NuxtLink>
            </div>
        </div>

        <!-- Content -->
        <template v-else-if="attraction">
            <!-- Hero Section -->
            <section class="relative h-[60vh] sm:h-[70vh] bg-gray-900">
                <!-- Hero Image -->
                <img :src="attraction.imageUrl || '/images/placeholder-attraction.jpg'" :alt="attraction.name"
                    class="w-full h-full object-cover opacity-70" />

                <!-- Overlay Content -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div class="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12 sm:pb-16">
                        <!-- Category Badge -->
                        <div class="mb-4" v-if="attraction.type">
                            <span
                                class="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold capitalize">
                                {{ attraction.type }}
                            </span>
                        </div>

                        <!-- Title -->
                        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
                            {{ attraction.name }}
                        </h1>

                        <!-- Quick Stats -->
                        <div class="flex flex-wrap gap-6 text-white">
                            <div class="flex items-center gap-2" v-if="formattedDuration">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm">{{ formattedDuration }}</span>
                            </div>
                            <div class="flex items-center gap-2" v-if="formattedAgeRequirement">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span class="text-sm">{{ formattedAgeRequirement }}</span>
                            </div>
                            <div class="flex items-center gap-2" v-if="attraction.capacity">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span class="text-sm">Max {{ attraction.capacity }} orang</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Main Content -->
            <section class="py-12 sm:py-16 lg:py-20">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
                        <!-- Left Column - Main Content -->
                        <div class="lg:col-span-2 space-y-12">
                            <!-- Overview -->
                            <div class="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                                <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-4">Tentang Wahana</h2>
                                <p class="text-base text-[#666] leading-relaxed whitespace-pre-line break-words">{{
                                    attraction.description }}</p>
                            </div>

                            <!-- Highlights (Static for now as DB doesn't have this field yet, hiding if empty) -->
                            <div v-if="attractionHighlights.length > 0">
                                <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-4">Highlight</h3>
                                <ul class="space-y-3">
                                    <li v-for="(highlight, index) in attractionHighlights" :key="index"
                                        class="flex items-start gap-3">
                                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span class="text-[#666]">{{ highlight }}</span>
                                    </li>
                                </ul>
                            </div>

                            <!-- What's Included (Static mock fallback) -->
                            <div v-if="attractionIncluded.length > 0">
                                <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-4">Yang Termasuk</h3>
                                <ul class="grid sm:grid-cols-2 gap-3">
                                    <li v-for="(item, index) in attractionIncluded" :key="index"
                                        class="flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        <span class="text-sm text-[#666]">{{ item }}</span>
                                    </li>
                                </ul>
                            </div>

                            <!-- Safety Info (Static mock fallback) -->
                            <div v-if="attractionSafety.length > 0"
                                class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                                <h3 class="text-lg font-black text-blue-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Informasi Keamanan
                                </h3>
                                <ul class="space-y-2">
                                    <li v-for="(info, index) in attractionSafety" :key="index"
                                        class="text-sm text-blue-900 flex items-start gap-2">
                                        <span class="text-blue-500">•</span>
                                        <span>{{ info }}</span>
                                    </li>
                                </ul>
                            </div>

                            <!-- Image Gallery -->
                            <div v-if="galleryImages.length > 0">
                                <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-6">Galeri Foto</h3>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div v-for="(image, index) in galleryImages" :key="index"
                                        class="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                                        <img :src="image" :alt="`${attraction.name} ${index + 1}`"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Booking Card (Sticky) -->
                        <div class="lg:col-span-1">
                            <div class="sticky top-24 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
                                <!-- Price -->
                                <div class="mb-6 pb-6 border-b border-gray-200">
                                    <div class="text-sm text-[#999] mb-1">Harga mulai dari</div>
                                    <div class="text-3xl font-black text-green-600">{{ formattedPrice }}</div>
                                    <div class="text-xs text-[#999] mt-1">per orang</div>
                                </div>

                                <!-- Quick Info -->
                                <div class="space-y-4 mb-6">
                                    <div class="flex items-start gap-3" v-if="formattedDuration">
                                        <svg class="w-5 h-5 text-[#666] flex-shrink-0 mt-0.5" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <div class="text-sm font-bold text-[#333]">Durasi</div>
                                            <div class="text-sm text-[#666]">{{ formattedDuration }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-3" v-if="todayOperatingHours">
                                        <svg class="w-5 h-5 text-[#666] flex-shrink-0 mt-0.5" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <div class="text-sm font-bold text-[#333]">Jam Operasional</div>
                                            <div class="text-sm text-[#666]">{{ todayOperatingHours }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <svg class="w-5 h-5 text-[#666] flex-shrink-0 mt-0.5" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <div class="text-sm font-bold text-[#333]">Lokasi</div>
                                            <div class="text-sm text-[#666]">D'LAS Purbalingga</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Booking Availability Status -->
                                <div class="mb-4" v-if="!attraction.isAvailable">
                                    <div
                                        class="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {{ attraction.availabilityReason || 'Wahana sedang tidak tersedia' }}
                                    </div>
                                </div>

                                <!-- Add to Cart Button -->
                                <CartAddToCartButton :item="cartItem" :disabled="!attraction.isAvailable"
                                    button-text="Tambah ke Keranjang" variant="primary" class="w-full mb-3" />

                                <!-- Contact -->
                                <a href="https://wa.me/6281234567890" target="_blank"
                                    class="block w-full py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 text-center font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Hubungi Kami
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Related Attractions -->
            <section class="py-12 sm:py-16 bg-gray-50" v-if="relatedAttractions.length > 0">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-8 text-center">Wahana Lainnya</h2>
                    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                        <UiAttractionCard v-for="related in relatedAttractions" :key="related.id" :id="related.id"
                            :name="related.name" :description="related.description || ''"
                            :image="related.imageUrl || '/images/placeholder-attraction.jpg'"
                            :price="formatPrice(related.adultPrice)" :slug="related.slug" :category="related.type"
                            :badge="related.priority > 5 ? '🔥 POPULER' : ''" />
                    </div>

                    <div v-if="hasMoreRelated" class="mt-8 text-center">
                        <button @click="loadMoreRelated" :disabled="relatedPending"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-600 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="relatedPending"
                                class="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                            <span v-else>Lihat Wahana Lainnya</span>
                            <svg v-if="!relatedPending" class="w-5 h-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiResponse } from '~/types/api'
import type { Attraction, AttractionListResponse } from '~/types/attraction'

const route = useRoute()
const slug = route.params.slug as string

// Fetch current attraction details
const { data: attractionData, status, error } = await useFetch<ApiResponse<Attraction>>(`/api/attractions/${slug}`, {
    key: `attraction-${slug}`
})

const attraction = computed(() => {
    return attractionData.value?.data || null
})

// Fetch related attractions (popular ones)
const relatedLimit = ref(3)

const { data: relatedData, pending: relatedPending } = await useFetch<ApiResponse<AttractionListResponse>>('/api/attractions', {
    params: {
        limit: relatedLimit,
        isActive: true,
        sortBy: 'priority',
        sortOrder: 'desc'
    },
    key: 'related-attractions',
    lazy: true
})

const relatedAttractions = computed(() => {
    // Filter out current attraction if present in related list
    return (relatedData.value?.data?.attractions || []).filter(a => a.id !== attraction.value?.id)
})

const hasMoreRelated = computed(() => {
    return (relatedData.value?.data?.totalItems || 0) > relatedLimit.value
})

const loadMoreRelated = () => {
    relatedLimit.value = 100 // Load all (max 100 for now)
}

// Formatting Helpers
const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(Number(price)).replace('Rp', 'Rp ')
}

const formattedPrice = computed(() => {
    if (!attraction.value) return ''
    return formatPrice(attraction.value.adultPrice)
})

const formattedDuration = computed(() => {
    if (!attraction.value?.durationMinutes) return null
    const minutes = attraction.value.durationMinutes
    if (minutes < 60) return `${minutes} menit`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours} jam`
    return `${hours} jam ${remainingMinutes} menit`
})

const formattedAgeRequirement = computed(() => {
    if (!attraction.value) return null
    const { minAge, maxAge } = attraction.value
    if (minAge && maxAge) return `${minAge} - ${maxAge} tahun`
    if (minAge) return `${minAge}+ tahun`
    if (maxAge) return `Maksimal ${maxAge} tahun`
    return 'Semua usia'
})

const todayOperatingHours = computed(() => {
    if (!attraction.value?.operatingHours) return '08:00 - 17:00 WIB' // Default

    // Simple logic to get today's hours if structured in JSON, 
    // assuming JSON structure is key-value days or similar. 
    // If it's complex, we might need a utility. 
    // For now, let's try to parse or return a generic string.
    try {
        const oh = attraction.value.operatingHours
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        if (oh[today]) {
            if (oh[today].isClosed) return 'Tutup'
            return `${oh[today].open} - ${oh[today].close} WIB`
        }
        return '08:00 - 17:00 WIB'
    } catch (e) {
        return '08:00 - 17:00 WIB'
    }
})

// Gallery Images
const galleryImages = computed(() => {
    if (!attraction.value) return []
    // Use imageUrls if available (it is typed as string[] in interface but could be JSON in DB)
    // The API response sanitization returns imageUrls as array if it was json in DB.
    if (Array.isArray(attraction.value.imageUrls) && attraction.value.imageUrls.length > 0) {
        return attraction.value.imageUrls
    }
    // Fallback if no gallery, use hero image multiple times or placeholders
    if (attraction.value.imageUrl) return [attraction.value.imageUrl]
    return []
})

// Static/Mocked content for missing fields in DB
// These could be moved to DB later
const attractionHighlights = computed(() => {
    // We could infer some highlights from data or return empty
    return []
})

const attractionIncluded = computed(() => {
    return []
})

const attractionSafety = computed(() => {
    return []
})

// Cart item data
const cartItem = computed(() => {
    if (!attraction.value) {
        // Return dummy data to satisfy type checking (won't be used as component is conditional)
        return {
            type: 'attraction' as const,
            itemId: '',
            name: '',
            price: 0,
            quantity: 1,
            image: '',
            metadata: {
                category: ''
            }
        }
    }

    return {
        type: 'attraction' as const,
        itemId: attraction.value.id,
        name: attraction.value.name,
        price: Number(attraction.value.adultPrice),
        quantity: 1,
        image: attraction.value.imageUrl || '/images/placeholder-attraction.jpg',
        metadata: {
            duration: formattedDuration.value || '',
            ageRequirement: formattedAgeRequirement.value || '',
            category: attraction.value.type || ''
        }
    }
})

// SEO Meta
useHead({
    title: computed(() => attraction.value ? `${attraction.value.name} - D'LAS Purbalingga` : 'Wahana - D\'LAS Purbalingga'),
    meta: [
        { name: 'description', content: computed(() => attraction.value?.description || '') },
        { property: 'og:title', content: computed(() => attraction.value ? `${attraction.value.name} - D'LAS Purbalingga` : '') },
        { property: 'og:description', content: computed(() => attraction.value?.description || '') },
        { property: 'og:image', content: computed(() => attraction.value?.imageUrl || '') }
    ]
})
</script>
