import { ref, onMounted, onUnmounted } from 'vue'

export const useGyroscope = () => {
    const isAvailable = ref(false)
    const isEnabled = ref(false)
    const isPermissionGranted = ref(false)
    const needsPermission = ref(false)

    // Device orientation data
    const orientation = ref({
        alpha: 0,  // Z-axis rotation (0-360)
        beta: 0,   // X-axis rotation (-180 to 180)
        gamma: 0   // Y-axis rotation (-90 to 90)
    })

    // Calibration values
    let initialAlpha: number | null = null
    let initialBeta: number | null = null
    let initialGamma: number | null = null

    // Check if gyroscope is available
    const checkAvailability = () => {
        isAvailable.value = 'DeviceOrientationEvent' in window

        // Check if permission is needed (iOS 13+)
        needsPermission.value = typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    }

    // Request permission (iOS 13+)
    const requestPermission = async (): Promise<boolean> => {
        if (!needsPermission.value) {
            return true
        }

        try {
            const permission = await (DeviceOrientationEvent as any).requestPermission()
            isPermissionGranted.value = permission === 'granted'
            return isPermissionGranted.value
        } catch (error) {
            console.error('Gyroscope permission denied:', error)
            return false
        }
    }

    // Handle device orientation event
    const handleOrientation = (event: DeviceOrientationEvent) => {
        if (!isEnabled.value) return

        const { alpha, beta, gamma } = event

        if (alpha === null || beta === null || gamma === null) return

        // Calibrate on first reading
        if (initialAlpha === null) {
            initialAlpha = alpha
            initialBeta = beta
            initialGamma = gamma
            return
        }

        // Store relative orientation
        orientation.value = {
            alpha: alpha - initialAlpha,
            beta: beta - (initialBeta ?? 0),
            gamma: gamma - (initialGamma ?? 0)
        }
    }

    // Enable gyroscope
    const enable = async (): Promise<boolean> => {
        if (!isAvailable.value) {
            console.warn('Gyroscope not available')
            return false
        }

        // Request permission if needed
        if (needsPermission.value && !isPermissionGranted.value) {
            const granted = await requestPermission()
            if (!granted) {
                return false
            }
        }

        // Reset calibration
        initialAlpha = null
        initialBeta = null
        initialGamma = null

        // Start listening
        window.addEventListener('deviceorientation', handleOrientation)
        isEnabled.value = true

        return true
    }

    // Disable gyroscope
    const disable = () => {
        window.removeEventListener('deviceorientation', handleOrientation)
        isEnabled.value = false

        // Reset orientation
        orientation.value = { alpha: 0, beta: 0, gamma: 0 }
    }

    // Toggle gyroscope
    const toggle = async (): Promise<boolean> => {
        if (isEnabled.value) {
            disable()
            return false
        } else {
            return await enable()
        }
    }

    // Recalibrate (reset initial values)
    const recalibrate = () => {
        initialAlpha = null
        initialBeta = null
        initialGamma = null
    }

    // Setup
    onMounted(() => {
        checkAvailability()
    })

    // Cleanup
    onUnmounted(() => {
        disable()
    })

    return {
        isAvailable,
        isEnabled,
        isPermissionGranted,
        needsPermission,
        orientation,
        enable,
        disable,
        toggle,
        recalibrate,
        requestPermission
    }
}
