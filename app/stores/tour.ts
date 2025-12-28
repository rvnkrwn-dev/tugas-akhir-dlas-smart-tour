import { defineStore } from 'pinia'
import type { Scene, Hotspot, ViewerState, TourSettings } from '~/types/virtual-tour'
import type { ApiResponse } from '~/types/api'

export const useTourStore = defineStore('tour', {
    state: () => ({
        // Core state
        currentScene: null as Scene | null,
        scenes: [] as Scene[],
        isActive: false,
        isLoading: false,

        // Viewer state
        viewerState: {
            yaw: 0,
            pitch: 0,
            hfov: 100
        } as ViewerState,

        // Settings
        settings: {
            isFullscreen: false,
            isGyroEnabled: false,
            isVRMode: false,
            quality: 'low',
            isDebugMode: false
        } as TourSettings,

        // UI state
        showFullscreenOverlay: false,
        selectedHotspot: null as Hotspot | null,
        showHotspotPanel: false,
        showLocationsPanel: false,


        // Error handling
        error: null as string | null
    }),

    getters: {
        // Visible hotspots based on FOV and visibility rules
        visibleHotspots: (state): Hotspot[] => {
            if (!state.currentScene) return []

            const { yaw, pitch, hfov } = state.viewerState
            const buffer = 30 // degrees buffer for smoother experience

            return state.currentScene.hotspots.filter(hotspot => {
                // Check if within FOV
                const isInFOV = isWithinFOV(
                    hotspot.yaw,
                    hotspot.pitch,
                    yaw,
                    pitch,
                    hfov,
                    buffer
                )

                // Check zoom level rules
                const meetsZoomRules = (
                    (!hotspot.minHfov || hfov >= hotspot.minHfov) &&
                    (!hotspot.maxHfov || hfov <= hotspot.maxHfov)
                )

                return isInFOV && meetsZoomRules
            })
        },

        currentSceneId: (state): string | null => {
            return state.currentScene?.id || null
        },

        adjacentScenes: (state): Scene[] => {
            if (!state.currentScene?.adjacentScenes) return []

            return state.scenes.filter(scene =>
                state.currentScene?.adjacentScenes?.includes(scene.id)
            )
        },

        isFullscreenRequired: (state): boolean => {
            return state.isActive && !state.settings.isFullscreen
        }
    },

    actions: {
        // Initialize tour
        async initTour() {
            try {
                this.isLoading = true
                this.error = null

                const { apiFetch } = useFetchApi()

                // Fetch global settings first
                try {
                    const settingsRes = await apiFetch<{ tourDebugMode: boolean }>('/api/settings')
                    if (settingsRes.success) {
                        this.settings.isDebugMode = settingsRes.data.tourDebugMode
                    }
                } catch (e) {
                    console.warn('Failed to fetch global settings', e)
                }

                // Load all scenes metadata
                const response = await apiFetch<ApiResponse<Scene[]>>('/api/virtual-tour/scenes')
                this.scenes = response.data

                this.isLoading = false
            } catch (error) {
                this.error = 'Failed to load virtual tour data'
                this.isLoading = false
                console.error('Tour init error:', error)
            }
        },

        // Start tour with specific scene
        async startTour(sceneId?: string) {
            const targetSceneId = sceneId || this.scenes[0]?.id

            if (!targetSceneId) {
                this.error = 'No scenes available'
                return
            }

            this.isActive = true
            await this.loadScene(targetSceneId)
        },

        // Load a specific scene
        async loadScene(sceneId: string) {
            try {
                this.isLoading = true
                this.error = null

                // Check if scene exists in local state with hotspots
                // Since initTour fetches all scenes with hotspots now, we can use local data
                const localScene = this.scenes.find(s => s.id === sceneId)

                if (localScene) {
                    this.currentScene = localScene
                } else {
                    // Fallback to fetch if not found locally (e.g. direct link entry)
                    const { apiFetch } = useFetchApi()
                    const response = await apiFetch<ApiResponse<Scene>>(`/api/virtual-tour/scenes/${sceneId}`)
                    this.currentScene = response.data
                }

                if (!this.currentScene) {
                    throw new Error(`Scene not found: ${sceneId}`)
                }

                const scene = this.currentScene

                // Reset viewer state to scene defaults
                this.viewerState = {
                    yaw: scene.defaultYaw,
                    pitch: scene.defaultPitch,
                    hfov: scene.hfov
                }

                // Preload adjacent scenes
                this.preloadAdjacentScenes()

                this.isLoading = false
                return true
            } catch (error) {
                this.error = `Failed to load scene: ${sceneId}`
                this.isLoading = false
                console.error('Scene load error:', error)
                return false
            }
        },

        // Preload adjacent scenes for smooth navigation
        async preloadAdjacentScenes() {
            if (!this.currentScene?.adjacentScenes) return

            // Preload images for adjacent scenes
            this.currentScene.adjacentScenes.forEach(async (sceneId) => {
                const scene = this.scenes.find(s => s.id === sceneId)
                if (scene) {
                    // Preload low quality image
                    const img = new Image()
                    img.src = scene.imageUrlLow
                }
            })
        },

        // Update viewer state (called by Pannellum)
        updateViewerState(state: Partial<ViewerState>) {
            this.viewerState = { ...this.viewerState, ...state }
        },

        // Toggle settings
        toggleFullscreen(value: boolean) {
            this.settings.isFullscreen = value
            this.showFullscreenOverlay = this.isActive && !value
        },

        toggleGyro(value?: boolean) {
            this.settings.isGyroEnabled = value ?? !this.settings.isGyroEnabled
        },

        toggleVRMode(value?: boolean) {
            this.settings.isVRMode = value ?? !this.settings.isVRMode

            // Auto-enable gyro in VR mode
            if (this.settings.isVRMode && !this.settings.isGyroEnabled) {
                this.toggleGyro(true)
            }
        },

        // Hotspot interactions
        selectHotspot(hotspot: Hotspot | null) {
            this.selectedHotspot = hotspot
            this.showHotspotPanel = !!hotspot
        },

        // Panel toggles
        toggleLocationsPanel() {
            this.showLocationsPanel = !this.showLocationsPanel
        },

        // Exit tour
        exitTour() {
            this.isActive = false
            this.currentScene = null
            this.selectedHotspot = null
            this.showHotspotPanel = false
            this.showLocationsPanel = false
            this.settings.isGyroEnabled = false
            this.settings.isVRMode = false
        },

        // Clear error
        clearError() {
            this.error = null
        }
    }
})

// Helper function to check if hotspot is within FOV
function isWithinFOV(
    hotspotYaw: number,
    hotspotPitch: number,
    viewYaw: number,
    viewPitch: number,
    hfov: number,
    buffer: number
): boolean {
    // Calculate angular distance
    const yawDiff = Math.abs(normalizeAngle(hotspotYaw - viewYaw))
    const pitchDiff = Math.abs(hotspotPitch - viewPitch)

    // Check if within FOV + buffer
    const halfHfov = (hfov + buffer) / 2
    const halfVfov = (hfov * 0.75 + buffer) / 2 // Approximate VFOV

    return yawDiff <= halfHfov && pitchDiff <= halfVfov
}

// Normalize angle to -180 to 180
function normalizeAngle(angle: number): number {
    while (angle > 180) angle -= 360
    while (angle < -180) angle += 360
    return angle
}
