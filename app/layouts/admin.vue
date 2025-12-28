<template>
    <div class="min-h-screen bg-[#F9F9F9] relative">
        <!-- Loading Overlay with Blur -->
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isAuthLoading"
                class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div class="text-center">
                    <div
                        class="w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4">
                    </div>
                    <p class="text-[#666] font-semibold">Memuat Dashboard...</p>
                    <p class="text-[#999] text-sm mt-1">Mohon tunggu</p>
                </div>
            </div>
        </Transition>

        <!-- Admin Sidebar -->
        <AdminSidebar />

        <!-- Main Content Area -->
        <div class="transition-all duration-300" :class="isCollapsed ? 'lg:pl-20' : 'lg:pl-64'">
            <!-- Top Header Bar -->
            <AdminHeader />

            <!-- Page Content with Smooth Transition -->
            <main class="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                <Transition mode="out-in" enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150" leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2">
                    <div>
                        <slot />
                    </div>
                </Transition>
            </main>

            <!-- Footer -->
            <footer class="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p class="text-sm text-[#666]">
                        © 2024 <span class="font-semibold text-[#4CAF50]">D'LAS Purbalingga</span>. Hak cipta dilindungi
                        undang-undang.
                    </p>
                    <div class="flex items-center gap-4 text-sm text-[#666]">
                        <a href="#" class="hover:text-[#4CAF50] transition-colors">Privasi</a>
                        <span class="text-gray-300">•</span>
                        <a href="#" class="hover:text-[#4CAF50] transition-colors">Syarat</a>
                        <span class="text-gray-300">•</span>
                        <a href="#" class="hover:text-[#4CAF50] transition-colors">Bantuan</a>
                    </div>
                </div>
            </footer>
        </div>

        <!-- Scroll to Top Button -->
        <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
            <button v-if="showScrollTop" @click="scrollToTop"
                class="fixed bottom-6 transition-all duration-300 w-12 h-12 bg-white border-2 border-gray-200 text-[#666] rounded-full shadow-md hover:shadow-lg hover:border-[#4CAF50] hover:text-[#4CAF50] flex items-center justify-center z-20"
                :class="isCollapsed ? 'left-24' : 'left-[17rem]'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { initAuth } = useAuth()
const { isCollapsed } = useSidebarState()

// State
const isAuthLoading = ref(true)
const showScrollTop = ref(false)

// Methods
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

const handleScroll = () => {
    showScrollTop.value = window.scrollY > 300
}

// Lifecycle
onMounted(async () => {
    // Initialize auth state
    await initAuth()
    isAuthLoading.value = false

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #4CAF50;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #45a049;
}
</style>
