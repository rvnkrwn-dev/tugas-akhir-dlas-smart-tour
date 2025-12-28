/**
 * Scanner Middleware
 * Checks if authenticated user has SCANNER role
 * Should be used together with auth middleware
 */
export default defineNuxtRouteMiddleware((to, from) => {
    // Access cookies directly (available in SSR)
    const accessToken = useCookie('accessToken')
    const userCookie = useCookie<any>('user')

    // Check if user is authenticated
    const isAuthenticated = !!(accessToken.value && userCookie.value)

    if (!isAuthenticated) {
        return navigateTo('/auth/login')
    }

    // Check if user has scanner role
    const userRole = userCookie.value?.role
    if (userRole !== 'SCANNER') {
        // Redirect non-scanner users to home
        return navigateTo('/')
    }
})
