<template>
    <div>
        <!-- Header -->
        <div class="text-center mb-8">
            <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-2">
                Verifikasi Email
            </h2>
            <p class="text-sm sm:text-base text-[#666]">
                {{ statusMessage }}
            </p>
        </div>

        <!-- Status Display -->
        <div class="space-y-5">
            <!-- Loading State -->
            <div v-if="verifying" class="flex flex-col items-center justify-center py-8">
                <div class="w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mb-4">
                </div>
                <p class="text-sm text-[#666]">Memverifikasi email Anda...</p>
            </div>

            <!-- Success State -->
            <div v-else-if="verified" class="space-y-5">
                <div class="p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <div class="flex items-start gap-3">
                        <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-green-800 mb-1">Email Berhasil Diverifikasi!</p>
                            <p class="text-xs text-green-700">{{ successMessage }}</p>
                            <p class="text-xs text-green-600 mt-2">
                                Mengalihkan ke halaman login dalam <span class="font-bold">{{ countdown }}</span>
                                detik...
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Manual Login Button -->
                <AuthButton @click="goToLogin" text="Ke Halaman Login Sekarang" variant="primary" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="space-y-5">
                <div class="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div class="flex items-start gap-3">
                        <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-red-800 mb-1">Verifikasi Gagal</p>
                            <p class="text-xs text-red-700">{{ errorMessage }}</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                    <AuthButton v-if="canResend" @click="resendVerification" text="Kirim Ulang Email Verifikasi"
                        :loading="resending" loading-text="Mengirim..." variant="primary" />

                    <AuthButton @click="goToLogin" text="Kembali ke Login" variant="secondary" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'

// Set layout untuk halaman ini
definePageMeta({
    layout: 'auth',
    middleware: 'guest'
})

// Use fetch API composable and router
const { apiFetch } = useFetchApi()
const router = useRouter()
const route = useRoute()

// State
const verifying = ref(true)
const verified = ref(false)
const error = ref(false)
const statusMessage = ref('Mohon tunggu sementara kami memverifikasi email Anda...')
const successMessage = ref('')
const errorMessage = ref('')
const countdown = ref(5)
const canResend = ref(false)
const resending = ref(false)

// Get token from URL query
const token = ref('')

// Verify email on mount
onMounted(async () => {
    token.value = route.query.token as string || ''

    if (!token.value) {
        verifying.value = false
        error.value = true
        errorMessage.value = 'Token verifikasi tidak valid atau hilang. Silakan periksa email Anda untuk tautan yang benar.'
        canResend.value = true
        statusMessage.value = 'Verifikasi gagal'
        return
    }

    await verifyEmail()
})

// Verify email function
const verifyEmail = async () => {
    verifying.value = true
    error.value = false
    verified.value = false

    try {
        const response = await apiFetch<ApiResponse<null>>(`/api/auth/email/verify?token=${token.value}`, {
            method: 'GET'
        })

        if (response.success) {
            // Success
            verified.value = true
            verifying.value = false
            successMessage.value = response.message || 'Email berhasil diverifikasi. Anda sekarang dapat masuk ke akun Anda'
            statusMessage.value = 'Verifikasi berhasil!'

            // Start countdown
            startCountdown()
        } else {
            throw new Error(response.message || 'Verifikasi gagal')
        }

    } catch (err: any) {
        // console.error('Verification error:', err)
        // console.log('Error data:', err.data)
        // console.log('Error statusCode:', err.statusCode)

        verifying.value = false
        error.value = true
        statusMessage.value = 'Verifikasi gagal'

        // Handle specific errors
        if (err.statusCode === 404) {
            errorMessage.value = 'Token verifikasi tidak valid atau sudah digunakan'
            canResend.value = true
        } else if (err.statusCode === 400) {
            // Check if it's expired or just bad request
            if (err.data?.data?.message) {
                errorMessage.value = err.data.data.message
            } else {
                errorMessage.value = 'Token verifikasi telah kedaluwarsa. Silakan minta yang baru'
            }
            canResend.value = true
        } else if (err.data?.data?.message) {
            errorMessage.value = err.data.data.message
            canResend.value = true
        } else {
            errorMessage.value = 'Terjadi kesalahan saat verifikasi. Silakan coba lagi nanti.'
            canResend.value = true
        }
    }
}

// Start countdown timer
const startCountdown = () => {
    const interval = setInterval(() => {
        countdown.value--

        if (countdown.value <= 0) {
            clearInterval(interval)
            goToLogin()
        }
    }, 1000)
}

// Resend verification email
const resendVerification = async () => {
    resending.value = true

    try {
        const response = await apiFetch<ApiResponse<null>>('/api/auth/email/resend', {
            method: 'POST',
            body: {
                email: '' // User needs to provide email - we'll redirect to a form
            }
        })

        if (response.success) {
            errorMessage.value = 'Email verifikasi terkirim! Silakan periksa kotak masuk Anda.'
            canResend.value = false
        }
    } catch (err: any) {
        console.error('Resend error:', err)
        // For now, just redirect to login where they can request resend
        router.push('/auth/login')
    } finally {
        resending.value = false
    }
}

// Go to login page
const goToLogin = () => {
    router.push('/auth/login')
}
</script>
