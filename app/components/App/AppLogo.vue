<template>
    <div class="flex items-center gap-3 group flex-shrink-0 z-10">
        <div
            class="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0">
            <!-- Icon Slot with Default Home Icon -->
            <slot name="icon">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </slot>
        </div>

        <!-- Text Content -->
        <div v-if="!iconOnly" class="flex flex-col justify-center">
            <slot name="text">
                <span class="text-lg font-black text-[#333] leading-none">D'LAS</span>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    iconOnly: {
        type: Boolean,
        default: false
    }
})
</script>
