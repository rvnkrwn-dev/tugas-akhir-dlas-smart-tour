<template>
    <div class="min-h-screen bg-white">
        <!-- Hero Section -->
        <section class="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 bg-[#F9F9F9] overflow-hidden">
            <!-- Decorative Elements -->
            <div class="absolute top-10 right-10 w-64 h-64 bg-[#4CAF50]/5 rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 left-10 w-80 h-80 bg-[#FF9800]/5 rounded-full blur-3xl"></div>
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4CAF50]/3 rounded-full blur-3xl">
            </div>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    <!-- Left Column - Content -->
                    <div class="space-y-6">
                        <!-- Badge -->
                        <div
                            class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide">
                            Wonderful Indonesia
                        </div>

                        <!-- Title -->
                        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-[#333] leading-tight">
                            Tentang<br />
                            <span class="text-[#4CAF50]">D'LAS Purbalingga</span>
                        </h1>

                        <!-- Description -->
                        <p class="text-base sm:text-lg text-[#666] leading-relaxed">
                            Nikmati suasana pegunungan di kawasan lereng Gunung Slamet. D'LAS menghadirkan
                            petualangan outdoor, edukasi satwa, dan Dino Land dalam satu lokasi wisata keluarga.
                        </p>

                        <!-- Quick Stats -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            <div
                                class="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                                <div class="text-2xl font-black text-[#4CAF50] mb-1">2018</div>
                                <div class="text-xs text-[#666]">Tahun Berdiri</div>
                            </div>
                            <div
                                class="bg-white rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-colors">
                                <div class="text-2xl font-black text-[#FF9800] mb-1">7+</div>
                                <div class="text-xs text-[#666]">Wahana</div>
                            </div>
                            <div
                                class="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                                <div class="text-2xl font-black text-[#2196F3] mb-1">100K+</div>
                                <div class="text-xs text-[#666]">Pengunjung</div>
                            </div>
                            <div
                                class="bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                                <div class="text-2xl font-black text-[#9C27B0] mb-1">4.8★</div>
                                <div class="text-xs text-[#666]">Rating</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Image -->
                    <div class="relative lg:order-last order-first">
                        <div
                            class="aspect-[4/3] bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="/images/hero-main.png" alt="D'LAS Purbalingga"
                                class="w-full h-full object-cover" />
                        </div>
                        <!-- Floating Badge -->
                        <div
                            class="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div class="text-xs text-[#999] mb-1">Dikelola Profesional</div>
                                    <div class="text-sm font-black text-[#333]">PT. Lembah Asri Jaya</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 1. Profil Singkat (Who We Are) -->
        <section class="relative py-16 sm:py-20 bg-white overflow-hidden">
            <!-- Decorative Elements -->
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
                        Profil Kami
                    </div>
                    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                        Siapa Kami?
                    </h2>
                    <p class="text-base sm:text-lg text-[#666]">
                        Destinasi wisata keluarga di kawasan Serang, Karangreja, Purbalingga
                    </p>
                </div>

                <!-- Content -->
                <div class="max-w-4xl mx-auto space-y-8">
                    <!-- Description -->
                    <div class="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100">
                        <p class="text-base sm:text-lg text-[#666] leading-relaxed mb-6">
                            <strong class="text-[#333] font-black">Desa Wisata Lembah Asri Serang (D'LAS)</strong>
                            terletak di lereng Gunung Slamet, menawarkan udara sejuk pegunungan dan pemandangan alam
                            yang menenangkan. Kami menghadirkan pengalaman liburan yang memadukan aktivitas outdoor,
                            edukasi satwa di D'LAS Zoo, dan petualangan di Dino Land—semua dirancang untuk keluarga
                            yang ingin menikmati alam sambil belajar dan bermain.
                        </p>

                        <p class="text-sm sm:text-base text-[#666] leading-relaxed">
                            Dengan fasilitas pendukung seperti area istirahat, tempat ibadah, dan pilihan aktivitas
                            kelompok, <strong class="text-[#333]">D'LAS</strong> menjadi pilihan tepat untuk liburan
                            keluarga, gathering, atau program outbound di kawasan Purbalingga.
                        </p>
                    </div>

                    <!-- Feature Cards -->
                    <div class="grid sm:grid-cols-3 gap-6">
                        <!-- Wahana Lengkap -->
                        <div
                            class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-colors">
                            <div
                                class="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-4">
                                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-black text-[#333] mb-2">Suasana Pegunungan</h3>
                            <p class="text-sm text-[#666]">Udara sejuk dan pemandangan alam di lereng Gunung Slamet</p>
                        </div>

                        <!-- Pengelolaan Profesional -->
                        <div
                            class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
                            <div
                                class="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-4">
                                <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-black text-[#333] mb-2">Fasilitas Ramah Keluarga</h3>
                            <p class="text-sm text-[#666]">Area istirahat, tempat ibadah, dan toilet bersih untuk
                                kenyamanan keluarga</p>
                        </div>

                        <!-- Lokasi Strategis -->
                        <div
                            class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 transition-colors">
                            <div
                                class="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mb-4">
                                <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-black text-[#333] mb-2">Beragam Aktivitas</h3>
                            <p class="text-sm text-[#666]">Dari edukasi satwa, Dino Land, hingga adventure outdoor dalam
                                satu kawasan</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 2. Sejarah Singkat -->
        <section class="relative py-16 sm:py-20 bg-[#F9F9F9] overflow-hidden">
            <!-- Decorative Elements -->
            <div class="absolute top-20 right-10 w-10 h-10 text-[#FF9800] opacity-15 animate-float hidden md:block">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </div>
            <div
                class="absolute bottom-20 left-20 w-8 h-8 text-[#4CAF50] opacity-20 animate-float-delayed hidden md:block">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,22 2,22" />
                </svg>
            </div>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Section Header -->
                <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                    <div
                        class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                        Perjalanan Kami
                    </div>
                    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                        Sejarah D'LAS
                    </h2>
                    <p class="text-base sm:text-lg text-[#666]">
                        Dari visi menjadi destinasi wisata terpadu yang dicintai keluarga Indonesia
                    </p>
                </div>

                <!-- Timeline -->
                <div class="max-w-5xl mx-auto">
                    <div class="relative">
                        <!-- Vertical Line (Hidden on mobile) -->
                        <div
                            class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#4CAF50] via-[#FF9800] to-[#2196F3] hidden lg:block">
                        </div>

                        <div class="space-y-12">
                            <!-- 2018 - Awal Mula -->
                            <div class="relative">
                                <div class="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                                    <!-- Left: Content (Desktop) / Full (Mobile) -->
                                    <div class="lg:text-right">
                                        <div
                                            class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-green-200 transition-all duration-300">
                                            <!-- Icon -->
                                            <div
                                                class="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-4 lg:ml-auto">
                                                <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <!-- Content -->
                                            <h3 class="text-2xl font-black text-[#4CAF50] mb-3">2018 - Awal Mula</h3>
                                            <p class="text-sm sm:text-base text-[#666] leading-relaxed">
                                                <strong class="text-[#333]">PT. Lembah Asri Jaya</strong> didirikan
                                                dengan visi menghadirkan wisata berbasis alam di kawasan Serang,
                                                Purbalingga.
                                                <strong class="text-[#333]">D'LAS Zoo</strong> menjadi program pertama
                                                yang membuka akses edukasi satwa untuk keluarga di Jawa Tengah.
                                            </p>
                                            <!-- Stats -->
                                            <div class="mt-4 pt-4 border-t border-gray-100">
                                                <div class="flex items-center gap-2 text-sm text-[#4CAF50] font-bold">
                                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    <span>Wahana Pertama: D'LAS Zoo</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Center: Year Badge -->
                                    <div
                                        class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full items-center justify-center border-4 border-white shadow-lg z-10">
                                        <span class="text-xl font-black text-green-600">18</span>
                                    </div>

                                    <!-- Right: Empty (Desktop) -->
                                    <div class="hidden lg:block"></div>
                                </div>
                            </div>

                            <!-- 2019 - Ekspansi Wahana -->
                            <div class="relative">
                                <div class="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                                    <!-- Left: Empty (Desktop) -->
                                    <div class="hidden lg:block"></div>

                                    <!-- Center: Year Badge -->
                                    <div
                                        class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full items-center justify-center border-4 border-white shadow-lg z-10">
                                        <span class="text-xl font-black text-orange-600">19</span>
                                    </div>

                                    <!-- Right: Content (Desktop) / Full (Mobile) -->
                                    <div>
                                        <div
                                            class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-orange-200 transition-all duration-300">
                                            <!-- Icon -->
                                            <div
                                                class="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center mb-4">
                                                <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <!-- Content -->
                                            <h3 class="text-2xl font-black text-[#FF9800] mb-3">2019 - Ekspansi Wahana
                                            </h3>
                                            <p class="text-sm sm:text-base text-[#666] leading-relaxed mb-4">
                                                Pengembangan kawasan dilanjutkan dengan hadirnya ATV Adventure, Jeep
                                                Adventure, dan Dino Land—memperkaya pilihan aktivitas petualangan dan
                                                edukasi untuk pengunjung segala usia.
                                            </p>
                                            <!-- Feature List -->
                                            <ul class="space-y-2">
                                                <li class="flex items-start gap-2 text-sm text-[#333]">
                                                    <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                                                        fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    <span><strong>ATV Adventure</strong> - Petualangan off-road seru
                                                    </span>
                                                </li>
                                                <li class="flex items-start gap-2 text-sm text-[#333]">
                                                    <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                                                        fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    <span><strong>Jeep Adventure</strong> - Jelajah alam dengan jeep
                                                    </span>
                                                </li>
                                                <li class="flex items-start gap-2 text-sm text-[#333]">
                                                    <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                                                        fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    <span><strong>Dino Land</strong> - Taman dinosaurus edukatif</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 2021-Present - Inovasi Berkelanjutan -->
                            <div class="relative">
                                <div class="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                                    <!-- Left: Content (Desktop) / Full (Mobile) -->
                                    <div class="lg:text-right">
                                        <div
                                            class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-blue-200 transition-all duration-300">
                                            <!-- Icon -->
                                            <div
                                                class="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-4 lg:ml-auto">
                                                <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <!-- Content -->
                                            <h3 class="text-2xl font-black text-[#2196F3] mb-3">2021 - Sekarang</h3>
                                            <p class="text-sm sm:text-base text-[#666] leading-relaxed mb-4">
                                                D'LAS terus meningkatkan fasilitas pendukung keluarga dan program
                                                edukasi
                                                berkelanjutan. Kepercayaan masyarakat terhadap kualitas pengalaman
                                                wisata
                                                kami terus tumbuh seiring dengan komitmen menjaga kelestarian alam
                                                pegunungan.
                                            </p>
                                            <!-- Achievement Badge -->
                                            <div class="mt-4 pt-4 border-t border-gray-100">
                                                <div
                                                    class="inline-flex items-center gap-2 text-sm text-[#2196F3] font-bold">
                                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span>Destinasi Favorit Purbalingga</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Center: Year Badge -->
                                    <div
                                        class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-full items-center justify-center border-4 border-white shadow-lg z-10">
                                        <span class="text-xl font-black text-blue-600">21</span>
                                    </div>

                                    <!-- Right: Empty (Desktop) -->
                                    <div class="hidden lg:block"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Card -->
                    <div
                        class="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                        <div class="text-center max-w-3xl mx-auto">
                            <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-3">Perjalanan yang Terus Berlanjut
                            </h3>
                            <p class="text-sm sm:text-base text-[#666] leading-relaxed">
                                Dari tahun ke tahun, D'LAS Purbalingga terus berkembang dan berinovasi untuk memberikan
                                layanan wisata berkualitas. Kami berkomitmen untuk terus meningkatkan kualitas
                                pelayanan,
                                memperkaya program edukasi, dan menjaga kelestarian alam untuk generasi mendatang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. Visi, Misi & Nilai -->
        <section class="relative py-16 sm:py-20 bg-white overflow-hidden">
            <!-- Floating Decorations -->
            <div class="absolute top-10 right-10 w-10 h-10 text-[#FF9800] opacity-15 animate-float hidden md:block">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </div>
            <div
                class="absolute bottom-10 left-10 w-8 h-8 text-[#4CAF50] opacity-20 animate-float-delayed hidden md:block">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,22 2,22" />
                </svg>
            </div>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Section Header -->
                <div class="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
                    <div
                        class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                        Visi, Misi & Nilai
                    </div>
                    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                        Komitmen Kami
                    </h2>
                    <p class="text-base sm:text-lg text-[#666]">
                        Memberikan pengalaman wisata terbaik dengan inovasi berkelanjutan
                    </p>
                </div>

                <div class="max-w-6xl mx-auto space-y-12">
                    <!-- Visi & Misi Grid -->
                    <div class="grid lg:grid-cols-2 gap-8">
                        <!-- Vision -->
                        <div class="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100">
                            <!-- Content -->
                            <h3 class="text-2xl sm:text-3xl font-black text-blue-600 mb-4">Visi</h3>
                            <p class="text-base sm:text-lg text-[#333] leading-relaxed font-medium">
                                Menjadi destinasi wisata pegunungan terdepan yang memberikan pengalaman berkualitas
                                melalui keseimbangan antara petualangan, edukasi, dan kelestarian alam.
                            </p>
                        </div>

                        <!-- Mission -->
                        <div class="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100">
                            <!-- Content -->
                            <h3 class="text-2xl sm:text-3xl font-black text-green-600 mb-4">Misi</h3>
                            <ul class="space-y-3">
                                <li class="flex items-start gap-3 text-sm sm:text-base text-[#333]">
                                    <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Menyediakan <strong>aktivitas outdoor dan edukasi alam</strong> yang aman
                                        serta menyenangkan</span>
                                </li>
                                <li class="flex items-start gap-3 text-sm sm:text-base text-[#333]">
                                    <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Menciptakan <strong>pengalaman liburan yang berkesan</strong> untuk setiap
                                        keluarga</span>
                                </li>
                                <li class="flex items-start gap-3 text-sm sm:text-base text-[#333]">
                                    <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Mengembangkan <strong>program berkelanjutan</strong> yang mengedukasi tentang
                                        satwa dan lingkungan</span>
                                </li>
                                <li class="flex items-start gap-3 text-sm sm:text-base text-[#333]">
                                    <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Menjaga <strong>kelestarian alam pegunungan</strong> untuk generasi
                                        mendatang</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Nilai & Komitmen Cards -->
                    <div>
                        <h3 class="text-2xl sm:text-3xl font-black text-[#333] mb-8 text-center">Nilai & Komitmen Kami
                        </h3>
                        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <!-- Keamanan -->
                            <div
                                class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-colors">
                                <div
                                    class="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 class="text-lg font-black text-[#333] mb-2">Keamanan Utama</h4>
                                <p class="text-sm text-[#666] leading-relaxed">Protokol keselamatan ketat di setiap
                                    aktivitas untuk kenyamanan keluarga</p>
                            </div>

                            <!-- Pelayanan -->
                            <div
                                class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
                                <div
                                    class="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </div>
                                <h4 class="text-lg font-black text-[#333] mb-2">Staf Terlatih</h4>
                                <p class="text-sm text-[#666] leading-relaxed">Tim berpengalaman siap membantu keluarga
                                    selama kunjungan</p>
                            </div>

                            <!-- Lingkungan -->
                            <div
                                class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-200 transition-colors">
                                <div
                                    class="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 class="text-lg font-black text-[#333] mb-2">Kelestarian Alam</h4>
                                <p class="text-sm text-[#666] leading-relaxed">Komitmen menjaga kebersihan dan ekosistem
                                    pegunungan</p>
                            </div>

                            <!-- Pengalaman -->
                            <div
                                class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 transition-colors">
                                <div
                                    class="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg class="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <h4 class="text-lg font-black text-[#333] mb-2">Momen Berharga</h4>
                                <p class="text-sm text-[#666] leading-relaxed">Menciptakan kenangan indah bersama
                                    keluarga di alam terbuka</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. CTA Section -->
        <section class="relative py-16 sm:py-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] overflow-hidden">
            <!-- Decorative Dots -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute inset-0"
                    style="background-image: radial-gradient(circle, white 1.5px, transparent 1.5px); background-size: 40px 40px;">
                </div>
            </div>

            <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="max-w-4xl mx-auto text-center text-white">
                    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                        Siap Merasakan Pengalaman<br />
                        Wisata Tak Terlupakan?
                    </h2>
                    <p class="text-base sm:text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Ajak keluarga menjelajah alam pegunungan di D'LAS Purbalingga. Dari edukasi satwa hingga
                        petualangan outdoor—semua menanti untuk menciptakan momen tak terlupakan.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <NuxtLink to="/wahana"
                            class="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#4CAF50] hover:bg-white/90 font-bold text-base rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            <span>Lihat Wahana</span>
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </NuxtLink>

                        <NuxtLink to="/hubungi-kami"
                            class="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 font-bold text-base rounded-full transition-all duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Hubungi Kami</span>
                        </NuxtLink>
                    </div>

                    <!-- Quick Contact Info -->
                    <div class="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-white/20">
                        <div class="flex items-center gap-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div class="text-left">
                                <div class="text-xs text-white/80">Telepon</div>
                                <div class="font-bold">0812-3456-7890</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div class="text-left">
                                <div class="text-xs text-white/80">Jam Operasional</div>
                                <div class="font-bold">08:00 - 17:00 WIB</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Information (Keep existing) -->
        <section class="relative py-16 sm:py-20 bg-[#F9F9F9] overflow-hidden">
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
                        Hubungi Kami
                    </div>
                    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 leading-tight">
                        Siap Melayani Anda
                    </h2>
                    <p class="text-base sm:text-lg text-[#666]">
                        Tim kami siap membantu merencanakan kunjungan wisata Anda
                    </p>
                </div>

                <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
                    <!-- Left Column - Map -->
                    <div class="rounded-2xl overflow-hidden border border-gray-200 aspect-square lg:aspect-auto">
                        <iframe title="Lokasi D'Las Lembah Asri Serang Purbalingga di Google Maps"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.9863932054427!2d109.28861627567494!3d-7.242386592763981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ff3d3ffffffff%3A0x83d8dc79ac5a6a66!2sD&#39;Las%20Lembah%20Asri%20Serang%20Purbalingga!5e0!3m2!1sen!2sid!4v1765816514321!5m2!1sen!2sid"
                            width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy"
                            class="w-full h-full min-h-[350px] sm:min-h-[400px]">
                        </iframe>
                    </div>

                    <!-- Right Column - Contact Details -->
                    <div class="space-y-6">
                        <!-- Address -->
                        <div class="flex items-start gap-4">
                            <div
                                class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
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
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Telepon</h3>
                                <p class="text-sm sm:text-base text-[#666] space-y-1">
                                    <a href="tel:088983717124"
                                        class="block hover:text-[#4CAF50] transition-colors">0889-8371-7124</a>
                                    <a href="tel:081229334485"
                                        class="block hover:text-[#4CAF50] transition-colors">0812-2933-4485</a>
                                </p>
                            </div>
                        </div>

                        <!-- Email -->
                        <div class="flex items-start gap-4">
                            <div
                                class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center border border-blue-100">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-black text-[#333] mb-2">Email</h3>
                                <a href="mailto:lembahasrijaya@gmail.com"
                                    class="text-sm sm:text-base text-[#666] hover:text-[#4CAF50] transition-colors">
                                    lembahasrijaya@gmail.com
                                </a>
                            </div>
                        </div>

                        <!-- Operating Hours -->
                        <div class="flex items-start gap-4">
                            <div
                                class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center border border-orange-100">
                                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
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

                        <!-- Direction Button -->
                        <div class="pt-2">
                            <a href="https://maps.google.com/?q=D'LAS+Purbalingga" target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold text-sm rounded-full transition-all duration-300 shadow-lg">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- CTA Section -->
        <LandingCTASection />
    </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
    title: 'Jelajah D\'LAS - Desa Wisata Lembah Asri Serang Purbalingga',
    meta: [
        { name: 'description', content: 'Jelajahi Desa Wisata Lembah Asri Serang (D\'LAS) di Purbalingga dengan D\'LAS Zoo, Dino Land, ATV, Flying Fox, Jeep Offroad, outbound, dan fasilitas lengkap. Dikelola profesional oleh PT. Lembah Asri Jaya sejak 2018.' },
        { name: 'keywords', content: 'D\'LAS Purbalingga, Desa Wisata Lembah Asri Serang, D\'LAS Zoo, Dino Land, ATV Purbalingga, outbound Purbalingga, wisata keluarga, PT Lembah Asri Jaya' },
        { property: 'og:title', content: 'Jelajah D\'LAS - Desa Wisata Lembah Asri Serang Purbalingga' },
        { property: 'og:description', content: 'Destinasi wisata alam terpadu dengan D\'LAS Zoo, wahana petualangan, outbound, dan fasilitas lengkap untuk keluarga di kaki Gunung Slamet' },
    ]
})
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
