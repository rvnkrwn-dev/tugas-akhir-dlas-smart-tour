<template>
    <div class="space-y-4 sm:space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Manajemen Wahana</h2>
                    <p class="text-xs sm:text-sm text-[#666]">Kelola wahana, harga, dan ketersediaan</p>
                </div>
                <button @click="openCreateModal"
                    class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Wahana</span>
                </button>
            </div>
        </div>



        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col lg:flex-row gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="attraction_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="attraction_search" name="attraction_search" v-model="filters.search"
                            @input="debouncedSearch" type="text" placeholder="Cari berdasarkan nama atau deskripsi..."
                            class="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <!-- Filters Group -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:flex lg:items-end w-full lg:w-auto">
                    <!-- Type Filter -->
                    <div class="w-full lg:w-40">
                        <label for="attraction_type"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Tipe</label>
                        <div class="relative">
                            <select id="attraction_type" name="attraction_type" v-model="filters.type"
                                @change="fetchAttractions"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                                <option value="">Semua Tipe</option>
                                <option value="Museum">Museum</option>
                                <option value="Park">Taman</option>
                                <option value="Beach">Pantai</option>
                                <option value="Temple">Candi</option>
                                <option value="Adventure">Petualangan</option>
                                <option value="Cultural">Budaya</option>
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
                        <label for="attraction_status"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                        <div class="relative">
                            <select id="attraction_status" name="attraction_status" v-model="filters.isActive"
                                @change="fetchAttractions"
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
                </div>
            </div>
        </div>

        <!-- Attractions Table -->
        <UiTable :columns="columns" :data="attractions" :loading="isLoading" :error="error" :on-retry="fetchAttractions"
            :sort-by="filters.sortBy" :sort-order="filters.sortOrder as 'asc' | 'desc'" @sort="handleSort">
            <!-- Image Cell -->
            <template #cell-image="{ row }">
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img v-if="row.imageUrl" :src="row.imageUrl" :alt="row.name" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </template>

            <!-- Name Cell -->
            <template #cell-name="{ row }">
                <div class="min-w-[150px] max-w-[200px]">
                    <div class="font-semibold text-[#333] text-sm truncate" :title="row.name">{{ row.name }}</div>
                    <div class="text-xs text-[#666] mt-0.5 truncate" :title="row.slug">/{{ row.slug }}</div>
                </div>
            </template>

            <!-- Type Cell -->
            <template #cell-type="{ row }">
                <span class="text-sm text-[#666] whitespace-nowrap">{{ row.type || '-' }}</span>
            </template>

            <!-- Pricing Cell -->
            <template #cell-pricing="{ row }">
                <div class="text-sm whitespace-nowrap">
                    <div class="font-semibold text-[#333]">
                        {{ formatCurrency(row.adultPrice, row.currency) }}
                    </div>
                    <div v-if="row.childPrice" class="text-xs text-[#666]">
                        Child: {{ formatCurrency(row.childPrice, row.currency) }}
                    </div>
                </div>
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
                </div>
            </template>

            <!-- Created Date Cell -->
            <template #cell-createdAt="{ row }">
                <span class="text-sm text-[#666] whitespace-nowrap">
                    {{ formatDate(row.createdAt) }}
                </span>
            </template>

            <!-- Actions Cell -->
            <template #cell-actions="{ row }">
                <div class="relative w-[80px] flex justify-end">
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
                            <button @click="viewAttraction(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Details
                            </button>

                            <!-- Edit Attraction -->
                            <button @click="editAttraction(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Wahana
                            </button>

                            <!-- Delete Attraction -->
                            <button @click="deleteAttraction(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus Wahana
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
                <UiPagination v-if="attractions.length > 0" :current-page="pagination.page"
                    :total-pages="pagination.totalPages" :total-items="pagination.total"
                    :items-per-page="pagination.limit" :has-prev-page="pagination.hasPrevPage"
                    :has-next-page="pagination.hasNextPage" item-name="attractions" @change="changePage" />
            </template>
        </UiTable>

        <!-- View Attraction Detail Modal -->
        <UiModal v-model="showDetailModal" title="Detail Wahana" size="lg" :show-default-footer="false">
            <div v-if="selectedAttraction" class="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
                <!-- Attraction Header Card (Fixed) -->
                <div
                    class="bg-gradient-to-br from-[#4CAF50]/5 to-[#45a049]/5 rounded-xl p-4 sm:p-5 border border-[#4CAF50]/20 flex-shrink-0 mb-4">
                    <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        <!-- Thumbnail -->
                        <div
                            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg shadow-green-600/20 flex-shrink-0 bg-gray-100">
                            <img v-if="selectedAttraction.imageUrl" :src="selectedAttraction.imageUrl"
                                :alt="selectedAttraction.name" class="w-full h-full object-cover">
                            <div v-else
                                class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        <!-- Attraction Info -->
                        <div class="flex-1 min-w-0 w-full">
                            <h3 class="text-xl sm:text-2xl font-bold text-[#333] mb-1">{{ selectedAttraction.name }}
                            </h3>
                            <NuxtLink :to="`/wahana/${selectedAttraction.slug}`" target="_blank"
                                class="flex items-center gap-2 text-xs sm:text-sm text-[#666] mb-3 hover:text-[#4CAF50] transition-colors group">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span class="font-mono decoration-[1.5px] group-hover:underline">/{{
                                    selectedAttraction.slug }}</span>
                                <svg class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </NuxtLink>

                            <!-- Badges -->
                            <div class="flex flex-wrap gap-2">
                                <span :class="[
                                    'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                    selectedAttraction.isActive
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                ]">
                                    {{ selectedAttraction.isActive ? 'Aktif' : 'Tidak Aktif' }}
                                </span>
                                <span
                                    class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    {{ selectedAttraction.type }}
                                </span>
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

                <!-- Tab Content -->
                <div class="flex-1 overflow-y-auto pr-1">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'" class="space-y-4">
                        <!-- Cover Image (Large) -->
                        <div
                            class="relative w-full h-48 sm:h-64 bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-100">
                            <img v-if="selectedAttraction.imageUrl" :src="selectedAttraction.imageUrl"
                                :alt="selectedAttraction.name" class="w-full h-full object-cover">
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        <!-- Gallery Images Grid -->
                        <div v-if="selectedAttraction.imageUrls && selectedAttraction.imageUrls.length > 0" class="mb-6">
                            <h4 class="text-sm font-bold text-[#333] mb-3">Galeri</h4>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div v-for="(img, idx) in selectedAttraction.imageUrls" :key="idx"
                                    class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group">
                                    <img :src="img" :alt="`${selectedAttraction.name} gallery ${idx + 1}`"
                                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                                </div>
                            </div>
                        </div>

                        <!-- Info Cards Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <!-- Type Card -->
                            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-semibold text-blue-600 mb-0.5">Tipe</p>
                                        <p class="text-sm font-bold text-blue-900 truncate">{{ selectedAttraction.type
                                            || '-' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Capacity Card -->
                            <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-semibold text-purple-600 mb-0.5">Kapasitas</p>
                                        <p class="text-sm font-bold text-purple-900">{{ selectedAttraction.capacity ||
                                            '-' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Duration Card -->
                            <div class="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-semibold text-orange-600 mb-0.5">Durasi</p>
                                        <p class="text-sm font-bold text-orange-900">
                                            {{ selectedAttraction.durationMinutes ?
                                                `${selectedAttraction.durationMinutes} mnt`
                                                : '-' }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Currency Card -->
                            <div class="bg-green-50 rounded-xl p-4 border border-green-100">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-semibold text-green-600 mb-0.5">Mata Uang</p>
                                        <p class="text-sm font-bold text-green-900">{{ selectedAttraction.currency ||
                                            'IDR' }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing Section -->
                        <div
                            class="bg-gradient-to-br from-[#4CAF50]/5 to-[#45a049]/10 rounded-2xl p-5 border border-[#4CAF50]/20 mb-6">
                            <h4 class="text-sm font-bold text-[#333] mb-4 flex items-center gap-2">
                                <svg class="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Harga
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="bg-white rounded-xl p-4 border border-gray-200">
                                    <p class="text-xs font-semibold text-[#666] mb-1">Tiket Dewasa</p>
                                    <p class="text-lg font-bold text-[#4CAF50]">
                                        {{ formatCurrency(selectedAttraction.adultPrice, selectedAttraction.currency) }}
                                    </p>
                                </div>
                                <div class="bg-white rounded-xl p-4 border border-gray-200">
                                    <p class="text-xs font-semibold text-[#666] mb-1">Tiket Anak</p>
                                    <p class="text-lg font-bold text-[#4CAF50]">
                                        {{ selectedAttraction.childPrice ?
                                            formatCurrency(selectedAttraction.childPrice,
                                                selectedAttraction.currency) : '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Details Tab -->
                    <div v-if="activeTab === 'details'" class="space-y-4">
                        <div v-if="selectedAttraction.shortDescription"
                            class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label class="text-xs font-bold text-[#666] uppercase tracking-wide mb-2 block">Deskripsi Singkat</label>
                            <p class="text-sm text-[#333] leading-relaxed">{{ selectedAttraction.shortDescription }}</p>
                        </div>

                        <div v-if="selectedAttraction.description"
                            class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label class="text-xs font-bold text-[#666] uppercase tracking-wide mb-2 block">Deskripsi Lengkap</label>
                            <p class="text-sm text-[#333] leading-relaxed whitespace-pre-wrap">{{
                                selectedAttraction.description }}
                            </p>
                        </div>

                        <div v-if="!selectedAttraction.shortDescription && !selectedAttraction.description"
                            class="text-center py-10">
                            <p class="text-sm text-[#999]">Tidak ada deskripsi</p>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div
                    class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 mt-auto flex-shrink-0">
                    <button @click="showDetailModal = false"
                        class="px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200 order-3 sm:order-1">
                        Tutup
                    </button>
                    <button @click="toggleAttractionStatus(selectedAttraction)" :class="[
                        'px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-colors cursor-pointer order-2',
                        selectedAttraction.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                    ]">
                        {{ selectedAttraction.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
                    </button>
                    <button @click="editAttraction(selectedAttraction)"
                        class="px-4 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer order-1 sm:order-3">
                        Edit Wahana
                    </button>
                </div>
            </div>
        </UiModal>

        <!-- Add/Edit Attraction Modal -->
        <UiModal v-model="showEditModal" :title="editingAttraction?.id ? 'Edit Wahana' : 'Tambah Wahana Baru'"
            size="xl" :show-default-footer="false">
            <form @submit.prevent="saveAttraction" class="space-y-4">
                <!-- Name & Slug -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="attraction_name" class="block text-sm font-semibold text-[#333] mb-2">Nama <span
                                class="text-red-500">*</span></label>
                        <input id="attraction_name" name="attraction_name" v-model="editingAttraction.name"
                            @blur="handleNameBlur" type="text" required placeholder="Contoh: Candi Borobudur"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_slug" class="block text-sm font-semibold text-[#333] mb-2">
                            Slug
                            <span class="text-xs font-normal text-[#666]">(auto-generated)</span>
                        </label>
                        <div class="relative">
                            <input id="attraction_slug" name="attraction_slug" v-model="editingAttraction.slug"
                                type="text" readonly placeholder="Otomatis dari nama"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 outline-none text-sm cursor-not-allowed">
                            <div class="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Type & Priority -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="attraction_type_input"
                            class="block text-sm font-semibold text-[#333] mb-2">Tipe</label>
                        <input id="attraction_type_input" name="attraction_type_input" v-model="editingAttraction.type"
                            type="text" placeholder="Contoh: Candi, Museum, Taman, Pantai"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_priority"
                            class="block text-sm font-semibold text-[#333] mb-2">Prioritas</label>
                        <input id="attraction_priority" name="attraction_priority"
                            v-model.number="editingAttraction.priority" type="number" min="0"
                            placeholder="0 (angka lebih tinggi = prioritas lebih tinggi)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                </div>

                <!-- Pricing -->
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label for="attraction_adult_price" class="block text-sm font-semibold text-[#333] mb-2">Tiket Dewasa
                            <span class="text-red-500">*</span></label>
                        <input id="attraction_adult_price" name="attraction_adult_price"
                            v-model.number="editingAttraction.adultPrice" type="number" step="0.01" required
                            placeholder="Contoh: 50000"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_child_price" class="block text-sm font-semibold text-[#333] mb-2">Tiket Anak</label>
                        <input id="attraction_child_price" name="attraction_child_price"
                            v-model.number="editingAttraction.childPrice" type="number" step="0.01"
                            placeholder="Contoh: 25000 (opsional)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_currency"
                            class="block text-sm font-semibold text-[#333] mb-2">Mata Uang</label>
                        <input id="attraction_currency" name="attraction_currency" v-model="editingAttraction.currency"
                            type="text" maxlength="3" placeholder="IDR"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                </div>

                <!-- Capacity & Duration -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="attraction_capacity"
                            class="block text-sm font-semibold text-[#333] mb-2">Kapasitas</label>
                        <input id="attraction_capacity" name="attraction_capacity"
                            v-model.number="editingAttraction.capacity" type="number" min="0"
                            placeholder="Contoh: 100 (maks pengunjung per hari)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_duration" class="block text-sm font-semibold text-[#333] mb-2">Durasi
                            (menit)</label>
                        <input id="attraction_duration" name="attraction_duration"
                            v-model.number="editingAttraction.durationMinutes" type="number" min="0"
                            placeholder="Contoh: 120 (rata-rata lama kunjungan)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                </div>

                <!-- Age Restrictions -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="attraction_min_age" class="block text-sm font-semibold text-[#333] mb-2">Min
                            Usia</label>
                        <input id="attraction_min_age" name="attraction_min_age"
                            v-model.number="editingAttraction.minAge" type="number" min="0"
                            placeholder="Contoh: 5 (opsional)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                    <div>
                        <label for="attraction_max_age" class="block text-sm font-semibold text-[#333] mb-2">Max
                            Usia</label>
                        <input id="attraction_max_age" name="attraction_max_age"
                            v-model.number="editingAttraction.maxAge" type="number" min="0"
                            placeholder="Contoh: 80 (opsional)"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                    </div>
                </div>

                <!-- Cover Image Upload -->
                <div>
                    <label class="block text-sm font-semibold text-[#333] mb-2">Gambar Sampul</label>
                    <input ref="coverInputRef" type="file" accept="image/*" class="hidden" @change="handleCoverFileChange">
                    
                    <div class="flex items-start gap-4">
                        <div class="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                            <img v-if="previewCover" :src="previewCover" class="w-full h-full object-cover">
                            <img v-else-if="editingAttraction.imageUrl" :src="editingAttraction.imageUrl" class="w-full h-full object-cover">
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <button type="button" @click="triggerCoverInput"
                                class="px-4 py-2 text-sm font-medium text-[#4CAF50] bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                                {{ editingAttraction.imageUrl || previewCover ? 'Ubah Sampul' : 'Unggah Sampul' }}
                            </button>
                            <p class="text-xs text-gray-500 mt-2">Ukuran rekomendasi: 1200x800px. Maks 5MB.</p>
                        </div>
                    </div>
                </div>

                <!-- Gallery Images Upload -->
                <div>
                    <label class="block text-sm font-semibold text-[#333] mb-2">Gambar Galeri</label>
                    <input ref="galleryInputRef" type="file" multiple accept="image/*" class="hidden" @change="handleGalleryFilesChange">

                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div class="grid grid-cols-2 small:grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                            <!-- Existing Images -->
                            <div v-for="(url, index) in editingAttraction.imageUrls" :key="'existing-' + index" 
                                class="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 bg-white">
                                <img :src="url" class="w-full h-full object-cover">
                                <button type="button" @click="removeGalleryImage(index, true)"
                                    class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-0.5 text-center">
                                    Existing
                                </div>
                            </div>

                            <!-- New Preview Images -->
                            <div v-for="(item, index) in previewGalleryImages" :key="'new-' + index"
                                class="relative aspect-square rounded-lg overflow-hidden group border border-green-200 bg-white ring-2 ring-green-500/20">
                                <img :src="item.url" class="w-full h-full object-cover">
                                <button type="button" @click="removeGalleryImage(index, false)"
                                    class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div class="absolute bottom-0 left-0 right-0 bg-green-500/90 text-white text-[10px] px-2 py-0.5 text-center font-medium">
                                    New
                                </div>
                            </div>

                            <!-- Add Button -->
                            <button type="button" @click="triggerGalleryInput"
                                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#4CAF50] hover:bg-green-50 flex flex-col items-center justify-center text-gray-400 hover:text-[#4CAF50] transition-all gap-2">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span class="text-xs font-medium">Tambah Gambar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Short Description -->
                <div>
                    <label for="attraction_short_desc" class="block text-sm font-semibold text-[#333] mb-2">Deskripsi
                        Singkat</label>
                    <textarea id="attraction_short_desc" name="attraction_short_desc"
                        v-model="editingAttraction.shortDescription" rows="2" maxlength="500"
                        placeholder="Ringkasan singkat tentang wahana (maks 500 karakter)"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm resize-none"></textarea>
                </div>

                <!-- Full Description -->
                <div>
                    <label for="attraction_full_desc" class="block text-sm font-semibold text-[#333] mb-2">Deskripsi
                        Lengkap</label>
                    <textarea id="attraction_full_desc" name="attraction_full_desc"
                        v-model="editingAttraction.description" rows="4"
                        placeholder="Deskripsi detail tentang wahana, termasuk sejarah, fitur, dan informasi pengunjung..."
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm resize-none"></textarea>
                </div>

                <!-- Status -->
                <div>
                    <label for="attraction_active" class="flex items-center gap-2 cursor-pointer">
                        <input id="attraction_active" name="attraction_active" v-model="editingAttraction.isActive"
                            type="checkbox"
                            class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer">
                        <span class="text-sm font-medium text-[#333]">Aktif</span>
                    </label>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" @click="closeEditModal"
                        class="px-5 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="isSaving"
                        class="px-5 py-2.5 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isSaving ? 'Menyimpan...' : 'Simpan Wahana' }}
                    </button>
                </div>
            </form>
        </UiModal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'
import type { Attraction, AttractionListResponse } from '~/types/attraction'

// Define TableColumn interface locally
// Define TableColumn interface locally
interface TableColumn {
    key: string
    label: string
    sortable?: boolean
    slot?: boolean
    sticky?: boolean
    width?: string
    minWidth?: string
    align?: 'left' | 'center' | 'right'
}

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
})

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const attractions = ref<Attraction[]>([])
const showDetailModal = ref(false)
const showEditModal = ref(false)
const selectedAttraction = ref<Attraction | null>(null)
const editingAttraction = ref<Partial<Attraction>>({})
const isSaving = ref(false)


// Action Dropdown State
const activeActionMenu = ref<string | null>(null)
const dropdownPosition = ref({ top: '0px', left: '0px' })
const dropdownStyle = computed(() => ({
    top: dropdownPosition.value.top,
    left: dropdownPosition.value.left
}))

// File Upload State
const selectedCoverFile = ref<File | null>(null)
const previewCover = ref<string | null>(null)
const selectedGalleryFiles = ref<File[]>([])
const previewGalleryImages = ref<{ file: File; url: string }[]>([])
const deletedGalleryUrls = ref<string[]>([])

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

// File Input Refs
const coverInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)

// Handle Cover Image Selection
const triggerCoverInput = () => {
    coverInputRef.value?.click()
}

const handleCoverFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert.error('Error', 'Hanya format PNG, JPG, JPEG, dan WEBP yang diperbolehkan')
            input.value = ''
            return
        }

        selectedCoverFile.value = file
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            previewCover.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

// Handle Gallery Image Selection
const triggerGalleryInput = () => {
    galleryInputRef.value?.click()
}

const handleGalleryFilesChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files) {
        const newFiles = Array.from(input.files)
        const validFiles: File[] = []
        let hasInvalid = false

        newFiles.forEach(file => {
            if (ALLOWED_TYPES.includes(file.type)) {
                validFiles.push(file)
            } else {
                hasInvalid = true
            }
        })

        if (hasInvalid) {
            alert.error('Error', 'Beberapa file dilewati. Hanya format PNG, JPG, JPEG, dan WEBP yang diperbolehkan')
        }

        if (validFiles.length > 0) {
            selectedGalleryFiles.value = [...selectedGalleryFiles.value, ...validFiles]

            // Create previews
            validFiles.forEach(file => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    previewGalleryImages.value.push({
                        file,
                        url: e.target?.result as string
                    })
                }
                reader.readAsDataURL(file)
            })
        }
    }
    // Reset input so same files can be selected again if needed
    if (input) input.value = ''
}

// Remove Gallery Image
const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
        // Mark existing image for deletion
        if (editingAttraction.value.imageUrls && editingAttraction.value.imageUrls[index]) {
            deletedGalleryUrls.value.push(editingAttraction.value.imageUrls[index])
            editingAttraction.value.imageUrls.splice(index, 1)
        }
    } else {
        // Remove from new selection
        selectedGalleryFiles.value.splice(index, 1)
        previewGalleryImages.value.splice(index, 1)
    }
}

// Tabs
const activeTab = ref('overview')
const tabs = [
    { id: 'overview', label: 'Ringkasan' },
    { id: 'details', label: 'Detail' }
]

// Filters
const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    isActive: 'true',
    sortBy: 'createdAt',
    sortOrder: 'desc'
})

// Pagination
const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
})

// Table columns
const columns: TableColumn[] = [
    { key: 'image', label: 'Gambar', slot: true, width: '80px', sortable: false },
    { key: 'name', label: 'Nama', slot: true, sortable: true, minWidth: '150px' },
    { key: 'type', label: 'Tipe', slot: true, sortable: true, width: '120px' },
    { key: 'pricing', label: 'Harga', slot: true, sortable: true, width: '140px' },
    { key: 'status', label: 'Status', slot: true, sortable: true, width: '120px' },
    { key: 'createdAt', label: 'Dibuat', slot: true, sortable: true, width: '120px' },
    { key: 'actions', label: '', slot: true, sticky: true, width: '80px', align: 'right' }
]

// Composables
const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Handle name blur to generate unique slug
const handleNameBlur = async () => {
    // Only generate slug for new attractions or if name changed significantly
    if (!editingAttraction.value || !editingAttraction.value.name) return

    // Simple check: if slug is already set and we are editing, maybe don't regenerate unless empty
    if (editingAttraction.value.id && editingAttraction.value.slug) return

    const baseSlug = generateSlug(editingAttraction.value.name)
    editingAttraction.value.slug = baseSlug

    try {
        const response = await apiFetch<ApiResponse<Attraction>>(`/api/attractions/${baseSlug}`)
        if (response.success) {
            // Slug exists (attraction found), so append timestamp to make it unique for new creation
            // Or handle collision logic. Here we just ensure current form slug is unique.
            // Wait, if response.success that means slug acts conflict?
            // Actually index.get.ts returns success if found.
            // If we are creating new, we don't want conflict.
            editingAttraction.value.slug = `${baseSlug}-${Date.now()}`
        }
    } catch (err: any) {
        if (err.statusCode === 404) {
            // Slug is available (not found)
        } else {
            console.error('Error checking slug availability:', err)
        }
    }
}




const handleSort = (key: string) => {
    if (filters.value.sortBy === key) {
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        filters.value.sortBy = key
        filters.value.sortOrder = 'desc'
    }
    fetchAttractions()
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        filters.value.page = 1
        fetchAttractions()
    }, 500)
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
                left: `${rect.right - 192}px` // Align right edge
            }
        }
    }

    activeActionMenu.value = id
}

// Fetch attractions
const fetchAttractions = async () => {
    isLoading.value = true
    error.value = null

    try {
        const query: any = {
            page: filters.value.page,
            limit: filters.value.limit,
            sortBy: filters.value.sortBy,
            sortOrder: filters.value.sortOrder
        }

        if (filters.value.search) query.search = filters.value.search
        if (filters.value.type) query.type = filters.value.type
        if (filters.value.isActive !== '') query.isActive = filters.value.isActive

        const response = await apiFetch<ApiResponse<AttractionListResponse>>('/api/admin/attractions', {
            method: 'GET',
            params: query
        })

        if (response.success) {
            attractions.value = response.data.attractions
            pagination.value = {
                page: response.data.currentPage,
                limit: response.data.limit,
                total: response.data.totalItems,
                totalPages: response.data.totalPages,
                hasNextPage: response.data.hasNext,
                hasPrevPage: response.data.hasPrev
            }
        }
    } catch (err: any) {
        error.value = err.message || 'Gagal mengambil data wahana'
        console.error('Failed to fetch attractions:', err)
    } finally {
        isLoading.value = false
    }
}

const changePage = (page: number) => {
    filters.value.page = page
    fetchAttractions()
}

// Format currency
const formatCurrency = (amount: number | string, currency: string = 'IDR') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount)
}

// Format date
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// View attraction
const viewAttraction = (attraction: any) => {
    selectedAttraction.value = attraction
    showDetailModal.value = true
}

// Create Attraction (Open Modal)
const openCreateModal = () => {
    editingAttraction.value = {
        name: '',
        slug: '',
        type: '',
        priority: 0,
        adultPrice: 0,
        childPrice: null,
        currency: 'IDR',
        capacity: null,
        durationMinutes: null,
        minAge: null,
        maxAge: null,
        imageUrl: '',
        imageUrls: [],
        shortDescription: '',
        description: '',
        isActive: true
    }
    
    // Reset file states
    selectedCoverFile.value = null
    previewCover.value = null
    selectedGalleryFiles.value = []
    previewGalleryImages.value = []
    deletedGalleryUrls.value = []
    if (coverInputRef.value) coverInputRef.value.value = ''
    if (galleryInputRef.value) galleryInputRef.value.value = ''

    showEditModal.value = true
}

// Edit Attraction (Open Modal)
const editAttraction = (attraction: any) => {
    const clone = JSON.parse(JSON.stringify(attraction)) // Deep clone
    if (!clone.imageUrls) clone.imageUrls = []
    editingAttraction.value = clone
    
    // Reset file states
    selectedCoverFile.value = null
    previewCover.value = null
    selectedGalleryFiles.value = []
    previewGalleryImages.value = []
    deletedGalleryUrls.value = []
    if (coverInputRef.value) coverInputRef.value.value = ''
    if (galleryInputRef.value) galleryInputRef.value.value = ''

    showEditModal.value = true
}

// Save Attraction
const saveAttraction = async () => {
    if (!editingAttraction.value) return
    isSaving.value = true

    try {
        const isEdit = !!editingAttraction.value.id
        const endpoint = isEdit
            ? `/api/admin/attractions/${editingAttraction.value.id}`
            : '/api/admin/attractions'

        // FormData for Create (Post)
        if (!isEdit) {
            const formData = new FormData()
            
            // Append text fields
            const dataToSubmit = editingAttraction.value as any
            Object.keys(dataToSubmit).forEach(key => {
                const value = dataToSubmit[key]
                if (key === 'imageUrls' || key === 'imageUrl') return // specific handling
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value))
                }
            })

            // Append cover image
            if (selectedCoverFile.value) {
                formData.append('image', selectedCoverFile.value)
            }

            // Append gallery images
            selectedGalleryFiles.value.forEach(file => {
                formData.append('images', file)
            })

            const response: any = await apiFetch(endpoint, {
                method: 'POST',
                body: formData
            })

            if (response.success) {
                await alert.success('Berhasil', 'Wahana berhasil dibuat')
                showEditModal.value = false
                fetchAttractions()
            }
        } 
        // Logic for Edit (Patch)
        else {
            // 1. Update text fields
            const payload = { ...editingAttraction.value }
            
            // Ensure numbers are actual numbers
            if (payload.adultPrice) payload.adultPrice = Number(payload.adultPrice)
            if (payload.childPrice) payload.childPrice = Number(payload.childPrice)
            if (payload.capacity) payload.capacity = Number(payload.capacity)
            if (payload.durationMinutes) payload.durationMinutes = Number(payload.durationMinutes)
            if (payload.minAge) payload.minAge = Number(payload.minAge)
            if (payload.maxAge) payload.maxAge = Number(payload.maxAge)
            if (payload.priority) payload.priority = Number(payload.priority)

            // Remove non-data fields handled separately
            delete payload.imageUrl
            delete payload.imageUrls

            const response: any = await apiFetch(endpoint, {
                method: 'PATCH',
                body: payload
            })

            if (!response.success) throw new Error('Gagal memperbarui detail wahana')

            const attractionId = editingAttraction.value.id

            // 2. Update cover image if changed
            if (selectedCoverFile.value) {
                const coverFormData = new FormData()
                coverFormData.append('image', selectedCoverFile.value)
                await apiFetch(`/api/admin/attractions/${attractionId}/images/cover`, {
                    method: 'PATCH',
                    body: coverFormData
                })
            }

            // 3. Add new gallery images
            if (selectedGalleryFiles.value.length > 0) {
                const galleryFormData = new FormData()
                selectedGalleryFiles.value.forEach(file => {
                    galleryFormData.append('images', file)
                })
                await apiFetch(`/api/admin/attractions/${attractionId}/images/gallery`, {
                    method: 'POST',
                    body: galleryFormData
                })
            }

            // 4. Delete removed gallery images
            if (deletedGalleryUrls.value.length > 0) {
                // Delete individually as the API expects one by one (based on typical REST, verifying with earlier file read)
                // Actually gallery.delete.ts takes { imageUrl: ... }
                // We can run these in parallel
                await Promise.all(deletedGalleryUrls.value.map(url => 
                    apiFetch(`/api/admin/attractions/${attractionId}/images/gallery`, {
                        method: 'DELETE',
                        body: { imageUrl: url }
                    })
                ))
            }

            await alert.success('Berhasil', 'Wahana berhasil diperbarui')
            showEditModal.value = false
            fetchAttractions()
        }

    } catch (err: any) {
        console.error(err)
        // Global toast will handle the error
        // await alert.error('Error', err.data?.message || err.message || 'Gagal menyimpan wahana')
    } finally {
        isSaving.value = false
    }
}

// Delete Attraction
const deleteAttraction = async (attraction: any) => {
    const confirmed = await alert.confirm(
        'Hapus Wahana',
        `Apakah Anda yakin ingin menghapus <strong>${attraction.name}</strong>?`,
        'Hapus',
        'Batal'
    )

    if (!confirmed) return

    try {
        const response: any = await apiFetch(`/api/admin/attractions/${attraction.id}`, {
            method: 'DELETE'
        })

        if (response.success) {
            await alert.success('Berhasil', 'Wahana berhasil dihapus')
            fetchAttractions()
        }
    } catch (err: any) {
        // Global toast will handle the error
        // await alert.error('Error', err.data?.message || 'Gagal menghapus wahana')
    }
}

// Toggle Status
const toggleAttractionStatus = async (attraction: any) => {
    try {
        const response: any = await apiFetch(`/api/admin/attractions/${attraction.id}`, {
            method: 'PATCH',
            body: { isActive: !attraction.isActive }
        })

        if (response.success) {
            attraction.isActive = !attraction.isActive
            // Optionally refresh stats if they depend on active count
        }
    } catch (err: any) {
        // Global toast will handle the error
        // await alert.error('Error', err.data?.message || 'Gagal memperbarui status')
    }
}

const closeEditModal = () => {
    showEditModal.value = false
    editingAttraction.value = null as any
}

onMounted(() => {
    fetchAttractions()
})
</script>
