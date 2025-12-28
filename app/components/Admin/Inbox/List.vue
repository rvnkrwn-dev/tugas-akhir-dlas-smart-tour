<template>
    <div class="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <!-- Header: Search & Tabs -->
        <div class="p-3 md:p-4 border-b border-gray-200 flex-shrink-0 space-y-3 md:space-y-3">
            <h2 class="text-base md:text-lg font-bold text-[#333]">Kotak Masuk</h2>

            <!-- Search -->
            <div class="relative">
                <input :value="search" @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
                    type="text" placeholder="Cari pesan..."
                    class="w-full px-3 py-2 md:px-4 md:py-2.5 pl-9 md:pl-10 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                <svg class="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <!-- Tabs -->
            <div class="flex gap-1 p-1 bg-gray-50 rounded-lg">
                <button @click="$emit('filter', 'ALL')"
                    class="flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2"
                    :class="currentFilter === 'ALL' ? 'bg-white text-[#333] shadow-sm' : 'text-[#666] hover:text-[#333]'">
                    Semua Pesan
                    <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        :class="currentFilter === 'ALL' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'">
                        {{ stats.total }}
                    </span>
                </button>
                <button @click="$emit('filter', 'UNREAD')"
                    class="flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2"
                    :class="currentFilter === 'UNREAD' ? 'bg-white text-[#333] shadow-sm' : 'text-[#666] hover:text-[#333]'">
                    Belum Dibaca
                    <span v-if="stats.unread > 0" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        :class="currentFilter === 'UNREAD' ? 'bg-green-100 text-green-600' : 'bg-green-100 text-green-600'">
                        {{ stats.unread }}
                    </span>
                    <span v-else class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-500">
                        0
                    </span>
                </button>
            </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
            <div v-if="loading" class="p-3 md:p-4 space-y-3">
                <div v-for="i in 5" :key="i" class="animate-pulse flex gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 md:h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-2 md:h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                </div>
            </div>

            <div v-else-if="messages.length === 0"
                class="flex flex-col items-center justify-center h-full p-8 text-center text-[#999]">
                <svg class="w-10 h-10 md:w-12 md:h-12 mb-3 text-gray-200" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-xs md:text-sm">Tidak ada pesan ditemukan</p>
            </div>

            <div v-else class="divide-y divide-gray-100">
                <button v-for="msg in messages" :key="msg.id" @click="$emit('select', msg)"
                    class="w-full p-3.5 md:p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left relative group"
                    :class="selectedId === msg.id ? 'bg-[#4CAF50]/5 hover:bg-[#4CAF50]/10 border-l-4 border-l-[#4CAF50]' : 'border-l-4 border-l-transparent'">
                    <!-- Avatar -->
                    <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0 shadow-sm"
                        :class="generateAvatarColor(msg.fullName)">
                        {{ getInitials(msg.fullName) }}
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-0.5">
                            <h3 class="text-sm truncate pr-2"
                                :class="msg.isRead ? 'font-medium text-[#333]' : 'font-bold text-black'">
                                {{ msg.fullName }}
                            </h3>
                            <span class="text-[10px] md:text-xs text-[#999] whitespace-nowrap flex-shrink-0">
                                {{ formatTime(msg.createdAt) }}
                            </span>
                        </div>
                        <p class="text-xs truncate mb-0.5 md:mb-1 capitalize"
                            :class="msg.isRead ? 'text-[#666]' : 'text-[#333] font-semibold'">
                            {{ msg.subject }}
                        </p>
                        <p class="text-xs text-[#999] truncate">
                            {{ msg.message }}
                        </p>
                    </div>

                    <!-- Unread Indicator Dot -->
                    <div v-if="!msg.isRead"
                        class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#4CAF50] rounded-full">
                    </div>
                </button>

                <!-- Load More Trigger (if needed) or Pagination Footer could go here -->
            </div>
        </div>

        <!-- Pagination Footer -->
        <div class="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 flex-shrink-0">
            <button :disabled="!pagination.hasPrevPage" @click="$emit('page-change', pagination.currentPage - 1)"
                class="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-[#666]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <span class="text-xs text-[#666]">
                Halaman {{ pagination.currentPage }} dari {{ pagination.totalPages }}
            </span>
            <button :disabled="!pagination.hasNextPage" @click="$emit('page-change', pagination.currentPage + 1)"
                class="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-[#666]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
// immport type { InboxMessage } from '~/types/admin'


defineProps<{
    messages: any[];
    loading: boolean;
    search: string;
    currentFilter: string;
    selectedId: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
    };
    stats: {
        total: number;
        unread: number;
    };
}>();

defineEmits(['update:search', 'filter', 'select', 'page-change']);

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

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
    ];

    if (!name) return colors[0];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
</script>
