import { ref } from 'vue'
import type { AlertOptions } from '~/components/UI/UiAlert.vue'

const alertInstance = ref<any>(null)

export const useAlert = () => {
    const setAlertInstance = (instance: any) => {
        alertInstance.value = instance
    }

    const alert = {
        success: (title: string, message: string, confirmText = 'OK') => {
            return new Promise<void>((resolve) => {
                alertInstance.value?.show({
                    type: 'success',
                    title,
                    message,
                    confirmText,
                    showCancel: false,
                    onConfirm: () => resolve()
                })
            })
        },

        error: (title: string, message: string, confirmText = 'OK') => {
            return new Promise<void>((resolve) => {
                alertInstance.value?.show({
                    type: 'error',
                    title,
                    message,
                    confirmText,
                    showCancel: false,
                    onConfirm: () => resolve()
                })
            })
        },

        warning: (title: string, message: string, confirmText = 'OK') => {
            return new Promise<void>((resolve) => {
                alertInstance.value?.show({
                    type: 'warning',
                    title,
                    message,
                    confirmText,
                    showCancel: false,
                    onConfirm: () => resolve()
                })
            })
        },

        info: (title: string, message: string, confirmText = 'OK') => {
            return new Promise<void>((resolve) => {
                alertInstance.value?.show({
                    type: 'info',
                    title,
                    message,
                    confirmText,
                    showCancel: false,
                    onConfirm: () => resolve()
                })
            })
        },

        confirm: (title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel') => {
            return new Promise<boolean>((resolve) => {
                alertInstance.value?.show({
                    type: 'confirm',
                    title,
                    message,
                    confirmText,
                    cancelText,
                    showCancel: true,
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false)
                })
            })
        },

        custom: (options: AlertOptions) => {
            return new Promise<boolean>((resolve) => {
                alertInstance.value?.show({
                    ...options,
                    onConfirm: async () => {
                        if (options.onConfirm) await options.onConfirm()
                        resolve(true)
                    },
                    onCancel: () => {
                        if (options.onCancel) options.onCancel()
                        resolve(false)
                    }
                })
            })
        }
    }

    return {
        alert,
        setAlertInstance
    }
}
