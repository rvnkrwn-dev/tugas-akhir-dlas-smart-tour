<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
                    Acara & Event
                </h1>
                <p class="text-xl text-slate-300 text-center mb-12">
                    Temukan berbagai acara dan event menarik di D'LAS
                </p>

                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div class="text-center">
                        <div
                            class="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z">
                                </path>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-white mb-4">
                            Halaman Dalam Pengembangan
                        </h2>
                        <p class="text-slate-300 mb-8">
                            Fitur acara dan event sedang dalam tahap pengembangan. Silakan kembali lagi nanti atau
                            hubungi kami untuk informasi lebih lanjut.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <NuxtLink to="/"
                                class="inline-flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                Kembali ke Beranda
                            </NuxtLink>
                            <NuxtLink to="/hubungi-kami"
                                class="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20">
                                Hubungi Kami
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: 'Acara & Event - D\'LAS Smart Tour',
    meta: [
        {
            name: 'description',
            content: 'Temukan berbagai acara dan event menarik di D\'LAS'
        }
    ]
})
</script>
