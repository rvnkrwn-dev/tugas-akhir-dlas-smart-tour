// Virtual Tour Type Definitions

export interface Scene {
    id: string
    name: string
    description?: string
    location?: string
    imageUrlLow: string      // For initial load
    imageUrlHigh: string     // For high quality
    defaultYaw: number
    defaultPitch: number
    hfov: number
    sequence: number         // For ordering and numbering
    hotspots: Hotspot[]
    adjacentScenes?: string[] // For preloading
}

export interface Hotspot {
    id: string
    type: 'info' | 'loket' | 'navigate'
    pitch: number
    yaw: number
    title: string
    description?: string
    icon?: string

    // For info type
    media?: HotspotMedia[]

    // For loket type
    productId?: string
    product?: {
        id: string
        name: string
        price: number
        image: string | null
        slug: string
    }
    tickets?: Ticket[]

    // For navigate type
    targetSceneId?: string

    // Visibility rules for virtualization
    minHfov?: number  // Only show when zoomed in
    maxHfov?: number  // Only show when zoomed out
}

export interface HotspotMedia {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
}

export interface Ticket {
    id: string
    productId?: string
    name: string
    description: string
    price: number
    type: 'adult' | 'child' | 'senior' | 'group'
    available: boolean
    maxQuantity?: number
    image?: string
}

export interface CartItem {
    ticketId: string
    ticket: Ticket
    quantity: number
    sceneId: string
    hotspotId: string
}

export interface ViewerState {
    yaw: number
    pitch: number
    hfov: number
}

export interface TourSettings {
    isFullscreen: boolean
    isGyroEnabled: boolean
    isVRMode: boolean
    quality: 'low' | 'high'
    isDebugMode?: boolean
}
