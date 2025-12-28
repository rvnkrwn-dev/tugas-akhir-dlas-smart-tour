<template>
    <aside class="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300"
        :class="[
            isCollapsed ? 'w-20' : 'w-64',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]">
        <div class="flex flex-col h-full">
            <!-- Logo Section -->
            <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-200"
                :class="{ 'justify-center': isCollapsed }">
                <AppLogo :icon-only="isCollapsed">
                    <template #icon>
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <!-- Chart/Admin Icon -->
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </template>
                    <template #text>
                        <h1 class="text-base font-semibold text-[#333] whitespace-nowrap">Admin Panel</h1>
                        <p class="text-xs text-[#666] whitespace-nowrap">D'LAS Management</p>
                    </template>
                </AppLogo>
            </div>

            <!-- Navigation Menu -->
            <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-2">
                <!-- Group: Dashboard -->
                <div>
                    <div v-if="!isCollapsed"
                        class="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Dashboard
                    </div>
                    <NuxtLink to="/admin/dashboard" @mouseenter="showTooltip('Beranda', $event)"
                        @mouseleave="hideTooltip"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                        :class="[
                            isActive('/admin/dashboard')
                                ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                            isCollapsed ? 'justify-center' : ''
                        ]">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
                            leave-from-class="opacity-100" leave-to-class="opacity-0">
                            <span v-if="!isCollapsed" class="whitespace-nowrap">Beranda</span>
                        </Transition>
                    </NuxtLink>
                </div>

                <div class="h-px bg-gray-100 mx-3 my-2"></div>

                <!-- Group: Manajemen Tour -->
                <div>
                    <div v-if="!isCollapsed"
                        class="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Manajemen Tour
                    </div>
                    <div class="space-y-1">
                        <!-- Virtual Tour -->
                        <NuxtLink to="/admin/virtual-tour" @mouseenter="showTooltip('Tur Virtual', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/virtual-tour')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Tur Virtual</span>
                            </Transition>
                        </NuxtLink>

                        <!-- Attractions -->
                        <NuxtLink to="/admin/attractions" @mouseenter="showTooltip('Wahana', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/attractions')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Wahana</span>
                            </Transition>
                        </NuxtLink>

                        <!-- Tickets -->
                        <NuxtLink to="/admin/tickets" @mouseenter="showTooltip('Tiket', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/tickets')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Tiket</span>
                            </Transition>
                        </NuxtLink>
                    </div>
                </div>

                <div class="h-px bg-gray-100 mx-3 my-2"></div>

                <!-- Group: Transaksi -->
                <div>
                    <div v-if="!isCollapsed"
                        class="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Transaksi
                    </div>
                    <!-- Transactions -->
                    <NuxtLink to="/admin/transactions" @mouseenter="showTooltip('Transaksi', $event)"
                        @mouseleave="hideTooltip"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                        :class="[
                            isActive('/admin/transactions')
                                ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                            isCollapsed ? 'justify-center' : ''
                        ]">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
                            leave-from-class="opacity-100" leave-to-class="opacity-0">
                            <span v-if="!isCollapsed" class="whitespace-nowrap">Transaksi</span>
                        </Transition>
                    </NuxtLink>
                </div>

                <div class="h-px bg-gray-100 mx-3 my-2"></div>

                <!-- Group: Manajemen Pengguna -->
                <div>
                    <div v-if="!isCollapsed"
                        class="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Manajemen Pengguna
                    </div>
                    <div class="space-y-1">
                        <!-- Users -->
                        <NuxtLink to="/admin/users" @mouseenter="showTooltip('Pengguna', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/users')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Pengguna</span>
                            </Transition>
                        </NuxtLink>

                        <!-- Testimonials -->
                        <NuxtLink to="/admin/testimonials" @mouseenter="showTooltip('Testimoni', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/testimonials')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Testimoni</span>
                            </Transition>
                        </NuxtLink>
                    </div>
                </div>

                <div class="h-px bg-gray-100 mx-3 my-2"></div>

                <!-- Group: Sistem -->
                <div>
                    <div v-if="!isCollapsed"
                        class="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Sistem
                    </div>
                    <div class="space-y-1">
                        <!-- Inbox -->
                        <NuxtLink to="/admin/inbox" @mouseenter="showTooltip('Kotak Masuk', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/inbox')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Kotak Masuk</span>
                            </Transition>
                        </NuxtLink>

                        <!-- Settings -->
                        <NuxtLink to="/admin/settings" @mouseenter="showTooltip('Pengaturan', $event)"
                            @mouseleave="hideTooltip"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                            :class="[
                                isActive('/admin/settings')
                                    ? 'bg-[#4CAF50]/10 text-[#4CAF50] font-semibold border border-[#4CAF50]/20'
                                    : 'text-[#666] hover:bg-[#4CAF50]/5 hover:text-[#4CAF50] border border-transparent',
                                isCollapsed ? 'justify-center' : ''
                            ]">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <Transition enter-active-class="transition-opacity duration-200"
                                enter-from-class="opacity-0" enter-to-class="opacity-100"
                                leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <span v-if="!isCollapsed" class="whitespace-nowrap">Pengaturan</span>
                            </Transition>
                        </NuxtLink>
                    </div>
                </div>
            </nav>



            <!-- Back to Site Section -->
            <div class="border-t border-gray-200 p-3">
                <NuxtLink to="/" @mouseenter="showTooltip('Kembali ke Situs', $event)" @mouseleave="hideTooltip"
                    class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#666] hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 rounded-xl transition-all duration-200"
                    :class="isCollapsed ? 'justify-center' : 'justify-center'">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                        <span v-if="!isCollapsed">Kembali ke Situs</span>
                    </Transition>
                </NuxtLink>
            </div>
            <!-- Active Tooltip (Fixed position to escape overflow) -->
            <div v-if="tooltipState.show && isCollapsed"
                class="fixed left-20 z-50 px-3 py-2 bg-[#1a1a1a] text-white text-xs rounded-md shadow-lg transform -translate-y-1/2 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#1a1a1a]"
                :style="{ top: `${tooltipState.top}px` }">
                {{ tooltipState.label }}
            </div>
        </div>
    </aside>

    <!-- Mobile Overlay -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-show="isMobileOpen" @click="closeMobile"
            class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden">
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { user } = useAuth()
const route = useRoute()
const { isCollapsed, isMobileOpen, closeMobile } = useSidebarState()

// Tooltip State
const tooltipState = ref({
    show: false,
    label: '',
    top: 0
})

const showTooltip = (label: string, event: MouseEvent) => {
    if (!isCollapsed.value) return
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    tooltipState.value = {
        show: true,
        label,
        top: rect.top + (rect.height / 2)
    }
}

const hideTooltip = () => {
    tooltipState.value.show = false
}

// Computed
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

// Methods
const isActive = (path: string) => {
    return route.path === path || route.path.startsWith(path + '/')
}
</script>
