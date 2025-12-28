<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Manajemen Pengguna</h2>
                    <p class="text-xs sm:text-sm text-[#666]">Kelola semua pengguna, peran, dan izin</p>
                </div>
                <button @click="showAddUserModal = true"
                    class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Pengguna</span>
                </button>
            </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Total Pengguna</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.totalUsers }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">+{{
                        stats.newUsers.last30Days }}</span>
                    <span class="text-gray-400">30 hari terakhir</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Pengguna Aktif</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.activeUsers }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        stats.percentages.activePercentage }}%</span>
                    <span class="text-gray-400">dari total pengguna</span>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Baru (7 Hari)</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.newUsers.last7Days }}</h3>
                <!-- Note: API returns last7Days, using it as proxy or need to adjust API if "Today" is critical. 
                     The API actually returns newUsersLast7Days and newUsersLast30Days. 
                     The response structure shows newUsers: { last7Days: ..., last30Days: ... } 
                     I will label it "New (7 Days)" for accuracy. -->
                <p class="text-xs text-gray-400 mt-2">Pendaftaran baru minggu ini</p>
            </div>

            <div class="bg-white rounded-2xl p-4 border border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-1">Pengguna Terverifikasi</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.overview.verifiedUsers }}</h3>
                <div class="mt-2 text-xs flex items-center gap-1">
                    <span class="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">{{
                        stats.percentages.verifiedPercentage }}%</span>
                    <span class="text-gray-400">email terverifikasi</span>
                </div>
            </div>
        </div>

        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col lg:flex-row gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="user_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="user_search" name="user_search" v-model="filters.search" type="text"
                            placeholder="Cari nama atau email..." @input="debouncedSearch"
                            class="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <!-- Filters Group -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:flex lg:items-end">
                    <!-- Role Filter -->
                    <div class="w-full lg:w-40">
                        <label for="user_role"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Peran</label>
                        <div class="relative">
                            <select id="user_role" name="user_role" v-model="filters.role" @change="fetchUsers"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                                <option value="">Semua Peran</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="SCANNER">Pemindai</option>
                                <option value="CUSTOMER">Pelanggan</option>
                            </select>
                            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <!-- Status Filter -->
                    <div class="w-full lg:w-40">
                        <label for="user_status"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                        <div class="relative">
                            <select id="user_status" name="user_status" v-model="filters.isActive" @change="fetchUsers"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                                <option value="">Semua Status</option>
                                <option value="true">Aktif</option>
                                <option value="false">Tidak Aktif</option>
                            </select>
                            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <!-- Email Verification Filter -->
                    <div class="w-full lg:w-40">
                        <label for="user_email_status"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status Email</label>
                        <div class="relative">
                            <select id="user_email_status" name="user_email_status" v-model="filters.isEmailVerified"
                                @change="fetchUsers"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                                <option value="">Semua Status Email</option>
                                <option value="true">Terverifikasi</option>
                                <option value="false">Belum Terverifikasi</option>
                            </select>
                            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <UiTable :columns="tableColumns" :data="users" :loading="isLoading" :error="error" :on-retry="fetchUsers"
            :sort-by="filters.sortBy" :sort-order="filters.sortOrder as 'asc' | 'desc'" @sort="handleSort">
            <!-- User Cell -->
            <template #cell-user="{ row }">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {{ getUserInitials(row) }}
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-[#333] truncate">{{ getUserName(row) }}</p>
                        <p class="text-xs text-[#666] truncate">{{ row.email }}</p>
                    </div>
                </div>
            </template>

            <!-- Role Cell -->
            <template #cell-role="{ row }">
                <UiBadge :variant="getRoleBadgeVariant(row.role)">
                    {{ formatRole(row.role) }}
                </UiBadge>
            </template>

            <!-- Status Cell -->
            <template #cell-status="{ row }">
                <div class="flex flex-col gap-1">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium"
                        :class="row.isActive ? 'text-green-600' : 'text-gray-400'">
                        <span class="w-2 h-2 rounded-full"
                            :class="row.isActive ? 'bg-green-500' : 'bg-gray-400'"></span>
                        {{ row.isActive ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                    <span v-if="row.isEmailVerified" class="inline-flex items-center gap-1 text-xs text-blue-600">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        Terverifikasi
                    </span>
                </div>
            </template>

            <!-- Transactions Cell -->
            <template #cell-transactions="{ row }">
                <span class="text-sm font-medium text-[#333]">{{ row._count.purchase_transactions }}</span>
            </template>

            <!-- Last Login Cell -->
            <template #cell-lastLogin="{ row }">
                <span class="text-sm text-[#666] whitespace-nowrap">{{ formatDate(row.lastLoginAt) }}</span>
            </template>

            <!-- Actions Cell -->
            <template #cell-actions="{ row }">
                <div class="relative">
                    <button @click.stop="toggleActionMenu(row.id, $event)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <Teleport to="body">
                        <div v-if="activeActionMenu === row.id" :style="dropdownStyle"
                            class="fixed w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] py-1 overflow-hidden">
                            <!-- View Details -->
                            <button @click="viewUser(row); toggleActionMenu(null)"
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

                            <!-- Edit User -->
                            <button @click="editUser(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Pengguna
                            </button>

                            <!-- Delete User -->
                            <button @click="deleteUser(row, false); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus Pengguna
                            </button>
                        </div>
                    </Teleport>

                    <!-- Backdrop to close -->
                    <div v-if="activeActionMenu === row.id" @click="toggleActionMenu(null)"
                        class="fixed inset-0 z-[9998] bg-transparent cursor-default"></div>
                </div>
            </template>

            <!-- Footer with Pagination -->
            <template #footer>
                <UiPagination v-if="users.length > 0" :current-page="pagination.currentPage"
                    :total-pages="pagination.totalPages" :total-items="pagination.totalUsers"
                    :items-per-page="filters.limit" :has-prev-page="pagination.hasPrevPage"
                    :has-next-page="pagination.hasNextPage" item-name="users" @change="changePage" />
            </template>
        </UiTable>

        <!-- User Detail Modal -->
        <UiModal v-model="showUserDetailModal" :title="selectedUser ? getUserName(selectedUser) : 'Detail Pengguna'"
            size="xl" :show-default-footer="false">

            <div v-if="selectedUser" class="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
                <!-- User Header Card (Fixed) -->
                <div
                    class="bg-gradient-to-br from-[#4CAF50]/5 to-[#45a049]/5 rounded-xl p-4 sm:p-5 border border-[#4CAF50]/20 flex-shrink-0 mb-4">
                    <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        <!-- Avatar -->
                        <div
                            class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-green-600/20">
                            {{ getUserInitials(selectedUser) }}
                        </div>

                        <!-- User Info -->
                        <div class="flex-1 min-w-0 w-full">
                            <h3 class="text-xl sm:text-2xl font-bold text-[#333] mb-1">{{ getUserName(selectedUser) }}
                            </h3>
                            <p class="text-xs sm:text-sm text-[#666] mb-3 break-all">{{ selectedUser.email }}</p>

                            <!-- Badges -->
                            <div class="flex flex-wrap gap-2">
                                <UiBadge :variant="getRoleBadgeVariant(selectedUser.role)">
                                    {{ formatRole(selectedUser.role) }}
                                </UiBadge>
                                <UiBadge :variant="selectedUser.isActive ? 'success' : 'default'">
                                    {{ selectedUser.isActive ? 'Aktif' : 'Tidak Aktif' }}
                                </UiBadge>
                                <UiBadge v-if="selectedUser.isEmailVerified" variant="info">
                                    ✓ Email Terverifikasi
                                </UiBadge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex border-b border-gray-200 mb-4 flex-shrink-0 overflow-x-auto">
                    <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                        class="px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap"
                        :class="activeTab === tab.id ? 'text-[#4CAF50]' : 'text-[#666] hover:text-[#333]'">
                        {{ tab.label }}
                        <div v-if="activeTab === tab.id"
                            class="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] rounded-t-full"></div>
                    </button>
                </div>

                <!-- Tab Content (Scrollable) -->
                <div class="flex-1 overflow-y-auto pr-1">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'" class="space-y-4">
                        <!-- Quick Stats -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p class="text-xs text-[#666] mb-1">Transactions</p>
                                <p class="text-lg font-bold text-[#4CAF50]">{{
                                    selectedUser.statistics?.totalTransactions ||
                                    selectedUser._count?.purchase_transactions
                                    || 0 }}</p>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p class="text-xs text-[#666] mb-1">Total Spent</p>
                                <p class="text-lg font-bold text-[#4CAF50]">{{
                                    new Intl.NumberFormat('id-ID', {
                                        style: 'currency', currency: 'IDR',
                                        maximumFractionDigits: 0
                                    }).format(selectedUser.statistics?.totalSpent || 0) }}
                                </p>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p class="text-xs text-[#666] mb-1">Activity Logs</p>
                                <p class="text-lg font-bold text-[#4CAF50]">{{
                                    selectedUser.statistics?.totalActivities || selectedUser._count?.activity_logs
                                    || 0
                                }}</p>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p class="text-xs text-[#666] mb-1">Member Since</p>
                                <p class="text-sm font-bold text-[#333]">{{ new
                                    Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', year:
                                            'numeric'
                                    }) }}</p>
                            </div>
                        </div>

                        <!-- Account Details -->
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h4 class="text-sm font-bold text-[#333]">Detail Akun</h4>
                            </div>
                            <div class="p-4 space-y-3">
                                <div
                                    class="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">ID Pengguna</span>
                                    <span class="text-sm font-mono font-medium text-[#333]">{{ selectedUser.id }}</span>
                                </div>
                                <div
                                    class="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Login Terakhir</span>
                                    <span class="text-sm font-medium text-[#333]">{{
                                        formatDate(selectedUser.lastLoginAt)
                                    }}</span>
                                </div>
                                <div
                                    class="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                    <span class="text-sm text-[#666]">Diperbarui Pada</span>
                                    <span class="text-sm font-medium text-[#333]">{{ formatDate(selectedUser.updatedAt)
                                        }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Tab -->
                    <div v-if="activeTab === 'profile'" class="space-y-4">
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h4 class="text-sm font-bold text-[#333]">Informasi Pribadi</h4>
                            </div>
                            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Nama Depan</p>
                                    <p class="text-sm font-semibold text-[#333]">{{
                                        selectedUser.user_profiles?.firstName || '-'
                                    }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Nama Belakang</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.lastName
                                        || '-'
                                    }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">No. Telepon</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.phone ||
                                        '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Jenis Kelamin</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.gender
                                        || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Tanggal Lahir</p>
                                    <p class="text-sm font-semibold text-[#333]">{{
                                        selectedUser.user_profiles?.dateOfBirth ?
                                            new Date(selectedUser.user_profiles.dateOfBirth).toLocaleDateString() : '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Bahasa</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.language
                                        || '-'
                                    }}</p>
                                </div>
                                <div class="sm:col-span-2">
                                    <p class="text-xs text-[#666] mb-1">Alamat</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.address
                                        || '-'
                                    }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Kota</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.city ||
                                        '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Kode Pos</p>
                                    <p class="text-sm font-semibold text-[#333]">{{
                                        selectedUser.user_profiles?.postalCode ||
                                        '-' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-[#666] mb-1">Negara</p>
                                    <p class="text-sm font-semibold text-[#333]">{{ selectedUser.user_profiles?.country
                                        || '-'
                                    }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Transactions Tab -->
                    <div v-if="activeTab === 'transactions'" class="space-y-4">
                        <div v-if="selectedUser.recentTransactions?.length > 0" class="space-y-3">
                            <div v-for="transaction in selectedUser.recentTransactions" :key="transaction.id"
                                class="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-[#4CAF50]/30 transition-colors">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-[#333]">{{ transaction.transactionCode }}</p>
                                        <p class="text-xs text-[#666]">{{ new
                                            Date(transaction.createdAt).toLocaleString() }}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-[#4CAF50]">{{ transaction.currency }} {{
                                        Number(transaction.totalAmount).toLocaleString() }}</p>
                                    <UiBadge :variant="getTransactionStatusVariant(transaction.status)"
                                        class="text-[10px]">
                                        {{ transaction.status }}
                                    </UiBadge>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-10">
                            <p class="text-sm text-[#999]">Tidak ada riwayat transaksi</p>
                        </div>
                    </div>

                    <!-- Activity Tab -->
                    <div v-if="activeTab === 'activity'" class="space-y-4">
                        <div v-if="selectedUser.recentActivities?.length > 0" class="space-y-4 pl-2">
                            <div v-for="activity in selectedUser.recentActivities" :key="activity.id"
                                class="relative pl-6 pb-4 border-l border-gray-200 last:border-0 last:pb-0">
                                <div
                                    class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-orange-100 border-2 border-white ring-1 ring-orange-200">
                                </div>
                                <div class="flex justify-between items-start gap-4">
                                    <div>
                                        <p class="text-sm font-bold text-[#333]">{{ activity.action }}</p>
                                        <p class="text-xs text-[#666] mt-0.5">{{ activity.description }}</p>
                                    </div>
                                    <span class="text-xs text-[#999] whitespace-nowrap">{{
                                        formatDate(activity.createdAt)
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-10">
                            <p class="text-sm text-[#999]">Tidak ada aktivitas terbaru</p>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div
                    class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 mt-auto flex-shrink-0">
                    <button @click="showUserDetailModal = false"
                        class="px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200 order-3 sm:order-1">
                        Tutup
                    </button>
                    <button @click="toggleUserStatus(selectedUser)"
                        :class="selectedUser.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'"
                        class="px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors cursor-pointer order-2">
                        {{ selectedUser.isActive ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna' }}
                    </button>
                    <button @click="editUser(selectedUser)"
                        class="px-4 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer order-1 sm:order-3">
                        Edit Pengguna
                    </button>
                </div>
            </div>
        </UiModal>

        <!-- Edit User Modal -->
        <UiModal v-model="showEditUserModal" title="Edit Pengguna" size="lg" :show-default-footer="false">

            <form v-if="editingUser" @submit.prevent="saveUser" class="space-y-4">
                <!-- Email -->
                <div>
                    <label for="edit_user_email" class="block text-sm font-semibold text-[#333] mb-2">Email</label>
                    <input id="edit_user_email" name="edit_user_email" v-model="editingUser.email" type="email" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                </div>

                <!-- Role -->
                <div>
                    <label for="edit_user_role" class="block text-sm font-semibold text-[#333] mb-2">Peran</label>
                    <select id="edit_user_role" name="edit_user_role" v-model="editingUser.role"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <option value="CUSTOMER">Pelanggan</option>
                        <option value="SCANNER">Pemindai</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                </div>

                <!-- Status Toggles -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="edit_user_active" class="flex items-center gap-2 cursor-pointer">
                            <input id="edit_user_active" name="edit_user_active" v-model="editingUser.isActive"
                                type="checkbox"
                                class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer">
                            <span class="text-sm font-medium text-[#333]">Aktif</span>
                        </label>
                    </div>
                    <div>
                        <label for="edit_user_verified" class="flex items-center gap-2 cursor-pointer">
                            <input id="edit_user_verified" name="edit_user_verified"
                                v-model="editingUser.isEmailVerified" type="checkbox"
                                class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer">
                            <span class="text-sm font-medium text-[#333]">Email Terverifikasi</span>
                        </label>
                    </div>
                </div>

                <!-- Profile Information -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                    <h4 class="text-sm font-bold text-[#333] mb-3">Informasi Profil</h4>

                    <div class="grid grid-cols-2 gap-4">
                        <!-- First Name -->
                        <div>
                            <label for="edit_user_fname" class="block text-xs font-medium text-[#666] mb-1">Nama
                                Depan</label>
                            <input id="edit_user_fname" name="edit_user_fname" v-model="editingUser.profile.firstName"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Last Name -->
                        <div>
                            <label for="edit_user_lname" class="block text-xs font-medium text-[#666] mb-1">Nama
                                Belakang</label>
                            <input id="edit_user_lname" name="edit_user_lname" v-model="editingUser.profile.lastName"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Phone -->
                        <div>
                            <label for="edit_user_phone"
                                class="block text-xs font-medium text-[#666] mb-1">No. Telepon</label>
                            <input id="edit_user_phone" name="edit_user_phone" v-model="editingUser.profile.phone"
                                type="tel"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Date of Birth -->
                        <div>
                            <label for="edit_user_dob" class="block text-xs font-medium text-[#666] mb-1">Tanggal
                                Lahir</label>
                            <input id="edit_user_dob" name="edit_user_dob" v-model="editingUser.profile.dateOfBirth"
                                type="date"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Gender -->
                        <div>
                            <label for="edit_user_gender"
                                class="block text-xs font-medium text-[#666] mb-1">Jenis Kelamin</label>
                            <select id="edit_user_gender" name="edit_user_gender" v-model="editingUser.profile.gender"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="MALE">Laki-laki</option>
                                <option value="FEMALE">Perempuan</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>

                        <!-- Language -->
                        <div>
                            <label for="edit_user_lang"
                                class="block text-xs font-medium text-[#666] mb-1">Bahasa</label>
                            <select id="edit_user_lang" name="edit_user_lang" v-model="editingUser.profile.language"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                                <option value="INDONESIAN">Indonesian</option>
                                <option value="ENGLISH">English</option>
                            </select>
                        </div>

                        <!-- Address -->
                        <div class="col-span-2">
                            <label for="edit_user_address"
                                class="block text-xs font-medium text-[#666] mb-1">Alamat</label>
                            <input id="edit_user_address" name="edit_user_address" v-model="editingUser.profile.address"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- City -->
                        <div>
                            <label for="edit_user_city" class="block text-xs font-medium text-[#666] mb-1">Kota</label>
                            <input id="edit_user_city" name="edit_user_city" v-model="editingUser.profile.city"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Postal Code -->
                        <div>
                            <label for="edit_user_zip" class="block text-xs font-medium text-[#666] mb-1">Kode
                                Pos</label>
                            <input id="edit_user_zip" name="edit_user_zip" v-model="editingUser.profile.postalCode"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Country -->
                        <div class="col-span-2">
                            <label for="edit_user_country"
                                class="block text-xs font-medium text-[#666] mb-1">Negara</label>
                            <input id="edit_user_country" name="edit_user_country" v-model="editingUser.profile.country"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" @click="showEditUserModal = false"
                        class="px-5 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="isSaving"
                        class="px-5 py-2.5 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                    </button>
                </div>
            </form>
        </UiModal>

        <!-- Add User Modal -->
        <UiModal v-model="showAddUserModal" title="Tambah Pengguna Baru" size="lg" :show-default-footer="false">

            <form @submit.prevent="createUser" class="space-y-4">
                <!-- Email -->
                <div>
                    <label for="new_user_email" class="block text-sm font-semibold text-[#333] mb-2">Email <span
                            class="text-red-500">*</span></label>
                    <input id="new_user_email" name="new_user_email" v-model="newUser.email" type="email" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                        placeholder="user@example.com">
                </div>

                <!-- Password -->
                <div>
                    <label for="new_user_password" class="block text-sm font-semibold text-[#333] mb-2">Password <span
                            class="text-red-500">*</span></label>
                    <input id="new_user_password" name="new_user_password" v-model="newUser.password" type="password"
                        required minlength="8"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                        placeholder="Minimal 8 karakter">
                    <p class="text-xs text-[#666] mt-1">Minimal 8 karakter</p>
                </div>

                <!-- Role -->
                <div>
                    <label for="new_user_role" class="block text-sm font-semibold text-[#333] mb-2">Peran <span
                            class="text-red-500">*</span></label>
                    <select id="new_user_role" name="new_user_role" v-model="newUser.role" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <option value="">Pilih Peran</option>
                        <option value="CUSTOMER">Pelanggan</option>
                        <option value="SCANNER">Pemindai</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                </div>

                <!-- Status Toggles -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="new_user_active" class="flex items-center gap-2 cursor-pointer">
                            <input id="new_user_active" name="new_user_active" v-model="newUser.isActive"
                                type="checkbox"
                                class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer">
                            <span class="text-sm font-medium text-[#333]">Aktif</span>
                        </label>
                    </div>
                    <div>
                        <label for="new_user_verified" class="flex items-center gap-2 cursor-pointer">
                            <input id="new_user_verified" name="new_user_verified" v-model="newUser.isEmailVerified"
                                type="checkbox"
                                class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer">
                            <span class="text-sm font-medium text-[#333]">Email Terverifikasi</span>
                        </label>
                    </div>
                </div>

                <!-- Profile Information -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                    <h4 class="text-sm font-bold text-[#333] mb-3">Informasi Profil (Opsional)</h4>

                    <div class="grid grid-cols-2 gap-4">
                        <!-- First Name -->
                        <div>
                            <label for="new_user_fname" class="block text-xs font-medium text-[#666] mb-1">Nama
                                Depan</label>
                            <input id="new_user_fname" name="new_user_fname" v-model="newUser.profile.firstName"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Last Name -->
                        <div>
                            <label for="new_user_lname" class="block text-xs font-medium text-[#666] mb-1">Nama
                                Belakang</label>
                            <input id="new_user_lname" name="new_user_lname" v-model="newUser.profile.lastName"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Phone -->
                        <div>
                            <label for="new_user_phone" class="block text-xs font-medium text-[#666] mb-1">No.
                                Telepon</label>
                            <input id="new_user_phone" name="new_user_phone" v-model="newUser.profile.phone" type="tel"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Date of Birth -->
                        <div>
                            <label for="new_user_dob" class="block text-xs font-medium text-[#666] mb-1">Tanggal
                                Lahir</label>
                            <input id="new_user_dob" name="new_user_dob" v-model="newUser.profile.dateOfBirth"
                                type="date"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Gender -->
                        <div>
                            <label for="new_user_gender"
                                class="block text-xs font-medium text-[#666] mb-1">Jenis Kelamin</label>
                            <select id="new_user_gender" name="new_user_gender" v-model="newUser.profile.gender"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="MALE">Laki-laki</option>
                                <option value="FEMALE">Perempuan</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>

                        <!-- Language -->
                        <div>
                            <label for="new_user_lang"
                                class="block text-xs font-medium text-[#666] mb-1">Bahasa</label>
                            <select id="new_user_lang" name="new_user_lang" v-model="newUser.profile.language"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                                <option value="INDONESIAN">Indonesian</option>
                                <option value="ENGLISH">English</option>
                            </select>
                        </div>

                        <!-- Address -->
                        <div class="col-span-2">
                            <label for="new_user_address"
                                class="block text-xs font-medium text-[#666] mb-1">Alamat</label>
                            <input id="new_user_address" name="new_user_address" v-model="newUser.profile.address"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- City -->
                        <div>
                            <label for="new_user_city" class="block text-xs font-medium text-[#666] mb-1">Kota</label>
                            <input id="new_user_city" name="new_user_city" v-model="newUser.profile.city" type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Postal Code -->
                        <div>
                            <label for="new_user_zip" class="block text-xs font-medium text-[#666] mb-1">Kode
                                Pos</label>
                            <input id="new_user_zip" name="new_user_zip" v-model="newUser.profile.postalCode"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>

                        <!-- Country -->
                        <div class="col-span-2">
                            <label for="new_user_country"
                                class="block text-xs font-medium text-[#666] mb-1">Negara</label>
                            <input id="new_user_country" name="new_user_country" v-model="newUser.profile.country"
                                type="text"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" @click="closeAddUserModal"
                        class="px-5 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="isCreating"
                        class="px-5 py-2.5 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isCreating ? 'Membuat...' : 'Buat Pengguna' }}
                    </button>
                </div>
            </form>
        </UiModal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define TableColumn interface locally (same as in UiTable)
interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    sticky?: boolean
    slot?: boolean
    sortable?: boolean
    headerClass?: string
    cellClass?: string
    width?: string
    minWidth?: string
}

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
})

const { apiFetch } = useFetchApi()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const users = ref<any[]>([])
const stats = ref<any>({
    overview: {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0
    },
    newUsers: {
        last7Days: 0,
        last30Days: 0
    },
    percentages: {
        activePercentage: 0,
        verifiedPercentage: 0
    }
})
const showAddUserModal = ref(false)
const showUserDetailModal = ref(false)
const selectedUser = ref<any>(null)
const showEditUserModal = ref(false)
const editingUser = ref<any>(null)
const isSaving = ref(false)
const isCreating = ref(false)
const newUser = ref({
    email: '',
    password: '',
    role: '',
    isActive: true,
    isEmailVerified: false,
    profile: {
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        country: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        postalCode: '',
        language: 'INDONESIAN'
    }
})

const activeTab = ref('overview')
const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'profile', label: 'Profil' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'activity', label: 'Aktivitas' }
]

// Filters
const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isActive: 'true',
    isEmailVerified: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
})

// Pagination
const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
})

// Table Columns Configuration
const tableColumns: TableColumn[] = [
    { key: 'user', label: 'Pengguna', slot: true, sortable: true, minWidth: '250px' },
    { key: 'role', label: 'Peran', slot: true, width: '150px' },
    { key: 'status', label: 'Status', slot: true, width: '120px' },
    { key: 'transactions', label: 'Transaksi', slot: true, width: '120px' },
    { key: 'lastLogin', label: 'Login Terakhir', slot: true, sortable: true, width: '150px' },
    { key: 'actions', label: '', align: 'right', sticky: true, slot: true, width: '80px' }
]

// Debounce timer
let searchTimeout: NodeJS.Timeout

const activeActionMenu = ref<string | null>(null)
const dropdownPosition = ref({ top: '0px', left: '0px' })
const dropdownStyle = computed(() => ({
    top: dropdownPosition.value.top,
    left: dropdownPosition.value.left
}))

const toggleActionMenu = (id: string | null, event?: Event) => {
    if (activeActionMenu.value === id) {
        activeActionMenu.value = null
        return
    }

    if (id && event) {
        const button = (event.target as HTMLElement).closest('button')
        if (button) {
            const rect = button.getBoundingClientRect()
            // Position: vertically aligned below button (with gap), right aligned with button's right edge
            // 192px is roughly w-48 (12rem)
            dropdownPosition.value = {
                top: `${rect.bottom + 8}px`,
                left: `${rect.right - 192}px`
            }
        }
    }

    activeActionMenu.value = id
}

// Methods
const fetchUserStats = async () => {
    try {
        const response: any = await apiFetch('/api/admin/dashboard/users')
        if (response.success) {
            stats.value = response.data
        }
    } catch (err) {
        console.error('Failed to fetch user stats:', err)
    }
}

const fetchUsers = async () => {
    try {
        isLoading.value = true
        error.value = null

        const query: any = {
            page: filters.value.page,
            limit: filters.value.limit,
            sortBy: filters.value.sortBy,
            sortOrder: filters.value.sortOrder
        }

        if (filters.value.search) query.search = filters.value.search
        if (filters.value.role) query.role = filters.value.role
        if (filters.value.isActive !== '') query.isActive = filters.value.isActive
        if (filters.value.isEmailVerified !== '') query.isEmailVerified = filters.value.isEmailVerified

        const response: any = await apiFetch('/api/admin/users', { query })

        if (response.success && response.data) {
            users.value = response.data.users
            pagination.value = response.data.pagination
        }
    } catch (err: any) {
        console.error('Failed to fetch users:', err)
        error.value = err.data?.message || 'Failed to load users'
    } finally {
        isLoading.value = false
    }
}

const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        filters.value.page = 1
        fetchUsers()
    }, 500)
}

const changePage = (page: number) => {
    filters.value.page = page
    fetchUsers()
}

const handleSort = (key: string) => {
    if (filters.value.sortBy === key) {
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        filters.value.sortBy = key
        filters.value.sortOrder = 'desc' // Default to desc for new column
    }
    fetchUsers()
}

const getUserName = (user: any) => {
    if (user.user_profiles?.firstName && user.user_profiles?.lastName) {
        return `${user.user_profiles.firstName} ${user.user_profiles.lastName}`
    }
    if (user.user_profiles?.firstName) {
        return user.user_profiles.firstName
    }
    return user.email.split('@')[0]
}

const getUserInitials = (user: any) => {
    if (user.user_profiles?.firstName && user.user_profiles?.lastName) {
        return `${user.user_profiles.firstName.charAt(0)}${user.user_profiles.lastName.charAt(0)}`.toUpperCase()
    }
    if (user.user_profiles?.firstName) {
        return user.user_profiles.firstName.charAt(0).toUpperCase()
    }
    return user.email.charAt(0).toUpperCase()
}

const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
        'SUPER_ADMIN': 'Super Admin',
        'ADMIN': 'Admin',
        'SCANNER': 'Pemindai',
        'CUSTOMER': 'Pelanggan'
    }
    return roleMap[role] || role.replace('_', ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

const getRoleBadgeVariant = (role: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    const variants: Record<string, any> = {
        'SUPER_ADMIN': 'info',
        'ADMIN': 'primary',
        'SCANNER': 'warning',
        'CUSTOMER': 'default'
    }
    return variants[role] || 'default'
}

const getTransactionStatusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    const variants: Record<string, any> = {
        'COMPLETED': 'success',
        'PROCESSING': 'info',
        'PENDING': 'warning',
        'FAILED': 'danger',
        'CANCELLED': 'default',
        'REFUNDED': 'default'
    }
    return variants[status] || 'default'
}


const formatDate = (date: string | null) => {
    if (!date) return 'Tidak pernah'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m yang lalu`
    if (diffHours < 24) return `${diffHours}j yang lalu`
    if (diffDays < 7) return `${diffDays}h yang lalu`
    return d.toLocaleDateString('id-ID')
}

const updateLocalStats = (action: 'create' | 'update' | 'delete' | 'toggle', newUser: any, oldUser: any = null) => {
    if (!stats.value) return

    // Helper to check if user counts as active/verified
    const isActive = (u: any) => u.isActive
    const isVerified = (u: any) => u.isEmailVerified

    if (action === 'create') {
        stats.value.overview.totalUsers++
        stats.value.newUsers.last7Days++ // Optimistically increment new users count
        if (isActive(newUser)) stats.value.overview.activeUsers++
        if (isVerified(newUser)) stats.value.overview.verifiedUsers++
    } else if (action === 'delete') {
        stats.value.overview.totalUsers--
        if (isActive(newUser)) stats.value.overview.activeUsers--
        if (isVerified(newUser)) stats.value.overview.verifiedUsers--
    } else if (action === 'toggle' || action === 'update') {
        // Handle Active Status Change
        if (isActive(newUser) !== isActive(oldUser)) {
            if (isActive(newUser)) {
                stats.value.overview.activeUsers++
            } else {
                stats.value.overview.activeUsers--
            }
        }

        // Handle Verified Status Change
        if (isVerified(newUser) !== isVerified(oldUser)) {
            if (isVerified(newUser)) {
                stats.value.overview.verifiedUsers++
            } else {
                stats.value.overview.verifiedUsers--
            }
        }
    }

    // Recalculate Percentages
    if (stats.value.overview.totalUsers > 0) {
        stats.value.percentages.activePercentage = Math.round((stats.value.overview.activeUsers / stats.value.overview.totalUsers) * 100)
        stats.value.percentages.verifiedPercentage = Math.round((stats.value.overview.verifiedUsers / stats.value.overview.totalUsers) * 100)
    }
}

const viewUser = async (user: any) => {
    const { alert } = useAlert()

    try {
        isLoading.value = true

        const response: any = await apiFetch(`/api/admin/users/${user.id}`)

        if (response.success && response.data) {
            selectedUser.value = {
                ...response.data.user,
                recentTransactions: response.data.recentTransactions || [],
                recentActivities: response.data.recentActivities || [],
                statistics: response.data.statistics || {}
            }
            showUserDetailModal.value = true
        }
    } catch (err: any) {
        // Global toast handles error
        // Global toast handles error
    } finally {
        isLoading.value = false
    }
}

const editUser = (user: any) => {
    // Clone user data for editing
    editingUser.value = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        profile: {
            firstName: user.user_profiles?.firstName || '',
            lastName: user.user_profiles?.lastName || '',
            phone: user.user_profiles?.phone || '',
            city: user.user_profiles?.city || '',
            country: user.user_profiles?.country || '',
            dateOfBirth: user.user_profiles?.dateOfBirth ? new Date(user.user_profiles.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user.user_profiles?.gender || '',
            address: user.user_profiles?.address || '',
            postalCode: user.user_profiles?.postalCode || '',
            language: user.user_profiles?.language || 'INDONESIAN'
        }
    }

    showUserDetailModal.value = false
    showEditUserModal.value = true
}

const saveUser = async () => {
    if (!editingUser.value) return

    const { alert } = useAlert()
    isSaving.value = true

    try {
        // Prepare payload with formatted date
        const payload = {
            email: editingUser.value.email,
            role: editingUser.value.role,
            isActive: editingUser.value.isActive,
            isEmailVerified: editingUser.value.isEmailVerified,
            profile: {
                ...editingUser.value.profile,
                dateOfBirth: editingUser.value.profile.dateOfBirth
                    ? new Date(editingUser.value.profile.dateOfBirth).toISOString()
                    : null
            }
        }

        const response: any = await apiFetch(`/api/admin/users/${editingUser.value.id}`, {
            method: 'PATCH',
            body: payload
        })

        if (response.success) {
            await alert.success(
                'Success',
                'User has been updated successfully.'
            )

            // Optimistic Update
            const index = users.value.findIndex(u => u.id === editingUser.value.id)
            if (index !== -1) {
                // Keep original user for stats comparison
                const oldUser = { ...users.value[index] }

                // Update user in list
                users.value[index] = {
                    ...users.value[index],
                    // Merge updated fields from response or payload
                    email: payload.email,
                    role: payload.role,
                    isActive: payload.isActive,
                    isEmailVerified: payload.isEmailVerified,
                    user_profiles: {
                        ...users.value[index].user_profiles,
                        ...payload.profile
                    },
                    updatedAt: new Date().toISOString()
                }

                // Update stats
                updateLocalStats('update', users.value[index], oldUser)
            }

            showEditUserModal.value = false
            editingUser.value = null
            // await fetchUsers() // Removed for optimistic update
        }
    } catch (err: any) {
        // Global toast handles error
    } finally {
        isSaving.value = false
    }
}

const toggleUserStatus = async (user: any) => {
    const { alert } = useAlert()

    const confirmed = await alert.confirm(
        `${user.isActive ? 'Deactivate' : 'Activate'} User`,
        `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} <strong>${getUserName(user)}</strong>?`,
        user.isActive ? 'Deactivate' : 'Activate',
        'Cancel'
    )

    if (!confirmed) return

    try {
        const response: any = await apiFetch(`/api/admin/users/${user.id}/toggle-active`, {
            method: 'PATCH'
        })

        if (response.success) {
            await alert.success(
                'Success',
                `User has been ${user.isActive ? 'deactivated' : 'activated'} successfully.`
            )

            // Optimistic Update
            const index = users.value.findIndex(u => u.id === user.id)
            if (index !== -1) {
                const oldUser = { ...users.value[index] }
                users.value[index].isActive = !user.isActive
                updateLocalStats('toggle', users.value[index], oldUser)
            }
            // await fetchUsers() // Removed for optimistic update
        }
    } catch (err: any) {
        // Global toast handles error
    }
}

const deleteUser = async (user: any, hardDelete = false) => {
    const { alert } = useAlert()

    const confirmed = await alert.confirm(
        hardDelete ? 'Permanently Delete User' : 'Delete User',
        hardDelete
            ? `Are you sure you want to <strong>PERMANENTLY DELETE</strong> <strong>${getUserName(user)}</strong>?<br><br>This will delete all user data including transactions, activities, and cannot be undone.`
            : `Are you sure you want to delete <strong>${getUserName(user)}</strong>?<br><br>This will deactivate the user account.`,
        hardDelete ? 'Permanently Delete' : 'Delete',
        'Cancel'
    )

    if (!confirmed) return

    try {
        const query = hardDelete ? { hardDelete: 'true' } : {}
        const response: any = await apiFetch(`/api/admin/users/${user.id}`, {
            method: 'DELETE',
            query
        })

        if (response.success) {
            await alert.success(
                'Success',
                hardDelete
                    ? 'User has been permanently deleted.'
                    : 'User has been deactivated successfully.'
            )

            // Optimistic Update
            const index = users.value.findIndex(u => u.id === user.id)
            if (index !== -1) {
                if (hardDelete) {
                    // Permanently remove from list
                    const oldUser = users.value[index]
                    users.value.splice(index, 1)
                    updateLocalStats('delete', oldUser)
                } else {
                    // Soft delete (deactivate)
                    const oldUser = { ...users.value[index] }
                    users.value[index].isActive = false
                    updateLocalStats('toggle', users.value[index], oldUser)
                }
            }
            // await fetchUsers() // Removed for optimistic update
        }
    } catch (err: any) {
        // Global toast handles error
    }
}

const createUser = async () => {
    const { alert } = useAlert()
    isCreating.value = true

    try {
        const response: any = await apiFetch('/api/admin/users', {
            method: 'POST',
            body: {
                email: newUser.value.email,
                password: newUser.value.password,
                role: newUser.value.role,
                isActive: newUser.value.isActive,
                isEmailVerified: newUser.value.isEmailVerified,
                profile: newUser.value.profile
            }
        })

        if (response.success && response.data) {
            await alert.success(
                'Success',
                'User has been created successfully.'
            )

            // Optimistic Update
            // Add new user to start of list
            const createdUser = {
                ...response.data.user,
                user_profiles: response.data.user.user_profiles || newUser.value.profile // Fallback if profile not fully returned
            }
            users.value.unshift(createdUser)
            updateLocalStats('create', createdUser)

            closeAddUserModal()
            // await fetchUsers() // Removed for optimistic update
        }
    } catch (err: any) {
        // Global toast handles error
    } finally {
        isCreating.value = false
    }
}

const closeAddUserModal = () => {
    showAddUserModal.value = false
    // Reset form
    newUser.value = {
        email: '',
        password: '',
        role: '',
        isActive: true,
        isEmailVerified: false,
        profile: {
            firstName: '',
            lastName: '',
            phone: '',
            city: '',
            country: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            postalCode: '',
            language: 'INDONESIAN'
        }
    }
}

// Fetch users on mount
// Fetch users on mount
onMounted(() => {
    fetchUsers()
    fetchUserStats()
})
</script>
