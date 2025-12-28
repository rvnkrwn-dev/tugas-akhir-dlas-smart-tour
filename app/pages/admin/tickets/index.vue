<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Manajemen Tiket</h2>
                    <p class="text-xs sm:text-sm text-[#666]">Pantau dan kelola penjualan serta validasi tiket</p>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Total Tiket</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.totalTickets }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-gray-400">Volume seumur hidup</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Tiket Aktif</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.activeTickets }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        stats.metrics.activeRate }}%</span>
                    <span class="text-gray-400">dari total</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Digunakan Hari Ini</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.today.usedCount }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium"
                        v-if="stats.today.usageGrowth > 0">+{{ stats.today.usageGrowth }}%</span>
                    <span class="text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-medium" v-else>{{
                        stats.today.usageGrowth }}%</span>
                    <span class="text-gray-400">vs kemarin</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Segera Kedaluwarsa</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.expiringSoon }}</h3>
                <p class="text-xs text-gray-400 mt-2">7 hari ke depan</p>
            </div>
        </div>

        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="ticket_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="ticket_search" name="ticket_search" v-model="searchQuery" type="text"
                            placeholder="Cari kode tiket, email pengguna..."
                            class="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                            @input="handleSearch">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="w-full sm:w-48 lg:w-56">
                    <label for="ticket_status"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                    <div class="relative">
                        <select id="ticket_status" v-model="statusFilter" @change="changePage(1)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                            <option value="">Semua Status</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="PARTIALLY_USED">Sebagian Digunakan</option>
                            <option value="FULLY_USED">Sudah Digunakan</option>
                            <option value="EXPIRED">Kedaluwarsa</option>
                            <option value="CANCELLED">Dibatalkan</option>
                            <option value="REFUNDED">Dikembalikan</option>
                        </select>
                        <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tickets Table -->
        <UiTable :columns="columns" :data="tickets" :loading="loading" :error="error" no-data-message="Tidak ada tiket ditemukan"
            no-data-sub-message="Coba sesuaikan filter atau kata kunci pencarian Anda">

            <!-- Ticket Code -->
            <template #cell-ticketCode="{ row: item }">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <div>
                        <p class="font-bold text-[#333] font-mono">{{ item.ticketCode }}</p>
                        <p class="text-xs text-[#666]">{{ formatDate(item.visitDateFrom) }}</p>
                    </div>
                </div>
            </template>

            <!-- User -->
            <template #cell-user="{ row: item }">
                <div v-if="item.purchase_transactions?.users" class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-green-600/20">
                        {{ getUserInitials(item.purchase_transactions.users) }}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-[#333]">{{ getUserName(item.purchase_transactions.users) }}</p>
                        <p class="text-xs text-[#666]">{{ item.purchase_transactions.users.email }}</p>
                    </div>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
            </template>

            <!-- Attraction -->
            <template #cell-attraction="{ row: item }">
                <div v-if="item.ticket_details?.[0]?.attractions" class="flex items-center gap-2">
                    <span class="text-sm font-medium text-[#333]">{{ item.ticket_details[0].attractions.name }}</span>
                    <span v-if="item.ticket_details.length > 1"
                        class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        +{{ item.ticket_details.length - 1 }}
                    </span>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
            </template>

            <!-- Qty -->
            <template #cell-qty="{ row: item }">
                <div class="text-sm">
                    <span class="font-bold text-[#333]">{{ calculateTotalQty(item) }}</span>
                    <span class="text-[#666]"> tiket</span>
                </div>
            </template>

            <!-- Status -->
            <template #cell-status="{ row: item }">
                <UiBadge :variant="getTicketStatusVariant(item.status)">
                    {{ formatStatus(item.status) }}
                </UiBadge>
            </template>

            <!-- Actions -->
            <template #cell-actions="{ row: item }">
                <div class="relative">
                    <button @click.stop="toggleActionMenu(item.id)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="activeActionMenu === item.id"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 overflow-hidden">
                        <!-- View Details -->
                        <button @click="viewTicket(item); toggleActionMenu(null)"
                            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Detail
                        </button>
                    </div>

                    <!-- Backdrop to close -->
                    <div v-if="activeActionMenu === item.id" @click="toggleActionMenu(null)"
                        class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
                </div>
            </template>

            <!-- Footer Pagination -->
            <template #footer>
                <UiPagination v-if="tickets.length > 0" :current-page="pagination.currentPage"
                    :total-pages="pagination.totalPages" :total-items="pagination.totalItems"
                    :items-per-page="pagination.limit" :has-prev-page="pagination.hasPrevPage"
                    :has-next-page="pagination.hasNextPage" item-name="tickets" @change="changePage" />
            </template>
        </UiTable>

        <!-- Ticket Detail Modal -->
        <UiModal v-model="showDetailModal" title="Detail Tiket" size="lg" :show-default-footer="false">
            <div v-if="selectedTicket" class="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">

                <!-- Ticket Header Card (Fixed) -->
                <div
                    class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 sm:p-5 border border-orange-200/50 flex-shrink-0 mb-4">
                    <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        <!-- QR Placeholder -->
                        <div
                            class="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 p-1">
                            <!-- Placeholder for QR Code -->
                            <svg class="w-full h-full text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm8 4h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-2h2v2h-2v-2zm-2 2h2v2h-2v-2z" />
                            </svg>
                        </div>

                        <div class="flex-1 min-w-0 w-full">
                            <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-1 font-mono tracking-wide">{{
                                selectedTicket.ticketCode }}</h3>
                            <div class="flex items-center gap-2 text-xs sm:text-sm text-[#666] mb-3">
                                <span>Tanggal Pembelian: {{ formatDate(selectedTicket.createdAt) }}</span>
                            </div>

                            <!-- Badges -->
                            <div class="flex flex-wrap gap-2">
                                <span :class="[
                                    'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                                    getTicketStatusClass(selectedTicket.status)
                                ]">
                                    {{ formatStatus(selectedTicket.status) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex border-b border-gray-200 mb-4 flex-shrink-0">
                    <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                        class="px-4 py-2 text-sm font-medium transition-colors relative"
                        :class="activeTab === tab.id ? 'text-[#4CAF50]' : 'text-[#666] hover:text-[#333]'">
                        {{ tab.label }}
                        <div v-if="activeTab === tab.id"
                            class="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] rounded-t-full"></div>
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="flex-1 overflow-y-auto pr-1">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'" class="space-y-4">

                        <!-- Attraction Info -->
                        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 class="text-sm font-bold text-[#333] mb-3 flex items-center gap-2">
                                <svg class="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Detail Wahana
                            </h4>
                            <div v-for="detail in selectedTicket.ticket_details" :key="detail.id"
                                class="mb-3 last:mb-0 border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-3">
                                        <img v-if="detail.attractions?.imageUrl" :src="detail.attractions.imageUrl"
                                            class="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="">
                                        <div>
                                            <p class="text-sm font-bold text-[#333]">{{ detail.attractions?.name ||
                                                'Wahana Tidak Diketahui' }}</p>
                                            <p class="text-xs text-[#666]">{{ formatDate(detail.visitDate) }}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-bold text-[#333]">{{ detail.totalQty }} Tiket</p>
                                        <p class="text-xs text-[#666]">Dipesan</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- User Info -->
                        <!-- User Info -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 class="text-sm font-bold text-[#333]">Informasi Pengguna</h4>
                            </div>
                            <div class="p-4 space-y-3" v-if="selectedTicket.purchase_transactions?.users">
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Nama</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        getUserName(selectedTicket.purchase_transactions.users) }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Email</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        selectedTicket.purchase_transactions.users.email }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">No. Telepon</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        selectedTicket.purchase_transactions.users.user_profiles?.phone || '-' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Transaction Info -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 class="text-sm font-bold text-[#333]">Info Transaksi</h4>
                            </div>
                            <div class="p-4 space-y-3" v-if="selectedTicket.purchase_transactions">
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Kode Transaksi</span>
                                    <span class="text-sm font-mono font-medium text-[#333]">{{
                                        selectedTicket.purchase_transactions.transactionCode }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Total Bayar</span>
                                    <span class="text-sm font-bold text-[#4CAF50]">{{
                                        formatCurrency(selectedTicket.purchase_transactions.totalAmount,
                                            selectedTicket.purchase_transactions.currency) }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Status Pembayaran</span>
                                    <UiBadge
                                        :variant="selectedTicket.purchase_transactions.status === 'PAID' ? 'success' : 'warning'">
                                        {{ selectedTicket.purchase_transactions.status }}
                                    </UiBadge>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Timeline Tab (Mock for now or basic data) -->
                    <div v-if="activeTab === 'timeline'" class="space-y-4">
                        <div class="relative pl-6 pb-4 border-l border-gray-200 last:border-0 last:pb-0">
                            <div
                                class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-green-100">
                            </div>
                            <div class="flex justify-between items-start gap-4">
                                <div>
                                    <p class="text-sm font-bold text-[#333]">Tiket Dibuat</p>
                                    <p class="text-xs text-[#666] mt-0.5">Tiket dihasilkan setelah pembayaran berhasil</p>
                                </div>
                                <span class="text-xs text-[#999] whitespace-nowrap">{{
                                    formatDate(selectedTicket.createdAt,
                                        true) }}</span>
                            </div>
                        </div>
                        <div v-if="selectedTicket.updatedAt > selectedTicket.createdAt"
                            class="relative pl-6 pb-4 border-l border-gray-200 last:border-0 last:pb-0">
                            <div
                                class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-100">
                            </div>
                            <div class="flex justify-between items-start gap-4">
                                <div>
                                    <p class="text-sm font-bold text-[#333]">Terakhir Diperbarui</p>
                                    <p class="text-xs text-[#666] mt-0.5">Status atau detail diperbarui</p>
                                </div>
                                <span class="text-xs text-[#999] whitespace-nowrap">{{
                                    formatDate(selectedTicket.updatedAt,
                                        true) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-auto flex-shrink-0">
                    <button @click="showDetailModal = false"
                        class="px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Tutup
                    </button>
                    <!-- Future actions: Refund, Resend Email etc. -->
                </div>
            </div>
        </UiModal>

    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
})

const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// --- Types ---
interface Ticket {
    id: string
    ticketCode: string
    status: string
    visitDateFrom: string
    createdAt: string
    updatedAt: string
    purchase_transactions: {
        transactionCode: string
        totalAmount: number
        currency: string
        status: string
        users: {
            email: string
            user_profiles?: {
                firstName?: string
                lastName?: string
                phone?: string
            }
        }
    }
    ticket_details: Array<{
        id: string
        totalQty: number
        visitDate: string
        attractions: {
            name: string
            imageUrl?: string
        }
    }>
}

interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    slot?: boolean
}

// --- State ---
const tickets = ref<Ticket[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const page = ref(1)
let searchTimeout: any = null
const stats = ref({
    overview: {
        totalTickets: 0,
        activeTickets: 0,
        expiringSoon: 0
    },
    metrics: {
        activeRate: 0
    },
    today: {
        usedCount: 0,
        usageGrowth: 0
    }
})

const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
})

// Modal State
const showDetailModal = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const activeTab = ref<string>('overview')

const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'timeline', label: 'Linimasa' }
]

const columns: TableColumn[] = [
    { key: 'ticketCode', label: 'Kode Tiket', slot: true },
    { key: 'user', label: 'Pengguna', slot: true },
    { key: 'attraction', label: 'Wahana', slot: true },
    { key: 'qty', label: 'Jml', align: 'center', slot: true },
    { key: 'status', label: 'Status', align: 'center', slot: true },
    { key: 'actions', label: '', align: 'right', slot: true }
]

// --- Fetch Data ---
const fetchTicketStats = async () => {
    try {
        const response: any = await apiFetch('/api/admin/dashboard/tickets')
        if (response.success) {
            stats.value = response.data
        }
    } catch (err) {
        console.error('Failed to fetch ticket stats:', err)
    }
}

const fetchTickets = async () => {
    loading.value = true
    error.value = null
    try {
        const response: any = await apiFetch('/api/admin/tickets', {
            params: {
                page: page.value,
                limit: 10,
                search: searchQuery.value || undefined,
                status: statusFilter.value || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            }
        })

        tickets.value = response.data.tickets
        Object.assign(pagination, response.data.pagination)
    } catch (err: any) {
        error.value = err.message || 'Failed to fetch tickets'
        // Global toast handles error
        // alert.error('Error', error.value || 'Unknown error')
    } finally {
        loading.value = false
    }
}

// --- Event Handlers ---
const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        page.value = 1
        fetchTickets()
    }, 500)
}

const changePage = (newPage: number) => {
    page.value = newPage
    fetchTickets()
}

const viewTicket = (ticket: Ticket) => {
    selectedTicket.value = ticket
    activeTab.value = 'overview'
    showDetailModal.value = true
}

const activeActionMenu = ref<string | null>(null)
const toggleActionMenu = (id: string | null) => {
    if (activeActionMenu.value === id) {
        activeActionMenu.value = null
    } else {
        activeActionMenu.value = id
    }
}

// --- Helpers ---
const getUserInitials = (user: any) => {
    if (user?.user_profiles?.firstName) {
        return (user.user_profiles.firstName[0] + (user.user_profiles.lastName?.[0] || '')).toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || '?'
}

const getUserName = (user: any) => {
    if (user?.user_profiles?.firstName) {
        return `${user.user_profiles.firstName} ${user.user_profiles.lastName || ''}`
    }
    return 'Unknown User'
}

const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return '-'
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
    if (includeTime) {
        options.hour = '2-digit'
        options.minute = '2-digit'
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount)
}

const formatStatus = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'Aktif'
        case 'PARTIALLY_USED': return 'Sebagian DiGunakan'
        case 'FULLY_USED': return 'Sudah Digunakan'
        case 'EXPIRED': return 'Kedaluwarsa'
        case 'CANCELLED': return 'Dibatalkan'
        case 'REFUNDED': return 'Dikembalikan'
        default: return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    }
}

const getTicketStatusVariant = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'success'
        case 'PARTIALLY_USED': return 'warning'
        case 'FULLY_USED': return 'default'
        case 'EXPIRED': return 'danger'
        case 'CANCELLED': return 'danger'
        case 'REFUNDED': return 'info'
        default: return 'default'
    }
}

const getTicketStatusClass = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200'
        case 'PARTIALLY_USED': return 'bg-orange-50 text-orange-700 border-orange-200'
        case 'FULLY_USED': return 'bg-gray-50 text-gray-700 border-gray-200'
        case 'EXPIRED': return 'bg-red-50 text-red-700 border-red-200'
        case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200'
        case 'REFUNDED': return 'bg-blue-50 text-blue-700 border-blue-200'
        default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
}

const calculateTotalQty = (ticket: any) => {
    return ticket.ticket_details?.reduce((sum: number, detail: any) => sum + detail.totalQty, 0) || 0
}

// Initial Data Load
// Initial Data Load
onMounted(() => {
    fetchTickets()
    fetchTicketStats()
})
</script>
