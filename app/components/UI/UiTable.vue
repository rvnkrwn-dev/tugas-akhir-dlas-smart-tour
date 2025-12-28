<template>
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
            <div
                class="inline-block w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mb-4">
            </div>
            <p class="text-[#666] font-medium">{{ loadingText }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-red-600 font-semibold mb-2">{{ error }}</p>
            <button v-if="onRetry" @click="onRetry" class="text-[#4CAF50] hover:underline font-medium cursor-pointer">
                Try Again
            </button>
        </div>

        <!-- Table -->
        <div v-else-if="data.length > 0" class="overflow-x-auto">
            <table class="w-full">
                <!-- Header -->
                <thead class="bg-[#F9F9F9] border-b border-gray-200">
                    <tr>
                        <th v-for="column in columns" :key="column.key" :class="[
                            'px-5 py-3 text-xs font-semibold text-[#666] uppercase tracking-wider whitespace-nowrap transition-colors select-none',
                            column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                            column.sticky ? 'sticky right-0 bg-[#F9F9F9]' : '',
                            column.sortable ? 'cursor-pointer hover:bg-gray-100 hover:text-[#333]' : '',
                            column.headerClass || ''
                        ]" @click="column.sortable && emit('sort', column.key)">
                            <div class="flex items-center gap-1"
                                :class="{ 'justify-end': column.align === 'right', 'justify-center': column.align === 'center' }">
                                {{ column.label }}
                                <span v-if="column.sortable"
                                    class="flex flex-col text-[8px] leading-none text-gray-400">
                                    <span
                                        :class="{ 'text-[#4CAF50]': sortBy === column.key && sortOrder === 'asc' }">▲</span>
                                    <span
                                        :class="{ 'text-[#4CAF50]': sortBy === column.key && sortOrder === 'desc' }">▼</span>
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>

                <!-- Body -->
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(row, rowIndex) in data" :key="getRowKey(row, rowIndex)"
                        :class="['transition-colors', rowHoverClass]">
                        <td v-for="column in columns" :key="column.key" :class="[
                            'px-5 py-4',
                            column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                            column.sticky ? 'sticky right-0 bg-white' : '',
                            column.cellClass || ''
                        ]">
                            <!-- Custom Slot -->
                            <slot v-if="column.slot" :name="`cell-${column.key}`" :row="row"
                                :value="getCellValue(row, column.key)">
                                {{ getCellValue(row, column.key) }}
                            </slot>
                            <!-- Default Cell -->
                            <span v-else>{{ getCellValue(row, column.key) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div v-else class="p-12 text-center">
            <slot name="empty">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-[#666] font-medium">{{ emptyText }}</p>
            </slot>
        </div>

        <!-- Footer Slot (for pagination, etc) -->
        <div v-if="$slots.footer && data.length > 0" class="px-5 py-4 border-t border-gray-200 bg-[#F9F9F9]">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Export interface for use in other components
export interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
    sticky?: boolean
    slot?: boolean
    sortable?: boolean
    headerClass?: string
    cellClass?: string
}

interface Props {
    columns: TableColumn[]
    data: any[]
    loading?: boolean
    error?: string | null
    loadingText?: string
    emptyText?: string
    rowKey?: string
    rowHoverClass?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onRetry?: () => void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    error: null,
    loadingText: 'Loading...',
    emptyText: 'No data available',
    rowKey: 'id',
    rowHoverClass: 'hover:bg-gray-50',
    sortBy: '',
    sortOrder: 'desc'
})

const emit = defineEmits<{
    (e: 'sort', key: string): void
}>()

// Get cell value from row using dot notation
const getCellValue = (row: any, key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], row)
}

// Get row key for v-for
const getRowKey = (row: any, index: number) => {
    return row[props.rowKey] || index
}
</script>

<style scoped>
/* Ensure sticky cell background changes on row hover */
tr:hover td.sticky {
    background-color: rgb(249 250 251);
    /* gray-50 */
}
</style>
