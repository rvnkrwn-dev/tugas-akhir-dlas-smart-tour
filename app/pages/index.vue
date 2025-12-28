<template>
    <div>
        <!-- Hero Section -->
        <HeroSection />

        <!-- About Section -->
        <AboutSection />

        <!-- Attractions Section -->
        <AttractionsSection />

        <!-- Features Section -->
        <FeaturesSection />



        <!-- Testimonials Section -->
        <TestimonialsSection />

        <!-- CTA Section -->
        <CTASection />

        <!-- Location Section -->
        <LocationSection />
    </div>
</template>

<script setup lang="ts">
// Import Landing Components
import HeroSection from '~/components/Landing/HeroSection.vue'
import AboutSection from '~/components/Landing/AboutSection.vue'
import AttractionsSection from '~/components/Landing/AttractionsSection.vue'
import FeaturesSection from '~/components/Landing/FeaturesSection.vue'

import TestimonialsSection from '~/components/Landing/TestimonialsSection.vue'
import CTASection from '~/components/Landing/CTASection.vue'
import LocationSection from '~/components/Landing/LocationSection.vue'

// Landing Page for D'LAS Purbalingga
definePageMeta({
    layout: 'default'
})

// SEO Meta Tags
useHead({
    title: "D'LAS Purbalingga - Desa Wisata Lembah Asri Serang",
    meta: [
        {
            name: 'description',
            content: 'Desa Wisata Lembah Asri Serang (D\'LAS) - Destinasi wisata alam terpadu di Purbalingga dengan D\'LAS Zoo, wahana petualangan, outbound, dan fasilitas lengkap untuk keluarga. Dikelola profesional oleh PT. Lembah Asri Jaya.'
        },
        {
            name: 'keywords',
            content: 'D\'LAS Purbalingga, Desa Wisata Lembah Asri Serang, D\'LAS Zoo, wisata Purbalingga, outbound Purbalingga, wisata keluarga, rekreasi Jawa Tengah, PT Lembah Asri Jaya, Dino Land, ATV, Flying Fox'
        },
        {
            property: 'og:title',
            content: "D'LAS Purbalingga - Desa Wisata Lembah Asri Serang"
        },
        {
            property: 'og:description',
            content: 'Destinasi wisata alam terpadu dengan D\'LAS Zoo, wahana petualangan, outbound, dan fasilitas lengkap untuk keluarga di Purbalingga, Jawa Tengah.'
        },
        {
            property: 'og:type',
            content: 'website'
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image'
        }
    ]
})
</script>
