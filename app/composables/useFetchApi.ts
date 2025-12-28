import type { FetchOptions } from 'ofetch'
import { useErrorParser } from './useErrorParser'
import { useToast } from './useToast'

/**
 * Custom $fetch wrapper for internal API calls with auto bearer token injection
 * For external APIs, use useFetch directly
 */
export const useFetchApi = () => {
  const { getAccessToken, refreshAccessToken } = useAuth()

  const apiFetch = async <T = any>(
    url: string,
    options?: any
  ): Promise<T> => {
    // Get current access token
    const token = getAccessToken()

    // Prepare headers with bearer token
    const headers = {
      ...(options?.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    }

    try {
      return await $fetch(url, {
        ...options,
        headers
      }) as T
    } catch (error: any) {
      // If 401 Unauthorized, try refresh and retry
      // We explicitly do NOT retry on 403 Forbidden (authenticated but no permission)
      if (error?.response?.status === 401 || error?.statusCode === 401) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
          const newToken = getAccessToken()
          return await $fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
          }) as T
        }
      }

      // Universal Error Handling with Toast
      const { parseError } = useErrorParser()
      const { message } = parseError(error)

      // Use useNuxtApp to access toast if useToast is auto-imported, 
      // or directly use the composable if it keeps global state (which ours does)
      const { error: showError } = useToast()

      // Avoid showing toast for 401 as it might be a session expiry handled elsewhere or redirect
      // Show toast if not 401 OR if refresh failed (which throws)
      if (error?.response?.status !== 401) {
        showError('Gagal', message)
      }

      throw error
    }
  }

  return { apiFetch }
}
