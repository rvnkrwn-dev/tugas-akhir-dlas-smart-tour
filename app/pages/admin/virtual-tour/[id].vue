<template>
    <div class="space-y-6">
        <div class="space-y-6">
            <!-- Page Header -->
            <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-semibold text-[#333]">
                            {{ isNew ? 'Buat Scene Baru' : (isEdit ? 'Edit Scene' : 'Detail Scene') }}
                        </h2>
                    </div>

                    <div class="flex gap-3">
                        <!-- Edit Button -->
                        <button v-if="!isEdit && !isNew" @click="toggleEdit" type="button"
                            class="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Scene
                        </button>

                        <!-- Cancel Button -->
                        <button v-if="isEdit && !isNew" @click="toggleEdit" type="button"
                            class="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-[#666] bg-white hover:bg-gray-50 transition-colors">
                            Batal
                        </button>



                        <button v-if="isEdit || isNew" @click="saveScene" :disabled="saving"
                            class="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-bold text-white bg-[#4CAF50] hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="saving"
                                class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 class="text-sm font-bold text-[#333] uppercase tracking-wider">Detail Scene</h3>
                </div>
                <div class="p-6 space-y-6">
                    <!-- Name & Description -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="scene_name" class="block text-sm font-semibold text-[#333] mb-2">Nama Scene</label>
                            <input id="scene_name" name="scene_name" type="text" v-model="form.name" :disabled="!isEdit"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="Contoh: Lobi Utama" />
                        </div>
                        <div>
                            <label for="scene_sequence" class="block text-sm font-semibold text-[#333] mb-2">Urutan</label>
                            <input id="scene_sequence" name="scene_sequence" type="number" v-model="form.sequence"
                                :disabled="!isEdit"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="0" />
                        </div>
                        <div class="md:col-span-2">
                            <label for="scene_description"
                                class="block text-sm font-semibold text-[#333] mb-2">Deskripsi</label>
                            <textarea id="scene_description" name="scene_description" v-model="form.description"
                                rows="3" :disabled="!isEdit"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="Deskripsi singkat tentang scene ini..."></textarea>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-gray-100"></div>

                    <!-- Images -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="scene_img_high" class="block text-sm font-semibold text-[#333] mb-2">URL Gambar
                                (Kualitas Tinggi)</label>
                            <div class="flex flex-col gap-3">
                                <input id="scene_img_high" name="scene_img_high" type="text" v-model="form.imageUrlHigh"
                                    :disabled="!isEdit"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="/images/pano/scene.jpg" />

                                <!-- File Upload -->
                                <div v-if="isEdit" class="flex items-center justify-center w-full">
                                    <label
                                        class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div v-if="uploadingHigh"
                                                class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mb-2">
                                            </div>
                                            <svg v-else
                                                class="w-8 h-8 mb-4 text-gray-400 group-hover:text-[#4CAF50] transition-colors"
                                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 20 16">
                                                <path stroke="currentColor" stroke-linecap="round"
                                                    stroke-linejoin="round" stroke-width="2"
                                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p class="mb-2 text-sm text-gray-500"><span
                                                    class="font-semibold text-[#333]">Klik untuk
                                                    unggah</span> atau seret dan lepas</p>
                                            <p class="text-xs text-gray-400">JPG or PNG</p>
                                        </div>
                                        <input id="upload_high" name="upload_high" type="file" class="hidden"
                                            accept="image/*" @change="(e) => handleFileUpload(e, 'high')" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label for="scene_img_low" class="block text-sm font-semibold text-[#333] mb-2">URL Gambar
                                (Kualitas Rendah)</label>
                            <div class="flex flex-col gap-3">
                                <input id="scene_img_low" name="scene_img_low" type="text" v-model="form.imageUrlLow"
                                    :disabled="!isEdit"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="/images/pano/scene_low.jpg" />
                                <p class="text-xs text-gray-500">Digunakan untuk pemuatan awal yang cepat.</p>

                                <!-- File Upload for Low Quality -->
                                <label v-if="isEdit"
                                    class="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer w-full text-sm">
                                    <span v-if="uploadingLow"
                                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></span>
                                    <svg v-else class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Unggah Gambar Low Res
                                    <input id="upload_low" name="upload_low" type="file" class="hidden" accept="image/*"
                                        @change="(e) => handleFileUpload(e, 'low')" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Image -->
                    <div v-if="form.imageUrlHigh"
                        class="rounded-xl overflow-hidden bg-gray-100 aspect-video relative border border-gray-200">
                        <img :src="form.imageUrlHigh" class="w-full h-full object-cover" alt="Scene Preview" />
                        <div
                            class="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            Viewer Preview
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-gray-100"></div>

                    <!-- Initial View Settings -->
                    <div>
                        <h3 class="text-sm font-bold text-[#333] uppercase tracking-wider mb-4">Pengaturan Tampilan Awal
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label for="scene_pitch" class="block text-sm font-medium text-[#666] mb-2">Pitch
                                    (Vertikal)</label>
                                <input id="scene_pitch" name="scene_pitch" type="number" step="0.1"
                                    v-model="form.defaultPitch" :disabled="!isEdit"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500" />
                            </div>
                            <div>
                                <label for="scene_yaw" class="block text-sm font-medium text-[#666] mb-2">Yaw
                                    (Horizontal)</label>
                                <input id="scene_yaw" name="scene_yaw" type="number" step="0.1"
                                    v-model="form.defaultYaw" :disabled="!isEdit"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500" />
                            </div>
                            <div>
                                <label for="scene_hfov" class="block text-sm font-medium text-[#666] mb-2">HFOV
                                    (Zoom)</label>
                                <input id="scene_hfov" name="scene_hfov" type="number" step="1" v-model="form.hfov"
                                    :disabled="!isEdit"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="scene_active" class="flex items-center gap-2 cursor-pointer w-fit">
                            <input id="scene_active" name="scene_active" v-model="form.isActive" type="checkbox"
                                :disabled="!isEdit"
                                class="w-5 h-5 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50] cursor-pointer disabled:opacity-50">
                            <span class="text-sm font-bold text-[#333]">Scene Aktif</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Hotspots List (Only if not new) -->
            <div v-if="!isNew" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 class="text-lg font-bold text-[#333]">Hotspots</h3>
                    <button type="button" @click="openAddHotspot"
                        class="inline-flex items-center text-sm text-white bg-[#4CAF50] hover:bg-[#45a049] font-bold px-4 py-2 rounded-xl transition-colors">
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Hotspot
                    </button>
                </div>
                <div class="p-6">
                    <!-- List -->
                    <div v-if="hotspots.length === 0"
                        class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p class="text-gray-400 text-sm">Belum ada hotspot yang dikonfigurasi untuk scene ini.</p>
                    </div>

                    <ul v-else class="divide-y divide-gray-100">
                        <li v-for="hotspot in hotspots" :key="hotspot.id"
                            class="py-4 flex justify-between items-center hover:bg-gray-50 -mx-6 px-6 transition-colors cursor-pointer group"
                            @click="openEditHotspot(hotspot)">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0"
                                    :class="{
                                        'bg-blue-100 text-blue-600': hotspot.type === 'info',
                                        'bg-green-100 text-green-600': hotspot.type === 'navigate',
                                        'bg-orange-100 text-orange-600': hotspot.type === 'loket'
                                    }">
                                    <!-- Icon based on type -->
                                    <span v-if="hotspot.type === 'navigate'">➡️</span>
                                    <span v-else-if="hotspot.type === 'loket'">🎟️</span>
                                    <span v-else>ℹ️</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4
                                        class="text-sm font-bold text-[#333] group-hover:text-[#4CAF50] transition-colors">
                                        {{ hotspot.title }}</h4>
                                    <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide"
                                            :class="{
                                                'bg-blue-50 text-blue-700': hotspot.type === 'info',
                                                'bg-green-50 text-green-700': hotspot.type === 'navigate',
                                                'bg-orange-50 text-orange-700': hotspot.type === 'loket'
                                            }">
                                            {{ hotspot.type }}
                                        </span>
                                        <span class="text-xs text-[#999]">Pitch: {{ hotspot.pitch?.toFixed(1) }} • Yaw:
                                            {{ hotspot.yaw?.toFixed(1) }}</span>
                                    </div>

                                    <!-- Show Attraction Info for Loket Type -->
                                    <div v-if="hotspot.type === 'loket' && hotspot.attraction"
                                        class="mt-2 flex items-center gap-2 p-2 bg-orange-50/50 rounded-lg border border-orange-100">
                                        <img v-if="hotspot.attraction.imageUrl" :src="hotspot.attraction.imageUrl"
                                            :alt="hotspot.attraction.name"
                                            class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-semibold text-orange-900 truncate">{{
                                                hotspot.attraction.name }}</p>
                                            <p class="text-xs text-orange-700">
                                                {{ formatCurrency(hotspot.attraction.adultPrice) }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Show Target Scene for Navigate Type -->
                                    <div v-if="hotspot.type === 'navigate' && hotspot.targetScene"
                                        class="mt-2 text-xs text-green-700 bg-green-50/50 px-2 py-1 rounded inline-flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        Ke: {{ hotspot.targetScene.name }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <button @click.stop="deleteHotspot(hotspot)"
                                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Hotspot Modal -->
        <UiModal v-model="showHotspotModal" :title="isEditingHotspot ? 'Edit Hotspot' : 'Tambah Hotspot'" size="lg"
            :show-default-footer="false">
            <form @submit.prevent="saveHotspot" class="space-y-5">
                <!-- Type -->
                <div>
                    <label for="hotspot_type" class="block text-sm font-semibold text-[#333] mb-2">Tipe Hotspot <span
                            class="text-red-500">*</span></label>
                    <select id="hotspot_type" name="hotspot_type" v-model="hotspotForm.type" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <option value="info">Info (Tooltip)</option>
                        <option value="navigate">Navigasi (Panah)</option>
                        <option value="loket">Loket (Tiket Booth)</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        <span v-if="hotspotForm.type === 'navigate'">Membuat panah navigasi ke scene lain.</span>
                        <span v-else-if="hotspotForm.type === 'loket'">Membuat loket tiket dengan tombol "Tambah ke Keranjang".</span>
                        <span v-else>Menampilkan teks info sederhana saat di-hover.</span>
                    </p>
                </div>

                <!-- Title -->
                <div>
                    <label for="hotspot_title" class="block text-sm font-semibold text-[#333] mb-2">Judul <span
                            class="text-red-500">*</span></label>
                    <input id="hotspot_title" name="hotspot_title" type="text" v-model="hotspotForm.title" required
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                        placeholder="Contoh: Gerbang Masuk" />
                </div>

                <!-- Description -->
                <div>
                    <label for="hotspot_description"
                        class="block text-sm font-semibold text-[#333] mb-2">Deskripsi</label>
                    <textarea id="hotspot_description" name="hotspot_description" v-model="hotspotForm.description"
                        rows="2"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm"
                        placeholder="Detail opsional..."></textarea>
                </div>

                <!-- Coordinates -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="hotspot_pitch" class="block text-sm font-semibold text-[#333] mb-2">Pitch
                            (Vertikal)</label>
                        <input id="hotspot_pitch" name="hotspot_pitch" type="number" step="0.1"
                            v-model="hotspotForm.pitch" required
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm" />
                    </div>
                    <div>
                        <label for="hotspot_yaw" class="block text-sm font-semibold text-[#333] mb-2">Yaw
                            (Horizontal)</label>
                        <input id="hotspot_yaw" name="hotspot_yaw" type="number" step="0.1" v-model="hotspotForm.yaw"
                            required
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm" />
                    </div>
                </div>

                <!-- Conditional Fields -->
                <div v-if="hotspotForm.type === 'navigate'" class="p-4 bg-green-50 rounded-xl border border-green-100">
                    <label for="hotspot_target" class="block text-sm font-bold text-green-800 mb-2">Target Scene <span
                            class="text-red-500">*</span></label>
                    <select id="hotspot_target" name="hotspot_target" v-model="hotspotForm.targetSceneId" required
                        class="w-full px-4 py-2.5 rounded-xl border border-green-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm bg-white">
                        <option value="">Pilih Target Scene</option>
                        <option v-for="scene in availableScenes" :key="scene.id" :value="scene.id">
                            {{ scene.sequence }} - {{ scene.name }}
                        </option>
                    </select>
                </div>

                <div v-if="hotspotForm.type === 'loket'" class="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <label for="hotspot_product" class="block text-sm font-bold text-orange-800 mb-2">Produk Terkait
                        <span class="text-red-500">*</span></label>
                    <select id="hotspot_product" name="hotspot_product" v-model="hotspotForm.productId" required
                        class="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm bg-white">
                        <option value="">Pilih Wahana / Produk</option>
                        <option v-for="attr in attractions" :key="attr.id" :value="attr.id"
                            :class="{ 'text-gray-400': !attr.isActive }">
                            {{ attr.name }} {{ !attr.isActive ? '(Tidak Aktif)' : '' }}
                        </option>
                    </select>
                    <p class="text-xs text-orange-600 mt-2">
                        Catatan: Ini akan menampilkan nama produk dan harga pada kartu hotspot. Pastikan produk yang ditautkan aktif.
                    </p>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <button type="button" @click="closeHotspotModal"
                        class="px-5 py-2.5 text-sm font-medium text-[#666] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="savingHotspot"
                        class="px-5 py-2.5 text-sm font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ savingHotspot ? 'Menyimpan...' : (isEditingHotspot ? 'Perbarui Hotspot' : 'Buat Hotspot') }}
                    </button>
                </div>
            </form>
        </UiModal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'
import type { Attraction, AttractionListResponse } from '~/types/attraction'

definePageMeta({
    layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { apiFetch } = useFetchApi()
const { alert } = useAlert() // Assuming global alert

const isNew = computed(() => route.params.id === 'new')
const isEdit = ref(isNew.value)
const sceneId = computed(() => route.params.id as string)
const saving = ref(false)
const loading = ref(false)
const uploadingHigh = ref(false)
const uploadingLow = ref(false)

const form = reactive({
    name: '',
    description: '',
    imageUrlLow: '',
    imageUrlHigh: '',
    defaultPitch: 0,
    defaultYaw: 0,
    hfov: 100,
    sequence: 0,
    isActive: true
})

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
            form.imageUrlHigh = res.data.url
            // Auto fill low quality if empty
            if (!form.imageUrlLow) {
                form.imageUrlLow = res.data.url
            }
        } else {
            form.imageUrlLow = res.data.url
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

const hotspots = ref<any[]>([])
const allScenes = ref<any[]>([])
const attractions = ref<Attraction[]>([])

// Hotspot Modal State
const showHotspotModal = ref(false)
const savingHotspot = ref(false)
const hotspotForm = reactive({
    id: null as string | null,
    type: 'info' as 'info' | 'loket' | 'navigate',
    pitch: 0,
    yaw: 0,
    title: '',
    description: '',
    icon: '',
    productId: '' as string | null,
    targetSceneId: '' as string | null
})

const isEditingHotspot = computed(() => !!hotspotForm.id)

const availableScenes = computed(() => {
    return allScenes.value.filter(s => s.id !== sceneId.value)
})

const fetchScenes = async () => {
    try {
        const res: any = await apiFetch('/api/admin/tour/scenes', { params: { limit: 100 } })
        allScenes.value = res.data.scenes
    } catch (e) {
        console.error('Failed to fetch scenes', e)
    }
}

const fetchAttractions = async () => {
    try {
        // Use generic type apiFetch<ApiResponse<AttractionListResponse>>
        const res = await apiFetch<ApiResponse<AttractionListResponse>>('/api/attractions', {
            params: {
                limit: 100,
                isActive: true // Might want to show inactive if selecting? But usually only active products allowed.
            }
        })

        if (res.success) {
            const attractionsList = res.data.attractions
            // Filter and sort: active first, then by name
            attractions.value = attractionsList.sort((a, b) => {
                if (a.isActive === b.isActive) {
                    return a.name.localeCompare(b.name)
                }
                return a.isActive ? -1 : 1
            })
        }
    } catch (e) {
        console.error('Failed to fetch attractions', e)
    }
}

const openAddHotspot = () => {
    hotspotForm.id = null
    hotspotForm.type = 'info'
    hotspotForm.pitch = 0
    hotspotForm.yaw = 0
    hotspotForm.title = ''
    hotspotForm.description = ''
    hotspotForm.icon = ''
    hotspotForm.productId = ''
    hotspotForm.targetSceneId = ''

    showHotspotModal.value = true

    // Lazy load dependencies
    if (allScenes.value.length === 0) fetchScenes()
    if (attractions.value.length === 0) fetchAttractions()
}

const openEditHotspot = (hotspot: any) => {
    hotspotForm.id = hotspot.id
    hotspotForm.type = hotspot.type
    hotspotForm.pitch = hotspot.pitch
    hotspotForm.yaw = hotspot.yaw
    hotspotForm.title = hotspot.title
    hotspotForm.description = hotspot.description || ''
    hotspotForm.icon = hotspot.icon || ''
    hotspotForm.productId = hotspot.productId || ''
    hotspotForm.targetSceneId = hotspot.targetSceneId || ''

    showHotspotModal.value = true

    if (allScenes.value.length === 0) fetchScenes()
    if (attractions.value.length === 0) fetchAttractions()
}

const closeHotspotModal = () => {
    showHotspotModal.value = false
}

const saveHotspot = async () => {
    savingHotspot.value = true
    try {
        const payload: any = {
            sceneId: sceneId.value,
            type: hotspotForm.type,
            pitch: hotspotForm.pitch,
            yaw: hotspotForm.yaw,
            title: hotspotForm.title,
            description: hotspotForm.description,
            icon: hotspotForm.icon,
            productId: hotspotForm.productId || null,
            targetSceneId: hotspotForm.targetSceneId || null
        }

        if (isEditingHotspot.value) {
            await apiFetch(`/api/admin/tour/hotspots/${hotspotForm.id}`, {
                method: 'PUT',
                body: payload
            })
        } else {
            await apiFetch('/api/admin/tour/hotspots', {
                method: 'POST',
                body: payload
            })
        }

        alert.success('Berhasil', `Hotspot berhasil ${isEditingHotspot.value ? 'diperbarui' : 'dibuat'}`)
        closeHotspotModal()
        fetchScene() // Reload scene to get updated hotspots
    } catch (error) {
        console.error('Failed to save hotspot', error)
        // Global toast handles error
        // alert.error('Error', 'Gagal menyimpan hotspot')
    } finally {
        savingHotspot.value = false
    }
}

const deleteHotspot = async (hotspot: any) => {
    // Improve confirm dialog with alert? No, confirm is fine for now or implementation custom alert
    // Standard alert.confirm might be async

    // For now keep standard confirm
    if (!confirm('Apakah Anda yakin ingin menghapus hotspot ini?')) return

    try {
        await apiFetch(`/api/admin/tour/hotspots/${hotspot.id}`, {
            method: 'DELETE'
        })
        alert.success('Berhasil', 'Hotspot dihapus')
        fetchScene()
    } catch (error) {
        console.error('Failed to delete hotspot', error)
        // Global toast handles error
        // alert.error('Error', 'Gagal menghapus hotspot')
    }
}

// Helper function to format currency
const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(numAmount)
}

const fetchScene = async () => {
    if (isNew.value) return

    loading.value = true
    try {
        const res: any = await apiFetch(`/api/admin/tour/scenes/${sceneId.value}`)
        const data = res.data

        form.name = data.name
        form.description = data.description
        form.imageUrlLow = data.imageUrlLow
        form.imageUrlHigh = data.imageUrlHigh
        form.defaultPitch = data.defaultPitch
        form.defaultYaw = data.defaultYaw
        form.hfov = data.hfov
        form.sequence = data.sequence
        form.isActive = data.isActive

        hotspots.value = data.hotspots || []
    } catch (error) {
        console.error('Failed to load scene:', error)
        // Global toast handles error
        // alert.error('Error', 'Gagal memuat detail scene')
        router.push('/admin/virtual-tour')
    } finally {
        loading.value = false
    }
}

const saveScene = async () => {
    saving.value = true
    try {
        const payload = { ...form }

        if (isNew.value) {
            await apiFetch('/api/admin/tour/scenes', {
                method: 'POST',
                body: payload
            })
            alert.success('Berhasil', 'Scene berhasil dibuat')
            router.push('/admin/virtual-tour')
        } else {
            await apiFetch(`/api/admin/tour/scenes/${sceneId.value}`, {
                method: 'PUT',
                body: payload
            })
            alert.success('Berhasil', 'Scene berhasil diperbarui')
            isEdit.value = false // Exit edit mode
            fetchScene() // Reload data
        }
    } catch (error) {
        console.error('Failed to save scene:', error)
        // Global toast handles error
        // alert.error('Error', 'Gagal menyimpan scene')
    } finally {
        saving.value = false
    }
}

const toggleEdit = () => {
    if (isEdit.value) {
        // Cancel edit - revert changes
        isEdit.value = false
        fetchScene()
    } else {
        // Enter edit mode
        isEdit.value = true
    }
}

onMounted(fetchScene)
</script>
