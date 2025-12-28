/**
 * Admin Middleware
 * Checks if authenticated user has ADMIN or SUPER_ADMIN role
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

    // Check if user has admin role
    const userRole = userCookie.value?.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        // Redirect non-admin users to home
        return navigateTo('/')
    }
})
