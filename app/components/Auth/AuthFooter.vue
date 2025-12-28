<template>
    <div class="text-center text-xs text-[#666]">
        <div class="flex items-center justify-center space-x-4">
            <NuxtLink to="/privacy" class="hover:text-[#4CAF50] transition-colors duration-200">
                Privacy Policy
            </NuxtLink>
            <span class="text-gray-300">•</span>
            <NuxtLink to="/terms" class="hover:text-[#4CAF50] transition-colors duration-200">
                Terms of Service
            </NuxtLink>
        </div>
        <p class="mt-3 text-[#999]">
            © {{ currentYear }} D'LAS Purbalingga. All rights reserved.
        </p>
    </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
