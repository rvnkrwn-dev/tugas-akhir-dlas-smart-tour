<template>
    <section class="relative py-16 sm:py-20 bg-white overflow-hidden">
        <!-- Floating Decorations -->
        <div class="absolute top-10 left-10 w-10 h-10 text-[#4CAF50] opacity-15 animate-float hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>
        <div
            class="absolute bottom-10 right-20 w-8 h-8 text-[#FF9800] opacity-20 animate-float-delayed hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,22 2,22" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Section Header -->
            <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                <div
                    class="inline-block px-4 py-2 bg-pink-500/10 text-pink-600 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                    Testimoni
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                    Apa Kata Pengunjung Kami?
                </h2>
                <p class="text-base sm:text-lg text-[#666]">
                    Ribuan keluarga telah menikmati pengalaman tak terlupakan di D'LAS Purbalingga
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <div v-for="i in 3" :key="i"
                    class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 animate-pulse">
                    <div class="flex space-x-1 mb-4">
                        <div v-for="j in 5" :key="j" class="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div class="space-y-3 mb-6">
                        <div class="h-4 bg-gray-200 rounded w-full"></div>
                        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div class="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gray-200 rounded w-24"></div>
                            <div class="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p class="text-gray-600">Gagal memuat testimoni. Silakan coba lagi nanti.</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!testimonials || testimonials.length === 0" class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p class="text-gray-600">Belum ada testimoni tersedia.</p>
            </div>

            <!-- Testimonials Grid -->
            <div v-else class="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                <div v-for="(testimonial, index) in testimonials" :key="testimonial.id" :class="[
                    'bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 transition-colors duration-300',
                    getBorderColorClass(index)
                ]">
                    <!-- Stars -->
                    <div class="flex space-x-1 mb-4">
                        <svg v-for="star in 5" :key="star" :class="[
                            'w-4 h-4 sm:w-5 sm:h-5',
                            star <= testimonial.rating ? 'text-[#FFB300]' : 'text-gray-200'
                        ]" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>

                    <!-- Quote -->
                    <p class="text-sm sm:text-base text-[#666] mb-6 leading-relaxed">
                        "{{ testimonial.comment }}"
                    </p>

                    <!-- Author -->
                    <div class="flex items-center space-x-3">
                        <div :class="[
                            'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border',
                            getAvatarClass(index, testimonial.avatarColor)
                        ]">
                            <span :class="['font-bold text-sm sm:text-base', getAvatarTextClass(index)]">
                                {{ getInitials(testimonial.name) }}
                            </span>
                        </div>
                        <div>
                            <div class="font-black text-[#333] text-sm sm:text-base">{{ testimonial.name }}</div>
                            <div class="text-xs sm:text-sm text-[#666]">{{ testimonial.location }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
interface Testimonial {
    id: string
    name: string
    location: string
    rating: number
    comment: string
    avatarColor: string | null
    createdAt: string
}

import type { ApiResponse } from '~/types/api'


// Fetch testimonials from API
const { data, pending, error } = await useFetch<ApiResponse<Testimonial[]>>('/api/testimonials', {
    query: { limit: 6 }
})

const testimonials = computed(() => data.value?.data || [])

// Helper function to get initials from name
const getInitials = (name: string): string => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
}

// Helper function to get border color class based on index
const getBorderColorClass = (index: number): string => {
    const colors = ['hover:border-indigo-200', 'hover:border-pink-200', 'hover:border-green-200']
    return colors[index % colors.length] || 'hover:border-indigo-200'
}

// Helper function to get avatar gradient class
const getAvatarClass = (index: number, customColor?: string | null): string => {
    if (customColor) {
        return `bg-gradient-to-br ${customColor}`
    }
    const gradients = [
        'bg-gradient-to-br from-indigo-100 to-purple-200 border-indigo-100',
        'bg-gradient-to-br from-pink-100 to-rose-200 border-pink-100',
        'bg-gradient-to-br from-green-100 to-emerald-200 border-green-100'
    ]
    return gradients[index % gradients.length] || gradients[0]
}

// Helper function to get avatar text color
const getAvatarTextClass = (index: number): string => {
    const colors = ['text-indigo-600', 'text-pink-600', 'text-green-600']
    return colors[index % colors.length] || 'text-indigo-600'
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
