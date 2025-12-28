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
                    class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                    Fasilitas Lengkap
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                    Kenyamanan Anda Prioritas Kami
                </h2>
                <p class="text-base sm:text-lg text-[#666]">
                    Nikmati berbagai fasilitas modern untuk pengalaman wisata yang sempurna
                </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                <!-- Feature 1: Parkir Luas -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 group-hover:border-blue-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Parkir Luas</h3>
                        <p class="text-xs text-[#666]">Area parkir untuk bus & mobil</p>
                    </div>
                </div>

                <!-- Feature 2: Cottage & Penginapan -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto border border-purple-100 group-hover:border-purple-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Cottage</h3>
                        <p class="text-xs text-[#666]">Penginapan nyaman & asri</p>
                    </div>
                </div>

                <!-- Feature 3: Camping Ground -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto border border-green-100 group-hover:border-green-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 21l18-18M3 21h18M3 21V10l9-9 9 9v11" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Camping Ground</h3>
                        <p class="text-xs text-[#666]">Area berkemah di alam</p>
                    </div>
                </div>

                <!-- Feature 4: Meeting Room -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 group-hover:border-indigo-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Meeting Room</h3>
                        <p class="text-xs text-[#666]">Ruang pertemuan & gathering</p>
                    </div>
                </div>

                <!-- Feature 5: Restoran & Cafe -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto border border-orange-100 group-hover:border-orange-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Restoran & Cafe</h3>
                        <p class="text-xs text-[#666]">Kuliner lokal khas</p>
                    </div>
                </div>

                <!-- Feature 6: Musholla -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 group-hover:border-teal-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Musholla</h3>
                        <p class="text-xs text-[#666]">Tempat ibadah bersih</p>
                    </div>
                </div>

                <!-- Feature 7: Toilet Bersih -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mx-auto border border-cyan-100 group-hover:border-cyan-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-cyan-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Toilet Bersih</h3>
                        <p class="text-xs text-[#666]">Fasilitas sanitasi modern</p>
                    </div>
                </div>

                <!-- Feature 8: Toko Souvenir -->
                <div class="group text-center space-y-3">
                    <div
                        class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto border border-pink-100 group-hover:border-pink-300 transition-colors duration-300">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-black text-[#333] text-sm sm:text-base mb-1">Toko Souvenir</h3>
                        <p class="text-xs text-[#666]">Oleh-oleh khas D'LAS</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// Features Section Component
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
