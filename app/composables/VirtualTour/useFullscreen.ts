import { ref, onMounted, onUnmounted } from 'vue'

export const useFullscreen = () => {
    const isFullscreen = ref(false)
    const isSupported = ref(false)

    // Check if fullscreen API is supported
    const checkSupport = () => {
        isSupported.value = !!(
            document.fullscreenEnabled ||
            (document as any).webkitFullscreenEnabled ||
            (document as any).mozFullScreenEnabled ||
            (document as any).msFullscreenEnabled
        )
    }

    // Enter fullscreen
    const enterFullscreen = async (): Promise<boolean> => {
        if (!isSupported.value) {
            console.warn('Fullscreen API not supported')
            return false
        }

        try {
            const element = document.documentElement

            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen()
            } else if ((element as any).mozRequestFullScreen) {
                await (element as any).mozRequestFullScreen()
            } else if ((element as any).msRequestFullscreen) {
                await (element as any).msRequestFullscreen()
            }

            return true
        } catch (error) {
            console.error('Failed to enter fullscreen:', error)
            return false
        }
    }

    // Exit fullscreen
    const exitFullscreen = async (): Promise<boolean> => {
        if (!document.fullscreenElement) {
            return true
        }

        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen()
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen()
            }

            return true
        } catch (error) {
            console.error('Failed to exit fullscreen:', error)
            return false
        }
    }

    // Toggle fullscreen
    const toggleFullscreen = async (): Promise<boolean> => {
        if (isFullscreen.value) {
            return await exitFullscreen()
        } else {
            return await enterFullscreen()
        }
    }

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
        isFullscreen.value = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        )
    }

    // Setup event listeners
    onMounted(() => {
        checkSupport()

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('mozfullscreenchange', handleFullscreenChange)
        document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    })

    // Cleanup
    onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    })

    return {
        isFullscreen,
        isSupported,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen
    }
}
