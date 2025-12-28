<template>
  <div class="min-h-screen bg-[#F9F9F9] relative overflow-hidden">
    <!-- Memphis Decorations -->
    <div class="absolute top-10 right-10 w-12 h-12 text-[#4CAF50] opacity-10 hidden md:block">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
    <div class="absolute bottom-20 left-20 w-10 h-10 text-[#FF9800] opacity-15 hidden md:block">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 22,22 2,22" />
      </svg>
    </div>
    <div class="absolute top-1/3 left-10 w-8 h-8 text-[#4CAF50] opacity-10 hidden md:block">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    </div>

    <!-- Auth Container -->
    <div class="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div class="w-full max-w-md">
        <!-- Logo/Brand -->
        <AuthBrand class="mb-6 sm:mb-8" />

        <!-- Auth Card -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <slot />
        </div>

        <!-- Back to Home Link -->
        <div class="text-center mt-4 sm:mt-6">
          <NuxtLink to="/"
            class="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#4CAF50] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="font-medium">Kembali ke Beranda</span>
          </NuxtLink>
        </div>

        <!-- Footer Links -->
        <AuthFooter class="mt-4 sm:mt-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Layout khusus untuk halaman authentication (login, register, forgot password, dll)

// State
const isLangDropdownOpen = ref(false)
const currentLang = ref('ID')

// Refs
const langDropdown = ref<HTMLElement | null>(null)

// Methods
const toggleLangDropdown = () => {
  isLangDropdownOpen.value = !isLangDropdownOpen.value
}

const setLanguage = (lang: string) => {
  currentLang.value = lang
  isLangDropdownOpen.value = false
  // TODO: Implement actual i18n language switching
}

// Close dropdown on outside click
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (langDropdown.value && !langDropdown.value.contains(target)) {
    isLangDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
