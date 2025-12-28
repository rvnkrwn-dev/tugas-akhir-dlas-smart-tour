interface User {
    id: string
    email: string
    role: string
    isActive: boolean
    isEmailVerified: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
    user_profiles?: {
        id: string
        firstName?: string
        lastName?: string
        phone?: string
        avatarUrl?: string | null
        dateOfBirth?: string | null
        gender?: string | null
        address?: string | null
        city?: string | null
        country?: string | null
        postalCode?: string | null
    }
}

interface LoginCredentials {
    email: string
    password: string
}



/**
 * Authentication composable for managing JWT tokens and user state
 */
/**
 * Authentication composable for managing JWT tokens and user state
 */
// Shared promise for refresh token request to prevent race conditions (Single-flight)
let globalRefreshPromise: Promise<boolean> | null = null
// Global refresh timer (shared across all useAuth instances)
let globalRefreshTimer: ReturnType<typeof setTimeout> | null = null

import type { ApiResponse } from '~/types/api'
import { getTimeUntilExpiry, isTokenExpired } from '~/utils/jwt'

export const useAuth = () => {
    // Use cookies for SSR compatibility (accessible in middleware)
    const accessTokenCookie = useCookie('accessToken', {
        maxAge: 60 * 60 * 24 * 7, // 7 days - matches refresh token for UX, but technically access token expires sooner
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })

    const userCookie = useCookie<User | null>('user', {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })

    // Reactive state (synced with cookies)
    const user = useState<User | null>('auth_user', () => userCookie.value || null)
    const accessToken = useState<string | null>('auth_access_token', () => accessTokenCookie.value || null)
    const isInitialized = useState<boolean>('auth_initialized', () => false)

    // Computed
    const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const isScanner = computed(() => user.value?.role === 'SCANNER')
    const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

    /**
     * Get current access token
     */
    const getAccessToken = (): string | null => {
        // Try from state first
        if (accessToken.value) {
            return accessToken.value
        }

        // Try from cookie
        if (accessTokenCookie.value) {
            accessToken.value = accessTokenCookie.value
            return accessTokenCookie.value
        }

        return null
    }

    /**
     * Schedule automatic token refresh before expiration
     */
    const scheduleTokenRefresh = (token: string) => {
        // Clear existing timer
        if (globalRefreshTimer) {
            clearTimeout(globalRefreshTimer)
            globalRefreshTimer = null
        }

        // Check if token is valid
        const timeUntilExpiry = getTimeUntilExpiry(token)
        if (timeUntilExpiry === null) {
            console.warn('[Auth] Cannot schedule refresh: invalid token')
            return
        }

        // If token is already expired, refresh immediately
        if (timeUntilExpiry <= 0) {
            refreshAccessToken()
            return
        }

        // Calculate when to refresh:
        // - Refresh 5 minutes before expiration
        // - Or at halfway point if token life is less than 10 minutes
        const REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in ms
        const refreshBuffer = Math.min(REFRESH_BUFFER, timeUntilExpiry / 2)
        const refreshIn = timeUntilExpiry - refreshBuffer

        const refreshInSeconds = Math.floor(refreshIn / 1000)
        const expiresInSeconds = Math.floor(timeUntilExpiry / 1000)
        
        // Schedule the refresh
        globalRefreshTimer = setTimeout(async () => {
            const success = await refreshAccessToken()
            
            if (success) {
                const newToken = getAccessToken()
                if (newToken) {
                    // Re-schedule for the new token
                    scheduleTokenRefresh(newToken)
                }
            } else {
                console.error('[Auth] Auto-refresh failed')
            }
        }, refreshIn)
    }

    /**
     * Set access token and schedule auto-refresh
     */
    const setAccessToken = (token: string) => {
        accessToken.value = token
        accessTokenCookie.value = token
        
        // Auto-schedule refresh for the new token
        if (process.client) {
            scheduleTokenRefresh(token)
        }
    }

    /**
     * Set user data
     */
    const setUser = (userData: User) => {
        user.value = userData
        userCookie.value = userData
    }

    /**
     * Get user from cookie
     */
    const getUserFromStorage = (): User | null => {
        return userCookie.value || null
    }

    /**
     * Clear all tokens and user data
     */
    const clearTokens = () => {
        accessToken.value = null
        user.value = null
        isInitialized.value = false

        // Clear cookies
        accessTokenCookie.value = null
        userCookie.value = null
        
        // Clear refresh timer
        if (globalRefreshTimer) {
            clearTimeout(globalRefreshTimer)
            globalRefreshTimer = null
        }
    }

    /**
     * Fetch current user profile
     */
    const fetchMe = async (): Promise<boolean> => {
        try {
            const token = getAccessToken()
            if (!token) return false

            // The /api/auth/me endpoint directly returns the User object in its data field
            const response = await $fetch<ApiResponse<User>>(
                '/api/auth/me',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (response.success && response.data) {
                // User data is directly in response.data
                setUser(response.data)
                return true
            }

            return false
        } catch (error) {
            // Do not clear tokens immediately here, let the caller decide or let useFetchApi handle 401s
            console.error('Failed to fetch user:', error)
            return false
        }
    }

    /**
     * Initialize auth state
     * Call this on app mount to restore session
     */
    const initAuth = async () => {
        // Skip if already initialized
        if (isInitialized.value) {
            return
        }

        // Try to get user from cookie first (fastest)
        const storedUser = getUserFromStorage()
        if (storedUser) {
            user.value = storedUser
        }

        const token = getAccessToken()
        if (token) {
            // Validate token / fetch fresh user data
            // We do this in background mainly, but for critical checks we await
            try {
                const success = await fetchMe()
                if (!success) {
                    // Try ONE refresh if initial fetch fails logic
                    const refreshed = await refreshAccessToken()
                    if (refreshed) {
                        await fetchMe()
                    }
                }
            } catch (error) {
                // Try refreshing if fetch failed
                const refreshed = await refreshAccessToken()
                if (refreshed) {
                    await fetchMe()
                }
            }
        }

        // Mark as initialized
        isInitialized.value = true
    }

    /**
     * Login user
     */
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            // Use useFetchApi for internal API calls if circular dependency wasn't an issue, but here we use $fetch safely
            const response = await $fetch<ApiResponse<{ accessToken: string; user: User }>>('/api/auth/login', {
                method: 'POST',
                body: credentials,
            })

            if (response.success && response.data) {
                // Store access token
                setAccessToken(response.data.accessToken)

                // Set user (with persistence)
                setUser(response.data.user)

                // Refresh token is automatically stored in HTTP-only cookie by backend

                return true
            }

            return false
        } catch (error: any) {
            console.error('Login failed:', error)
            throw error
        }
    }

    /**
     * Logout user
     */
    const logout = async (): Promise<void> => {
        try {
            const token = getAccessToken()
            if (token) {
                // Call logout endpoint to invalidate refresh token
                await $fetch<ApiResponse<null>>('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            }
        } catch (error) {
            console.error('Logout API call failed:', error)
        } finally {
            // Always clear local tokens
            clearTokens()

            // Redirect to login page calling navigateTo might be risky if logout is called from middleware, 
            // but generally safe in event handlers.
            // Using window.location.href or similar ensures full state reset if needed, but navigateTo is Nuxt way.
            await navigateTo('/auth/login', { replace: true })
        }
    }

    /**
     * Refresh access token using refresh token cookie
     * Implements "Single-flight" pattern: only one network request at a time
     */
    const refreshAccessToken = async (): Promise<boolean> => {
        // If there is already a refresh in progress, return the existing promise
        if (globalRefreshPromise) {
            return globalRefreshPromise
        }

        // Create a new refresh promise
        globalRefreshPromise = (async () => {
            try {
                const response = await $fetch<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', {
                    credentials: 'include', // Important: send cookies
                    retry: false, // Do not retry the refresh request itself
                })

                if (response.success && response.data) {
                    // Store new access token
                    setAccessToken(response.data.accessToken)
                    return true
                }

                return false
            } catch (error) {
                console.error('Token refresh failed:', error)

                // If refresh fails (401/403), it means session is dead.
                // We must log out.
                clearTokens()
                await navigateTo('/auth/login')

                return false
            } finally {
                // Reset the global promise so subsequent calls (after this one finishes) can try again if needed
                globalRefreshPromise = null
            }
        })()

        return globalRefreshPromise
    }

    return {
        // State
        user: readonly(user),
        isAuthenticated,
        isAdmin,
        isScanner,
        isCustomer,

        // Methods
        login,
        logout,
        getAccessToken,
        setAccessToken,
        clearTokens,
        refreshAccessToken,
        scheduleTokenRefresh,
        initAuth,
        fetchMe,
    }
}

