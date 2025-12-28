<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
                    Blog D'LAS
                </h1>
                <p class="text-xl text-slate-300 text-center mb-12">
                    Artikel, tips, dan informasi terbaru seputar D'LAS
                </p>

                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div class="text-center">
                        <div
                            class="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z">
                                </path>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-white mb-4">
                            Halaman Dalam Pengembangan
                        </h2>
                        <p class="text-slate-300 mb-8">
                            Fitur blog sedang dalam tahap pengembangan. Silakan kembali lagi nanti atau hubungi kami
                            untuk informasi lebih lanjut.
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
    title: 'Blog - D\'LAS Smart Tour',
    meta: [
        {
            name: 'description',
            content: 'Baca artikel, tips, dan informasi terbaru seputar D\'LAS'
        }
    ]
})
</script>
