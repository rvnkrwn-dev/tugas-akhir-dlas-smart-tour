<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200">
            <h2 class="text-2xl font-black text-[#333] mb-2">Pengaturan</h2>
            <p class="text-[#666]">Konfigurasi pengaturan sistem dan preferensi</p>
        </div>

        <!-- Settings Grid -->
        <div class="grid grid-cols-1 gap-6">
            <!-- Virtual Tour Settings -->
            <div class="bg-white rounded-2xl p-6 border border-gray-200">
                <div class="flex items-start gap-4 mb-6">
                    <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-[#333]">Tur Virtual</h3>
                        <p class="text-sm text-[#666]">Konfigurasi pengalaman tur virtual</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Debug Mode -->
                    <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                        <div>
                            <p class="font-semibold text-[#333] text-sm">Mode Debug</p>
                            <p class="text-xs text-[#666] mt-0.5">Tampilkan koordinat hotspot dan log debug</p>
                        </div>
                        <label for="tour_debug_mode" class="relative inline-flex items-center cursor-pointer">
                            <input id="tour_debug_mode" name="tour_debug_mode" type="checkbox"
                                v-model="settings.tour_debug_mode" class="sr-only peer" @change="updateSettings">
                            <div
                                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600">
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
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
const isLoading = ref(false)

const settings = reactive({
    tour_debug_mode: false
})

const fetchSettings = async () => {
    try {
        const response: any = await apiFetch('/api/admin/settings')
        if (response.success) {
            settings.tour_debug_mode = response.data.tour_debug_mode === true
        }
    } catch (err) {
        console.error('Failed to fetch settings:', err)
        // Global toast handles error
        // alert.error('Error', 'Gagal memuat pengaturan')
    }
}

const updateSettings = async () => {
    isLoading.value = true
    try {
        await apiFetch('/api/admin/settings/update', {
            method: 'POST',
            body: {
                settings: [
                    {
                        key: 'tour_debug_mode',
                        value: settings.tour_debug_mode,
                        description: 'Enable debug mode for Virtual Tour'
                    }
                ]
            }
        })
        alert.success('Sukses', 'Pengaturan berhasil diperbarui')
    } catch (err) {
        console.error('Failed to update settings:', err)
        // Global toast handles error
        // alert.error('Error', 'Gagal memperbarui pengaturan')
        // Revert setting on error
        settings.tour_debug_mode = !settings.tour_debug_mode
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchSettings()
})
</script>
