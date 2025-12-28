<template>
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Tiket Saya</h1>
        <p class="text-base text-gray-600 mt-2">Lihat dan kelola semua tiket aktif dan riwayat Anda</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="h-48 bg-gray-200 animate-pulse"></div>
            <div class="p-6 space-y-4">
                <div class="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div class="space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
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
        <h3 class="text-lg font-bold text-red-900 mb-2">Gagal memuat tiket</h3>
        <p class="text-red-600 mb-6">{{ error.message || 'Terjadi kesalahan yang tidak terduga' }}</p>
        <button @click="fetchTickets"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
            Coba Lagi
        </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="tickets.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="max-w-md mx-auto">
            <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Tiket</h2>
            <p class="text-gray-600 mb-8">
                Anda belum membeli tiket apapun. Jelajahi wahana kami dan mulai petualangan Anda!
            </p>
            <NuxtLink to="/wahana"
                class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
                <span>Jelajahi Wahana</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </NuxtLink>
        </div>
    </div>

    <!-- Tickets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="ticket in tickets" :key="ticket.id"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 group">
            <!-- Header/Status -->
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {{ formatDate(ticket.createdAt) }}
                </span>
                <span :class="getStatusClasses(ticket.status)"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                    {{ getStatusLabel(ticket.status) }}
                </span>
            </div>

            <!-- QR Code Section -->
            <div
                class="p-8 bg-white flex flex-col items-center justify-center border-b border-gray-50 bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:16px_16px]">
                <div
                    class="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                    <img v-if="ticket.qrCode" :src="ticket.qrCode" :alt="ticket.ticketCode"
                        class="w-32 h-32 object-contain" />
                    <div v-else class="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
                        <span class="text-xs">Tidak Ada QR</span>
                    </div>
                </div>
                <p class="mt-4 text-sm font-mono font-bold text-gray-600 tracking-wider select-all">{{ ticket.ticketCode
                    }}</p>
            </div>

            <!-- Ticket Details -->
            <div class="p-6">
                <!-- Attractions List -->
                <div class="space-y-4 mb-6">
                    <div v-for="detail in ticket.ticket_details" :key="detail.id" class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img v-if="detail.attractions.imageUrl" :src="detail.attractions.imageUrl"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-gray-900 truncate">{{ detail.attractions.name }}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {{ detail.totalQty }} Tiket
                                </span>
                                <span class="text-xs text-gray-500" v-if="detail.remainingQty > 0">
                                    {{ detail.remainingQty }} Tersisa
                                </span>
                                <span class="text-xs text-red-500" v-else>
                                    Habis
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-2 gap-3">
                    <button @click="showTicketDetails(ticket)"
                        class="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors border border-gray-200">
                        Detail
                    </button>
                    <button @click="downloadTicket(ticket)"
                        class="w-full py-2.5 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl text-sm transition-colors border border-green-200 flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh
                    </button>
                </div>
            </div>
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
    title: 'Tiket Saya - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Lihat dan kelola tiket yang telah Anda beli' }
    ]
})

// Composables
const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// State
const loading = ref(true)
const tickets = ref<any[]>([])
const error = ref<any>(null)

// Methods
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'AKTIF'
        case 'PARTIALLY_USED': return 'TERPAKAI SEBAGIAN'
        case 'FULLY_USED': return 'TERPAKAI SEMUA'
        case 'EXPIRED': return 'KEDALUWARSA'
        case 'CANCELLED': return 'DIBATALKAN'
        default: return status
    }
}

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-100 text-green-800'
        case 'PARTIALLY_USED':
            return 'bg-blue-100 text-blue-800'
        case 'FULLY_USED':
            return 'bg-gray-100 text-gray-800 line-through decoration-gray-400'
        case 'EXPIRED':
            return 'bg-red-100 text-red-800'
        case 'CANCELLED':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const fetchTickets = async () => {
    loading.value = true
    error.value = null
    try {
        const response = await apiFetch<ApiResponse<{ tickets: any[], pagination: any }>>('/api/purchase/my-tickets')
        if (response.success && response.data) {
            tickets.value = response.data.tickets
        }
    } catch (err: any) {
        console.error('Failed to fetch tickets:', err)
        error.value = err
        alert.error('Error', 'Gagal memuat tiket. Silakan coba lagi.')
    } finally {
        loading.value = false
    }
}

const showTicketDetails = (ticket: any) => {
    // Implement detailed view / modal if needed
    // For now, simple alert or reusable modal
    alert.info('Detail Tiket', `ID Tiket: ${ticket.id}\nBerlaku Sampai: ${formatDate(ticket.validUntil)}`)
}

const downloadTicket = async (ticket: any) => {
    // Implement PDF download or image save
    alert.info('Segera Hadir', 'Fitur unduh tiket akan segera hadir!')
}

// Lifecycle
onMounted(() => {
    fetchTickets()
})
</script>
