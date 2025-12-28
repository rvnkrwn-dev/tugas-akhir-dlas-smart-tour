<template>
    <div class="h-full bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div v-if="!message" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#999]">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-[#333] mb-1">Pilih pesan</h3>
            <p class="text-sm">Pilih pesan dari daftar untuk melihat detail</p>
        </div>

        <template v-else>
            <!-- Header -->
            <div class="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <div class="flex justify-between items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <h1 class="text-lg md:text-2xl font-bold text-[#333] leading-tight capitalize">{{ message.subject }}
                    </h1>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <a :href="`mailto:${message.email}?subject=Re: ${message.subject}`"
                            class="p-1.5 md:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Balas">
                            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </a>
                        <button @click="$emit('delete', message.id)"
                            class="p-1.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus">
                            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-3 md:gap-4">
                    <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-sm"
                        :class="generateAvatarColor(message.fullName)">
                        {{ getInitials(message.fullName) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-0.5 md:gap-0">
                            <h3 class="font-bold text-[#333] text-sm md:text-base truncate">{{ message.fullName }}</h3>
                            <span class="text-xs md:text-sm text-[#666] whitespace-nowrap">{{
                                formatDate(message.createdAt) }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs md:text-sm text-[#666] truncate">
                            <span class="truncate">{{ message.email }}</span>
                            <span class="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                            <span class="truncate">{{ message.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-4 md:p-6">
                <div
                    class="prose max-w-none text-[#333] whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
                    {{ message.message }}
                </div>
            </div>

            <!-- Footer Reply Action -->
            <div class="p-3 md:p-6 border-t border-gray-100 flex-shrink-0">
                <a :href="`mailto:${message.email}?subject=Re: ${message.subject}`"
                    class="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 md:px-4 md:py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-xs md:text-sm font-medium rounded-lg transition-colors">
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Balas via Email</span>
                </a>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    message: any;
}>();

defineEmits(['delete']);

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
