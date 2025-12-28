<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Testimoni</h2>
                    <p class="text-xs sm:text-sm text-[#666]">Kelola ulasan dan penilaian dari pengunjung</p>
                </div>
                <button @click="openInviteModal"
                    class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Kirim Undangan</span>
                </button>
            </div>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="testimonial_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="testimonial_search" name="testimonial_search" v-model="search" type="text"
                            placeholder="Cari ulasan..."
                            class="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                            @input="page = 1">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="w-full sm:w-48 lg:w-56">
                    <label for="testimonial_status"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                    <div class="relative">
                        <select id="testimonial_status" v-model="filterStatus" @change="page = 1"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm appearance-none cursor-pointer bg-white">
                            <option value="ALL">Semua Ulasan</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                        <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <UiTable :columns="columns" :data="testimonials" :loading="loading" error=""
            :no-data-message="'Tidak ada testimoni ditemukan'"
            :no-data-sub-message="'Coba ubah filter atau kata kunci pencarian Anda'">

            <!-- User -->
            <template #cell-user="{ row }">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        :class="row.avatarColor || getAvatarColor(row.name)">
                        {{ getInitials(row.name) }}
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-[#333] truncate" :title="row.name">{{ row.name }}</p>
                        <div v-if="row.isPublished"
                            class="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                            <span>Publik</span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Rating -->
            <template #cell-rating="{ row }">
                <div class="flex items-center gap-1">
                    <span class="font-bold text-sm text-[#333]">{{ row.rating }}</span>
                    <svg class="w-3.5 h-3.5 text-orange-400 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            </template>

            <!-- Comment -->
            <template #cell-comment="{ row }">
                <p class="text-sm text-gray-600 line-clamp-2" :title="row.comment">{{ row.comment }}</p>
            </template>

            <!-- Status -->
            <template #cell-status="{ row }">
                <UiBadge :variant="getStatusVariant(row.status)">
                    {{ formatStatus(row.status) }}
                </UiBadge>
            </template>

            <!-- Created At -->
            <template #cell-createdAt="{ row }">
                <span class="text-sm text-[#666]">{{ formatDate(row.createdAt) }}</span>
            </template>

            <!-- Actions -->
            <template #cell-actions="{ row }">
                <div class="relative">
                    <div class="flex items-center justify-end gap-1">
                        <!-- Quick Actions for Pending -->
                        <div v-if="row.status === 'PENDING'" class="flex items-center gap-1">
                            <button @click="updateStatus(row, 'APPROVED')"
                                class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Setujui">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button @click="updateStatus(row, 'REJECTED')"
                                class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Tolak">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div class="w-px h-4 bg-gray-200 mx-1"></div>
                        </div>

                        <button @click.stop="toggleActionMenu(row.id, $event)"
                            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>

                    <!-- Dropdown -->
                    <Teleport to="body">
                        <div v-if="activeActionMenu === row.id" :style="dropdownStyle"
                            class="fixed w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] py-1 overflow-hidden">

                            <button @click="viewReview(row); toggleActionMenu(null)"
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

                            <button v-if="row.status === 'APPROVED'" @click="togglePublish(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4" :class="row.isPublished ? 'text-orange-500' : 'text-blue-500'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path v-if="row.isPublished" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {{ row.isPublished ? 'Batalkan Publikasi' : 'Publikasikan' }}
                            </button>

                            <button @click="handleDelete(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                            </button>
                        </div>
                    </Teleport>

                    <!-- Backdrop -->
                    <div v-if="activeActionMenu === row.id" @click="toggleActionMenu(null)"
                        class="fixed inset-0 z-[9998] bg-transparent cursor-default"></div>
                </div>
            </template>

            <template #footer>
                <UiPagination v-if="testimonials.length > 0" :current-page="pagination.currentPage"
                    :total-pages="pagination.totalPages" :total-items="pagination.totalItems" :items-per-page="20"
                    :has-prev-page="pagination.hasPrevPage" :has-next-page="pagination.hasNextPage"
                    item-name="testimonials" @change="handlePageChange" />
            </template>
        </UiTable>

        <!-- View Review Modal -->
        <UiModal v-model="showViewModal" title="Detail Ulasan" size="xl" :show-default-footer="false">
            <div v-if="selectedReview" class="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
                <!-- Header Card (Fixed) -->
                <div
                    class="bg-gradient-to-br from-[#4CAF50]/5 to-[#45a049]/5 rounded-xl p-4 sm:p-5 border border-[#4CAF50]/20 flex-shrink-0 mb-4">
                    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-green-600/20"
                            :class="selectedReview.avatarColor || getAvatarColor(selectedReview.name)">
                            {{ getInitials(selectedReview.name) }}
                        </div>

                        <div class="text-center sm:text-left flex-1 min-w-0 w-full">
                            <h3 class="font-bold text-[#333] text-xl sm:text-2xl truncate mb-1">{{ selectedReview.name
                                }}</h3>
                            <p class="text-xs sm:text-sm text-[#666] mb-3">
                                {{ selectedReview.email || 'Email tidak tersedia' }}
                            </p>

                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <!-- Rating -->
                                <div
                                    class="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 flex-shrink-0">
                                    <span class="font-bold text-sm">{{ selectedReview.rating }}.0</span>
                                    <div class="flex">
                                        <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5"
                                            :class="i <= selectedReview.rating ? 'fill-current' : 'text-orange-200'"
                                            viewBox="0 0 20 20">
                                            <path
                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                </div>

                                <!-- Badges Group -->
                                <UiBadge :variant="getStatusVariant(selectedReview.status)" class="px-3 py-1.5">
                                    {{ formatStatus(selectedReview.status) }}
                                </UiBadge>

                                <div v-if="selectedReview.isPublished"
                                    class="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    PUBLIK
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content (Scrollable) -->
                <div class="flex-1 overflow-y-auto pr-1 space-y-4">
                    <!-- Comment -->
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <h4 class="text-sm font-bold text-[#333]">Komentar Ulasan</h4>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 leading-relaxed text-lg italic text-center sm:text-left">
                                "{{ selectedReview.comment }}"
                            </p>
                        </div>
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h4 class="text-sm font-bold text-[#333]">Lokasi</h4>
                            </div>
                            <div class="p-4">
                                <p class="font-semibold text-gray-800 text-lg truncate"
                                    :title="selectedReview.location">{{
                                        selectedReview.location }}</p>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h4 class="text-sm font-bold text-[#333]">Tanggal Pengajuan</h4>
                            </div>
                            <div class="p-4">
                                <p class="font-semibold text-gray-800 text-lg">{{ formatDate(selectedReview.createdAt)
                                }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div
                    class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 mt-auto flex-shrink-0">
                    <button @click="showViewModal = false"
                        class="px-4 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200 order-2 sm:order-1">
                        Tutup
                    </button>

                    <button v-if="selectedReview.status === 'APPROVED'" @click="togglePublish(selectedReview)"
                        class="px-4 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
                        :class="selectedReview.isPublished
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="selectedReview.isPublished" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {{ selectedReview.isPublished ? 'Batalkan Publikasi' : 'Publikasikan Ulasan' }}
                    </button>
                    <div v-else class="hidden sm:block"></div>
                </div>
            </div>
        </UiModal>

        <UiModal v-model="showInviteModal" title="Kirim Undangan Ulasan" submit-text="Kirim" cancel-text="Batal"
            :submit-disabled="sendingReminders" @submit="handleSendReminders">
            <div class="space-y-4">
                <!-- Info Banner -->
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-700">
                    <svg class="w-5 h-5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Undangan ulasan akan dikirim ke alamat email pengunjung beserta tautan formulir ulasan pribadi.</p>
                </div>

                <!-- Form -->
                <div class="space-y-4">
                    <div class="space-y-1.5">
                        <label for="invite_email" class="text-sm font-semibold text-gray-700">Email Pengunjung <span
                                class="text-red-500">*</span></label>
                        <input id="invite_email" name="invite_email" v-model="inviteForm.email" type="email"
                            placeholder="email@example.com"
                            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] transition-all">
                    </div>
                </div>
            </div>
        </UiModal>

        <UiAlert ref="alertRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiAlert from '~/components/UI/UiAlert.vue'
import UiModal from '~/components/UI/UiModal.vue'
import UiBadge from '~/components/UI/UiBadge.vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
    layout: 'admin',
    middleware: ['auth']
})

interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    sticky?: boolean
    slot?: boolean
    sortable?: boolean
    width?: string
    minWidth?: string
}

const columns: TableColumn[] = [
    { key: 'user', label: 'Pengguna', slot: true, minWidth: '200px' },
    { key: 'rating', label: 'Penilaian', slot: true, width: '100px' },
    { key: 'comment', label: 'Komentar', slot: true, minWidth: '300px' },
    { key: 'status', label: 'Status', slot: true, width: '120px' },
    { key: 'createdAt', label: 'Tanggal', slot: true, width: '150px' },
    { key: 'actions', label: '', align: 'right', sticky: true, slot: true, width: '120px' }
]

// State
const search = ref('')
const filterStatus = ref('ALL') // ALL, PENDING, APPROVED, REJECTED
const page = ref(1)
const alertRef = ref()
const toast = useToast()

const { apiFetch } = useFetchApi()

// Fetch Data
const { data, status, refresh } = await useAsyncData(
    'admin-testimonials',
    () => apiFetch('/api/admin/testimonials', {
        query: {
            page: page.value,
            limit: 20,
            search: search.value,
            status: filterStatus.value === 'ALL' ? undefined : filterStatus.value
        }
    }),
    {
        watch: [page, search, filterStatus]
    }
)

const loading = computed(() => status.value === 'pending')
const testimonials = computed(() => data.value?.data?.testimonials || [])
const pagination = computed(() => data.value?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasPrevPage: false,
    hasNextPage: false
})

// Utilities
const getInitials = (name: string) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const getAvatarColor = (name: string) => {
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
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
}

const formatStatus = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'Disetujui'
        case 'REJECTED': return 'Ditolak'
        case 'PENDING': return 'Menunggu'
        case 'ALL': return 'Semua Ulasan'
        default: return status
    }
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'success'
        case 'REJECTED': return 'danger'
        case 'PENDING': return 'warning'
        default: return 'default'
    }
}

// Actions Mode Management
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
            dropdownPosition.value = {
                top: `${rect.bottom + 8}px`,
                left: `${rect.right - 192}px`
            }
        }
    }

    activeActionMenu.value = id
}

const handleFilter = (status: string) => {
    filterStatus.value = status
    page.value = 1
}

const handlePageChange = (newPage: number) => {
    page.value = newPage
}

const updateStatus = async (review: any, newStatus: string) => {
    try {
        await apiFetch(`/api/admin/testimonials/${review.id}`, {
            method: 'PATCH',
            body: { status: newStatus }
        })
        review.status = newStatus

        // Auto publish if approved
        if (newStatus === 'APPROVED' && !review.isPublished) {
            review.isPublished = true
            await apiFetch(`/api/admin/testimonials/${review.id}`, {
                method: 'PATCH',
                body: { isPublished: true }
            })
        }

        alertRef.value.show({
            type: 'success',
            title: 'Sukses',
            message: `Review berhasil ${newStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}`
        })
    } catch (error) {
        console.error('Failed to update status', error)
        // Global toast handles error
        // alertRef.value.show({
        //     type: 'error',
        //     title: 'Error',
        //     message: 'Gagal memperbarui status ulasan'
        // })
    }
}

const togglePublish = async (review: any) => {
    try {
        const newPublishedState = !review.isPublished
        await apiFetch(`/api/admin/testimonials/${review.id}`, {
            method: 'PATCH',
            body: { isPublished: newPublishedState }
        })
        review.isPublished = newPublishedState

        alertRef.value.show({
            type: 'success',
            title: newPublishedState ? 'Dipublikasikan' : 'Tidak Dipublikasikan',
            message: `Review berhasil ${newPublishedState ? 'dipublikasikan' : 'dibatalkan publikasinya'}`
        })
    } catch (error) {
        console.error('Failed to toggle publish', error)
        // Global toast handles error
        // alertRef.value.show({
        //     type: 'error',
        //     title: 'Error',
        //     message: 'Gagal memperbarui status publikasi'
        // })
    }
}

const handleDelete = (review: any) => {
    alertRef.value.show({
        type: 'warning',
        title: 'Hapus Ulasan?',
        message: 'Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Hapus',
        cancelText: 'Batal',
        showCancel: true,
        onConfirm: async () => {
            try {
                await apiFetch(`/api/admin/testimonials/${review.id}`, {
                    method: 'DELETE'
                })
                refresh()
                alertRef.value.show({
                    type: 'success',
                    title: 'Dihapus',
                    message: 'Ulasan berhasil dihapus'
                })
            } catch (error) {
                console.error('Failed to delete review', error)
                // Global toast handles error
                // alertRef.value.show({
                //     type: 'error',
                //     title: 'Error',
                //     message: 'Gagal menghapus ulasan'
                // })
            }
        }
    })
}

const sendingReminders = ref(false)
const showInviteModal = ref(false)
const showViewModal = ref(false)
const selectedReview = ref<any>(null)
const inviteForm = ref({
    email: ''
})

const viewReview = (review: any) => {
    selectedReview.value = review
    showViewModal.value = true
}

const openInviteModal = () => {
    inviteForm.value = {
        email: ''
    }
    showInviteModal.value = true
}

const handleSendReminders = async () => {
    if (!inviteForm.value.email) {
        toast.error('Gagal', 'Email pengunjung wajib diisi')
        return
    }

    sendingReminders.value = true
    try {
        const { data } = await apiFetch('/api/tasks/send-review-reminders', {
            method: 'POST',
            body: {
                targetEmail: inviteForm.value.email
            }
        })

        const stats = data as any

        showInviteModal.value = false
        alertRef.value.show({
            type: 'success',
            title: 'Undangan Terkirim',
            message: `Undangan ulasan berhasil dikirim ke ${inviteForm.value.email}`
        })
    } catch (error: any) {
        console.error('Failed to send reminders', error)
        const errorMessage = error.data?.message || error.message || 'Gagal mengirim undangan ulasan.'
        // Global toast handles error
        // alertRef.value.show({
        //     type: 'error',
        //     title: 'Gagal',
        //     message: errorMessage
        // })
    } finally {
        sendingReminders.value = false
    }
}
</script>
