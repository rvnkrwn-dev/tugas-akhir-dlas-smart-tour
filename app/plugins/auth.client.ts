/**
 * Auth plugin - Initialize authentication on app load
 * This runs only on client-side
 */
export default defineNuxtPlugin(async () => {
    const { initAuth, getAccessToken, scheduleTokenRefresh, refreshAccessToken } = useAuth()

    // Initialize authentication
    await initAuth()

    // Schedule token refresh if user is authenticated
    const token = getAccessToken()
    if (token) {
        scheduleTokenRefresh(token)
    }

    // Handle tab visibility changes
    // When tab becomes visible after being hidden, check if token needs refresh
    if (process.client) {
        document.addEventListener('visibilitychange', async () => {
            if (document.hidden) {
            } else {
                const currentToken = getAccessToken()
                if (currentToken) {
                    // Import JWT utils dynamically to avoid circular dependencies
                    const { getTimeUntilExpiry } = await import('~/utils/jwt')
                    const timeRemaining = getTimeUntilExpiry(currentToken)
                    
                    if (timeRemaining !== null && timeRemaining < 5 * 60 * 1000) {
                        // Less than 5 minutes remaining, refresh now
                        const success = await refreshAccessToken()
                        
                        if (success) {
                            const newToken = getAccessToken()
                            if (newToken) {
                                scheduleTokenRefresh(newToken)
                            }
                        }
                    }
                }
            }
        })
    }
})
