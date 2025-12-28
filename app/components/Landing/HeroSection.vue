<template>
    <section
        class="relative min-h-screen flex items-center bg-[#F9F9F9] pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
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
        <div class="absolute bottom-20 right-1/3 w-12 h-12 text-gray-300 opacity-40 animate-float">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
            </svg>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <!-- Left Column - Content -->
                <div class="space-y-8 lg:pr-8 z-10">
                    <!-- Small Label -->
                    <div class="inline-block">
                        <span class="text-[#FF9800] font-bold text-sm uppercase tracking-wide">Wonderful
                            Indonesia</span>
                    </div>

                    <!-- Headline with Dotted Border Highlight -->
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#333] leading-tight">
                        Wisata Seru & Edukasi di
                        <span class="inline-block relative mt-2">
                            <span
                                class="relative inline-block px-4 py-2 border-4 border-dashed border-[#4CAF50] rounded-2xl transform rotate-1 bg-[#4CAF50]/5">
                                Kaki Gunung Slamet
                            </span>
                        </span>
                    </h1>

                    <!-- Subheadline -->
                    <p class="text-lg sm:text-xl text-[#666] leading-relaxed max-w-xl">
                        Jelajahi D'LAS Zoo dengan koleksi satwa edukatif, serunya Dino Land, hingga petualangan Jeep
                        Offroad di udara sejuk Purbalingga.
                    </p>

                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 items-start">
                        <NuxtLink to="/wahana"
                            class="group inline-flex items-center justify-center px-8 py-4 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <span>Pesan Tiket</span>
                            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </NuxtLink>

                        <button
                            class="inline-flex items-center gap-3 px-6 py-4 text-[#333] font-bold text-base hover:text-[#4CAF50] transition-colors duration-300">
                            <div
                                class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                                <svg class="w-5 h-5 text-[#4CAF50]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span>Tonton Video</span>
                        </button>
                    </div>

                    <!-- Scroll Down Indicator -->
                    <div class="flex items-center gap-3 pt-8">
                        <span class="text-sm text-[#666] font-medium">Scroll Down</span>
                        <svg class="w-6 h-6 text-[#4CAF50] animate-bounce-slow" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>

                <!-- Right Column - Blob Image -->
                <div class="relative h-[400px] sm:h-[500px] lg:h-[600px] mt-12 lg:mt-0">
                    <!-- Large Orange Blob -->
                    <div
                        class="absolute top-0 right-0 sm:right-10 lg:right-0 w-[280px] sm:w-[350px] lg:w-[400px] h-[350px] sm:h-[420px] lg:h-[500px] z-0">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                            <path fill="#FF9800"
                                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.8,87.6,-7.1,87.1C-23,86.6,-37.9,82.6,-51.4,75.2C-64.9,67.8,-77,57,-83.8,43.4C-90.6,29.8,-92.1,13.2,-89.7,-2.4C-87.3,-18,-81,-33.6,-71.8,-46.8C-62.6,-60,-50.5,-70.8,-36.8,-78.2C-23.1,-85.6,-7.7,-89.6,5.7,-88.3C19.1,-87,30.6,-83.6,44.7,-76.4Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>

                    <!-- Teal Blob -->
                    <div
                        class="absolute bottom-0 right-12 sm:right-20 lg:right-20 w-[200px] sm:w-[250px] lg:w-[300px] h-[250px] sm:h-[300px] lg:h-[350px] z-0">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                            <path fill="#00897B"
                                d="M39.5,-65.9C51.4,-58.5,61.3,-47.6,68.4,-35.1C75.5,-22.6,79.8,-8.5,79.3,5.7C78.8,19.9,73.5,34.2,64.8,45.8C56.1,57.4,44,66.3,30.7,71.8C17.4,77.3,2.9,79.4,-11.8,78.3C-26.5,77.2,-41.4,73,-53.8,64.8C-66.2,56.6,-76.1,44.4,-81.3,30.4C-86.5,16.4,-87,-0.4,-82.8,-15.4C-78.6,-30.4,-69.7,-43.6,-58.2,-51.3C-46.7,-59,-32.6,-61.2,-19.4,-63.8C-6.2,-66.4,6.1,-69.4,18.7,-69.8C31.3,-70.2,27.6,-73.3,39.5,-65.9Z"
                                transform="translate(100 100)" />
                        </svg>
                    </div>

                    <!-- Hero Image Placeholder -->
                    <div
                        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] lg:w-[350px] h-[350px] sm:h-[400px] lg:h-[450px] z-10">
                        <div class="w-full h-full rounded-3xl shadow-2xl overflow-hidden">
                            <NuxtImg src="/images/hero-main.png"
                                alt="D'LAS Purbalingga - Wisata Edukasi di Kaki Gunung Slamet" width="700" height="700"
                                format="webp" quality="80" loading="eager" class="w-full h-full object-cover" />
                        </div>
                    </div>

                    <!-- Small decorative circles -->
                    <div
                        class="absolute top-10 left-5 sm:left-10 w-12 sm:w-16 h-12 sm:h-16 bg-gray-200 rounded-full opacity-50 z-0">
                    </div>
                    <div
                        class="absolute top-16 sm:top-20 right-2 sm:right-5 w-10 sm:w-12 h-10 sm:h-12 bg-gray-300 rounded-full opacity-40 z-0">
                    </div>
                    <div
                        class="absolute bottom-24 sm:bottom-32 left-2 sm:left-5 w-14 sm:w-20 h-14 sm:h-20 bg-gray-200 rounded-full opacity-30 z-0">
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// Organic Memphis Style Hero Section for D'LAS Purbalingga
</script>

<style scoped>
@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

@keyframes float-delayed {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-15px) rotate(-5deg);
    }
}

@keyframes bounce-slow {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(10px);
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite;
    animation-delay: 1s;
}

.animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
}
</style>
