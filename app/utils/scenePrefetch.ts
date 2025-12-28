import type { Scene } from '~/types/virtual-tour'

const prefetchCache = new Set<string>()

export function prefetchScenes(sceneIds: string[], allScenes: Record<string, Scene>) {
    // Limit to 2 neighbors to save bandwidth as requested
    const targets = sceneIds.slice(0, 2)

    targets.forEach(id => {
        if (prefetchCache.has(id)) return

        const scene = allScenes[id]
        if (!scene) return

        // Prefer prefetching the low-res first for speed, or high-res if cached
        // Strategy: Prefetch the image that will be shown immediately.
        const url = scene.imageUrlLow || scene.imageUrlHigh

        if (url) {
            const img = new Image()
            img.src = url
            img.onload = () => {
                prefetchCache.add(id)
            }
            // Optional: also prefetch high res if bandwidth allows, but sticking to basics first
        }
    })
}
