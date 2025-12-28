<template>
    <div class="space-y-6">
        <!-- Error Alert -->
        <div v-if="error"
            class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ error.message }}</span>
            </div>
            <button @click="() => refresh()" class="text-sm font-bold hover:underline">Coba Lagi</button>
        </div>

        <!-- Stats Cards -->


        <div class="h-[calc(100vh-180px)] flex flex-col md:flex-row gap-4 md:gap-6">
            <!-- List View -->
            <div class="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 transition-all duration-300"
                :class="{ 'hidden md:flex': selectedMessage && isMobile }">
                <AdminInboxList :messages="messages" :loading="status === 'pending'" :search="search"
                    :current-filter="filterStatus" :selected-id="selectedId" :pagination="pagination" :stats="stats"
                    @update:search="handleSearch" @filter="handleFilter" @select="selectMessage"
                    @page-change="handlePageChange" />
            </div>

            <!-- Detail View -->
            <div class="flex-1 transition-all duration-300" :class="{ 'hidden md:flex': !selectedMessage && isMobile }">
                <!-- Mobile Back Button -->
                <div v-if="selectedMessage && isMobile" class="mb-4">
                    <button @click="clearSelection"
                        class="flex items-center gap-2 text-sm font-bold text-[#666] hover:text-[#333]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Kotak Masuk
                    </button>
                </div>

                <AdminInboxDetail :message="selectedMessage" @delete="handleDelete" />
            </div>
        </div>

        <!-- Confirmation Alert -->
        <UiAlert ref="alertRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UiAlert from '~/components/UI/UiAlert.vue'

definePageMeta({
    layout: 'admin',
    middleware: ['auth']
})

// Native Window Size Implementation
const windowWidth = ref(0)
const isMobile = computed(() => windowWidth.value < 768)

const updateWidth = () => {
    windowWidth.value = window.innerWidth
}

onMounted(() => {
    if (import.meta.client) {
        windowWidth.value = window.innerWidth
        window.addEventListener('resize', updateWidth)
    }
})

onUnmounted(() => {
    if (import.meta.client) {
        window.removeEventListener('resize', updateWidth)
    }
})

// State
const search = ref('')
const filterStatus = ref('ALL') // ALL | UNREAD
const page = ref(1)
const selectedId = ref<string | null>(null)

// API Fetch
const { apiFetch } = useFetchApi()

const { data, status, refresh, error } = await useAsyncData(
    'admin-inbox-list',
    () => apiFetch('/api/admin/inbox', {
        query: {
            page: page.value,
            limit: 20,
            search: search.value,
            isRead: filterStatus.value === 'UNREAD' ? 'false' : undefined
        }
    }),
    {
        watch: [page, search, filterStatus]
    }
)

const messages = computed(() => data.value?.data?.messages || [])
const stats = computed(() => data.value?.data?.stats || { total: 0, unread: 0 })
const pagination = computed(() => data.value?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false
})

const selectedMessage = computed(() =>
    messages.value.find((m: any) => m.id === selectedId.value) || null
)

// Actions
const alertRef = ref()

const handleSearch = (val: string) => {
    search.value = val
    page.value = 1
}

const handleFilter = (val: string) => {
    filterStatus.value = val
    page.value = 1
    selectedId.value = null
}

const handlePageChange = (newPage: number) => {
    page.value = newPage
}

const clearSelection = () => {
    selectedId.value = null
}

const selectMessage = async (msg: any) => {
    // Toggle close if already selected
    if (selectedId.value === msg.id) {
        selectedId.value = null
        return
    }

    selectedId.value = msg.id

    // Mark as read if needed
    if (!msg.isRead) {
        try {
            await apiFetch(`/api/admin/inbox/${msg.id}/read`, {
                method: 'PATCH'
            })
            // Update local state directly to reflect read status immediately
            msg.isRead = true

            // Force refresh data to sync with backend (and update stats)
            await refresh()
        } catch (error) {
            console.error('Failed to mark as read', error)
        }
    }
}

const handleDelete = async (id: string) => {
    alertRef.value.show({
        type: 'warning',
        title: 'Hapus Pesan?',
        message: 'Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Hapus',
        cancelText: 'Batal',
        showCancel: true,
        onConfirm: async () => {
            try {
                await apiFetch(`/api/admin/inbox/${id}`, {
                    method: 'DELETE'
                })
                selectedId.value = null

                // Show success feedback
                alertRef.value.show({
                    type: 'success',
                    title: 'Dihapus',
                    message: 'Pesan berhasil dihapus.'
                })

                refresh()
            } catch (error) {
                console.error('Failed to delete message', error)
                // Global toast handles error
                // alertRef.value.show({
                //     type: 'error',
                //     title: 'Error',
                //     message: 'Gagal menghapus pesan. Silakan coba lagi.'
                // })
            }
        }
    })
}
</script>
