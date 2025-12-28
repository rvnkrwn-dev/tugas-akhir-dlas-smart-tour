<template>
    <div>
        <!-- Header -->
        <div class="text-center mb-8">
            <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-2">
                Reset Kata Sandi
            </h2>
            <p class="text-sm sm:text-base text-[#666]">
                Masukkan kata sandi baru Anda di bawah ini
            </p>
        </div>

        <!-- Reset Password Form -->
        <form @submit.prevent="handleResetPassword" class="space-y-5">
            <!-- Success Message -->
            <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-2xl">
                <p class="text-sm text-green-600 text-center">{{ successMessage }}</p>
            </div>

            <!-- General Error Message -->
            <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-2xl">
                <p class="text-sm text-red-600 text-center">{{ errors.general }}</p>
            </div>

            <!-- New Password Input -->
            <div>
                <AuthInput id="password" v-model="form.password" type="password" label="Kata Sandi Baru"
                    placeholder="Buat kata sandi yang kuat" :required="true" :error="errors.password"
                    :show-password-toggle="true" autocomplete="new-password" />

                <!-- Password Strength Indicator -->
                <div v-if="form.password" class="mt-3 space-y-2">
                    <!-- Strength Bar -->
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-300" :class="passwordStrength.barColor"
                                :style="{ width: passwordStrength.score + '%' }"></div>
                        </div>
                        <span class="text-xs font-bold" :class="passwordStrength.textColor">
                            {{ passwordStrength.label }}
                        </span>
                    </div>

                    <!-- Requirements Checklist -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 flex-shrink-0"
                                :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span :class="passwordChecks.minLength ? 'text-green-700' : 'text-gray-600'">8+
                                karakter</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 flex-shrink-0"
                                :class="passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-400'"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span :class="passwordChecks.hasUppercase ? 'text-green-700' : 'text-gray-600'">Huruf
                                besar</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 flex-shrink-0"
                                :class="passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-400'"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span :class="passwordChecks.hasLowercase ? 'text-green-700' : 'text-gray-600'">Huruf
                                kecil</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 flex-shrink-0"
                                :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span :class="passwordChecks.hasNumber ? 'text-green-700' : 'text-gray-600'">Angka</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 flex-shrink-0"
                                :class="passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span :class="passwordChecks.hasSpecial ? 'text-green-700' : 'text-gray-600'">Karakter
                                spesial</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirm Password Input -->
            <AuthInput id="confirmPassword" v-model="form.confirmPassword" type="password"
                label="Konfirmasi Kata Sandi Baru" placeholder="Masukkan ulang kata sandi Anda" :required="true"
                :error="errors.confirmPassword" :show-password-toggle="true" autocomplete="new-password" />

            <!-- Submit Button -->
            <AuthButton type="submit" text="Reset Kata Sandi" :loading="loading" loading-text="Memproses..."
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
import { ref, reactive, computed, onMounted } from 'vue'
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

// Get token from URL query
const token = ref('')

onMounted(() => {
    token.value = route.query.token as string || ''

    if (!token.value) {
        errors.general = 'Token reset tidak valid atau hilang. Silakan minta tautan reset kata sandi baru.'
    }
})

// Form state
const form = reactive({
    password: '',
    confirmPassword: ''
})

// Error state
const errors = reactive({
    password: '',
    confirmPassword: '',
    general: ''
})

// Loading and success state
const loading = ref(false)
const successMessage = ref('')

// Password validation checks (computed)
const passwordChecks = computed(() => {
    const pwd = form.password
    return {
        minLength: pwd.length >= 8,
        hasUppercase: /[A-Z]/.test(pwd),
        hasLowercase: /[a-z]/.test(pwd),
        hasNumber: /[0-9]/.test(pwd),
        hasSpecial: /[^A-Za-z0-9]/.test(pwd)
    }
})

// Password strength calculation
const passwordStrength = computed(() => {
    const checks = passwordChecks.value
    const totalChecks = 5
    const passedChecks = Object.values(checks).filter(Boolean).length
    const score = Math.round((passedChecks / totalChecks) * 100)

    if (score < 40) {
        return {
            score,
            label: 'Lemah',
            barColor: 'bg-red-500',
            textColor: 'text-red-600'
        }
    } else if (score < 70) {
        return {
            score,
            label: 'Cukup',
            barColor: 'bg-orange-500',
            textColor: 'text-orange-600'
        }
    } else if (score < 100) {
        return {
            score,
            label: 'Baik',
            barColor: 'bg-yellow-500',
            textColor: 'text-yellow-600'
        }
    } else {
        return {
            score,
            label: 'Kuat',
            barColor: 'bg-green-500',
            textColor: 'text-green-600'
        }
    }
})

// Handle reset password
const handleResetPassword = async () => {
    // Reset errors and success
    errors.password = ''
    errors.confirmPassword = ''
    errors.general = ''
    successMessage.value = ''

    // Validation
    if (!token.value) {
        errors.general = 'Token reset tidak valid atau hilang'
        return
    }

    if (!form.password) {
        errors.password = 'Kata sandi wajib diisi'
        return
    }

    if (form.password.length < 8) {
        errors.password = 'Kata sandi harus minimal 8 karakter'
        return
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Mohon konfirmasi kata sandi Anda'
        return
    }

    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Kata sandi tidak cocok'
        return
    }

    // Set loading
    loading.value = true

    try {
        // Call reset password API
        const response = await apiFetch<ApiResponse<null>>('/api/auth/password/reset', {
            method: 'POST',
            body: {
                token: token.value,
                password: form.password,
                confirmPassword: form.confirmPassword
            }
        })

        if (response.success) {
            // Show success message
            successMessage.value = response.message || 'Kata sandi berhasil direset. Anda sekarang dapat masuk dengan kata sandi baru Anda'

            // Clear form
            form.password = ''
            form.confirmPassword = ''

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } else {
            errors.general = response.message || 'Gagal mereset kata sandi. Silakan coba lagi.'
        }

    } catch (error: any) {
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
        // Handle specific error messages
        else if (error.data?.data?.message) {
            errors.general = error.data.data.message
        } else if (error.statusCode === 404) {
            errors.general = 'Token reset kata sandi tidak valid atau sudah digunakan'
        } else if (error.statusCode === 400) {
            if (error.data?.data?.message) {
                errors.general = error.data.data.message
            } else {
                errors.general = 'Token reset kata sandi telah kedaluwarsa. Silakan minta yang baru'
            }
        } else {
            errors.general = 'Terjadi kesalahan. Silakan coba lagi nanti.'
        }
    } finally {
        loading.value = false
    }
}
</script>
