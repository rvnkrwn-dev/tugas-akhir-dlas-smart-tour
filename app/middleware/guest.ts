/**
 * Guest Middleware
 * Ensures user is NOT authenticated
 * Used for auth pages (login, register, forgot-password, etc.)
 * Redirects authenticated users to their appropriate dashboard
 */
export default defineNuxtRouteMiddleware((to, from) => {
    // Access cookies directly (available in SSR)
    const accessToken = useCookie('accessToken')
    const userCookie = useCookie<any>('user')

    // console.log('[Guest Middleware] Running...')
    // console.log('[Guest Middleware] accessToken:', !!accessToken.value)
    // console.log('[Guest Middleware] user:', userCookie.value)

    if (accessToken.value && userCookie.value) {
        const userRole = userCookie.value.role

        // Redirect based on role
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            return navigateTo('/admin/dashboard')
        } else if (userRole === 'SCANNER') {
            return navigateTo('/scanner')
        } else {
            // Regular users (CUSTOMER) go to home
            return navigateTo('/')
        }
    }

    // User is not authenticated, allow access to auth pages
})
