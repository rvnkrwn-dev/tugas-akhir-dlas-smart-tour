<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">Riwayat Scan</h1>
            <button @click="refresh"
                class="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <!-- Content -->
        <div v-if="pending" class="space-y-4">
            <div v-for="n in 5" :key="n" class="bg-white p-4 rounded-xl border border-gray-100 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>

        <div v-else-if="error" class="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
            <p class="text-red-600 mb-2">Gagal memuat riwayat.</p>
            <button @click="refresh" class="text-sm font-bold text-red-700 underline">Coba Lagi</button>
        </div>

        <div v-else-if="logs.length === 0" class="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Belum ada aktivitas</h3>
            <p class="text-gray-500 text-sm">Aktivitas scan tiket Anda akan muncul di sini.</p>
        </div>

        <div v-else class="space-y-4">
            <div v-for="log in logs" :key="log.id"
                class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                <div class="flex items-start gap-4">
                    <div
                        class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <p class="text-xs text-gray-500 font-medium">{{ formatDate(log.createdAt) }}</p>
                            <span class="text-xs text-gray-400">{{ formatTime(log.createdAt) }}</span>
                        </div>
                        <h3 class="text-sm font-bold text-gray-800">{{ log.description }}</h3>
                        <p class="text-xs text-gray-500 mt-1 truncate">ID: {{ log.entityId }}</p>
                    </div>
                </div>
            </div>

            <!-- Load More (Simple) -->
            <div v-if="hasMore" class="text-center pt-4">
                <button @click="loadMore"
                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors">
                    Muat Lebih Banyak
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFetchApi } from '~/composables/useFetchApi'

definePageMeta({
    layout: 'scanner',
    middleware: ['auth']
})

const { apiFetch } = useFetchApi()
const logs = ref<any[]>([])
const pending = ref(true)
const error = ref(null)
const page = ref(1)
const hasMore = ref(false)

const fetchData = async (reset = false) => {
    if (reset) {
        page.value = 1
        pending.value = true
        logs.value = []
    }

    try {
        const res: any = await apiFetch(`/api/scanner/history`, {
            query: { page: page.value, limit: 10 }
        })

        if (reset) {
            logs.value = res.data.logs
        } else {
            logs.value.push(...res.data.logs)
        }

        hasMore.value = page.value < res.data.pagination.totalPages
    } catch (err: any) {
        error.value = err
    } finally {
        pending.value = false
    }
}

const refresh = () => fetchData(true)
const loadMore = () => {
    page.value++
    fetchData()
}

// Initial load
onMounted(() => {
    fetchData(true)
})

// Helpers
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>
