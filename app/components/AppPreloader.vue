<template>
    <div v-if="loading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const nuxtApp = useNuxtApp()

onMounted(() => {
    nuxtApp.hook('page:finish', () => {
        setTimeout(() => {
            loading.value = false
        }, 500)
    })

    // Fallback
    setTimeout(() => {
        loading.value = false
    }, 2000)
})
</script>
