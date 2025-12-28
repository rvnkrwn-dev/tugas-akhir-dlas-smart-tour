import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    title: string
    message: string
    type: ToastType
    duration: number // in ms, 0 for infinite
    timer: any // Internal timer reference
    startTime?: number
    remaining?: number
    progress: number // 0 to 100
    progressInterval?: any
}

const toasts = ref<Toast[]>([])
const MAX_TOASTS = 5
const DEFAULT_DURATION = 5000

export const useToast = () => {
    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            const toast = toasts.value[index]
            if (toast && toast.timer) clearTimeout(toast.timer)
            if (toast && toast.progressInterval) clearInterval(toast.progressInterval)
            toasts.value.splice(index, 1)
        }
    }

    const show = (title: string, message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) => {
        const id = Math.random().toString(36).substring(2, 9)
        const toast: Toast = {
            id,
            title,
            message,
            type,
            duration,
            timer: null,
            progress: 100,
            startTime: Date.now(),
            remaining: duration
        }

        if (duration > 0) {
            setupTimer(toast)
        }

        toasts.value.push(toast)

        // Limit number of toasts
        if (toasts.value.length > MAX_TOASTS) {
            const oldest = toasts.value[0]
            if (oldest) removeToast(oldest.id)
        }
    }

    const setupTimer = (toast: Toast) => {
        if (toast.remaining !== undefined && toast.remaining > 0) {
            toast.timer = setTimeout(() => {
                removeToast(toast.id)
            }, toast.remaining)

            // Progress bar logic
            const interval = 50 // Update every 50ms
            const decrement = (100 * interval) / toast.duration

            toast.progressInterval = setInterval(() => {
                if (toast.progress > 0) {
                    toast.progress = Math.max(0, toast.progress - decrement)
                }
            }, interval)
        }
    }

    const pauseTimer = (id: string) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.timer && toast.startTime) {
            clearTimeout(toast.timer)
            clearInterval(toast.progressInterval)
            const elapsed = Date.now() - toast.startTime
            toast.remaining = Math.max(0, (toast.remaining || 0) - elapsed)
        }
    }

    const resumeTimer = (id: string) => {
        const toast = toasts.value.find(t => t.id === id)
        if (toast && toast.remaining && toast.remaining > 0) {
            toast.startTime = Date.now()
            setupTimer(toast)
        }
    }

    return {
        toasts,
        show,
        success: (title: string, message: string, duration?: number) => show(title, message, 'success', duration),
        error: (title: string, message: string, duration?: number) => show(title, message, 'error', duration),
        warning: (title: string, message: string, duration?: number) => show(title, message, 'warning', duration),
        info: (title: string, message: string, duration?: number) => show(title, message, 'info', duration),
        removeToast,
        pauseTimer,
        resumeTimer
    }
}
