<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Transaksi</h2>
                    <p class="text-xs sm:text-sm text-[#666]">Pantau dan kelola transaksi pembayaran</p>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Total Pendapatan</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.overview.totalRevenue) }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium"
                        v-if="stats.today.revenueGrowth > 0">+{{ stats.today.revenueGrowth }}%</span>
                    <span class="text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-medium" v-else>{{
                        stats.today.revenueGrowth }}%</span>
                    <span class="text-gray-400">vs kemarin</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Total Transaksi</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.totalTransactions }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        stats.today.transactions }}</span>
                    <span class="text-gray-400">hari ini</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Menunggu</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.pendingTransactions }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        formatCurrency(stats.overview.pendingAmount) }}</span>
                    <span class="text-gray-400">jumlah tertunda</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Tingkat Keberhasilan</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.metrics.successRate }}%</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        stats.overview.completedTransactions }}</span>
                    <span class="text-gray-400">selesai</span>
                </div>
            </div>
        </div>

        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="transaction_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="transaction_search" name="transaction_search" v-model="searchQuery" type="text"
                            placeholder="Cari kode transaksi, email..."
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
                    <label for="transaction_status"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                    <div class="relative">
                        <select id="transaction_status" name="transaction_status" v-model="statusFilter"
                            @change="changePage(1)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                            <option value="">Semua Status</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="processing">Memproses</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="FAILED">Gagal</option>
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

        <!-- Transactions Table -->
        <UiTable :columns="columns" :data="transactions" :loading="loading" :error="error"
            no-data-message="Tidak ada transaksi ditemukan" no-data-sub-message="Coba sesuaikan filter atau kata kunci pencarian Anda">

            <!-- Transaction Code -->
            <template #cell-transactionCode="{ row: item }">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="font-bold text-[#333] font-mono">{{ item.transactionCode }}</p>
                        <p class="text-xs text-[#666]">{{ formatDate(item.createdAt, true) }}</p>
                    </div>
                </div>
            </template>

            <!-- User -->
            <template #cell-user="{ row: item }">
                <div v-if="item.users" class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-green-600/20">
                        {{ getUserInitials(item.users) }}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-[#333]">{{ getUserName(item.users) }}</p>
                        <p class="text-xs text-[#666]">{{ item.users.email }}</p>
                    </div>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
            </template>

            <!-- Total Amount -->
            <template #cell-totalAmount="{ row: item }">
                <span class="font-bold text-[#333] font-mono">{{ formatCurrency(item.totalAmount, item.currency)
                    }}</span>
            </template>

            <!-- Status -->
            <template #cell-status="{ row: item }">
                <UiBadge :variant="getStatusVariant(item.status)">
                    {{ formatStatus(item.status) }}
                </UiBadge>
            </template>

            <!-- Actions -->
            <template #cell-actions="{ row: item }">
                <div class="relative">
                    <button @click.stop="toggleActionMenu(item.id, $event)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu with Teleport -->
                    <Teleport to="body">
                        <div v-if="activeActionMenu === item.id" :style="dropdownStyle"
                            class="fixed w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] py-1 overflow-hidden">
                            <!-- View Details -->
                            <button @click="viewTransaction(item); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Detail
                            </button>

                            <!-- Update Status (if not final) -->
                            <button v-if="!['CANCELLED', 'REFUNDED'].includes(item.status)"
                                @click="openStatusModal(item); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Perbarui Status
                            </button>

                            <!-- Refund (only COMPLETED) -->
                            <button v-if="item.status === 'COMPLETED'"
                                @click="openRefundModal(item); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Refund
                            </button>
                        </div>
                    </Teleport>

                    <!-- Backdrop to close -->
                    <div v-if="activeActionMenu === item.id" @click="toggleActionMenu(null)"
                        class="fixed inset-0 z-[9998] bg-transparent cursor-default"></div>
                </div>
            </template>

            <!-- Footer Pagination -->
            <template #footer>
                <UiPagination v-if="transactions.length > 0" :current-page="pagination.currentPage"
                    :total-pages="pagination.totalPages" :total-items="pagination.totalItems"
                    :items-per-page="pagination.limit" :has-prev-page="pagination.hasPrevPage"
                    :has-next-page="pagination.hasNextPage" item-name="transactions" @change="changePage" />
            </template>
        </UiTable>

        <!-- Transaction Detail Modal -->
        <UiModal v-model="showDetailModal" title="Detail Transaksi" size="lg" :show-default-footer="false">
            <div v-if="selectedTransaction" class="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">

                <!-- Header Card -->
                <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-5 border border-blue-200/50 flex-shrink-0 mb-4">
                    <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        <div
                            class="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                            <svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>

                        <div class="flex-1 min-w-0 w-full">
                            <h3 class="text-xl sm:text-2xl font-black text-[#333] mb-1 font-mono tracking-wide">
                                {{ selectedTransaction.transactionCode }}
                            </h3>
                            <div class="flex items-center gap-4 text-xs sm:text-sm text-[#666] mb-3">
                                <span>{{ formatDate(selectedTransaction.createdAt, true) }}</span>
                                <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span class="font-bold text-[#333]">{{ formatCurrency(selectedTransaction.totalAmount,
                                    selectedTransaction.currency) }}</span>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                <UiBadge :variant="getStatusVariant(selectedTransaction.status)">
                                    {{ formatStatus(selectedTransaction.status) }}
                                </UiBadge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
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

                        <!-- Items/Attractions -->
                        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 class="text-sm font-bold text-[#333] mb-3 flex items-center gap-2">
                                <svg class="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Item
                            </h4>
                            <div v-for="item in selectedTransaction.transaction_items" :key="item.id"
                                class="mb-3 last:mb-0 border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-3">
                                        <img v-if="item.attractions?.imageUrl" :src="item.attractions.imageUrl"
                                            class="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="">
                                        <div>
                                            <p class="text-sm font-bold text-[#333]">{{ item.attractions?.name ||
                                                'Item Tidak Diketahui'
                                            }}</p>
                                            <p class="text-xs text-[#666]">{{ formatCurrency(item.price, 'IDR') }} x {{
                                                item.quantity }}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-bold text-[#333]">{{ formatCurrency(item.totalPrice,
                                            'IDR') }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                                <p class="text-sm font-bold text-[#666]">Total</p>
                                <p class="text-lg font-black text-[#333]">{{
                                    formatCurrency(selectedTransaction.totalAmount,
                                        selectedTransaction.currency) }}</p>
                            </div>
                        </div>

                        <!-- User Info -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 class="text-sm font-bold text-[#333]">Detail Pelanggan</h4>
                            </div>
                            <div class="p-4 space-y-3" v-if="selectedTransaction.users">
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Nama</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        getUserName(selectedTransaction.users)
                                    }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Email</span>
                                    <span class="text-sm font-medium text-[#333]">{{ selectedTransaction.users.email
                                    }}</span>
                                </div>
                                <div class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">No. Telepon</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        selectedTransaction.users.user_profiles?.phone || '-' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Info -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden"
                            v-if="selectedTransaction.payments?.length">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 class="text-sm font-bold text-[#333]">Riwayat Pembayaran</h4>
                            </div>
                            <div class="p-4 space-y-3">
                                <div v-for="payment in selectedTransaction.payments" :key="payment.id"
                                    class="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p class="text-sm font-bold text-[#333]">{{ payment.method }}</p>
                                        <p class="text-xs text-[#666]">{{ formatDate(payment.paidAt || '', true) }}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-bold text-[#333]">{{ formatCurrency(payment.amount,
                                            'IDR') }}</p>
                                        <UiBadge size="sm"
                                            :variant="payment.status === 'SETTLED' ? 'success' : 'warning'">{{
                                                payment.status }}</UiBadge>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Activity Logs Tab -->
                    <div v-if="activeTab === 'logs'" class="space-y-4">
                        <div v-if="activityLogs.length > 0" class="relative pl-6 space-y-6">
                            <!-- Vertical Line -->
                            <div class="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>

                            <div v-for="log in activityLogs" :key="log.id" class="relative">
                                <!-- Dot -->
                                <div class="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white ring-1 ring-gray-200"
                                    :class="getLogColor(log.action)">
                                </div>

                                <div>
                                    <div class="flex justify-between items-start gap-4">
                                        <div>
                                            <p class="text-sm font-bold text-[#333]">{{ formatLogAction(log.action) }}
                                            </p>
                                            <p class="text-sm text-[#666] mt-0.5">{{ log.description }}</p>
                                            <div class="flex items-center gap-2 mt-2">
                                                <span
                                                    class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {{ log.users?.email || 'System' }}
                                                </span>
                                            </div>
                                        </div>
                                        <span class="text-xs text-[#999] whitespace-nowrap">{{ formatDate(log.createdAt,
                                            true)
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-8 text-[#666]">
                            Tidak ada log aktivitas ditemukan.
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-auto flex-shrink-0">
                    <button @click="showDetailModal = false"
                        class="px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Tutup
                    </button>
                </div>

            </div>
        </UiModal>
        <!-- Status Update Modal -->
        <UiModal v-model="showStatusModal" title="Perbarui Status Transaksi" size="md" :show-default-footer="false">
            <div class="p-6 space-y-4">
                <div v-if="selectedTransaction" class="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">Transaksi</span>
                        <span class="font-mono font-bold">{{ selectedTransaction.transactionCode }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Status Saat Ini</span>
                        <UiBadge :variant="getStatusVariant(selectedTransaction.status)">{{
                            formatStatus(selectedTransaction.status) }}</UiBadge>
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Status Select -->
                    <div>
                        <label for="update_status_select" class="block text-sm font-medium text-gray-700 mb-1">Status
                            Baru</label>
                        <select id="update_status_select" name="update_status_select" v-model="statusForm.status"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none">
                            <option value="">Pilih Status</option>
                            <option v-for="status in allowedTransitions" :key="status" :value="status">{{
                                formatStatus(status)
                                }}</option>
                        </select>
                    </div>

                    <!-- Reason -->
                    <div v-if="['CANCELLED', 'FAILED', 'REFUNDED'].includes(statusForm.status)">
                        <label for="update_status_reason" class="block text-sm font-medium text-gray-700 mb-1">Alasan
                            <span class="text-red-500">*</span></label>
                        <textarea id="update_status_reason" name="update_status_reason" v-model="statusForm.reason"
                            rows="2"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none"
                            placeholder="Masukkan alasan perubahan status..."></textarea>
                    </div>

                    <!-- Admin Notes -->
                    <div>
                        <label for="update_status_notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan
                            Admin
                            (Opsional)</label>
                        <textarea id="update_status_notes" name="update_status_notes" v-model="statusForm.adminNotes"
                            rows="2"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none"
                            placeholder="Catatan internal..."></textarea>
                    </div>
                </div>

                <div class="flex gap-3 pt-4 justify-end border-t border-gray-100 mt-6">
                    <button @click="showStatusModal = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                        Batal
                    </button>
                    <button @click="handleUpdateStatus" :disabled="isSubmitting"
                        class="px-4 py-2 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#45a049] rounded-lg transition-colors flex items-center gap-2">
                        <span v-if="isSubmitting"
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Perbarui Status
                    </button>
                </div>
            </div>
        </UiModal>

        <!-- Refund Modal -->
        <UiModal v-model="showRefundModal" title="Proses Refund" size="md" :show-default-footer="false">
            <div class="p-6 space-y-4">
                <div v-if="selectedTransaction" class="bg-red-50 rounded-xl p-4 border border-red-100 mb-4">
                    <h4 class="text-red-800 font-bold mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Tindakan Tidak Dapat Dibatalkan
                    </h4>
                    <p class="text-sm text-red-700">Refund akan menandai transaksi dan itemnya sebagai dikembalikan.
                        Tindakan ini tidak dapat dibatalkan.</p>
                </div>

                <div class="space-y-4">
                    <!-- Ticket Usage Warning -->
                    <div v-if="ticketSummary && ticketSummary.used > 0"
                        class="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <h4 class="text-amber-800 font-bold mb-1 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Penggunaan Sebagian Terdeteksi
                        </h4>
                        <p class="text-sm text-amber-700">
                            {{ ticketSummary.used }} dari {{ ticketSummary.total }} tiket telah digunakan.
                            <br>
                            <span class="font-bold">Refund Penuh dinonaktifkan.</span> Hanya tiket yang belum digunakan
                            yang dapat dikembalikan melalui Refund Sebagian.
                        </p>
                    </div>

                    <!-- Refund Method -->
                    <div>
                        <div class="flex gap-4">
                            <label for="refund_method_full" class="flex items-center gap-2"
                                :class="cannotFullRefund ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'">
                                <input id="refund_method_full" name="refund_method" type="radio"
                                    v-model="refundForm.refundMethod" value="FULL" :disabled="cannotFullRefund"
                                    class="text-[#4CAF50] focus:ring-[#4CAF50]" />
                                <span class="text-sm text-gray-700">Refund Penuh</span>
                            </label>
                            <label for="refund_method_partial" class="flex items-center gap-2 cursor-pointer">
                                <input id="refund_method_partial" name="refund_method" type="radio"
                                    v-model="refundForm.refundMethod" value="PARTIAL"
                                    class="text-[#4CAF50] focus:ring-[#4CAF50]" />
                                <span class="text-sm text-gray-700">Refund Sebagian</span>
                            </label>
                        </div>
                    </div>

                    <!-- Amount -->
                    <div>
                        <label for="refund_amount" class="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah Refund
                            <span v-if="selectedTransaction" class="text-gray-400 text-xs font-normal ml-1">
                                (Maks: {{ formatCurrency(selectedTransaction.totalAmount, selectedTransaction.currency)
                                }})
                            </span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                            <input id="refund_amount" name="refund_amount" type="number"
                                v-model="refundForm.refundAmount" :disabled="refundForm.refundMethod === 'FULL'"
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500">
                        </div>
                    </div>

                    <!-- Reason -->
                    <div>
                        <label for="refund_reason" class="block text-sm font-medium text-gray-700 mb-1">Alasan <span
                                class="text-red-500">*</span></label>
                        <textarea id="refund_reason" name="refund_reason" v-model="refundForm.reason" rows="2"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none"
                            placeholder="Alasan refund..."></textarea>
                        <p class="text-xs text-gray-500 mt-1 text-right">{{ refundForm.reason.length }}/1000 karakter
                            (min 10)
                        </p>
                    </div>

                    <!-- Admin Notes -->
                    <div>
                        <label for="refund_notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan Admin
                            (Opsional)</label>
                        <textarea id="refund_notes" name="refund_notes" v-model="refundForm.adminNotes" rows="2"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none"
                            placeholder="Catatan internal..."></textarea>
                    </div>

                    <!-- Notify Customer -->
                    <label for="refund_notify" class="flex items-center gap-2 cursor-pointer">
                        <input id="refund_notify" name="refund_notify" type="checkbox"
                            v-model="refundForm.notifyCustomer" class="rounded text-[#4CAF50] focus:ring-[#4CAF50]" />
                        <span class="text-sm text-gray-700">Beritahu pelanggan via email</span>
                    </label>
                </div>

                <div class="flex gap-3 pt-4 justify-end border-t border-gray-100 mt-6">
                    <button @click="showRefundModal = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                        Batal
                    </button>
                    <button @click="handleRefund" :disabled="isSubmitting || refundForm.reason.length < 10"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="isSubmitting"
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Proses Refund
                    </button>
                </div>
            </div>
        </UiModal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useFetchApi } from '~/composables/useFetchApi'
import { useAlert } from '~/composables/useAlert'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
})

const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// --- Types ---
interface Transaction {
    id: string
    transactionCode: string
    totalAmount: number
    currency: string
    status: string
    createdAt: string
    users: {
        email: string
        user_profiles?: {
            firstName?: string
            lastName?: string
            phone?: string
        }
    }
    // Expanded details
    transaction_items?: Array<{
        id: string
        quantity: number
        price: number
        totalPrice: number
        attractions: {
            name: string
            imageUrl?: string
        }
    }>
    payments?: Array<{
        id: string
        amount: number
        status: string
        method: string
        paidAt?: string
    }>
    tickets?: {
        ticket_details: Array<{
            totalQty: number
            usedQty: number
        }>
    }
}

interface ActivityLog {
    id: string
    action: string
    description: string
    createdAt: string
    users?: {
        email: string
    }
}

interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    slot?: boolean
    sticky?: boolean
    width?: string
    minWidth?: string
}

// --- State ---
const transactions = ref<Transaction[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const page = ref(1)
let searchTimeout: any = null
const stats = ref({
    overview: {
        totalRevenue: 0,
        totalTransactions: 0,
        pendingTransactions: 0,
        pendingAmount: 0,
        completedTransactions: 0
    },
    today: {
        revenueGrowth: 0,
        transactions: 0
    },
    metrics: {
        successRate: 0
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
const showStatusModal = ref(false)
const showRefundModal = ref(false)
const activeActionMenu = ref<string | null>(null)
const dropdownPosition = ref({ top: '0px', left: '0px' })
const dropdownStyle = computed(() => ({
    top: dropdownPosition.value.top,
    left: dropdownPosition.value.left
}))
const selectedTransaction = ref<Transaction | null>(null)
const activityLogs = ref<ActivityLog[]>([])
const activeTab = ref('overview')
const isSubmitting = ref(false)

// Forms
const statusForm = reactive({
    status: '',
    reason: '',
    adminNotes: ''
})

const refundForm = reactive({
    refundMethod: 'FULL' as 'FULL' | 'PARTIAL',
    refundAmount: 0,
    reason: '',
    adminNotes: '',
    notifyCustomer: true
})

// Transition Rules
const validTransitions: Record<string, string[]> = {
    PENDING: ['PROCESSING', 'CANCELLED', 'FAILED'],
    PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED'],
    FAILED: ['PROCESSING'],
    COMPLETED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: []
}

const allowedTransitions = computed(() => {
    if (!selectedTransaction.value) return []
    return validTransitions[selectedTransaction.value.status] || []
})

const ticketSummary = computed(() => {
    if (!selectedTransaction.value?.tickets?.ticket_details) return null
    return selectedTransaction.value.tickets.ticket_details.reduce((acc, detail) => ({
        total: acc.total + detail.totalQty,
        used: acc.used + detail.usedQty
    }), { total: 0, used: 0 })
})

const cannotFullRefund = computed(() => {
    return (ticketSummary.value?.used || 0) > 0
})

const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'logs', label: 'Log Aktivitas' }
]

const columns: TableColumn[] = [
    { key: 'transactionCode', label: 'Kode', slot: true, minWidth: '180px' },
    { key: 'user', label: 'Pelanggan', slot: true, minWidth: '200px' },
    { key: 'totalAmount', label: 'Jumlah', slot: true, width: '150px' },
    { key: 'status', label: 'Status', align: 'center', slot: true, width: '120px' },
    { key: 'actions', label: '', align: 'right', slot: true, sticky: true, width: '80px' }
]

// --- Fetch Data ---
const fetchTransactionStats = async () => {
    try {
        const response: any = await apiFetch('/api/admin/dashboard/transactions')
        if (response.success) {
            stats.value = response.data
        }
    } catch (err) {
        console.error('Failed to fetch transaction stats:', err)
    }
}

const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
        const response: any = await apiFetch('/api/admin/transactions', {
            params: {
                page: page.value,
                limit: 10,
                search: searchQuery.value || undefined,
                status: statusFilter.value || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            }
        })

        transactions.value = response.data.transactions
        Object.assign(pagination, response.data.pagination)
    } catch (err: any) {
        error.value = err.message || 'Failed to fetch transactions'
        // Global toast handles error
        // alert.error('Error', error.value || 'Unknown error')
    } finally {
        loading.value = false
    }
}

const fetchTransactionDetails = async (id: string) => {
    try {
        const response: any = await apiFetch(`/api/admin/transactions/${id}`)
        selectedTransaction.value = response.data.transaction
        activityLogs.value = response.data.activityLogs || []
    } catch (err: any) {
        // Global toast handles error
        // alert.error('Error', 'Failed to load details')
    }
}

// --- Event Handlers ---
const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        page.value = 1
        fetchTransactions()
    }, 500)
}

const changePage = (newPage: number) => {
    page.value = newPage
    fetchTransactions()
}

const viewTransaction = async (transaction: Transaction) => {
    selectedTransaction.value = transaction // optimistic
    showDetailModal.value = true
    activeTab.value = 'overview'
    await fetchTransactionDetails(transaction.id)
}

const toggleActionMenu = (id: string | null, event?: Event) => {
    if (activeActionMenu.value === id) {
        activeActionMenu.value = null
        return
    }

    if (id && event) {
        const button = (event.target as HTMLElement).closest('button')
        if (button) {
            const rect = button.getBoundingClientRect()
            dropdownPosition.value = {
                top: `${rect.bottom + 8}px`,
                left: `${rect.right - 192}px` // 192px = w-48 (12rem)
            }
        }
    }

    activeActionMenu.value = id
}

// --- Status Management ---
const openStatusModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    statusForm.status = ''
    statusForm.reason = ''
    statusForm.adminNotes = ''
    showStatusModal.value = true
}

const handleUpdateStatus = async () => {
    if (!selectedTransaction.value || !statusForm.status) return

    // Validation
    if (['CANCELLED', 'FAILED', 'REFUNDED'].includes(statusForm.status) && !statusForm.reason) {
        alert.error('Validation', 'Reason is required for this status')
        return
    }

    isSubmitting.value = true
    try {
        await apiFetch(`/api/admin/transactions/${selectedTransaction.value.id}/status`, {
            method: 'PATCH',
            body: statusForm
        })

        alert.success('Success', `Status updated to ${statusForm.status}`)
        showStatusModal.value = false
        fetchTransactions() // Refresh list
    } catch (err: any) {
        // Global toast handles error
        // alert.error('Error', err.data?.message || 'Failed to update status')
    } finally {
        isSubmitting.value = false
    }
}

// --- Refund Management ---
const openRefundModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction

    // Check usage to determine default method
    const hasUsage = transaction.tickets?.ticket_details?.some(d => d.usedQty > 0)

    refundForm.refundMethod = hasUsage ? 'PARTIAL' : 'FULL'
    refundForm.refundAmount = Number(transaction.totalAmount) // Will be reset by watcher if switched to PARTIAL, or kept for display
    if (hasUsage) {
        refundForm.refundAmount = 0 // Reset for partial
    }

    refundForm.reason = ''
    refundForm.adminNotes = ''
    refundForm.notifyCustomer = true
    showRefundModal.value = true
}

watch(() => refundForm.refundMethod, (newVal) => {
    if (newVal === 'FULL' && selectedTransaction.value) {
        refundForm.refundAmount = Number(selectedTransaction.value.totalAmount)
    }
})

const handleRefund = async () => {
    if (!selectedTransaction.value) return

    isSubmitting.value = true
    try {
        await apiFetch(`/api/admin/transactions/${selectedTransaction.value.id}/refund`, {
            method: 'POST',
            body: {
                ...refundForm,
                refundAmount: Number(refundForm.refundAmount)
            }
        })

        alert.success('Success', 'Refund processed successfully')
        showRefundModal.value = false
        fetchTransactions() // Refresh list
    } catch (err: any) {
        // Global toast handles error
        // alert.error('Error', err.data?.message || 'Failed to process refund')
    } finally {
        isSubmitting.value = false
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
    return new Date(dateString).toLocaleDateString('en-US', options)
}

const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount)
}

const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'COMPLETED': return 'success'
        case 'PENDING': return 'warning'
        case 'PROCESSING': return 'info'
        case 'FAILED': return 'danger'
        case 'CANCELLED': return 'danger'
        case 'REFUNDED': return 'default'
        default: return 'default'
    }
}

const getLogColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-500 ring-green-100'
    if (action.includes('UPDATE')) return 'bg-blue-500 ring-blue-100'
    if (action.includes('DELETE')) return 'bg-red-500 ring-red-100'
    return 'bg-gray-400 ring-gray-100'
}

const formatLogAction = (action: string) => {
    return action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

// Initial Data Load
onMounted(() => {
    fetchTransactions()
    fetchTransactionStats()
})
</script>
