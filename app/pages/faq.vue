<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
                    FAQ - Pertanyaan yang Sering Diajukan
                </h1>
                <p class="text-xl text-slate-300 text-center mb-12">
                    Temukan jawaban atas pertanyaan Anda
                </p>

                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <div class="text-center">
                        <div
                            class="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                </path>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-white mb-4">
                            Halaman Dalam Pengembangan
                        </h2>
                        <p class="text-slate-300 mb-8">
                            Halaman FAQ sedang dalam tahap pengembangan. Silakan kembali lagi nanti atau hubungi kami
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
    title: 'FAQ - D\'LAS Smart Tour',
    meta: [
        {
            name: 'description',
            content: 'Pertanyaan yang sering diajukan tentang D\'LAS'
        }
    ]
})
</script>
