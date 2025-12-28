<template>
    <section class="relative py-16 sm:py-20 bg-[#F9F9F9] overflow-hidden">
        <!-- Floating Decorations -->
        <div class="absolute top-10 right-10 w-10 h-10 text-[#4CAF50] opacity-15 animate-float hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>
        <div class="absolute bottom-10 left-20 w-8 h-8 text-[#FF9800] opacity-20 animate-float-delayed hidden md:block">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,22 2,22" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Section Header -->
            <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                <div
                    class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                    Lokasi & Kontak
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                    Temukan Kami
                </h2>
                <p class="text-base sm:text-lg text-[#666]">
                    Kunjungi kami di Purbalingga, Jawa Tengah
                </p>
            </div>

            <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
                <!-- Google Maps Embed -->
                <div class="rounded-2xl overflow-hidden border border-gray-200 aspect-square lg:aspect-auto">
                    <iframe title="Lokasi D'Las Lembah Asri Serang Purbalingga di Google Maps"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.9863932054427!2d109.28861627567494!3d-7.242386592763981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ff3d3ffffffff%3A0x83d8dc79ac5a6a66!2sD&#39;Las%20Lembah%20Asri%20Serang%20Purbalingga!5e0!3m2!1sen!2sid!4v1765816514321!5m2!1sen!2sid"
                        width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy"
                        class="w-full h-full min-h-[350px] sm:min-h-[400px]">
                    </iframe>
                </div>

                <!-- Contact Information -->
                <div class="space-y-6">
                    <!-- Address -->
                    <div class="flex items-start gap-4">
                        <div
                            class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center border border-indigo-100">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Alamat</h3>
                            <p class="text-sm sm:text-base text-[#666] leading-relaxed">
                                Jl. Raya Serang, Krajan, Serang, Kec. Karangreja,<br>
                                Kabupaten Purbalingga, Jawa Tengah 53357
                            </p>
                        </div>
                    </div>

                    <!-- Phone -->
                    <div class="flex items-start gap-4">
                        <div
                            class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center border border-green-100">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Telepon</h3>
                            <p class="text-sm sm:text-base text-[#666] space-y-1">
                                <a href="tel:081229334485"
                                    class="block hover:text-[#4CAF50] transition-colors">0812-2933-4485</a>
                                <a href="tel:02815100004"
                                    class="block hover:text-[#4CAF50] transition-colors">028-1510-0004</a>
                            </p>
                        </div>
                    </div>

                    <!-- Operating Hours -->
                    <div class="flex items-start gap-4">
                        <div
                            class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center border border-orange-100">
                            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Jam Operasional</h3>
                            <div class="text-sm sm:text-base text-[#666] space-y-1">
                                <p>Senin - Jumat: 08:00 - 17:00 WIB</p>
                                <p>Sabtu - Minggu: 07:00 - 18:00 WIB</p>
                                <p class="text-xs sm:text-sm text-[#4CAF50] font-bold mt-2">Buka Setiap Hari</p>
                            </div>
                        </div>
                    </div>

                    <!-- Social Media -->
                    <div class="flex items-start gap-4">
                        <div
                            class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center border border-pink-100">
                            <svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Media Sosial</h3>
                            <a href="https://www.instagram.com/dlas_serangofficial/" target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 text-sm sm:text-base text-[#666] hover:text-pink-600 transition-colors">
                                <span>@dlas_serangofficial</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <!-- Direction Button -->
                    <div class="pt-2">
                        <a href="https://maps.google.com/?q=D'LAS+Purbalingga" target="_blank" rel="noopener noreferrer"
                            class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span>Dapatkan Arah di Google Maps</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// Location Section Component
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
