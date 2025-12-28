<template>
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Info Text -->
        <p class="text-sm text-[#666] text-center sm:text-left order-2 sm:order-1">
            Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} {{ itemName }}
        </p>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <button @click="$emit('change', currentPage - 1)" :disabled="!hasPrevPage"
                class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white cursor-pointer">
                Previous
            </button>

            <span class="px-4 py-2 text-sm font-semibold text-[#333]">
                Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button @click="$emit('change', currentPage + 1)" :disabled="!hasNextPage"
                class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white cursor-pointer">
                Next
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
    itemName?: string
}

const props = withDefaults(defineProps<Props>(), {
    itemName: 'items'
})

defineEmits<{
    change: [page: number]
}>()

const startItem = computed(() => {
    return ((props.currentPage - 1) * props.itemsPerPage) + 1
})

const endItem = computed(() => {
    return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})
</script>
