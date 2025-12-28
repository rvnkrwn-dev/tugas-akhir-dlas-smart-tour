<template>
    <div class="space-y-4 md:space-y-6">
        <!-- Header -->
        <!-- Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Notifications</h1>
                    <p class="text-xs sm:text-sm text-[#666]">Stay updated with latest activities</p>
                </div>
                <div>
                    <button @click="markAllAsRead"
                        class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-50 hover:bg-green-100 text-green-600 font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Mark all as read</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Notification List -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div v-if="pending" class="p-8 text-center text-gray-500">
                Loading notifications...
            </div>

            <div v-else-if="notifications.length === 0"
                class="p-8 md:p-12 flex flex-col items-center justify-center text-[#999]">
                <div class="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 md:w-8 md:h-8 text-gray-300" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <p class="text-sm">No notifications yet</p>
            </div>

            <div v-else class="divide-y divide-gray-100">
                <NuxtLink v-for="notification in notifications" :key="notification.id" to="/admin/inbox"
                    class="block p-3.5 md:p-6 hover:bg-gray-50 transition-colors group relative"
                    :class="{ 'bg-blue-50/30': !notification.isRead }">
                    <div class="flex gap-3 md:gap-4">
                        <!-- Icon/Avatar -->
                        <div class="flex-shrink-0">
                            <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm"
                                :class="generateAvatarColor(notification.fullName)">
                                {{ getInitials(notification.fullName) }}
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h3 class="text-sm font-bold text-[#333]">{{ notification.fullName }}</h3>
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <span class="text-[10px] md:text-xs text-[#999]">{{
                                        formatDate(notification.createdAt) }}</span>
                                    <div v-if="!notification.isRead"
                                        class="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                </div>
                            </div>
                            <p class="text-xs md:text-sm text-[#444] font-medium mb-0.5 md:mb-1 truncate">{{
                                notification.subject }}</p>
                            <p class="text-xs md:text-sm text-[#666] line-clamp-1 break-all">{{ notification.message }}
                            </p>
                        </div>
                    </div>
                </NuxtLink>
            </div>

            <!-- Pagination/Load More (Optional) -->
            <div class="p-3 md:p-4 border-t border-gray-100 bg-gray-50 text-center">
                <p class="text-[10px] md:text-xs text-[#999]">Showing recent notifications</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: ['auth']
})

const { apiFetch } = useFetchApi()

// Fetch Data
const { data, pending, refresh } = await useAsyncData('admin-all-notifications', () =>
    apiFetch('/api/admin/inbox', {
        query: { limit: 50 } // Display more items for the full page
    })
)

const notifications = computed(() => data.value?.data?.messages || [])

/* --- Helpers --- */
const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}

const generateAvatarColor = (name: string) => {
    const colors = [
        'bg-gradient-to-br from-red-400 to-red-500',
        'bg-gradient-to-br from-orange-400 to-orange-500',
        'bg-gradient-to-br from-amber-400 to-amber-500',
        'bg-gradient-to-br from-green-400 to-green-500',
        'bg-gradient-to-br from-emerald-400 to-emerald-500',
        'bg-gradient-to-br from-teal-400 to-teal-500',
        'bg-gradient-to-br from-cyan-400 to-cyan-500',
        'bg-gradient-to-br from-sky-400 to-sky-500',
        'bg-gradient-to-br from-blue-400 to-blue-500',
        'bg-gradient-to-br from-indigo-400 to-indigo-500',
        'bg-gradient-to-br from-violet-400 to-violet-500',
        'bg-gradient-to-br from-purple-400 to-purple-500',
        'bg-gradient-to-br from-fuchsia-400 to-fuchsia-500',
        'bg-gradient-to-br from-pink-400 to-pink-500',
        'bg-gradient-to-br from-rose-400 to-rose-500'
    ]
    if (!name) return colors[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const markAllAsRead = async () => {
    try {
        await apiFetch('/api/admin/inbox/read-all', {
            method: 'PATCH'
        })
        await refresh()
        // Optional: Update header stats too if possible, but the route watch in header should handle it on navigation or poll
    } catch (error) {
        console.error('Failed to mark all as read', error)
    }
}
</script>
