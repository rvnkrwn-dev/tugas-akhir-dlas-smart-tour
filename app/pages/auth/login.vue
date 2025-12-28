<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl sm:text-3xl font-black text-[#333] mb-2">
        Selamat Datang Kembali
      </h2>
      <p class="text-sm sm:text-base text-[#666]">
        Masuk ke akun Anda untuk melanjutkan
      </p>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
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

      <!-- Email Input -->
      <AuthInput id="email" v-model="form.email" type="email" label="Alamat Email" placeholder="nama@contoh.com"
        :required="true" :error="errors.email" autocomplete="email" />

      <!-- Password Input -->
      <AuthInput id="password" v-model="form.password" type="password" label="Kata Sandi"
        placeholder="Masukkan kata sandi Anda" :required="true" :error="errors.password" :show-password-toggle="true"
        autocomplete="current-password" />

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label for="remember" class="flex items-center cursor-pointer">
          <input id="remember" name="remember" v-model="form.remember" type="checkbox"
            class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] focus:ring-offset-0" />
          <span class="ml-2 text-sm text-[#666]">Ingat saya</span>
        </label>

        <NuxtLink to="/auth/forgot-password"
          class="text-sm text-[#4CAF50] hover:text-[#45a049] transition-colors font-medium">
          Lupa kata sandi?
        </NuxtLink>
      </div>

      <!-- Submit Button -->
      <AuthButton type="submit" text="Masuk" :loading="loading" loading-text="Sedang masuk..." variant="primary" />
    </form>

    <!-- Sign Up Link -->
    <p class="mt-6 text-center text-sm text-[#666]">
      Belum punya akun?
      <NuxtLink to="/auth/register" class="font-bold text-[#4CAF50] hover:text-[#45a049] transition-colors">
        Daftar gratis
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Set layout untuk halaman ini
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

// Use auth composable
const { login, isAuthenticated, user } = useAuth()
const router = useRouter()

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false
})

// Error state
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

// Loading state
const loading = ref(false)

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

// Handle login
const handleLogin = async () => {
  // Reset errors and rate limit info
  errors.email = ''
  errors.password = ''
  errors.general = ''
  rateLimitInfo.isLimited = false

  // Basic validation
  if (!form.email) {
    errors.email = 'Email wajib diisi'
    return
  }

  if (!form.password) {
    errors.password = 'Kata sandi wajib diisi'
    return
  }

  // Set loading
  loading.value = true

  try {
    // Call login from useAuth
    const success = await login({
      email: form.email,
      password: form.password
    })

    if (success) {
      // Login successful - redirect based on role
      const userRole = user.value?.role

      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        // Redirect admin users to admin dashboard
        await router.push('/admin/dashboard')
      } else if (userRole === 'SCANNER') {
        // Redirect scanner users to scanner page
        await router.push('/scanner')
      } else {
        // Redirect regular users to home page
        await router.push('/')
      }
    } else {
      errors.general = 'Login gagal. Silakan coba lagi.'
    }

  } catch (error: any) {
    // Handle error
    // Handle error
    // console.error('Login error:', error)

    // Handle validation errors from API
    if (error.data?.data?.error?.details?.errors && Array.isArray(error.data.data.error.details.errors)) {
      const validationErrors = error.data.data.error.details.errors
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
      rateLimitInfo.message = error.data?.data?.message ||
        'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
      rateLimitInfo.retryAfter = error.data?.data?.error?.details?.retryAfter || 0

      // Don't set errors.general for rate limit - let the warning box handle it
    }
    // Handle specific error messages
    else if (error.data?.data?.message) {
      errors.general = error.data.data.message
    } else if (error.statusCode === 401) {
      errors.general = 'Email atau kata sandi salah'
    } else if (error.statusCode === 403) {
      errors.general = 'Akun tidak aktif. Silakan hubungi dukungan pelanggan.'
    } else {
      errors.general = 'Terjadi kesalahan. Silakan coba lagi nanti.'
    }
  } finally {
    loading.value = false
  }
}
</script>
