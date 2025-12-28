<template>
    <div class="min-h-screen bg-gray-50 pt-28 pb-12">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="max-w-4xl mx-auto mb-8">
                <nav class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <NuxtLink to="/" class="hover:text-green-600 transition-colors">Beranda</NuxtLink>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="text-gray-900 font-medium">Checkout</span>
                </nav>
                <h1 class="text-3xl font-black text-gray-900">Checkout Pesanan</h1>
            </div>

            <div class="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <!-- Left Column - Forms -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Customer Information -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span
                                class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">1</span>
                            Informasi Pemesan
                        </h2>

                        <div v-if="auth.isAuthenticated.value"
                            class="mb-6 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-bold text-gray-900">Gunakan Data Profil</div>
                                    <div class="text-xs text-gray-500">Isi formulir otomatis dengan data akun Anda</div>
                                </div>
                            </div>
                            <button @click="fillUserProfile" type="button"
                                class="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors">
                                Gunakan
                            </button>
                        </div>

                        <form @submit.prevent="submitOrder" class="space-y-6">
                            <div class="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label for="firstName" class="block text-sm font-bold text-gray-700 mb-2">Nama
                                        Depan</label>
                                    <input id="firstName" name="firstName" v-model="form.firstName" type="text" required
                                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        placeholder="Contoh: Budi" />
                                </div>
                                <div>
                                    <label for="lastName" class="block text-sm font-bold text-gray-700 mb-2">Nama
                                        Belakang</label>
                                    <input id="lastName" name="lastName" v-model="form.lastName" type="text" required
                                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        placeholder="Contoh: Santoso" />
                                </div>
                            </div>

                            <div class="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label for="email" class="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input id="email" name="email" v-model="form.email" type="email" required
                                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        placeholder="nama@email.com" />
                                </div>
                                <div>
                                    <label for="phone" class="block text-sm font-bold text-gray-700 mb-2">Nomor
                                        WhatsApp</label>
                                    <input id="phone" name="phone" v-model="form.phone" type="tel" required
                                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        placeholder="08123456789" />
                                </div>
                            </div>

                            <div class="border-t border-gray-100 pt-6 mt-6">
                                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span
                                        class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
                                    Catatan (Opsional)
                                </h2>
                                <div>
                                    <label for="notes" class="block text-sm font-bold text-gray-700 mb-2">Catatan
                                        Tambahan</label>
                                    <textarea id="notes" name="notes" v-model="form.notes" rows="3"
                                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                        placeholder="Tulis catatan jika ada permintaan khusus..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Payment Method -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span
                                class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">3</span>
                            Metode Pembayaran
                        </h2>

                        <div class="space-y-4">
                            <label for="payment_qris"
                                class="flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                                :class="form.paymentMethod === 'QRIS' ? 'border-green-600 bg-green-50' : 'border-gray-200'">
                                <input id="payment_qris" name="paymentMethod" type="radio" v-model="form.paymentMethod"
                                    value="QRIS" class="accent-green-600 w-5 h-5" />
                                <div class="flex-1">
                                    <div class="font-bold text-gray-900">QRIS</div>
                                    <div class="text-sm text-gray-500">Scan QR code dengan GoPay, OVO, Dana, dll</div>
                                </div>
                                <div class="text-2xl">📱</div>
                            </label>

                            <label for="payment_va"
                                class="flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                                :class="form.paymentMethod === 'VIRTUAL_ACCOUNT' ? 'border-green-600 bg-green-50' : 'border-gray-200'">
                                <input id="payment_va" name="paymentMethod" type="radio" v-model="form.paymentMethod"
                                    value="VIRTUAL_ACCOUNT" class="accent-green-600 w-5 h-5" />
                                <div class="flex-1">
                                    <div class="font-bold text-gray-900">Virtual Account</div>
                                    <div class="text-sm text-gray-500">Transfer bank otomatis (BCA, Mandiri, BRI, BNI)
                                    </div>
                                </div>
                                <div class="text-2xl">🏦</div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Summary -->
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
                        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">Ringkasan Pesanan</h3>

                            <!-- Items List -->
                            <div class="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                <div v-for="item in cartStore.items" :key="item.id" class="flex gap-3">
                                    <img :src="item.image || '/images/placeholder-attraction.jpg'" :alt="item.name"
                                        class="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-sm font-bold text-gray-900 truncate">{{ item.name }}</h4>
                                        <div class="text-xs text-gray-500 mb-1">
                                            {{ item.type === 'entrance' ? 'Tiket Masuk' : 'Wahana' }}
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs text-gray-500">{{ item.quantity }}x {{
                                                formatPrice(item.price)
                                                }}</span>
                                            <span class="text-sm font-bold text-green-600">{{ formatPrice(item.price *
                                                item.quantity)
                                            }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Totals -->
                            <div class="border-t border-gray-100 pt-4 space-y-2">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-600">Subtotal</span>
                                    <span class="font-bold text-gray-900">{{ formatPrice(cartStore.totalPrice) }}</span>
                                </div>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-600">Biaya Layanan</span>
                                    <span class="font-bold text-green-600">Gratis</span>
                                </div>
                                <div
                                    class="border-t border-dashed border-gray-200 pt-4 mt-2 flex items-center justify-between">
                                    <span class="font-bold text-gray-900">Total Pembayaran</span>
                                    <span class="text-xl font-black text-green-600">{{ formatPrice(cartStore.totalPrice)
                                    }}</span>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <button @click="submitOrder" :disabled="isSubmitting || cartStore.items.length === 0"
                                class="w-full mt-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2">
                                <span v-if="isSubmitting"
                                    class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span v-else>Bayar Sekarang</span>
                            </button>

                            <p class="text-xs text-center text-gray-400 mt-4">
                                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '~/types/api'
import { useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const { alert } = useAlert()

const isSubmitting = ref(false)

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: 'QRIS'
})

const auth = useAuth()

const fillUserProfile = () => {
    if (!auth.user.value) return

    const user = auth.user.value
    // Use optional chaining directly on user_profiles
    form.value.firstName = user.user_profiles?.firstName || ''
    form.value.lastName = user.user_profiles?.lastName || ''
    form.value.email = user.email || ''
    form.value.phone = user.user_profiles?.phone || ''
}

// Validation
const validateForm = () => {
    if (!form.value.firstName || !form.value.lastName || !form.value.email || !form.value.phone) {
        alert.error('Validasi Gagal', 'Mohon lengkapi semua data diri Anda')
        return false
    }
    if (!form.value.email.includes('@')) {
        alert.error('Validasi Gagal', 'Mohon masukkan alamat email yang valid')
        return false
    }
    return true
}

const config = useRuntimeConfig()

useHead({
    title: 'Checkout - D\'LAS Purbalingga',
    meta: [
        { name: 'description', content: 'Selesaikan pemesanan tiket liburan Anda di D\'LAS Lebak Wangi Asri Purbalingga' }
    ],
    script: [
        {
            src: config.public.midtransIsProduction
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js',
            'data-client-key': config.public.midtransClientKey,
            defer: true
        }
    ]
})

// Extend Window interface for Snap
declare global {
    interface Window {
        snap: any;
    }
}

const submitOrder = async () => {
    if (!validateForm()) return

    isSubmitting.value = true

    try {
        const payload = {
            customerInfo: {
                firstName: form.value.firstName,
                lastName: form.value.lastName,
                email: form.value.email,
                phone: form.value.phone,
            },
            notes: form.value.notes,
            paymentMethod: form.value.paymentMethod
        }

        const { apiFetch } = useFetchApi()

        const response = await apiFetch<ApiResponse<{ transaction: any, snapToken: string | null }>>('/api/purchase/checkout', {
            method: 'POST',
            body: payload
        })

        // Check if we have a Snap Token
        if (response.success && response.data?.snapToken) {
            // Transaction created, open Snap
            const snapToken = response.data.snapToken;

            if (!window.snap) {
                alert.error('Gagal Memuat', 'Sistem pembayaran sedang dimuat. Silahkan coba lagi dalam beberapa detik.');
                isSubmitting.value = false;
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: function (result: any) {
                    cartStore.clearCart()
                    alert.success('Pembayaran Berhasil', 'Tiket Anda sedang diproses dan akan dikirim ke email.')
                    router.push('/my-tickets') // Redirect to my tickets page
                },
                onPending: function (result: any) {
                    cartStore.clearCart()
                    alert.info('Menunggu Pembayaran', 'Silahkan selesaikan pembayaran Anda.')
                    router.push('/my-tickets')
                },
                onError: function (result: any) {
                    alert.error('Pembayaran Gagal', 'Terjadi kesalahan saat memproses pembayaran. Silahkan coba lagi.')
                },
                onClose: function () {
                    alert.warning('Pembayaran Belum Selesai', 'Anda menutup halaman pembayaran sebelum menyelesaikan transaksi.')
                    cartStore.clearCart()
                    router.push('/my-tickets')
                }
            })
        } else if (response.success) {
            // Fallback for non-Snap flows (if any)
            cartStore.clearCart()
            await alert.success('Berhasil', 'Pesanan berhasil dibuat!')
            router.push('/')
        }

    } catch (e: any) {
        console.error('Checkout Error:', e)
        alert.error('Gagal', e.message || 'Gagal memproses pesanan. Silahkan coba lagi.')
    } finally {
        isSubmitting.value = false
    }
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

onMounted(async () => {
    if (!cartStore.hasItems) {
        await alert.warning('Keranjang Kosong', 'Silahkan pilih tiket terlebih dahulu')
        router.push('/wahana')
        return
    }

    // Attempt to sync local cart with server
    // This is necessary because checkout endpoint reads from DB
    try {
        await cartStore.syncCart()
    } catch (e) {
        console.error('Failed to sync cart:', e)
        // Check if error is 401 (unauthorized)
        // In a real app we'd redirect to login
        // For now we'll allow proceed but checkout might fail if not guest enabled
    }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ccc;
}
</style>
