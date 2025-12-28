import { defineStore } from 'pinia'
import type { ApiResponse } from '~/types/api'

export interface CartItem {
    id: string
    type: 'entrance' | 'attraction'
    itemId: string
    ticketType?: 'adult' | 'child'
    name: string
    price: number
    quantity: number
    image?: string
    metadata?: {
        duration?: string
        ageRequirement?: string
        category?: string
    }
}

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [] as CartItem[],
        isOpen: false
    }),

    getters: {
        itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),

        totalPrice: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),

        // Alias for totalPrice (for compatibility)
        total: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),

        hasItems: (state) => state.items.length > 0,

        groupedItems: (state) => {
            const entrance = state.items.filter(item => item.type === 'entrance')
            const attractions = state.items.filter(item => item.type === 'attraction')
            return { entrance, attractions }
        },

        getItemById: (state) => (id: string) => {
            return state.items.find(item => item.id === id)
        }
    },

    actions: {
        async addItem(item: Omit<CartItem, 'id'>) {
            const { isAuthenticated } = useAuth()

            // Optimistic update
            const existingItem = this.items.find(
                i => i.itemId === item.itemId && (i.metadata?.category || 'attraction') === (item.metadata?.category || 'attraction')
            )

            if (existingItem) {
                existingItem.quantity += item.quantity
            } else {
                this.items.push({
                    ...item,
                    id: `${item.type}-${item.itemId}-${Date.now()}`
                })
            }

            // Sync with server if authenticated
            if (isAuthenticated.value) {
                const { apiFetch } = useFetchApi()
                try {
                    // Default values if missing
                    const visitDate = new Date()
                    visitDate.setDate(visitDate.getDate() + 1)

                    const payload = {
                        attractionId: item.itemId,
                        ticketType: item.ticketType || 'adult',
                        quantity: item.quantity,
                        visitDate: visitDate.toISOString()
                    }

                    await apiFetch<ApiResponse<any>>('/api/cart/items', {
                        method: 'POST',
                        body: payload
                    })

                    // Refresh cart to get server IDs and consistent state
                    await this.fetchCart()
                } catch (error) {
                    console.error('Failed to sync add item:', error)
                    // Optionally revert optimistic update here
                }
            }
        },

        async removeItem(itemId: string) {
            const { isAuthenticated } = useAuth()
            const item = this.getItemById(itemId)

            // Optimistic update
            const index = this.items.findIndex(i => i.id === itemId)
            if (index > -1) {
                this.items.splice(index, 1)
            }

            // Sync with server if authenticated
            if (isAuthenticated.value && item) {
                const { apiFetch } = useFetchApi()
                try {
                    // Start by assuming item.id is valid server ID if user is auth
                    // NOTE: This assumes item.id IS the cart_item id from server. 
                    // If it's a local temp ID, this will fail. 
                    // But fetchCart should have replaced local IDs with server IDs.
                    await apiFetch<ApiResponse<any>>(`/api/cart/items/${itemId}`, {
                        method: 'DELETE'
                    })
                } catch (error) {
                    console.error('Failed to sync remove item:', error)
                }
            }
        },

        async updateQuantity(itemId: string, quantity: number) {
            const { isAuthenticated } = useAuth()
            const item = this.getItemById(itemId)

            if (item) {
                if (quantity <= 0) {
                    await this.removeItem(itemId)
                    return
                }

                // Optimistic update
                item.quantity = quantity

                // Sync with server if authenticated
                if (isAuthenticated.value) {
                    const { apiFetch } = useFetchApi()
                    try {
                        await apiFetch<ApiResponse<any>>(`/api/cart/items/${itemId}`, {
                            method: 'PATCH',
                            body: { quantity }
                        })
                    } catch (error) {
                        console.error('Failed to sync update quantity:', error)
                    }
                }
            }
        },

        async clearCart() {
            const { isAuthenticated } = useAuth()

            // Optimistically clear local state
            this.items = []

            if (isAuthenticated.value) {
                const { apiFetch } = useFetchApi()
                try {
                    await apiFetch<ApiResponse<any>>('/api/cart/clear', {
                        method: 'DELETE'
                    })
                } catch (error) {
                    console.error('Failed to sync clear cart:', error)
                    // Revert or re-fetch state if failed
                    await this.fetchCart()
                }
            }
        },

        toggleCart() {
            this.isOpen = !this.isOpen
        },

        openCart() {
            this.isOpen = true
        },

        closeCart() {
            this.isOpen = false
        },

        async fetchCart() {
            const { isAuthenticated } = useAuth()
            if (!isAuthenticated.value) return

            const { apiFetch } = useFetchApi()
            try {
                const response = await apiFetch<ApiResponse<{ cart: any, summary: any, expiration: any }>>('/api/cart')

                if (response.success && response.data?.cart) {
                    // Map server items to local CartItem structure
                    this.items = response.data.cart.cart_items.map((serverItem: any) => {
                        // Normalize type
                        const rawType = (serverItem.attractions.type || '').toLowerCase();
                        let type: 'entrance' | 'attraction' = 'attraction';

                        if (rawType.includes('entrance') || rawType.includes('tiket') || rawType.includes('masuk')) {
                            type = 'entrance';
                        }

                        return {
                            id: serverItem.id, // Server CartItem ID
                            type: type,
                            itemId: serverItem.attractionId,
                            name: serverItem.attractions.name,
                            price: Number(serverItem.unitPrice),
                            quantity: serverItem.quantity,
                            image: serverItem.attractions.imageUrl,
                            metadata: {
                                duration: serverItem.attractions.durationMinutes ? `${serverItem.attractions.durationMinutes} Menit` : undefined,
                            }
                        }
                    })
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error)
            }
        },

        async syncCart() {
            // This is primarily for merging local guest cart to server on login
            if (this.items.length === 0) {
                // If local cart is empty, just fetch server cart
                await this.fetchCart()
                return
            }

            const { apiFetch } = useFetchApi()

            try {
                // Sync each item to the server
                // Ideally this should be a bulk endpoint, but for now we iterate
                const promises = this.items.map(async (item) => {
                    // Skip if item already has a server-like ID (UUID) and we are just syncing?
                    // Actually, for merge, we assume local items need to be pushed.
                    // But if we already fetched, we risk duplicating?
                    // Strategy: If user just logged in, we push everything.
                    // Ideally check if item exists on server, but API handles upsert logic partially 
                    // or we rely on the fact that we clear local and re-fetch.

                    // Simple approach: Push all local items, then fetch fresh state.

                    const visitDate = new Date()
                    visitDate.setDate(visitDate.getDate() + 1) // Tomorrow

                    const payload = {
                        attractionId: item.itemId,
                        ticketType: 'adult', // Default to adult for now
                        quantity: item.quantity,
                        visitDate: visitDate.toISOString()
                    }

                    try {
                        await apiFetch<ApiResponse<any>>('/api/cart/items', {
                            method: 'POST',
                            body: payload
                        })
                    } catch (e: any) {
                        console.error(`Failed to sync item ${item.name}:`, e)
                        // Don't throw here so other items can still sync
                    }
                })

                await Promise.all(promises)

                // After pushing everything, fetch the authoritative state from server
                await this.fetchCart()

            } catch (error) {
                console.error('Cart sync error:', error)
                throw error
            }
        }
    },

    persist: true
})
