<template>
    <div class="min-h-screen bg-white">
        <!-- Hero Section -->
        <section
            class="relative min-h-[85vh] flex items-center bg-[#F9F9F9] pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 overflow-hidden">
            <!-- Floating Decorative Elements -->
            <div class="absolute top-20 left-10 w-8 h-8 text-[#FF9800] opacity-40 animate-float">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </div>
            <div class="absolute top-40 right-20 w-6 h-6 text-[#4CAF50] opacity-30 animate-float-delayed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </div>
            <div class="absolute bottom-32 left-1/4 w-10 h-10 text-[#FF9800] opacity-25 animate-float">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,22 2,22" />
                </svg>
            </div>
            <div class="absolute top-1/3 right-10 opacity-30 animate-float-delayed">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M5 20 Q 10 10, 20 15 T 35 20" stroke="#4CAF50" stroke-width="2" fill="none" />
                </svg>
            </div>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="max-w-4xl mx-auto text-center">
                    <!-- Headline -->
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-[#333] leading-tight mb-6">
                        Wahana Seru &
                        <span class="inline-block relative mt-2">
                            <span
                                class="relative inline-block px-4 py-2 border-4 border-dashed border-[#FF9800] rounded-2xl transform -rotate-1 bg-[#FF9800]/5">
                                Petualangan Tak Terlupakan
                            </span>
                        </span>
                    </h1>

                    <!-- Description -->
                    <p class="text-base sm:text-lg text-[#666] leading-relaxed max-w-2xl mx-auto mb-10">
                        Dari ATV Adventure, Dino Land, hingga D'Las Zoo - temukan pengalaman wisata yang sempurna
                        untuk keluarga Anda di D'LAS Purbalingga.
                    </p>

                    <!-- Stats -->
                    <div class="flex flex-wrap justify-center gap-6 sm:gap-8">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div>
                                <div class="text-2xl font-black text-[#333]">7+</div>
                                <div class="text-xs text-[#666]">Wahana Seru</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <div class="text-2xl font-black text-[#333]">100K+</div>
                                <div class="text-xs text-[#666]">Pengunjung</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sticky Search Bar -->
        <div
            class="sticky top-16 md:top-18 lg:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="max-w-5xl mx-auto">
                    <div class="flex flex-col sm:flex-row gap-4 items-center">
                        <!-- Search Input -->
                        <div class="relative flex-1 w-full">
                            <input type="text" v-model="searchQuery" placeholder="Cari wahana favorit..."
                                class="w-full px-6 py-3 pr-12 rounded-2xl text-[#333] font-medium border-2 border-gray-200 focus:outline-none focus:border-[#4CAF50] transition-colors bg-white">
                            <svg class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <!-- Category Filter Dropdown -->
                        <div class="relative" ref="categoryDropdown">
                            <button @click="toggleCategoryDropdown"
                                class="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border-2 transition-all whitespace-nowrap"
                                :class="selectedCategories.length > 0 ? 'bg-[#4CAF50] text-white border-[#4CAF50]' : 'bg-white text-[#666] border-gray-200 hover:border-[#4CAF50]'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span>Filter Kategori</span>
                                <span v-if="selectedCategories.length > 0"
                                    class="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                    {{ selectedCategories.length }}
                                </span>
                                <svg class="w-4 h-4 transition-transform"
                                    :class="{ 'rotate-180': isCategoryDropdownOpen }" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <Transition enter-active-class="transition ease-out duration-200"
                                enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                                leave-active-class="transition ease-in duration-150"
                                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                                <div v-show="isCategoryDropdownOpen"
                                    class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 overflow-hidden z-50">
                                    <!-- Header -->
                                    <div class="px-4 py-2 border-b border-gray-100">
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm font-bold text-[#333]">Pilih Kategori</span>
                                            <button v-if="selectedCategories.length > 0" @click="clearCategories"
                                                class="text-xs font-bold text-red-600 hover:text-red-700">
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Category Options -->
                                    <div class="py-2">
                                        <label v-for="category in categories.filter(c => c.id !== 'all')"
                                            :key="category.id"
                                            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input type="checkbox" :value="category.id" v-model="selectedCategories"
                                                class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] focus:ring-2 cursor-pointer">
                                            <span class="text-sm">{{ category.emoji }}</span>
                                            <span class="text-sm font-medium text-[#333]">{{ category.name }}</span>
                                        </label>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attractions Grid -->
        <section class="bg-white">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <!-- Loading State -->
                <div v-if="status === 'pending'"
                    class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    <div v-for="i in 6" :key="i" class="bg-white rounded-2xl h-[400px] animate-pulse"></div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center text-red-500 py-12">
                    Gagal memuat wahana. Silakan coba lagi nanti.
                </div>

                <!-- Data Grid -->
                <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    <UiAttractionCard v-for="attraction in displayAttractions" :key="attraction.id" :id="attraction.id"
                        :name="attraction.name" :description="attraction.description" :image="attraction.image"
                        :price="attraction.price" :slug="attraction.slug" :category="attraction.category"
                        :badge="attraction.badge" />
                </div>

                <!-- Empty State -->
                <div v-if="status !== 'pending' && displayAttractions.length === 0" class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p class="text-[#666] font-medium">Wahana tidak ditemukan</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { ApiResponse } from '~/types/api'
import type { Attraction, AttractionListResponse } from '~/types/attraction'

// SEO Meta
useHead({
    title: 'Wahana & Atraksi - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Jelajahi berbagai wahana menarik di D\'LAS Purbalingga: Greenhouse Stroberi, Dino Land, D\'Las Zoo, Jeep Adventure, dan banyak lagi. Harga terjangkau untuk keluarga.' },
        { property: 'og:title', content: 'Wahana & Atraksi - D\'LAS Purbalingga' },
    ]
})

// State
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const isCategoryDropdownOpen = ref(false)
const categoryDropdown = ref<HTMLElement | null>(null)

// Computed params for API
const apiTypeFilter = computed(() => selectedCategories.value.length > 0 ? selectedCategories.value[0] : undefined)

const { data, status, error, refresh } = await useFetch<ApiResponse<AttractionListResponse>>('/api/attractions', {
    params: {
        limit: 100, // Show all for now on explore page
        isActive: true,
        sortBy: 'priority',
        sortOrder: 'desc',
        search: searchQuery,
        type: apiTypeFilter
    },
    watch: [selectedCategories], // Auto-refetch on category change
})

// Debounce search manually if needed, or just let it be efficiently handled by Nuxt's deduping?
// Actually simpler: watch searchQuery with a debounce utility or just bind v-model.lazy
watch(searchQuery, () => {
    // Basic debounce implementation
    const timeout = setTimeout(() => refresh(), 500)
    return () => clearTimeout(timeout)
})

const filteredAttractions = computed(() => data.value?.data?.attractions || [])

// Toggle category dropdown
const toggleCategoryDropdown = () => {
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

// Clear all categories
const clearCategories = () => {
    selectedCategories.value = []
    isCategoryDropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    if (categoryDropdown.value && !categoryDropdown.value.contains(event.target as Node)) {
        isCategoryDropdownOpen.value = false
    }
}

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Categories matching DB types (TICKET, RIDE, ATTRACTION)
// We map friendly names to DB values
const categories = [
    { id: 'all', name: 'Semua Wahana', emoji: '🎯' },
    { id: 'ATTRACTION', name: 'Atraksi', emoji: '🎡' },
    { id: 'RIDE', name: 'Wahana', emoji: '🎢' },
    { id: 'TICKET', name: 'Tiket & Paket', emoji: '🎫' },
]

// Computed for display in template handling format differences
// The UiAttractionCard expects: id, name, description, image, price, slug, category, badge
// API returns: id, name, description, imageUrl, adultPrice, slug, type, priority

// We don't need a computed map here if we update the template to use the correct fields directly.
// But the template uses `filteredAttractions` loop.
// Let's create a mapped computed for easy template usage if needed, or update template.
// I'll update template to match API fields in the next step, but here I'll try to map it to keep template changes minimal or clean.

const displayAttractions = computed(() => {
    return filteredAttractions.value.map((attraction: any) => ({
        id: attraction.id,
        name: attraction.name,
        description: attraction.description || '',
        price: formatPrice(attraction.adultPrice),
        category: attraction.type,
        slug: attraction.slug,
        image: attraction.imageUrl || '/images/placeholder-attraction.jpg',
        badge: attraction.priority > 5 ? '🔥 POPULER' : ''
    }))
})

const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(Number(price)).replace('Rp', 'Rp ')
}

</script>
