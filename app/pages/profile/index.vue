<template>
    <!-- Page Header -->
    <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-black text-gray-900">Profil Saya</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Kelola informasi pribadi dan preferensi Anda</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 p-4 sm:p-8">
        <div class="animate-pulse space-y-4">
            <div class="h-20 w-20 sm:h-24 sm:w-24 bg-gray-200 rounded-full mx-auto"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                    <div v-if="profile?.avatarUrl" class="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-green-50">
                        <img :src="profile.avatarUrl" :alt="fullName" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                        class="w-24 h-24 bg-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white">
                        {{ userInitials }}
                    </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0 w-full">
                    <h2 class="text-2xl font-bold text-gray-900 truncate">{{ fullName }}</h2>
                    <p class="text-base text-gray-600 break-all mt-1">{{ user?.email }}</p>
                    <div class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
                            {{ user?.role }}
                        </span>
                        <span v-if="user?.isEmailVerified"
                            class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            Terverifikasi
                        </span>
                    </div>
                </div>

                <!-- Edit Button -->
                <button v-if="!isEditing" @click="startEditing"
                    class="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profil
                </button>
            </div>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Personal Information -->
            <div class="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    Informasi Pribadi
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <!-- First Name -->
                    <div>
                        <label for="firstName" class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Nama
                            Depan</label>
                        <input id="firstName" name="firstName" v-model="formData.firstName" type="text"
                            :disabled="!isEditing"
                            class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                    </div>

                    <!-- Last Name -->
                    <div>
                        <label for="lastName" class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Nama
                            Belakang</label>
                        <input id="lastName" name="lastName" v-model="formData.lastName" type="text"
                            :disabled="!isEditing"
                            class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                    </div>

                    <!-- Phone -->
                    <div>
                        <label for="phone" class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Nomor
                            Telepon</label>
                        <input id="phone" name="phone" v-model="formData.phone" type="tel" :disabled="!isEditing"
                            class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                    </div>

                    <!-- Date of Birth -->
                    <div>
                        <label for="dateOfBirth"
                            class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Tanggal Lahir</label>
                        <input id="dateOfBirth" name="dateOfBirth" v-model="formData.dateOfBirth" type="date"
                            :disabled="!isEditing"
                            class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                    </div>

                    <!-- Gender -->
                    <div class="md:col-span-2">
                        <label for="gender"
                            class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
                        <div class="relative">
                            <select id="gender" name="gender" v-model="formData.gender" :disabled="!isEditing"
                                class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all appearance-none text-sm sm:text-base">
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="MALE">Laki-laki</option>
                                <option value="FEMALE">Perempuan</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Address Information -->
            <div class="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Informasi Alamat
                </h3>
                <div class="grid grid-cols-1 gap-4 sm:gap-5">
                    <!-- Address -->
                    <div>
                        <label for="address" class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Alamat
                            Lengkap</label>
                        <textarea id="address" name="address" v-model="formData.address" :disabled="!isEditing" rows="3"
                            class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base resize-none"></textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <!-- City -->
                        <div>
                            <label for="city"
                                class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Kota</label>
                            <input id="city" name="city" v-model="formData.city" type="text" :disabled="!isEditing"
                                class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                        </div>

                        <!-- Country -->
                        <div>
                            <label for="country"
                                class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Negara</label>
                            <input id="country" name="country" v-model="formData.country" type="text"
                                :disabled="!isEditing"
                                class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                        </div>

                        <!-- Postal Code -->
                        <div>
                            <label for="postalCode"
                                class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Kode
                                Pos</label>
                            <input id="postalCode" name="postalCode" v-model="formData.postalCode" type="text"
                                :disabled="!isEditing"
                                class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm sm:text-base" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Preferences -->
            <div class="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferensi
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Language -->
                    <div>
                        <label for="language"
                            class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Bahasa</label>
                        <div class="relative">
                            <select id="language" name="language" v-model="formData.language" :disabled="!isEditing"
                                class="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all appearance-none text-sm sm:text-base">
                                <option value="INDONESIAN">Indonesia</option>
                                <option value="ENGLISH">Inggris</option>
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <transition name="slide-up">
                <div v-if="isEditing"
                    class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 sm:static sm:bg-transparent sm:border-0 sm:p-0 z-40">
                    <div class="flex gap-3 justify-end max-w-7xl mx-auto w-full">
                        <button type="button" @click="cancelEditing"
                            class="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base shadow-sm">
                            Batal
                        </button>
                        <button type="submit" :disabled="saving"
                            class="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-green-600/20">
                            <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
                        </button>
                    </div>
                </div>
            </transition>
        </form>
    </div>

    <!-- Padding for fixed bottom actions on mobile -->
    <div v-if="isEditing" class="h-24 sm:h-0"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'

// Page meta
definePageMeta({
    layout: 'customer',
    middleware: 'auth'
})

// SEO
useHead({
    title: 'Profil Saya - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Kelola informasi profil dan preferensi Anda' }
    ]
})

// Composables
const { user, fetchMe } = useAuth()
const { apiFetch } = useFetchApi()
const { alert } = useAlert()

// State
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const formData = ref({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    language: 'INDONESIAN'
})

// Computed
const profile = computed(() => user.value?.user_profiles)

const fullName = computed(() => {
    if (profile.value?.firstName && profile.value?.lastName) {
        return `${profile.value.firstName} ${profile.value.lastName}`
    }
    if (profile.value?.firstName) {
        return profile.value.firstName
    }
    return user.value?.email?.split('@')[0] || 'User'
})

const userInitials = computed(() => {
    if (profile.value?.firstName && profile.value?.lastName) {
        return `${profile.value.firstName.charAt(0)}${profile.value.lastName.charAt(0)}`.toUpperCase()
    }
    if (profile.value?.firstName) {
        return profile.value.firstName.charAt(0).toUpperCase()
    }
    return user.value?.email?.charAt(0).toUpperCase() || 'U'
})

// Methods
const loadProfile = () => {
    if (profile.value) {
        formData.value = {
            firstName: profile.value.firstName || '',
            lastName: profile.value.lastName || '',
            phone: profile.value.phone || '',
            dateOfBirth: profile.value.dateOfBirth ? (profile.value.dateOfBirth.split('T')[0] ?? '') : '',
            gender: profile.value.gender || '',
            address: profile.value.address || '',
            city: profile.value.city || '',
            country: profile.value.country || '',
            postalCode: profile.value.postalCode || '',
            // Correctly cast language or default to INDONESIAN if missing/invalid type
            language: ((profile.value as any).language as string) || 'INDONESIAN'
        }
    }
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
    loadProfile() // Reset form data
}

const saveProfile = async () => {
    const confirmed = await alert.confirm(
        'Simpan Perubahan',
        'Apakah Anda yakin ingin menyimpan perubahan ini?',
        'Simpan',
        'Batal'
    )

    if (!confirmed) return

    saving.value = true
    try {
        const response = await apiFetch<ApiResponse<any>>('/api/auth/me', {
            method: 'PATCH',
            body: formData.value
        })

        if (response.success) {
            // Refresh user data to update useAuth state
            await fetchMe()
            isEditing.value = false

            // Show success message
            await alert.success('Sukses', 'Profil Anda berhasil diperbarui.')
        }
    } catch (error: any) {
        console.error('Failed to update profile:', error)
        // Standardized error handling: error.data.data.message or fallback
        const msg = error.data?.data?.message || error.data?.message || 'Gagal memperbarui profil'
        await alert.error('Error', msg)
    } finally {
        saving.value = false
    }
}

// Lifecycle
onMounted(async () => {
    loading.value = true
    try {
        await fetchMe()
        loadProfile()
    } catch (error) {
        console.error('Failed to load profile:', error)
    } finally {
        loading.value = false
    }
})
</script>
