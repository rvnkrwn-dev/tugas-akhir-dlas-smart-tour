<template>
    <section class="relative py-16 sm:py-20 bg-white overflow-hidden">
        <!-- Floating Decorative Elements -->
        <div class="absolute top-20 left-10 w-10 h-10 text-[#4CAF50] opacity-15 animate-float hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>
        <div
            class="absolute bottom-20 right-20 w-8 h-8 text-[#FF9800] opacity-20 animate-float-delayed hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,22 2,22" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Section Header -->
            <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                <div
                    class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                    Tentang Kami
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                    Destinasi Wisata Alam Terbaik di Purbalingga
                </h2>
                <p class="text-base sm:text-lg text-[#666]">
                    Pengalaman wisata terpadu yang dikelola profesional sejak 2018
                </p>
            </div>

            <!-- Content Grid -->
            <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto items-center">
                <!-- Left Column - Description -->
                <div class="space-y-6">
                    <p class="text-base sm:text-lg text-[#666] leading-relaxed">
                        <strong class="text-[#333]">D'LAS (Desa Wisata Lembah Asri Serang)</strong> adalah destinasi
                        wisata alam terpadu yang dikelola oleh BUMDes Serang Makmur Sejahtera dan dioperasikan secara
                        profesional oleh PT. Lembah Asri Jaya.
                    </p>

                    <p class="text-sm sm:text-base text-[#666] leading-relaxed">
                        Sebagai bagian dari Wonderful Indonesia, D'LAS menjadi ikon wisata Purbalingga yang menawarkan
                        pengalaman liburan lengkap dari relaksasi alam hingga petualangan seru.
                    </p>

                    <!-- CTA Button -->
                    <div class="pt-4">
                        <NuxtLink to="/jelajah-dlas"
                            class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <span>Pelajari Lebih Lanjut</span>
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Right Column - Value Props -->
                <div class="grid grid-cols-1 gap-4">
                    <!-- Value 1 -->
                    <div
                        class="flex items-start gap-4 bg-[#F9F9F9] rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-colors">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-black text-[#333] text-base mb-1">Wisata Terpadu</h3>
                            <p class="text-sm text-[#666]">Kombinasi sempurna antara alam, edukasi, dan petualangan</p>
                        </div>
                    </div>

                    <!-- Value 2 -->
                    <div
                        class="flex items-start gap-4 bg-[#F9F9F9] rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-black text-[#333] text-base mb-1">Dikelola Profesional</h3>
                            <p class="text-sm text-[#666]">Standar pelayanan terbaik dengan manajemen berpengalaman</p>
                        </div>
                    </div>

                    <!-- Value 3 -->
                    <div
                        class="flex items-start gap-4 bg-[#F9F9F9] rounded-2xl p-6 border border-gray-100 hover:border-amber-200 transition-colors">
                        <div
                            class="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-black text-[#333] text-base mb-1">Ramah Keluarga</h3>
                            <p class="text-sm text-[#666]">Cocok untuk segala usia dengan fasilitas lengkap dan aman</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// About Section Component
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
