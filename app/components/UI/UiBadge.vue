<template>
    <span :class="[
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        variantClasses[variant]
    ]">
        <slot></slot>
    </span>
</template>

<script setup lang="ts">
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
    variant?: BadgeVariant
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default'
})

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-blue-100 text-blue-700 border border-blue-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-orange-100 text-orange-700 border border-orange-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-purple-100 text-purple-700 border border-purple-200'
}
</script>
