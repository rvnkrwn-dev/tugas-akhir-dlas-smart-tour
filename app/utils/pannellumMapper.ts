import type { Scene, Hotspot } from '~/types/virtual-tour'

interface PannellumHotSpot {
    pitch: number
    yaw: number
    type: string
    text?: string
    sceneId?: string
    clickHandlerFunc?: (evt: Event, args: any) => void
    createTooltipFunc?: (hotSpotDiv: HTMLElement, args: any) => void
    createTooltipArgs?: any
    clickHandlerArgs?: any
    cssClass?: string
}

interface MapperOptions {
    onProductClick: (hotspot: Hotspot) => void
}

export function mapTourToPannellum(
    scenes: Record<string, Scene>,
    defaultConfig: any,
    options: MapperOptions
) {
    const mappedScenes: Record<string, any> = {}

    Object.values(scenes).forEach(scene => {
        mappedScenes[scene.id] = {
            // title: scene.name, // Disable default title box
            hfov: scene.hfov,
            pitch: scene.defaultPitch,
            yaw: scene.defaultYaw,
            type: 'equirectangular',
            panorama: scene.imageUrlLow, // Start with low res, Pannellum handles this or we can swap
            // We can treat imageUrlHigh as the main if we don't want strict multi-res for now
            // To stick to prompt "panorama: URL", we use one. 
            // Ideally we pass 'panorama' as the high res and let the viewer load it, 
            // but for "lazy load scene" pannellum does that by default if we pass config.

            hotSpots: scene.hotspots.map(hotspot => mapHotspot(hotspot, options))
        }
    })

    return {
        default: {
            firstScene: defaultConfig.firstScene,
            sceneFadeDuration: defaultConfig.sceneFadeDuration,
            autoLoad: defaultConfig.autoLoad,
            hotSpotDebug: defaultConfig.hotSpotDebug
        },
        scenes: mappedScenes
    }
}

function mapHotspot(hotspot: Hotspot, options: MapperOptions): PannellumHotSpot {
    const base: PannellumHotSpot = {
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: 'info', // default
        text: hotspot.title
    }

    if (hotspot.type === 'navigate' && hotspot.targetSceneId) {
        base.type = 'scene'
        base.sceneId = hotspot.targetSceneId
        // Pannellum handles click automatically for type='scene'
    } else if (hotspot.type === 'loket') {
        // Custom product/ticket hotspot
        base.type = 'info' // Use info or custom to allow clickHandler
        base.cssClass = 'custom-hotspot-product' // For styling

        // We inject the handler
        base.clickHandlerFunc = (evt: Event, args: any) => {
            // Stop propagation to prevent dragging via Pannellum (sometimes needed)
            evt.stopPropagation()
            options.onProductClick(hotspot)
        }
        // Pannellum passes 'args' to the function if defined in createTooltipArgs, 
        // but here we used closure so we have access to 'hotspot' directly.
        // However, Pannellum requires clickHandlerFunc to be set effectively.
    }

    return base
}
