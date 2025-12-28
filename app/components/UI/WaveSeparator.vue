<template>
    <div class="relative w-full overflow-hidden" :class="containerClass">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto"
            preserveAspectRatio="none">
            <path :d="wavePath" :fill="color" />
        </svg>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    variant?: 'wave1' | 'wave2' | 'wave3'
    color?: string
    flip?: boolean
    containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'wave1',
    color: '#FFFFFF',
    flip: false,
    containerClass: ''
})

const wavePaths = {
    wave1: 'M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z',
    wave2: 'M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z',
    wave3: 'M0,96L48,90.7C96,85,192,75,288,69.3C384,64,480,64,576,69.3C672,75,768,85,864,85.3C960,85,1056,75,1152,64C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'
}

const wavePath = computed(() => wavePaths[props.variant])
</script>
