export interface Attraction {
    id: string
    name: string
    slug: string
    type: string
    description?: string | null
    shortDescription?: string | null
    imageUrl?: string | null
    imageUrls?: string[] | null
    adultPrice: number | string // API might return string/decimal or number
    childPrice?: number | string | null
    currency: string
    priority: number
    isActive: boolean
    durationMinutes?: number | null
    capacity?: number | null
    minAge?: number | null
    maxAge?: number | null
    operatingHours?: any | null
    createdAt: string
    updatedAt: string
    isAvailable?: boolean // Added by availability check
    availabilityReason?: string | null // Added by availability check
}

export interface AttractionListResponse {
    attractions: Attraction[]
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
}
