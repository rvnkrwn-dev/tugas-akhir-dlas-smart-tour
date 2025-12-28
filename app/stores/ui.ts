import { defineStore } from 'pinia'

type DrawerType = 'productQuickView' | 'cart' | 'menu' | null

export const useUiStore = defineStore('ui', {
    state: () => ({
        activeDrawer: null as DrawerType,
        drawerData: null as any,
        isModalOpen: false
    }),

    actions: {
        openDrawer(type: DrawerType, data: any = null) {
            this.activeDrawer = type
            this.drawerData = data
        },

        closeDrawer() {
            this.activeDrawer = null
            this.drawerData = null
        },

        toggleDrawer(type: DrawerType) {
            if (this.activeDrawer === type) {
                this.closeDrawer()
            } else {
                this.openDrawer(type)
            }
        }
    }
})
