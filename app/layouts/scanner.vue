<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <AppHeader />

        <!-- Main Container -->
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pt-24 sm:pt-28 lg:pt-32">
            <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <!-- Sidebar Navigation (Desktop) -->
                <aside class="hidden lg:block lg:w-72 flex-shrink-0">
                    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
                        <!-- User Info -->
                        <div class="bg-blue-50 p-6 border-b border-gray-100">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl ring-4 ring-white">
                                    {{ userInitials }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-base font-bold text-gray-900 truncate">{{ userName }}</p>
                                    <p class="text-sm text-gray-600 truncate">Scanner Staff</p>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation Menu -->
                        <nav class="p-3 space-y-1">
                            <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                                class="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                                active-class="!bg-blue-600 !text-white">
                                <component :is="item.icon"
                                    class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                                <div class="flex-1">
                                    <div class="font-bold">{{ item.label }}</div>
                                    <div class="text-xs opacity-75">{{ item.description }}</div>
                                </div>
                                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </NuxtLink>

                            <!-- Logout/Exit -->
                            <button @click="handleExit"
                                class="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group mt-4">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span class="font-bold">Keluar</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                <!-- Mobile Navigation (Tabs) -->
                <nav
                    class="lg:hidden bg-white/80 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 z-50 pb-safe">
                    <div class="flex justify-around items-center px-2 py-2">
                        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                            class="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors"
                            active-class="text-blue-600 bg-blue-50">
                            <component :is="item.icon" class="w-6 h-6" />
                            <span class="text-[10px] font-medium">{{ item.label }}</span>
                        </NuxtLink>

                        <!-- Mobile Exit -->
                        <button @click="handleExit"
                            class="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl text-red-500 hover:bg-red-50">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span class="text-[10px] font-medium">Keluar</span>
                        </button>
                    </div>
                </nav>

                <!-- Main Content Area -->
                <main class="flex-1 min-w-0 pb-20 lg:pb-0">
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

const { user, logout } = useAuth()

const userName = computed(() => {
    if (!user.value) return 'Scanner'
    const profile = user.value.user_profiles
    if (profile?.firstName) return profile.firstName
    return user.value.email.split('@')[0]
})

const userInitials = computed(() => {
    if (!user.value) return 'S'
    return (userName.value.charAt(0) || 'S').toUpperCase()
})

const handleExit = async () => {
    // If Admin, go to dashboard. If dedicated scanner user, logout?
    if (user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN') {
        navigateTo('/admin/dashboard')
    } else {
        await logout()
        navigateTo('/auth/login')
    }
}

const navItems = [
    {
        label: 'Scan QR',
        path: '/scanner',
        description: 'Pindai tiket pengunjung',
        icon: h('svg', {
            class: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'
            })
        ])
    },
    {
        label: 'Riwayat',
        path: '/scanner/history',
        description: 'Log aktivitas scan',
        icon: h('svg', {
            class: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
        }, [
            h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
            })
        ])
    }
]
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
