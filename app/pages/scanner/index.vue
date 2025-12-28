<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Scan Tiket</h1>
                <p class="text-sm text-gray-500">Arahkan kamera ke kode QR tiket pengunjung</p>
            </div>
            <div class="flex items-center gap-3">
                <div v-if="isScanning"
                    class="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Kamera Aktif
                </div>
                <button v-else @click="startScanner"
                    class="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    Aktifkan Kamera
                </button>
            </div>
        </div>

        <!-- Scanner Card -->
        <div :class="[
            'relative overflow-hidden flex items-center justify-center transition-all duration-300',
            isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'bg-gray-900 rounded-2xl shadow-sm min-h-[500px] w-full'
        ]">
            <!-- Camera Container -->
            <div v-show="isScanning" id="qr-reader" class="w-full h-full absolute inset-0 bg-black"></div>

            <!-- Fallback / Initial State -->
            <div v-if="!isScanning"
                class="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-10">
                <div class="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">Siap Memindai</h3>
                <p class="text-gray-500 mb-6 text-center max-w-xs">Pastikan pencahayaan cukup dan kode QR tiket terlihat
                    jelas.</p>
                <button @click="startScanner"
                    class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95">
                    Mulai Scan
                </button>
            </div>

            <!-- Custom Overlay -->
            <div v-if="isScanning"
                class="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
                <!-- Frame with Shadow for Darkening Outside -->
                <div
                    class="w-72 h-72 border-2 border-white/50 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div
                        class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl -mt-1 -ml-1">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -mt-1 -mr-1">
                    </div>
                    <div
                        class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl -mb-1 -ml-1">
                    </div>
                    <div
                        class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -mb-1 -mr-1">
                    </div>

                    <!-- Scan laser -->
                    <div
                        class="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute top-1/2 -translate-y-1/2 animate-scan opacity-80 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    </div>
                </div>

                <!-- Text Instruction -->
                <div class="absolute bottom-12 left-0 right-0 text-center">
                    <span class="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
                        Arahkan ke kode QR
                    </span>
                </div>
            </div>

            <!-- Controls (Floating) -->
            <div v-if="isScanning" class="absolute top-6 right-6 z-30 flex items-center gap-3">
                <!-- Fullscreen Toggle -->
                <button @click="toggleFullscreen"
                    class="p-3 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full text-white transition-all transform hover:scale-105"
                    :title="isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'">
                    <svg v-if="!isFullscreen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Stop Button -->
                <button v-if="!isFullscreen" @click="stopScanner"
                    class="p-3 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-md transition-all transform hover:scale-105"
                    title="Matikan Kamera">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Result Modal (Modern) -->
        <Transition enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

                <!-- Card -->
                <div
                    class="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden transform">
                    <!-- Header Pattern -->
                    <div class="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 w-full absolute top-0 left-0"></div>

                    <!-- Close Button -->
                    <button @click="closeModal"
                        class="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Illustration/Icon -->
                    <div class="relative px-6 pt-12 pb-4 flex flex-col items-center text-center">
                        <div
                            class="w-20 h-20 bg-white border-4 border-white rounded-full shadow-lg flex items-center justify-center text-blue-600 mb-4 z-10">
                            <svg v-if="!errorMsg" class="w-10 h-10" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else class="w-10 h-10 text-red-500" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <div v-if="errorMsg">
                            <h3 class="text-xl font-black text-gray-900">Validasi Gagal</h3>
                            <p class="text-gray-500 text-sm mt-1">{{ errorMsg }}</p>
                        </div>
                        <div v-else-if="ticketData">
                            <h3 class="text-xl font-black text-gray-900">Tiket Valid</h3>
                            <p class="text-gray-500 text-sm mt-1">Order #{{ ticketData.ticket.code }}</p>
                        </div>
                        <div v-else class="animate-pulse">
                            <div class="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                            <div class="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                        </div>
                    </div>

                    <!-- Content Scrollable -->
                    <div v-if="ticketData && !errorMsg" class="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                        <!-- Visitor Card -->
                        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                            <div
                                class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                {{ ticketData.user.name.charAt(0) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-gray-500 uppercase">Pengunjung</p>
                                <p class="font-bold text-gray-900 truncate">{{ ticketData.user.name }}</p>
                                <p class="text-xs text-gray-500 truncate">{{ ticketData.user.email }}</p>
                            </div>
                        </div>

                        <!-- Items -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-bold text-gray-900">Detail Tiket</h4>
                                <span
                                    class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{
                                        ticketData.ticket.status }}</span>
                            </div>

                            <div class="space-y-3">
                                <div v-for="item in ticketData.items" :key="item.id"
                                    class="border rounded-xl p-3 relative hover:border-blue-500 transition-colors"
                                    :class="item.canRedeem ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'">
                                    <div class="flex justify-between items-start mb-2">
                                        <h5 class="font-bold text-gray-800 text-sm">{{ item.attractionName }}</h5>
                                        <div class="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            Total: {{ item.totalQty }}</div>
                                    </div>

                                    <div class="flex items-center justify-between mt-3">
                                        <div>
                                            <div class="text-xs text-gray-500">Sisa Kuota</div>
                                            <div class="text-lg font-black"
                                                :class="item.remainingQty > 0 ? 'text-blue-600' : 'text-gray-400'">{{
                                                    item.remainingQty }}</div>
                                        </div>

                                        <div v-if="item.canRedeem" class="flex items-center gap-2">
                                            <div class="flex items-center border rounded-lg overflow-hidden">
                                                <button
                                                    @click="redeemQty[item.id] = Math.max(1, (redeemQty[item.id] || 1) - 1)"
                                                    class="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">-</button>
                                                <input v-model="redeemQty[item.id]" type="number"
                                                    class="w-8 text-center text-sm font-bold focus:outline-none py-1"
                                                    readonly />
                                                <button
                                                    @click="redeemQty[item.id] = Math.min(item.remainingQty, (redeemQty[item.id] || 1) + 1)"
                                                    class="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">+</button>
                                            </div>
                                            <button @click="redeemItem(item)" :disabled="isRedeeming"
                                                class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50">
                                                {{ isRedeeming ? 'Processing' : 'Tukar' }}
                                            </button>
                                        </div>
                                        <div v-else
                                            class="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg">
                                            Habis</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <UiAlert ref="alertRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Html5Qrcode } from "html5-qrcode"
import { useFetchApi } from '~/composables/useFetchApi'

definePageMeta({
    layout: 'scanner',
    middleware: ['auth'] // Ensure guarded
})

const { apiFetch } = useFetchApi()
const alertRef = ref()
// Note: useAlert removed to avoid circular issues or just standard usage. 
// Assuming UiAlert handles its own display. 
const isScanning = ref(false)
const hasPermission = ref(false)
const isFullscreen = ref(false)
const showModal = ref(false)
const isLoading = ref(false)
const isRedeeming = ref(false)
const errorMsg = ref('')
const ticketData = ref<any>(null)
const redeemQty = ref<Record<string, number>>({})

let html5QrCode: Html5Qrcode | null = null

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
}

onMounted(() => {
    // Check permission status roughly (won't be accurate until requested)
    // Removed auto start for new design, user clicks button
})

onBeforeUnmount(() => {
    stopScanner()
})

const startScanner = async () => {
    isScanning.value = true // Show the container first
    await nextTick() // Wait for DOM update

    try {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qr-reader")
        }

        const config = { fps: 10, qrbox: { width: 250, height: 250 } }

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            (errorMessage) => {
                // Ignore parse errors
            }
        )
        hasPermission.value = true
    } catch (err) {
        console.error("Failed to start scanner", err)
        isScanning.value = false // Revert if failed
        hasPermission.value = false
        alert(err)
    }
}

const stopScanner = async () => {
    isFullscreen.value = false // Exit fullscreen
    if (html5QrCode && isScanning.value) {
        try {
            await html5QrCode.stop()
            isScanning.value = false
        } catch (err) {
            console.error("Failed to stop scanner", err)
        }
    }
}

const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log(`Scan matched: ${decodedText}`, decodedResult)
    // Beep sound
    playBeep()

    // Pause scanning
    await html5QrCode?.pause() // Pause instead of stop to resume faster

    // Process
    handleTicketCheck(decodedText)
}

const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.value = 880 // A5
    gainNode.gain.value = 0.1

    oscillator.start()
    setTimeout(() => {
        oscillator.stop()
        audioContext.close()
    }, 150)
}

const handleTicketCheck = async (qrCode: string) => {
    showModal.value = true
    isLoading.value = true
    errorMsg.value = ''
    ticketData.value = null
    redeemQty.value = {}

    try {
        const res: any = await apiFetch('/api/scanner/check', {
            method: 'POST',
            body: { qrCode }
        })

        ticketData.value = res.data
        // Init redeem qty
        if (ticketData.value?.items) {
            ticketData.value.items.forEach((item: any) => {
                redeemQty.value[item.id] = 1
            })
        }
    } catch (err: any) {
        console.error(err)
        errorMsg.value = err?.data?.data?.message || 'Gagal memvalidasi tiket.'
    } finally {
        isLoading.value = false
    }
}

const redeemItem = async (item: any) => {
    // if (!confirm(`Tukarkan ${redeemQty.value[item.id]}x ${item.attractionName}?`)) return

    isRedeeming.value = true
    try {
        const res: any = await apiFetch('/api/scanner/redeem', {
            method: 'POST',
            body: {
                ticketId: ticketData.value.ticket.id,
                detailId: item.id,
                quantity: redeemQty.value[item.id]
            }
        })

        // Success
        // alert(`Berhasil! Sisa: ${res.data.remaining}`)
        // Play success beep
        playBeep()

        // Update local state
        item.usedQty += redeemQty.value[item.id]
        item.remainingQty -= redeemQty.value[item.id]
        item.canRedeem = item.remainingQty > 0
        if (item.remainingQty < redeemQty.value[item.id]) redeemQty.value[item.id] = item.remainingQty || 1

    } catch (err: any) {
        alert(err?.data?.data?.message || 'Gagal menukarkan tiket')
    } finally {
        isRedeeming.value = false
    }
}

const closeModal = () => {
    showModal.value = false
    html5QrCode?.resume()
}

// Helpers
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const getStatusClass = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'bg-green-100 text-green-800'
        case 'PARTIALLY_USED': return 'bg-blue-100 text-blue-800'
        case 'FULLY_USED': return 'bg-gray-100 text-gray-800'
        case 'EXPIRED': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const isWrongDate = (data: any) => {
    if (!data?.ticket?.visitDateFrom) return false
    const today = new Date().setHours(0, 0, 0, 0)
    const visit = new Date(data.ticket.visitDateFrom).setHours(0, 0, 0, 0)
    return today !== visit
}
</script>

<style scoped>
#qr-reader {
    overflow: hidden;
}

@keyframes scan {
    0% {
        top: 0;
    }

    50% {
        top: 100%;
    }

    100% {
        top: 0;
    }
}

.animate-scan {
    animation: scan 2s infinite ease-in-out;
}
</style>
