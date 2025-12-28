<template>
  <div
    class="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background blobs -->
    <div
      class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none">
    </div>
    <div
      class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#8BC34A]/10 rounded-full blur-3xl pointer-events-none">
    </div>

    <div class="max-w-xl w-full mx-auto relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4">
          <!-- Logo placeholder or icon -->
          <svg class="w-8 h-8 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
          Bagikan Pengalamanmu
        </h2>
        <p class="mt-2 text-gray-600">
          Bagaimana keseruan liburanmu di DLAS Smart Tour?
        </p>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div class="p-8">
          <UiAlert ref="alertRef" class="mb-6" />

          <!-- Loading/Validating State -->
          <div v-if="(loading || checkingToken) && !success && !tokenError" class="text-center py-12">
            <svg class="animate-spin h-10 w-10 text-[#4CAF50] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <p class="text-gray-500">Memproses...</p>
          </div>

          <!-- Token Error State -->
          <div v-else-if="tokenError" class="text-center py-12">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Link Tidak Valid</h3>
            <p class="text-gray-600 mb-6">Link review ini kadaluarsa atau tidak ditemukan.</p>
            <NuxtLink to="/" class="inline-flex items-center text-[#4CAF50] hover:text-[#45a049] font-medium">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </NuxtLink>
          </div>


          <!-- Success View -->
          <div v-else-if="success" class="text-center py-12">
            <div
              class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 scale-100">
              <svg class="w-10 h-10 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h3>
            <p class="text-gray-600 mb-8 max-w-sm mx-auto">
              Review kamu sangat berarti bagi kami untuk terus meningkatkan pelayanan.
            </p>
            <NuxtLink to="/"
              class="inline-flex items-center justify-center px-8 py-3 bg-[#4CAF50] text-white font-medium rounded-xl hover:bg-[#45a049] transition-all">
              Kembali ke Beranda
            </NuxtLink>
          </div>

          <!-- Form View -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Rating -->
            <div class="flex flex-col items-center space-y-4">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Berikan Rating
              </label>
              <div class="flex items-center gap-2 sm:gap-4">
                <button v-for="star in 5" :key="star" type="button" @click="form.rating = star"
                  @mouseenter="hoverRating = star" @mouseleave="hoverRating = 0"
                  class="group relative focus:outline-none transition-transform active:scale-95"
                  :class="(hoverRating || form.rating) >= star ? 'scale-110' : 'scale-100'">
                  <svg class="w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 filter drop-shadow-sm"
                    :class="(hoverRating || form.rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-200 group-hover:text-gray-300'"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
                    fill="none">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              </div>
              <div class="h-6">
                <transition enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-2">
                  <p v-if="form.rating > 0" class="text-[#4CAF50] font-bold text-lg">
                    {{ getRatingLabel(form.rating) }}
                  </p>
                </transition>
              </div>
            </div>

            <!-- Comment Input -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label for="comment" class="text-sm font-semibold text-gray-700">
                  Ceritakan Pengalamanmu
                </label>
                <span class="text-xs text-gray-400" :class="{ 'text-red-500': form.comment.length > 1000 }">
                  {{ form.comment.length }}/1000
                </span>
              </div>
              <div class="relative">
                <textarea id="comment" v-model="form.comment" rows="5"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] transition-all resize-none text-gray-800 placeholder-gray-400"
                  placeholder="Apa yang paling kamu sukai? Pelayanan, fasilitas, atau suasananya?"></textarea>
                <!-- Helper icons or text could go here -->
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="loading || !isValid"
              class="w-full py-4 bg-[#4CAF50] text-white font-bold rounded-2xl hover:bg-[#45a049] hover:-translate-y-0.5 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              Kirim Review Link
            </button>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center space-y-2">
        <p class="text-xs text-gray-400">
          &copy; {{ new Date().getFullYear() }} DLAS Smart Tour
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Remove auth middleware
definePageMeta({
  layout: 'default'
})

// Imports
import { ref, reactive, computed, onMounted } from 'vue'
import { useFetchApi } from '~/composables/useFetchApi'
import type { ApiResponse } from '~/types/api'

// State
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const checkingToken = ref(true)
const success = ref(false)
const hoverRating = ref(0)
const alertRef = ref()
const tokenError = ref(false)
const { apiFetch } = useFetchApi()

const token = computed(() => route.query.token as string)

const form = reactive({
  rating: 0,
  comment: ''
})

// Validation
const isValid = computed(() => {
  return form.rating > 0 && form.comment.length >= 10 && form.comment.length <= 1000 && !tokenError.value
})

// Check token on mount
onMounted(async () => {
  if (!token.value) {
    tokenError.value = true
    checkingToken.value = false
    setTimeout(() => {
      alertRef.value?.show({
        type: 'error',
        title: 'Link Tidak Valid',
        message: 'Link review ini tidak valid atau sudah kadaluarsa. Silakan cek email Anda kembali.'
      })
    }, 500)
    return
  }

  try {
    const response = await apiFetch<ApiResponse<{ testimonial: any }>>('/api/testimonials/check-token', {
      query: { token: token.value }
    })

    if (response.data?.testimonial?.isCompleted) {
      success.value = true
    }
  } catch (error) {
    console.error("Token check failed:", error)
    tokenError.value = true
  } finally {
    checkingToken.value = false
  }
})

// Helpers
const getRatingLabel = (star: number) => {
  const labels = [
    'Sangat Buruk',
    'Buruk',
    'Cukup',
    'Bagus',
    'Sangat Bagus!'
  ]
  return labels[star - 1] || ''
}

// Handlers
const handleSubmit = async () => {
  if (!isValid.value) return

  loading.value = true
  success.value = false

  try {
    const response = await apiFetch<ApiResponse<{ testimonial: any }>>('/api/testimonials/submit', {
      method: 'POST',
      body: {
        token: token.value,
        rating: form.rating,
        comment: form.comment
      }
    })

    success.value = true
    form.rating = 0
    form.comment = ''

    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (error: any) {
    console.error('Failed to submit review:', error)
    const msg = error.data?.message || error.data?.data?.message || 'Gagal mengirim review. Silakan coba lagi.'

    if (alertRef.value?.show) {
      alertRef.value.show({
        type: 'error',
        title: 'Error',
        message: msg
      })
    } else {
      alert(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>
