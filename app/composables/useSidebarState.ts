// Shared state for sidebar collapse using Nuxt's useState for global reactivity
export const useSidebarState = () => {
    const isCollapsed = useState('sidebar-collapsed', () => false)
    const isMobileOpen = useState('sidebar-mobile-open', () => false)

    const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value
    }

    const toggleMobileOpen = () => {
        isMobileOpen.value = !isMobileOpen.value
    }

    const closeMobile = () => {
        isMobileOpen.value = false
    }

    return {
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        toggleMobileOpen,
        closeMobile
    }
}
