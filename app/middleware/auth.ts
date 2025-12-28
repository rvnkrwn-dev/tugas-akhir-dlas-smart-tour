/**
 * Auth Middleware
 * Checks if user is authenticated
 * Can be used for any protected route
 */
export default defineNuxtRouteMiddleware((to, from) => {
    // Access cookies directly (available in SSR)
    const accessToken = useCookie('accessToken')
    const userCookie = useCookie<any>('user')

    // Check if user is authenticated (has both token and user data)
    const isAuthenticated = !!(accessToken.value && userCookie.value)

    if (!isAuthenticated) {
        return navigateTo('/auth/login')
    }
})
