<template>
    <div>
        <!-- Header -->
        <div class="text-center mb-8">
            <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-2">
                Lupa Kata Sandi?
            </h2>
            <p class="text-sm sm:text-base text-[#666]">
                Masukkan email Anda dan kami akan mengirimkan tautan reset
            </p>
        </div>

        <!-- Forgot Password Form -->
        <form @submit.prevent="handleForgotPassword" class="space-y-5">
            <!-- Success Message -->
            <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-2xl">
                <p class="text-sm text-green-600 text-center">{{ successMessage }}</p>
            </div>

            <!-- General Error Message -->
            <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-2xl">
                <p class="text-sm text-red-600 text-center">{{ errors.general }}</p>
            </div>

            <!-- Rate Limit Warning -->
            <div v-if="rateLimitInfo.isLimited" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-amber-800 mb-1">Batas Percobaan Terlampaui</p>
                        <p class="text-xs text-amber-700">{{ rateLimitInfo.message }}</p>
                        <p v-if="rateLimitInfo.retryAfter" class="text-xs text-amber-600 mt-2">
                            Silakan coba lagi dalam <span class="font-bold">{{ formatRetryTime(rateLimitInfo.retryAfter)
                                }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Email Input -->
            <AuthInput id="email" v-model="form.email" type="email" label="Alamat Email" placeholder="nama@contoh.com"
                :required="true" :error="errors.email" autocomplete="email" />

            <!-- Submit Button -->
            <AuthButton type="submit" text="Kirim Tautan Reset" :loading="loading" loading-text="Mengirim..."
                variant="primary" />
        </form>

        <!-- Back to Login Link -->
        <p class="mt-6 text-center text-sm text-[#666]">
            Ingat kata sandi Anda?
            <NuxtLink to="/auth/login" class="font-bold text-[#4CAF50] hover:text-[#45a049] transition-colors">
                Masuk
            </NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ApiResponse } from '~/types/api'

// Set layout untuk halaman ini
definePageMeta({
    layout: 'auth',
    middleware: 'guest'
})

// Use fetch API composable
const { apiFetch } = useFetchApi()

// Form state
const form = reactive({
    email: ''
})

// Error state
const errors = reactive({
    email: '',
    general: ''
})

// Loading and success state
const loading = ref(false)
const successMessage = ref('')

// Rate limit info
const rateLimitInfo = reactive({
    isLimited: false,
    message: '',
    retryAfter: 0
})

// Helper function to format retry time
const formatRetryTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds} detik`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} menit`
}

// Handle forgot password
const handleForgotPassword = async () => {
    // Reset errors, success, and rate limit info
    errors.email = ''
    errors.general = ''
    successMessage.value = ''
    rateLimitInfo.isLimited = false

    // Validation
    if (!form.email) {
        errors.email = 'Email wajib diisi'
        return
    }

    // Set loading
    loading.value = true

    try {
        // Call forgot password API
        const response = await apiFetch<ApiResponse<null>>('/api/auth/password/forgot', {
            method: 'POST',
            body: {
                email: form.email
            }
        })

        if (response.success) {
            // Show success message
            successMessage.value = response.message || 'Jika email terdaftar di sistem kami, tautan reset kata sandi akan dikirim'

            // Clear form
            form.email = ''
        } else {
            errors.general = response.message || 'Gagal mengirim tautan reset. Silakan coba lagi.'
        }

    } catch (error: any) {
        console.error('Forgot password error:', error)

        // Handle validation errors from API
        if (error.data?.data?.errors && Array.isArray(error.data.data.errors)) {
            const validationErrors = error.data.data.errors
            validationErrors.forEach((err: any) => {
                const field = err.field
                const message = err.message

                if (field in errors) {
                    errors[field as keyof typeof errors] = message
                } else {
                    if (!errors.general) {
                        errors.general = message
                    } else {
                        errors.general += '; ' + message
                    }
                }
            })
        }
        // Handle rate limit
        else if (error.statusCode === 429) {
            rateLimitInfo.isLimited = true
            // Get message
            rateLimitInfo.message = error.data?.message || 'Terlalu banyak percobaan reset kata sandi. Silakan coba lagi nanti.'
            if (error.data?.data?.message) {
                rateLimitInfo.message = error.data.data.message
            }

            // Get retry time
            rateLimitInfo.retryAfter = error.data?.data?.error?.details?.retryAfter || 0

            errors.general = rateLimitInfo.message
        }
        // Handle specific error messages
        else if (error.data?.data?.message) {
            errors.general = error.data.data.message
        } else if (error.statusCode === 500) {
            errors.general = 'Gagal mengirim email reset. Silakan coba lagi nanti.'
        } else {
            errors.general = 'Terjadi kesalahan. Silakan coba lagi nanti.'
        }
    } finally {
        loading.value = false
    }
}
</script>
