<template>
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Transaksi Saya</h1>
        <p class="text-base text-gray-600 mt-2">Lihat riwayat pembelian dan status pesanan lengkap Anda</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div class="flex flex-col sm:flex-row justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                <div class="space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-32"></div>
                    <div class="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div class="h-8 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-2xl p-8 text-center border border-red-100">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 class="text-lg font-bold text-red-900 mb-2">Gagal memuat transaksi</h3>
        <p class="text-red-600 mb-6">{{ error.message || 'Terjadi kesalahan yang tidak terduga' }}</p>
        <button @click="() => fetchTransactions()"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
            Coba Lagi
        </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="max-w-md mx-auto">
            <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Transaksi</h2>
            <p class="text-gray-600 mb-8">
                Anda belum melakukan pembelian apapun. Riwayat transaksi Anda akan muncul di sini.
            </p>
            <NuxtLink to="/wahana"
                class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
                <span>Jelajahi Wahana</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </NuxtLink>
        </div>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-6">
        <div v-for="transaction in transactions" :key="transaction.id"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300">
            <!-- Header -->
            <div
                class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-bold text-gray-900">#{{ transaction.transactionCode }}</span>
                        <span class="text-xs text-gray-500">• {{ formatDate(transaction.createdAt) }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span :class="getStatusClasses(transaction.status)"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {{ getStatusLabel(transaction.status) }}
                    </span>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Items list summary -->
                <div class="space-y-3 mb-6">
                    <div v-for="item in transaction.transaction_items" :key="item.id"
                        class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                <img v-if="item.attractions?.imageUrl" :src="item.attractions.imageUrl"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-gray-900">{{ item.attractions?.name }}</p>
                                <p class="text-xs text-gray-500">{{ item.quantity }} x {{ formatPrice(item.unitPrice) }}
                                </p>
                            </div>
                        </div>
                        <p class="text-sm font-medium text-gray-900">{{ formatPrice(item.totalPrice) }}</p>
                    </div>
                </div>

                <!-- Footer / Total -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p class="text-xs text-gray-500">Total Pembayaran</p>
                        <p class="text-lg font-black text-gray-900">{{ formatPrice(transaction.totalAmount) }}</p>
                    </div>
                    <button @click="showDetails(transaction)"
                        class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>

        <!-- Pagination (Simple) -->
        <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 mt-8">
            <button @click="changePage(pagination.currentPage - 1)" :disabled="!pagination.hasPrevPage"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Sebelumnya
            </button>
            <span class="px-4 py-2 text-sm text-gray-600">
                Halaman {{ pagination.currentPage }} dari {{ pagination.totalPages }}
            </span>
            <button @click="changePage(pagination.currentPage + 1)" :disabled="!pagination.hasNextPage"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Selanjutnya
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'

// Page meta
definePageMeta({
    layout: 'customer',
    middleware: 'auth'
})

// SEO
useHead({
    title: 'Transaksi Saya - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Lihat riwayat transaksi dan detail pesanan Anda' }
    ]
})

// Composables
const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// State
const loading = ref(true)
const transactions = ref<any[]>([])
const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
})
const error = ref<any>(null)

// Methods
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PAID': return 'LUNAS'
        case 'COMPLETED': return 'SELESAI'
        case 'PENDING': return 'MENUNGGU'
        case 'FAILED': return 'GAGAL'
        case 'CANCELLED': return 'DIBATALKAN'
        case 'REFUNDED': return 'DIKEMBALIKAN'
        default: return status
    }
}

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'PAID':
        case 'COMPLETED':
            return 'bg-green-100 text-green-800'
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800'
        case 'FAILED':
        case 'CANCELLED':
            return 'bg-red-100 text-red-800'
        case 'REFUNDED':
            return 'bg-purple-100 text-purple-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const fetchTransactions = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
        const response = await apiFetch<ApiResponse<{ transactions: any[], pagination: any }>>(`/api/purchase/history?page=${page}&limit=10`)
        if (response.success && response.data) {
            transactions.value = response.data.transactions
            pagination.value = response.data.pagination
        }
    } catch (err: any) {
        console.error('Failed to fetch transactions:', err)
        error.value = err
        alert.error('Error', 'Gagal memuat riwayat transaksi.')
    } finally {
        loading.value = false
    }
}

const changePage = (page: number) => {
    if (page > 0 && page <= pagination.value.totalPages) {
        fetchTransactions(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const showDetails = (transaction: any) => {
    // Basic Alert for now, can be upgraded to modal
    const itemsList = transaction.transaction_items.map((i: any) =>
        `- ${i.attractions?.name} (${i.quantity}x)`
    ).join('\n')

    alert.info(
        `Transaksi ${transaction.transactionCode}`,
        `Status: ${getStatusLabel(transaction.status)}\nTotal: ${formatPrice(transaction.totalAmount)}\n\nItem:\n${itemsList}`
    )
}

// Lifecycle
onMounted(() => {
    fetchTransactions()
})
</script>
