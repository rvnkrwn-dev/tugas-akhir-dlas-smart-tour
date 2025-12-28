<template>
    <header class="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div class="flex items-center px-4 sm:px-6 lg:px-8 py-3 gap-4">
            <!-- Sidebar Toggle Button (Desktop) -->
            <div class="hidden lg:block relative group">
                <button @click="toggleCollapse"
                    class="p-2 text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-xl transition-all duration-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <!-- Panel/Sidebar Icon -->
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-18h10a2 2 0 012 2v14a2 2 0 01-2 2H9m0-18v18" />
                    </svg>
                </button>
                <!-- Tooltip -->
                <div
                    class="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {{ isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar' }}
                </div>
            </div>

            <button @click="toggleMobileOpen"
                class="lg:hidden p-2 text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-xl transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            </button>

            <!-- Separator -->
            <div class="h-6 w-px bg-gray-300"></div>

            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-2 text-sm flex-1 min-w-0">
                <NuxtLink to="/admin/dashboard"
                    class="text-[#666] hover:text-[#4CAF50] transition-colors font-medium truncate">
                    Beranda
                </NuxtLink>
                <template v-if="currentPageName !== 'Dashboard'">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="text-[#333] font-semibold truncate">{{ currentPageNameIndonesian }}</span>
                </template>
            </nav>

            <!-- Right Actions -->
            <div class="flex items-center gap-2">
                <!-- Notifications -->
                <!-- Notifications -->
                <div class="relative" ref="notificationDropdown">
                    <button @click="toggleNotification"
                        class="relative p-2 text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-xl transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span v-if="unreadCount > 0"
                            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <!-- Notification Dropdown -->
                    <Transition enter-active-class="transition ease-out duration-200"
                        enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-95">
                        <div v-show="isNotificationOpen"
                            class="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 overflow-hidden z-50">
                            <div
                                class="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 class="font-bold text-[#333] text-sm sm:text-base">Notifikasi</h3>
                                <span
                                    class="text-[10px] sm:text-xs font-medium text-[#4CAF50] bg-green-50 px-2 py-1 rounded-full">{{
                                        unreadCount }} Baru</span>
                            </div>

                            <div class="max-h-[60vh] sm:max-h-[300px] overflow-y-auto">
                                <div v-if="loadingNotifications"
                                    class="p-4 text-center text-xs sm:text-sm text-gray-500">
                                    Memuat...
                                </div>
                                <div v-else-if="unreadMessages.length === 0"
                                    class="p-6 sm:p-8 text-center text-gray-500 flex flex-col items-center">
                                    <svg class="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 mb-2" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p class="text-xs sm:text-sm">Tidak ada notifikasi baru</p>
                                </div>
                                <NuxtLink v-for="msg in unreadMessages" :key="msg.id" to="/admin/inbox"
                                    @click="isNotificationOpen = false"
                                    class="block px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                    <div class="flex justify-between items-start mb-1">
                                        <p class="text-xs sm:text-sm font-semibold text-[#333] truncate pr-2">{{
                                            msg.fullName }}</p>
                                        <span class="text-[10px] text-gray-400 whitespace-nowrap">{{
                                            formatDateShort(msg.createdAt)
                                        }}</span>
                                    </div>
                                    <p class="text-[10px] sm:text-xs text-gray-600 truncate">{{ msg.subject }}</p>
                                </NuxtLink>
                            </div>

                            <div class="border-t border-gray-100 p-2">
                                <NuxtLink to="/admin/notifications" @click="isNotificationOpen = false"
                                    class="block w-full text-center py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-lg transition-colors">
                                    Lihat Semua Pesan
                                </NuxtLink>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- User Profile Dropdown -->
                <div class="relative" ref="profileDropdown">
                    <button @click="toggleProfileDropdown"
                        class="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#4CAF50]/5 transition-all duration-200">
                        <div
                            class="w-8 h-8 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                            {{ userInitials }}
                        </div>
                        <svg class="w-4 h-4 text-[#666] hidden sm:block" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <Transition enter-active-class="transition ease-out duration-200"
                        enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-95">
                        <div v-show="isProfileDropdownOpen"
                            class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 overflow-hidden">
                            <div class="px-4 py-3 border-b border-gray-100">
                                <p class="text-sm font-semibold text-[#333] truncate">{{ userName }}</p>
                                <p class="text-xs text-[#666] truncate">{{ userEmail }}</p>
                                <p class="text-xs text-[#4CAF50] font-semibold mt-1">{{ userRole }}</p>
                            </div>

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
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Composables
const { user, logout } = useAuth()
const router = useRouter()
const route = useRoute()
const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebarState()

// State
const isProfileDropdownOpen = ref(false)
const profileDropdown = ref<HTMLElement | null>(null)
const isNotificationOpen = ref(false)
const notificationDropdown = ref<HTMLElement | null>(null)
const unreadMessages = ref<any[]>([])
const loadingNotifications = ref(false)

// Computed
const currentPageName = computed(() => {
    const path = route.path
    if (path === '/admin/dashboard') return 'Dashboard'
    if (path.startsWith('/admin/users')) return 'Users'
    if (path.startsWith('/admin/attractions')) return 'Attractions'
    if (path.startsWith('/admin/tickets')) return 'Tickets'
    if (path.startsWith('/admin/transactions')) return 'Transactions'
    if (path.startsWith('/admin/inbox')) return 'Inbox'
    if (path.startsWith('/admin/virtual-tour')) return 'Virtual Tour'
    if (path.startsWith('/admin/testimonials')) return 'Testimonials'
    if (path.startsWith('/admin/settings')) return 'Settings'
    if (path.startsWith('/admin/notifications')) return 'Notifications'
    return 'Page'
})

const currentPageNameIndonesian = computed(() => {
    const path = route.path
    if (path === '/admin/dashboard') return 'Beranda'
    if (path.startsWith('/admin/users')) return 'Pengguna'
    if (path.startsWith('/admin/attractions')) return 'Wahana'
    if (path.startsWith('/admin/tickets')) return 'Tiket'
    if (path.startsWith('/admin/transactions')) return 'Transaksi'
    if (path.startsWith('/admin/inbox')) return 'Kotak Masuk'
    if (path.startsWith('/admin/virtual-tour')) return 'Tur Virtual'
    if (path.startsWith('/admin/testimonials')) return 'Testimoni'
    if (path.startsWith('/admin/settings')) return 'Pengaturan'
    if (path.startsWith('/admin/notifications')) return 'Notifikasi'
    return 'Halaman'
})

const userName = computed(() => {
    if (!user.value) return 'Admin'
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
    if (!user.value) return 'A'
    const profile = user.value.user_profiles
    if (profile?.firstName && profile?.lastName) {
        return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    }
    if (profile?.firstName) {
        return profile.firstName.charAt(0).toUpperCase()
    }
    return user.value.email.charAt(0).toUpperCase()
})

const userRole = computed(() => {
    return user.value?.role || 'ADMIN'
})

// Notifications
const { apiFetch } = useFetchApi()

const checkUnreadMessages = async () => {
    try {
        const res = await apiFetch('/api/admin/inbox', {
            query: { limit: 1 } // Minimal fetch just for stats
        })
        return res.data?.stats?.unread || 0
    } catch (e) {
        return 0
    }
}

const { data: unreadCount, refresh: refreshNotifications } = await useAsyncData(
    'admin-notifications',
    () => checkUnreadMessages(),
    {
        watch: [() => route.path]
    }
)

const fetchUnreadMessages = async () => {
    loadingNotifications.value = true
    try {
        const res = await apiFetch('/api/admin/inbox', {
            query: { limit: 5, isRead: 'false' }
        })
        unreadMessages.value = res.data?.messages || []
    } catch (e) {
        console.error('Failed to fetch notifications', e)
    } finally {
        loadingNotifications.value = false
    }
}

const toggleNotification = async () => {
    isNotificationOpen.value = !isNotificationOpen.value
    if (isNotificationOpen.value) {
        await fetchUnreadMessages()
    }
}

const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Methods
const toggleProfileDropdown = () => {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value
}

const { alert } = useAlert()
const handleLogout = async () => {
    const confirmed = await alert.confirm(
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar dari panel admin?',
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

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    if (profileDropdown.value && !profileDropdown.value.contains(event.target as Node)) {
        isProfileDropdownOpen.value = false
    }
    if (notificationDropdown.value && !notificationDropdown.value.contains(event.target as Node)) {
        isNotificationOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // Poll every 30s for new messages
    const interval = setInterval(() => {
        refreshNotifications()
    }, 30000)

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
        clearInterval(interval)
    })
})
</script>
