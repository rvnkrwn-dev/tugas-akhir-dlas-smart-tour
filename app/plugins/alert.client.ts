export default defineNuxtPlugin((nuxtApp) => {
    // Alert will be auto-imported via Nuxt auto-imports
    // This plugin just ensures the component is available globally
    return {
        provide: {}
    }
})
