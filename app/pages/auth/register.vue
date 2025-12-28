<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-2">
        Buat Akun
      </h2>
      <p class="text-sm sm:text-base text-[#666]">
        Bergabunglah dengan kami dan mulai perjalanan Anda hari ini
      </p>
    </div>

    <!-- Register Form -->
    <form @submit.prevent="handleRegister" class="space-y-5">
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
              Silakan coba lagi dalam <span class="font-bold">{{ formatRetryTime(rateLimitInfo.retryAfter) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Full Name -->
      <AuthInput id="fullName" v-model="form.fullName" type="text" label="Nama Lengkap" placeholder="John Doe"
        :required="true" :error="errors.fullName" autocomplete="name" />

      <!-- Email Input -->
      <AuthInput id="email" v-model="form.email" type="email" label="Alamat Email" placeholder="nama@contoh.com"
        :required="true" :error="errors.email" autocomplete="email" />

      <!-- Phone Input -->
      <AuthInput id="phone" v-model="form.phone" type="tel" label="Nomor Telepon (Opsional)"
        placeholder="+62 812 3456 7890" :error="errors.phone" autocomplete="tel" />

      <!-- Password Input -->
      <div>
        <AuthInput id="password" v-model="form.password" type="password" label="Kata Sandi"
          placeholder="Buat kata sandi yang kuat" :required="true" :error="errors.password" :show-password-toggle="true"
          autocomplete="new-password" />

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
                :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.minLength ? 'text-green-700' : 'text-gray-600'">8+ karakter</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0"
                :class="passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.hasUppercase ? 'text-green-700' : 'text-gray-600'">Huruf besar</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0"
                :class="passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.hasLowercase ? 'text-green-700' : 'text-gray-600'">Huruf kecil</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0"
                :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.hasNumber ? 'text-green-700' : 'text-gray-600'">Angka</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0"
                :class="passwordChecks.hasSpecial ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.hasSpecial ? 'text-green-700' : 'text-gray-600'">Karakter spesial</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0"
                :class="passwordChecks.noSequential ? 'text-green-600' : 'text-gray-400'" fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span :class="passwordChecks.noSequential ? 'text-green-700' : 'text-gray-600'">Tidak berurutan (123,
                abc)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Password -->
      <AuthInput id="confirmPassword" v-model="form.confirmPassword" type="password" label="Konfirmasi Kata Sandi"
        placeholder="Masukkan ulang kata sandi Anda" :required="true" :error="errors.confirmPassword"
        :show-password-toggle="true" autocomplete="new-password" />

      <!-- Terms & Conditions -->
      <div class="flex items-start">
        <input v-model="form.acceptTerms" id="terms" name="acceptTerms" type="checkbox"
          class="w-4 h-4 mt-1 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] focus:ring-offset-0" />
        <label for="terms" class="ml-2 text-sm text-[#666]">
          Saya menyetujui
          <NuxtLink to="/terms" class="text-[#4CAF50] hover:text-[#45a049] font-medium">Syarat Layanan</NuxtLink>
          dan
          <NuxtLink to="/privacy" class="text-[#4CAF50] hover:text-[#45a049] font-medium">Kebijakan Privasi</NuxtLink>
        </label>
      </div>
      <p v-if="errors.acceptTerms" class="text-sm text-red-600 -mt-3">
        {{ errors.acceptTerms }}
      </p>

      <!-- Submit Button -->
      <AuthButton type="submit" text="Buat Akun" :loading="loading" loading-text="Membuat akun..." variant="primary" />
    </form>

    <!-- Sign In Link -->
    <p class="mt-6 text-center text-sm text-[#666]">
      Sudah punya akun?
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
const router = useRouter()

// Form state
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Error state
const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: '',
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

// Password validation checks (computed)
const passwordChecks = computed(() => {
  const pwd = form.password
  return {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    noSequential: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pwd),
    noRepeated: !/(.)\1{2,}/.test(pwd)
  }
})

// Password strength calculation
const passwordStrength = computed(() => {
  const checks = passwordChecks.value
  const totalChecks = 7
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

// Handle register
const handleRegister = async () => {
  // Reset errors, success, and rate limit info
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  successMessage.value = ''
  rateLimitInfo.isLimited = false

  // Validation
  let hasError = false

  if (!form.fullName) {
    errors.fullName = 'Nama lengkap wajib diisi'
    hasError = true
  }

  if (!form.email) {
    errors.email = 'Email wajib diisi'
    hasError = true
  }

  if (!form.password) {
    errors.password = 'Kata sandi wajib diisi'
    hasError = true
  } else if (form.password.length < 8) {
    errors.password = 'Kata sandi harus minimal 8 karakter'
    hasError = true
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Mohon konfirmasi kata sandi Anda'
    hasError = true
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Kata sandi tidak cocok'
    hasError = true
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'Anda harus menyetujui syarat dan ketentuan'
    hasError = true
  }

  if (hasError) return

  // Set loading
  loading.value = true

  try {
    // Split full name into first and last name
    const nameParts = form.fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || undefined

    // Call register API using useFetchApi
    const response = await apiFetch<ApiResponse<{ user: any; emailSent: boolean }>>('/api/auth/register', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        firstName,
        lastName,
        phone: form.phone || undefined
      }
    })

    if (response.success) {
      // Show success message
      successMessage.value = response.message || 'Pendaftaran berhasil! Silakan periksa email Anda untuk memverifikasi akun.'

      // Clear form
      form.fullName = ''
      form.email = ''
      form.phone = ''
      form.password = ''
      form.confirmPassword = ''
      form.acceptTerms = false

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } else {
      // Technically apiFetch throws on error, so this might be unreachable if standardized,
      // but good for completeness if success is false but no error thrown
      errors.general = response.message || 'Pendaftaran gagal. Silakan coba lagi.'
    }

  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle validation errors from API
    // Standardized Error structure: error.data.data.errors array
    if (error.data?.data?.errors && Array.isArray(error.data.data.errors)) {
      const validationErrors = error.data.data.errors

      validationErrors.forEach((err: any) => {
        const field = err.field
        const message = err.message

        // Map API field names to form field names
        if (field === 'firstName' || field === 'lastName') {
          errors.fullName = message
        } else if (field in errors) {
          errors[field as keyof typeof errors] = message
        } else {
          // If field not found, add to general error
          if (!errors.general) {
            errors.general = message
          } else {
            errors.general += '; ' + message
          }
        }
      })
    }
    // Handle specific error codes
    else if (error.statusCode === 429) {
      // Rate limit exceeded
      rateLimitInfo.isLimited = true
      rateLimitInfo.message = error.data?.message || 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.'
      // Some APIs return retryAfter in data, standardize checked logic
      // Assuming standard error response doesn't strictly enforce retryAfter location yet, but check data
      // For now just show message

      errors.general = rateLimitInfo.message
    }
    else if (error.statusCode === 409) {
      errors.email = 'Email sudah terdaftar'
    } else if (error.data?.message) {
      errors.general = error.data.message
    } else {
      errors.general = 'Terjadi kesalahan. Silakan coba lagi nanti.'
    }
  } finally {
    loading.value = false
  }
}
</script>
