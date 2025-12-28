<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Tur Virtual</h2>
                    <p class="text-xs sm:text-sm text-[#666]">
                        <span v-if="selectedScenes.length > 0" class="text-[#4CAF50] font-semibold">
                            {{ selectedScenes.length }} dipilih
                        </span>
                        <span v-else>Kelola scene 360° dan hotspot Anda</span>
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <!-- Bulk Delete Button -->
                    <button v-if="selectedScenes.length > 0" @click="bulkDeleteScenes"
                        class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Hapus ({{ selectedScenes.length }})</span>
                    </button>
                    <!-- Add Scene Button -->
                    <button @click="openCreateModal"
                        class="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-full transition-all duration-300 cursor-pointer text-sm">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Scene</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters & Search -->
        <!-- Filters & Search -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col lg:flex-row gap-4">
                <!-- Search -->
                <div class="flex-1 min-w-0">
                    <label for="admin_tour_search"
                        class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Cari</label>
                    <div class="relative">
                        <input id="admin_tour_search" name="search" v-model="filters.search" type="text"
                            placeholder="Cari scene..." @input="debouncedSearch"
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
                    <!-- Status Filter -->
                    <div class="w-full lg:w-40">
                        <label for="admin_tour_status"
                            class="block text-xs sm:text-sm font-semibold text-[#333] mb-2">Status</label>
                        <div class="relative">
                            <select id="admin_tour_status" name="status" v-model="filters.isActive"
                                @change="fetchScenes"
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

        <!-- Scenes Table -->
        <UiTable :columns="tableColumns" :data="scenes" :loading="loading" :error="error" :on-retry="fetchScenes"
            :sort-by="filters.sortBy" :sort-order="filters.sortOrder as 'asc' | 'desc'" @sort="handleSort">
            <!-- Checkbox Cell -->
            <template #cell-select="{ row }">
                <div class="w-[50px] flex justify-center">
                    <input type="checkbox" :checked="selectedScenes.includes(row.id)" @change="toggleSelection(row.id)"
                        :id="'scene_select_' + row.id" :name="'scene_select_' + row.id"
                        class="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer" />
                </div>
            </template>

            <!-- Order Cell -->
            <template #cell-order="{ row }">
                <div class="w-[80px]">
                    <span class="text-sm font-medium text-[#333]">{{ row.sequence }}</span>
                </div>
            </template>



            <!-- Scene Cell -->
            <template #cell-scene="{ row }">
                <div class="min-w-[150px] max-w-[200px]">
                    <p class="text-sm font-semibold text-[#333] truncate">{{ row.name }}</p>
                    <p class="text-xs text-[#666] truncate">{{ row.description || '-' }}</p>
                </div>
            </template>

            <!-- Hotspots Cell -->
            <template #cell-hotspots="{ row }">
                <div class="w-[120px]">
                    <UiBadge variant="info">
                        {{ row._count?.hotspots || 0 }} hotspots
                    </UiBadge>
                </div>
            </template>

            <!-- Status Cell -->
            <template #cell-status="{ row }">
                <div class="w-[120px]">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium"
                        :class="row.isActive ? 'text-green-600' : 'text-gray-400'">
                        <span class="w-2 h-2 rounded-full"
                            :class="row.isActive ? 'bg-green-500' : 'bg-gray-400'"></span>
                        {{ row.isActive ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                </div>
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
                        <div v-if="activeActionMenu === row.id" :style="dropdownPosition"
                            class="fixed w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] py-1 overflow-hidden">
                            <!-- Edit Scene -->
                            <button @click="editScene(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Scene
                            </button>

                            <!-- Delete Scene -->
                            <button @click="deleteScene(row); toggleActionMenu(null)"
                                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus Scene
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
                <UiPagination v-if="scenes.length > 0" :current-page="pagination.page"
                    :total-pages="pagination.totalPages" :total-items="pagination.total"
                    :items-per-page="pagination.limit" :has-prev-page="pagination.hasPrevPage"
                    :has-next-page="pagination.hasNextPage" item-name="scenes" @change="changePage" />
            </template>
        </UiTable>

        <!-- Create Scene Modal -->
        <UiModal v-model="showCreateModal" title="Tambah Scene Baru" size="lg" :show-default-footer="false">
            <form @submit.prevent="createScene" class="space-y-6">
                <!-- Name & Description -->
                <div class="space-y-4">
                    <div>
                        <label for="create_scene_name" class="block text-sm font-semibold text-[#333] mb-2">Nama Scene
                            <span class="text-red-500">*</span></label>
                        <input id="create_scene_name" name="create_scene_name" type="text" v-model="createForm.name"
                            required
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                            placeholder="Contoh: Lobi Utama" />
                    </div>

                    <div>
                        <label for="create_scene_desc"
                            class="block text-sm font-semibold text-[#333] mb-2">Deskripsi</label>
                        <textarea id="create_scene_desc" name="create_scene_desc" v-model="createForm.description"
                            rows="3"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm resize-none"
                            placeholder="Deskripsi opsional..."></textarea>
                    </div>
                </div>

                <!-- Sequence & Status -->
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label for="create_scene_seq" class="block text-sm font-semibold text-[#333] mb-2">Urutan</label>
                        <input id="create_scene_seq" name="create_scene_seq" type="number" v-model="createForm.sequence"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-[#333] mb-2">Status</label>
                        <label for="create_scene_active"
                            class="flex items-center gap-3 p-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                            <input id="create_scene_active" name="create_scene_active" type="checkbox"
                                v-model="createForm.isActive"
                                class="w-5 h-5 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]" />
                            <span class="text-sm font-medium text-[#333]">Aktif</span>
                        </label>
                    </div>
                </div>

                <!-- Image Upload -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-[#333] mb-2">Gambar Kualitas Tinggi (Asli) <span
                                class="text-red-500">*</span></label>
                        <div class="flex items-start gap-4">
                            <div v-if="createForm.imageUrlHigh"
                                class="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                <img :src="createForm.imageUrlHigh" class="w-full h-full object-cover" />
                                <div
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" @click="createForm.imageUrlHigh = ''"
                                        class="p-1.5 bg-white/20 hover:bg-red-500 rounded-full text-white transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="relative">
                                    <input id="create_upload_high" name="create_upload_high" type="file"
                                        accept="image/*" @change="handleFileUpload($event, 'high')"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        :disabled="uploadingHigh" />
                                    <div
                                        class="flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#4CAF50] hover:bg-[#4CAF50]/5 transition-colors">
                                        <div v-if="uploadingHigh" class="flex items-center text-[#4CAF50]">
                                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            Mengunggah...
                                        </div>
                                        <div v-else class="flex items-center text-gray-500">
                                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span>Unggah Gambar Kualitas Tinggi</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Rekomendasi: 4096x2048px (rasio 2:1)</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-[#333] mb-2">Gambar Kualitas Rendah (Preview)</label>
                        <div class="flex items-start gap-4">
                            <div v-if="createForm.imageUrlLow"
                                class="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                <img :src="createForm.imageUrlLow" class="w-full h-full object-cover" />
                                <div
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" @click="createForm.imageUrlLow = ''"
                                        class="p-1.5 bg-white/20 hover:bg-red-500 rounded-full text-white transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="relative">
                                    <input id="create_upload_low" name="create_upload_low" type="file" accept="image/*"
                                        @change="handleFileUpload($event, 'low')"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        :disabled="uploadingLow" />
                                    <div
                                        class="flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#4CAF50] hover:bg-[#4CAF50]/5 transition-colors">
                                        <div v-if="uploadingLow" class="flex items-center text-[#4CAF50]">
                                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            Mengunggah...
                                        </div>
                                        <div v-else class="flex items-center text-gray-500">
                                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span>Unggah Gambar Low Quality</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Opsional. Akan menggunakan kualitas tinggi jika kosong.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button type="button" @click="closeCreateModal"
                        class="px-5 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="creating"
                        class="px-5 py-2.5 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="creating"
                            class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2 inline-block"></span>
                        {{ creating ? 'Membuat...' : 'Buat Scene' }}
                    </button>
                </div>
            </form>
        </UiModal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'

definePageMeta({
    layout: 'admin'
})

// Types
interface Scene {
    id: string
    name: string
    description?: string
    imageUrlLow: string
    sequence: number
    isActive: boolean
    _count?: {
        hotspots: number
    }
}

// State
const loading = ref(false)
const error = ref<string | null>(null)
const scenes = ref<Scene[]>([])
const filters = reactive({
    search: '',
    isActive: '',
    sortBy: 'sequence',
    sortOrder: 'asc' as 'asc' | 'desc'
})
const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
})

// Action menu state
const activeActionMenu = ref<string | null>(null)
const dropdownPosition = ref({})

const { apiFetch } = useFetchApi()
const router = useRouter()
const { alert } = useAlert()

// Selection state
const selectedScenes = ref<string[]>([])
const isSelectAll = computed(() => {
    return scenes.value.length > 0 && selectedScenes.value.length === scenes.value.length
})

// Table columns configuration
const tableColumns = [
    { key: 'select', label: '', sortable: false, slot: true, width: '50px' },
    { key: 'order', label: 'Urutan', sortable: true, slot: true, width: '80px' },
    { key: 'scene', label: 'Scene', sortable: true, slot: true, minWidth: '150px' },
    { key: 'hotspots', label: 'Botspot', sortable: false, slot: true, width: '120px' },
    { key: 'status', label: 'Status', sortable: true, slot: true, width: '120px' },
    { key: 'actions', label: '', align: 'right' as const, sticky: true, slot: true, width: '80px' }
]

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        pagination.page = 1
        fetchScenes()
    }, 300)
}

// Actions
const fetchScenes = async () => {
    loading.value = true
    error.value = null
    try {
        const params: any = {
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search || undefined,
            isActive: filters.isActive || undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
        }

        const res: any = await apiFetch('/api/admin/tour/scenes', { params })

        scenes.value = res.data.scenes
        Object.assign(pagination, res.data.pagination)
    } catch (err: any) {
        console.error('Failed to fetch scenes:', err)
        error.value = err.message || 'Gagal memuat scene'
        // Global toast handles error
        // alert.error('Error', 'Gagal memuat scene')
    } finally {
        loading.value = false
    }
}

const editScene = (scene: Scene) => {
    router.push(`/admin/virtual-tour/${scene.id}`)
}

const deleteScene = async (scene: Scene) => {
    const confirmed = await alert.confirm(
        `Apakah Anda yakin ingin menghapus scene "${scene.name}"?`,
        'Tindakan ini tidak dapat dibatalkan.'
    )

    if (!confirmed) return

    try {
        await apiFetch(`/api/admin/tour/scenes/${scene.id}`, {
            method: 'DELETE'
        })
        alert.success('Berhasil', 'Scene berhasil dihapus')
        fetchScenes()
    } catch (err: any) {
        console.error('Failed to delete scene:', err)
        // Global toast handles error
        // alert.error('Error', 'Gagal menghapus scene')
    }
}

// Create Modal State
const showCreateModal = ref(false)
const creating = ref(false)
const uploadingHigh = ref(false)
const uploadingLow = ref(false)

const createForm = reactive({
    name: '',
    description: '',
    imageUrlLow: '',
    imageUrlHigh: '',
    sequence: 0,
    isActive: true
})

const openCreateModal = () => {
    // Reset form
    createForm.name = ''
    createForm.description = ''
    createForm.imageUrlLow = ''
    createForm.imageUrlHigh = ''
    createForm.sequence = scenes.value.length + 1
    createForm.isActive = true

    showCreateModal.value = true
}

const closeCreateModal = () => {
    showCreateModal.value = false
}

const handleFileUpload = async (event: Event, type: 'high' | 'low') => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    if (type === 'high') uploadingHigh.value = true
    else uploadingLow.value = true

    try {
        const res: any = await apiFetch('/api/admin/tour/upload', {
            method: 'POST',
            body: formData
        })

        if (type === 'high') {
            createForm.imageUrlHigh = res.data.url
            // Auto fill low quality if empty
            if (!createForm.imageUrlLow) {
                createForm.imageUrlLow = res.data.url
            }
        } else {
            createForm.imageUrlLow = res.data.url
        }

        alert.success('Berhasil', 'Gambar berhasil diunggah')
    } catch (error) {
        console.error('Upload failed:', error)
        // Global toast handles error
        // alert.error('Error', 'Gagal mengunggah gambar')
    } finally {
        if (type === 'high') uploadingHigh.value = false
        else uploadingLow.value = false
        // Reset input
        input.value = ''
    }
}

const createScene = async () => {
    if (!createForm.name) {
        alert.error('Error', 'Nama scene wajib diisi')
        return
    }
    if (!createForm.imageUrlHigh) {
        alert.error('Error', 'Gambar kualitas tinggi wajib diunggah')
        return
    }

    creating.value = true
    try {
        await apiFetch('/api/admin/tour/scenes', {
            method: 'POST',
            body: {
                ...createForm,
                // Set defaults for initial view
                defaultPitch: 0,
                defaultYaw: 0,
                hfov: 100
            }
        })

        alert.success('Berhasil', 'Scene berhasil dibuat')
        closeCreateModal()
        fetchScenes()
    } catch (err: any) {
        console.error('Failed to create scene:', err)
        // Global toast handles error
        // alert.error('Error', 'Gagal membuat scene')
    } finally {
        creating.value = false
    }
}

// Sorting handler
const handleSort = (column: string) => {
    if (filters.sortBy === column) {
        filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        filters.sortBy = column
        filters.sortOrder = 'asc'
    }
    fetchScenes()
}

// Pagination handler
const changePage = (newPage: number) => {
    pagination.page = newPage
    fetchScenes()
}

// Action menu handlers
const toggleActionMenu = (sceneId: string | null, event?: Event) => {
    if (activeActionMenu.value === sceneId) {
        activeActionMenu.value = null
        return
    }

    if (sceneId && event) {
        const button = (event.target as HTMLElement).closest('button')
        if (button) {
            const rect = button.getBoundingClientRect()
            dropdownPosition.value = {
                top: `${rect.bottom + 8}px`,
                left: `${rect.right - 192}px`
            }
        }
    }

    activeActionMenu.value = sceneId
}

// Selection handlers
const toggleSelection = (sceneId: string) => {
    const index = selectedScenes.value.indexOf(sceneId)
    if (index > -1) {
        selectedScenes.value.splice(index, 1)
    } else {
        selectedScenes.value.push(sceneId)
    }
}

const toggleSelectAll = () => {
    if (isSelectAll.value) {
        selectedScenes.value = []
    } else {
        selectedScenes.value = scenes.value.map(s => s.id)
    }
}

const bulkDeleteScenes = async () => {
    const confirmed = await alert.confirm(
        `Hapus ${selectedScenes.value.length} scene?`,
        'Tindakan ini akan menghapus scene yang dipilih, hotspot, dan gambar terkait secara permanen. Tindakan ini tidak dapat dibatalkan.'
    )

    if (!confirmed) return

    try {
        loading.value = true
        await apiFetch('/api/admin/tour/scenes/bulk-delete', {
            method: 'POST',
            body: {
                sceneIds: selectedScenes.value
            }
        })

        alert.success('Berhasil', `Berhasil menghapus ${selectedScenes.value.length} scene`)
        selectedScenes.value = []
        fetchScenes()
    } catch (err: any) {
        console.error('Failed to bulk delete scenes:', err)
        // Global toast handles error
        // alert.error('Error', 'Gagal menghapus scene')
    } finally {
        loading.value = false
    }
}

// Init
onMounted(fetchScenes)
</script>
```
