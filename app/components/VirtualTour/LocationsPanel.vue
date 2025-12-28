<template>
    <!-- Locations Panel - Scene Navigation -->
    <Transition enter-active-class="transition ease-out duration-300"
        enter-from-class="translate-y-full sm:translate-y-0 sm:translate-x-full"
        enter-to-class="translate-y-0 sm:translate-x-0" leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-y-0 sm:translate-x-0"
        leave-to-class="translate-y-full sm:translate-y-0 sm:translate-x-full">
        <div v-if="tourStore.showLocationsPanel"
            class="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 z-30 bg-black/50 backdrop-blur-sm"
            @click.self="handleClose">
            <div class="bg-white h-full sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-none sm:shadow-2xl">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-black text-gray-900">Locations</h3>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Current Location -->
                    <div class="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs text-blue-600 font-semibold">Current Location</p>
                                <p class="font-bold text-gray-900">{{ tourStore.currentScene?.name }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Available Scenes -->
                    <div class="space-y-3">
                        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Available Locations</p>
                        <div v-for="scene in tourStore.scenes" :key="scene.id"
                            class="border-2 rounded-xl p-4 transition-all cursor-pointer" :class="[
                                scene.id === tourStore.currentSceneId
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            ]" @click="handleNavigate(scene.id)">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-12 h-12 border-2 border-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span class="text-xl font-black text-blue-600">{{ scene.sequence + 1 }}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-gray-900 truncate">{{ scene.name }}</h4>
                                    <p class="text-sm text-gray-600 truncate">{{ scene.description }}</p>
                                </div>
                                <svg v-if="scene.id === tourStore.currentSceneId"
                                    class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useTourStore } from '~/stores/tour'

const tourStore = useTourStore()

const handleNavigate = async (sceneId: string) => {
    if (sceneId === tourStore.currentSceneId) return

    handleClose()
    await tourStore.loadScene(sceneId)
}

const handleClose = () => {
    tourStore.toggleLocationsPanel()
}
</script>
