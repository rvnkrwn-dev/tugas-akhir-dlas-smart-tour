<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <!-- Clean Header with Organic Memphis Style -->
    <div class="bg-[#F9F9F9]/95 backdrop-blur-md border-b border-gray-200">
      <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="block">
            <AppLogo />
          </NuxtLink>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-1">
            <template v-for="link in navigation" :key="link.path">
              <!-- Dropdown Menu -->
              <div v-if="link.children" class="relative group">
                <button :class="[
                  'flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-2xl transition-all duration-200',
                  link.isActive
                    ? '!text-[#4CAF50] !bg-[#4CAF50]/10'
                    : 'text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 group-hover:text-[#4CAF50] group-hover:bg-[#4CAF50]/5'
                ]">
                  {{ link.label }}
                  <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Dropdown Content -->
                <div
                  class="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                  <NuxtLink v-for="child in link.children" :key="child.label" :to="child.path"
                    class="block px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                    {{ child.label }}
                  </NuxtLink>
                </div>
              </div>

              <!-- Regular Link -->
              <NuxtLink v-else :to="link.path"
                class="px-4 py-2 text-sm font-bold text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-2xl transition-all duration-200"
                active-class="!text-[#4CAF50] !bg-[#4CAF50]/10">
                {{ link.label }}
              </NuxtLink>
            </template>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-2 sm:gap-3">

            <!-- Auth Buttons (Desktop - Not Logged In) -->
            <div v-if="!isLoggedIn" class="hidden sm:flex items-center gap-2">
              <NuxtLink to="/auth/login"
                class="px-4 py-2 text-sm font-bold text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-2xl transition-all duration-200">
                Masuk
              </NuxtLink>
              <NuxtLink to="/auth/register"
                class="px-5 py-2 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm">
                Daftar
              </NuxtLink>
            </div>

            <!-- Profile Dropdown (Desktop - Logged In) -->
            <div v-else class="relative hidden sm:block" ref="profileDropdown">
              <button @click="toggleProfileDropdown"
                class="flex items-center gap-2 px-2 py-2 rounded-2xl hover:bg-[#4CAF50]/5 transition-all duration-200">
                <div
                  class="w-8 h-8 bg-[#4CAF50] rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md">
                  {{ userInitials }}
                </div>
                <span class="hidden lg:inline text-sm font-bold text-[#333] max-w-[100px] truncate">{{ userName
                }}</span>
                <svg class="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Profile Dropdown Menu -->
              <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-show="isProfileDropdownOpen"
                  class="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-gray-200 py-2 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-bold text-[#333] truncate">{{ userName }}</p>
                    <p class="text-xs text-[#666] truncate">{{ userEmail }}</p>
                    <p v-if="user" class="text-xs text-[#4CAF50] font-bold mt-1">{{ user.role }}</p>
                  </div>

                  <!-- Admin Menu -->
                  <template v-if="isAdmin || isSuperAdmin">
                    <NuxtLink to="/admin/dashboard"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Panel Admin</span>
                    </NuxtLink>
                  </template>

                  <!-- Scanner Menu -->
                  <template v-if="isScanner || isSuperAdmin">
                    <NuxtLink to="/scanner"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span>Pindai Tiket</span>
                    </NuxtLink>
                  </template>

                  <!-- Customer Menu -->
                  <template v-if="isCustomer || isSuperAdmin">
                    <NuxtLink to="/my-tickets"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>Tiket Saya</span>
                    </NuxtLink>
                    <NuxtLink to="/transactions"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Transaksi Saya</span>
                    </NuxtLink>
                  </template>

                  <!-- Common Menu (My Profile) -->
                  <NuxtLink to="/profile"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Saya</span>
                  </NuxtLink>

                  <div class="border-t border-gray-100 mt-2 pt-2">
                    <button @click="handleLogout"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Mobile Menu Button -->
            <button @click="toggleMobileMenu" aria-label="Toggle mobile menu"
              class="lg:hidden p-2 text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-2xl transition-all duration-200">
              <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-show="isMobileMenuOpen" class="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div class="container mx-auto px-4 sm:px-6 py-4 space-y-1">
          <template v-for="link in navigation" :key="link.path">
            <!-- Mobile Dropdown -->
            <div v-if="link.children" class="space-y-1">
              <button @click="toggleMobileSubmenu(link.label)" :class="[
                'flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200',
                link.isActive
                  ? '!text-[#4CAF50] !bg-[#4CAF50]/10'
                  : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50]'
              ]">
                <span>{{ link.label }}</span>
                <svg class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': openMobileSubmenu === link.label }" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div v-show="openMobileSubmenu === link.label" class="pl-4 space-y-1">
                <NuxtLink v-for="child in link.children" :key="child.label" :to="child.path"
                  @click="isMobileMenuOpen = false"
                  class="block px-4 py-2.5 text-sm font-medium text-[#666] hover:text-[#4CAF50] rounded-xl transition-colors">
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>

            <!-- Regular Mobile Link -->
            <NuxtLink v-else :to="link.path" @click="isMobileMenuOpen = false"
              class="block px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200"
              active-class="!text-[#4CAF50] !bg-[#4CAF50]/10">
              {{ link.label }}
            </NuxtLink>
          </template>

          <div v-if="!isLoggedIn" class="pt-3 border-t border-gray-200 space-y-2">
            <NuxtLink to="/auth/login" @click="isMobileMenuOpen = false"
              class="block px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
              Masuk
            </NuxtLink>
            <NuxtLink to="/auth/register" @click="isMobileMenuOpen = false"
              class="block px-4 py-3 bg-[#4CAF50] text-white font-bold rounded-full text-center shadow-md">
              Daftar
            </NuxtLink>
          </div>

          <div v-else class="pt-3 border-t border-gray-200 space-y-1">
            <div class="px-4 py-2">
              <p class="text-sm font-bold text-[#333] truncate">{{ userName }}</p>
              <p class="text-xs text-[#666] truncate">{{ userEmail }}</p>
              <p v-if="user" class="text-xs text-[#4CAF50] font-bold mt-1">{{ user.role }}</p>
            </div>

            <!-- Admin Menu -->
            <template v-if="isAdmin || isSuperAdmin">
              <NuxtLink to="/admin/dashboard" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard Admin</span>
              </NuxtLink>
              <NuxtLink to="/admin/users" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Kelola Pengguna</span>
              </NuxtLink>
              <NuxtLink to="/admin/attractions" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Kelola Wahana</span>
              </NuxtLink>
            </template>

            <!-- Scanner Menu -->
            <template v-if="isScanner || isSuperAdmin">
              <NuxtLink to="/scanner" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Pindai Tiket</span>
              </NuxtLink>
            </template>

            <!-- Customer Menu -->
            <template v-if="isCustomer || isSuperAdmin">
              <NuxtLink to="/my-tickets" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span>Tiket Saya</span>
              </NuxtLink>
              <NuxtLink to="/transactions" @click="isMobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Transaksi Saya</span>
              </NuxtLink>
            </template>

            <!-- Common Menu (My Profile) -->
            <NuxtLink to="/profile" @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] rounded-2xl transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profil Saya</span>
            </NuxtLink>

            <button @click="handleLogout"
              class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 w-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '~/stores/cart'

// Use auth composable
const { user, isAuthenticated, logout } = useAuth()

// Use cart store
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

// Navigation Links
const navLinks = [
  { label: 'Beranda', path: '/' },
  { label: 'Jelajah D\'LAS', path: '/jelajah-dlas' },
  {
    label: 'Wahana',
    path: '/wahana',
    children: [
      { label: 'Tiket dan Paket Wisata', path: '/wahana' } // Assuming same path for now, or use query params if implemented
    ]
  },
  { label: 'Hubungi Kami', path: '/hubungi-kami' },
]

// State
const isMobileMenuOpen = ref(false)
const openMobileSubmenu = ref<string | null>(null) // Track open submenu
const isLangDropdownOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const isCartDropdownOpen = ref(false)
const currentLang = ref('ID')

// Helper function to check if a path is active
const isPathActive = (path: string) => {
  if (path === '/') return route.path === '/'
  // Correctly check for path segment boundary
  return route.path === path || route.path.startsWith(path + '/')
}

// Computes navigation with active state
const navigation = computed(() => {
  console.log('Current Route Path:', route.path)
  return navLinks.map(link => {
    const isSelfActive = isPathActive(link.path)
    const isChildActive = link.children
      ? link.children.some(child => isPathActive(child.path))
      : false

    console.log(`Link: ${link.label}, Path: ${link.path}, Active: ${isSelfActive || isChildActive}`)

    return {
      ...link,
      isActive: isSelfActive || isChildActive
    }
  })
})

// User computed properties
const isLoggedIn = computed(() => isAuthenticated.value)
const userName = computed(() => {
  if (!user.value) return 'Tamu'
  const profile = user.value.user_profiles
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`
  }
  if (profile?.firstName) {
    return profile.firstName
  }
  return user.value.email.split('@')[0]
})
const userEmail = computed(() => user.value?.email || '')
const userInitials = computed(() => {
  if (!user.value) return 'G'
  const profile = user.value.user_profiles
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  }
  if (profile?.firstName) {
    return profile.firstName.charAt(0).toUpperCase()
  }
  return user.value.email.charAt(0).toUpperCase()
})

// Role computed properties
const isAdmin = computed(() => user.value?.role === 'ADMIN')
const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN')
const isScanner = computed(() => user.value?.role === 'SCANNER')
const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

// Refs
const langDropdown = ref<HTMLElement | null>(null)
const profileDropdown = ref<HTMLElement | null>(null)
const cartDropdown = ref<HTMLElement | null>(null)

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isLangDropdownOpen.value = false
    isProfileDropdownOpen.value = false
  }
}

const toggleMobileSubmenu = (label: string) => {
  if (openMobileSubmenu.value === label) {
    openMobileSubmenu.value = null
  } else {
    openMobileSubmenu.value = label
  }
}

const toggleLangDropdown = () => {
  isLangDropdownOpen.value = !isLangDropdownOpen.value
  isProfileDropdownOpen.value = false
  isCartDropdownOpen.value = false
}

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
  isLangDropdownOpen.value = false
  isCartDropdownOpen.value = false
}

const toggleCartDropdown = () => {
  isCartDropdownOpen.value = !isCartDropdownOpen.value
  isLangDropdownOpen.value = false
  isProfileDropdownOpen.value = false
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const setLanguage = (lang: string) => {
  currentLang.value = lang
  isLangDropdownOpen.value = false
  // TODO: Implement i18n language switching
}

// Use alert composable
const { alert } = useAlert()

const handleLogout = async () => {
  const confirmed = await alert.confirm(
    'Konfirmasi Keluar',
    'Apakah Anda yakin ingin keluar dari akun Anda?',
    'Ya, Keluar',
    'Batal'
  )

  if (!confirmed) return

  try {
    await logout()
    isProfileDropdownOpen.value = false
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (langDropdown.value && !langDropdown.value.contains(event.target as Node)) {
    isLangDropdownOpen.value = false
  }
  if (profileDropdown.value && !profileDropdown.value.contains(event.target as Node)) {
    isProfileDropdownOpen.value = false
  }
  if (cartDropdown.value && !cartDropdown.value.contains(event.target as Node)) {
    isCartDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
