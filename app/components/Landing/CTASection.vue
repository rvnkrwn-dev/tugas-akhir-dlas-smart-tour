<template>
    <section class="relative py-12 sm:py-16 bg-gradient-to-br from-[#4CAF50] to-[#45a049] overflow-hidden">
        <!-- Decorative Elements -->
        <div class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        <!-- Memphis Decorations -->
        <div class="absolute top-20 right-20 w-12 h-12 text-white/10 hidden lg:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>
        <div class="absolute bottom-20 left-20 w-10 h-10 text-white/10 hidden lg:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,22 2,22" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                <!-- Heading -->
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
                    Siap untuk Petualangan Tak Terlupakan?
                </h2>

                <!-- Description -->
                <p class="text-sm sm:text-base lg:text-lg text-green-50 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Kunjungi D'LAS Purbalingga sekarang dan ciptakan kenangan indah bersama keluarga tercinta
                </p>

                <!-- CTA Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 sm:mb-10">
                    <NuxtLink to="/wahana"
                        class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-green-50 text-[#4CAF50] font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <span>Pesan Tiket Sekarang</span>
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </NuxtLink>

                    <NuxtLink to="/hubungi-kami"
                        class="px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4CAF50] font-bold text-sm sm:text-base rounded-full transition-all duration-300">
                        Hubungi Kami
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// CTA Section Component
</script>
