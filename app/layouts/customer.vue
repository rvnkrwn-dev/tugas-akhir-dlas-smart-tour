<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <AppHeader />

        <!-- Main Container with padding for fixed header -->
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pt-24 sm:pt-28 lg:pt-32">
            <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <!-- Sidebar Navigation (Desktop) -->
                <aside class="hidden lg:block lg:w-72 flex-shrink-0">
                    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
                        <!-- User Info -->
                        <div class="bg-green-50 p-6 border-b border-gray-100">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-xl ring-4 ring-white">
                                    {{ userInitials }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-base font-bold text-gray-900 truncate">{{ userName }}</p>
                                    <p class="text-sm text-gray-600 truncate">{{ userEmail }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation Menu -->
                        <nav class="p-3 space-y-1">
                            <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                                class="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all duration-200 group"
                                active-class="!bg-green-600 !text-white">
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
                        </nav>
                    </div>
                </aside>

                <!-- Mobile Navigation (Tabs) -->
                <div class="lg:hidden bg-white rounded-2xl border border-gray-100 p-2 mb-4">
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
                        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                            class="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                            active-class="!bg-green-600 !text-white">
                            <component :is="item.icon" class="w-4 h-4" />
                            <span>{{ item.label }}</span>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Main Content Area -->
                <main class="flex-1 min-w-0">
                    <slot />
                </main>
            </div>
        </div>

        <!-- Footer -->
        <AppFooter />

        <!-- Global Cart Components -->
        <CartButton />
        <CartDrawer />

        <!-- Virtual Tour FAB Button -->
        <VirtualTourFab />
    </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

// Use auth composable
const { user } = useAuth()

// User info
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

// Navigation items
const navItems = [
    {
        label: 'Profil Saya',
        path: '/profile',
        description: 'Kelola akun Anda',
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
                d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            })
        ])
    },
    {
        label: 'Tiket Saya',
        path: '/my-tickets',
        description: 'Lihat tiket Anda',
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
                d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
            })
        ])
    },
    {
        label: 'Transaksi Saya',
        path: '/transactions',
        description: 'Riwayat transaksi',
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
                d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            })
        ])
    }
]
</script>
