<template>
    <div class="min-h-screen bg-white">
        <!-- Hero Section -->
        <section
            class="relative min-h-[50vh] flex items-center bg-[#F9F9F9] pt-20 sm:pt-24 lg:pt-28 pb-12 overflow-hidden">
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

            <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="max-w-4xl mx-auto text-center">
                    <!-- Badge -->
                    <div
                        class="inline-block px-4 py-2 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-4">
                        💬 Kontak
                    </div>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-[#333] mb-4 leading-tight">
                        Hubungi Kami
                    </h1>
                    <p class="text-lg sm:text-xl text-[#666] max-w-2xl mx-auto">
                        Ada pertanyaan? Kami siap membantu Anda
                    </p>
                </div>
            </div>
        </section>

        <!-- Contact Form & Info -->
        <section class="py-16 sm:py-20 bg-white">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
                    <!-- Contact Form -->
                    <div class="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100">
                        <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-6">Kirim Pesan</h2>

                        <form @submit.prevent="handleSubmit" class="space-y-5">
                            <!-- Name -->
                            <div>
                                <label for="name" class="block text-sm font-bold text-[#333] mb-2">Nama Lengkap</label>
                                <input id="name" name="name" v-model="form.name" type="text" required
                                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all"
                                    placeholder="Masukkan nama Anda">
                            </div>

                            <!-- Email -->
                            <div>
                                <label for="email" class="block text-sm font-bold text-[#333] mb-2">Email</label>
                                <input id="email" name="email" v-model="form.email" type="email" required
                                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all"
                                    placeholder="nama@email.com">
                            </div>

                            <!-- Phone -->
                            <div>
                                <label for="phone" class="block text-sm font-bold text-[#333] mb-2">Nomor
                                    Telepon</label>
                                <input id="phone" name="phone" v-model="form.phone" type="tel" required
                                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all"
                                    placeholder="08xx-xxxx-xxxx">
                            </div>

                            <!-- Subject -->
                            <div>
                                <label for="subject" class="block text-sm font-bold text-[#333] mb-2">Subjek</label>
                                <select id="subject" name="subject" v-model="form.subject" required
                                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all">
                                    <option value="">Pilih subjek</option>
                                    <option value="informasi">Informasi Umum</option>
                                    <option value="reservasi">Reservasi</option>
                                    <option value="kerjasama">Kerjasama</option>
                                    <option value="keluhan">Keluhan</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>

                            <!-- Message -->
                            <div>
                                <label for="message" class="block text-sm font-bold text-[#333] mb-2">Pesan</label>
                                <textarea id="message" name="message" v-model="form.message" required rows="5"
                                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all resize-none"
                                    placeholder="Tulis pesan Anda di sini..."></textarea>
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" :disabled="isSubmitting"
                                class="w-full px-6 py-4 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    Mengirim...
                                </span>
                                <span v-else>Kirim Pesan</span>
                            </button>
                        </form>
                    </div>

                    <!-- Contact Information -->
                    <div class="space-y-6">
                        <div class="bg-white rounded-3xl p-8 border border-gray-100">
                            <h3 class="text-xl font-black text-[#333] mb-6">Informasi Kontak</h3>

                            <!-- Address -->
                            <div class="flex items-start gap-4 mb-6">
                                <div
                                    class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center">
                                    <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="text-base font-black text-[#333] mb-2">Alamat</h4>
                                    <p class="text-sm text-[#666] leading-relaxed">
                                        Jl. Raya Serang, Krajan, Serang, Kec. Karangreja,<br>
                                        Kabupaten Purbalingga, Jawa Tengah 53357
                                    </p>
                                </div>
                            </div>

                            <!-- Phone -->
                            <div class="flex items-start gap-4 mb-6">
                                <div
                                    class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                                    <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="text-base font-black text-[#333] mb-2">Telepon</h4>
                                    <p class="text-sm text-[#666] space-y-1">
                                        <a href="tel:081229334485"
                                            class="block hover:text-[#4CAF50] transition-colors">0812-2933-4485</a>
                                        <a href="tel:02815100004"
                                            class="block hover:text-[#4CAF50] transition-colors">028-1510-0004</a>
                                    </p>
                                </div>
                            </div>

                            <!-- Operating Hours -->
                            <div class="flex items-start gap-4 mb-6">
                                <div
                                    class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center">
                                    <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="text-base font-black text-[#333] mb-2">Jam Operasional</h4>
                                    <div class="text-sm text-[#666] space-y-1">
                                        <p>Senin - Jumat: 08:00 - 17:00 WIB</p>
                                        <p>Sabtu - Minggu: 07:00 - 18:00 WIB</p>
                                        <p class="text-[#4CAF50] font-bold mt-2">Buka Setiap Hari</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Social Media -->
                            <div class="flex items-start gap-4">
                                <div
                                    class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center">
                                    <svg class="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="text-base font-black text-[#333] mb-2">Media Sosial</h4>
                                    <a href="https://www.instagram.com/dlas_serangofficial/" target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center gap-2 text-sm text-[#666] hover:text-pink-600 transition-colors">
                                        <span>@dlas_serangofficial</span>
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Map Button -->
                        <a href="https://maps.google.com/?q=D'LAS+Purbalingga" target="_blank" rel="noopener noreferrer"
                            class="block w-full px-6 py-4 bg-white hover:bg-gray-50 border-2 border-[#4CAF50] text-[#4CAF50] font-bold rounded-full text-center transition-all duration-300">
                            <span class="inline-flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>Buka di Google Maps</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Location Map Section -->
        <LandingLocationSection />

        <!-- Alert Component -->
        <UiAlert ref="alertRef" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '#imports'
import { useFetchApi } from '~/composables/useFetchApi'
import type { ApiResponse } from '~/types/api'
import UiAlert from '../../components/UI/UiAlert.vue'

// SEO Meta
useHead({
    title: 'Hubungi Kami - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Hubungi D\'LAS Purbalingga untuk informasi, reservasi, atau pertanyaan. Telepon: 0812-2933-4485. Alamat: Jl. Raya Serang, Purbalingga, Jawa Tengah.' },
        { property: 'og:title', content: 'Hubungi Kami - D\'LAS Purbalingga' },
    ]
})

// Refs
const alertRef = ref()
const { apiFetch } = useFetchApi()

// Form State
const isSubmitting = ref(false)
const form = ref({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
})

// Form Handler
const handleSubmit = async () => {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
        const response = await apiFetch<ApiResponse<null>>('/api/inbox', {
            method: 'POST',
            body: {
                fullName: form.value.name,
                email: form.value.email,
                phone: form.value.phone,
                subject: form.value.subject,
                message: form.value.message
            }
        })

        // Show Success Alert
        alertRef.value.show({
            type: 'success',
            title: 'Pesan Terkirim',
            message: 'Terima kasih! Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.',
            confirmText: 'Tutup'
        })

        // Reset form
        form.value = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        }
    } catch (error: any) {
        console.error('Submission error:', error)
        const msg = error?.data?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.'

        // Show Error Alert
        alertRef.value.show({
            type: 'error',
            title: 'Gagal Mengirim',
            message: msg,
            confirmText: 'Tutup'
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>
