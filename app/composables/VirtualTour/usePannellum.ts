import { ref, type Ref } from 'vue'
import type { Scene } from '~/types/virtual-tour'
import { useTourStore } from '~/stores/tour'
import { useCartStore } from '~/stores/cart'

declare global {
    interface Window {
        pannellum: any
    }
}

export const usePannellum = (containerRef: Ref<HTMLElement | null>) => {
    const tourStore = useTourStore()
    const cartStore = useCartStore()
    let viewer: any = null

    // ---------------------------------------------------------
    // Helper Functions (Defined first to avoid hoisting issues)
    // ---------------------------------------------------------

    // Preload image helper
    const preloadImage = (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = reject
            img.src = url
        })
    }

    // Update viewer state in store
    const updateViewerState = () => {
        if (!viewer) return

        tourStore.updateViewerState({
            yaw: viewer.getYaw(),
            pitch: viewer.getPitch(),
            hfov: viewer.getHfov()
        })
    }



    // Debug helper
    const debugLog = (message: string, ...args: any[]) => {
        if (tourStore.settings.isDebugMode) {
            console.log(message, ...args)
        }
    }

    // Custom Tooltip Function for robust rendering
    // Defined before prepareHotspots because it's passed as a callback
    const hotspotTooltipFunc = (hotSpotDiv: HTMLElement, args: any) => {
        debugLog('🎨 [TOOLTIP FUNC] Called for hotspot:', args.title)
        debugLog('🎨 [TOOLTIP FUNC] Type:', args.type)
        debugLog('🎨 [TOOLTIP FUNC] HotSpotDiv:', hotSpotDiv)

        hotSpotDiv.classList.add('custom-hotspot');
        hotSpotDiv.classList.add(`type-${args.type}`);

        debugLog('🎨 [TOOLTIP FUNC] Added classes:', hotSpotDiv.className)

        // Interaction Logic
        if (args.type === 'navigate') {
            debugLog('🎨 [TOOLTIP FUNC] Setting up NAVIGATE hotspot')
            // Direct click on the icon triggers navigation
            hotSpotDiv.onclick = (e) => {
                debugLog('🖱️ [NAVIGATE CLICK]', args.title)
                e.preventDefault();
                e.stopPropagation();
                if (args.targetSceneId) {
                    tourStore.loadScene(args.targetSceneId)
                }
            };

            // Simple label tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'hotspot-tooltip simple-tooltip';
            tooltip.innerText = args.title;
            hotSpotDiv.appendChild(tooltip);
            debugLog('🎨 [TOOLTIP FUNC] Added tooltip for navigate')

        } else if (args.type === 'info' || args.type === 'loket') {
            debugLog('🎨 [TOOLTIP FUNC] Setting up INFO/LOKET hotspot')
            // Info/Loket hotspots no longer open drawer panel
            // Loket has its own "Add to Cart" button
            // Info just shows tooltip on hover

            if (args.type === 'loket') {
                // Click to toggle persistent visibility
                hotSpotDiv.onmousedown = (e) => e.stopPropagation() // Prevent global close on mousedown
                hotSpotDiv.ontouchstart = (e) => e.stopPropagation() // Prevent global close on touchstart
                hotSpotDiv.onclick = (e) => {
                    const isVisible = hotSpotDiv.classList.contains('force-show')

                    // Close all open custom hotspots
                    const allOpen = document.querySelectorAll('.custom-hotspot.force-show')
                    allOpen.forEach(el => el.classList.remove('force-show'))

                    // Toggle: If it wasn't visible before, open it now
                    if (!isVisible) {
                        hotSpotDiv.classList.add('force-show')
                    }

                    e.stopPropagation()
                }

                debugLog('🎨 [TOOLTIP FUNC] Creating LOKET card')
                // Interactive Card for Loket
                const card = document.createElement('div');
                card.className = 'hotspot-card';

                // Title
                const infoDiv = document.createElement('div');
                infoDiv.className = 'hotspot-card-info';

                const title = document.createElement('h4');
                title.innerText = args.product?.name || args.title;
                infoDiv.appendChild(title);

                // Tickets List
                const ticketsDiv = document.createElement('div');
                ticketsDiv.className = 'space-y-2 mt-2';

                const ticketsToRender = args.tickets || [];
                
                // Fallback if no tickets array (shouldn't happen with new API, but safe)
                if (ticketsToRender.length === 0 && args.product) {
                     ticketsToRender.push({
                         id: args.product.id,
                         name: 'Standard Ticket',
                         price: args.product.price,
                         type: 'adult',
                         productId: args.product.id
                     })
                }

                ticketsToRender.forEach((ticket: any) => {
                    const ticketRow = document.createElement('div');
                    ticketRow.className = 'flex justify-between items-center bg-gray-50 p-2 rounded';
                    
                    const ticketInfo = document.createElement('div');
                    const ticketName = document.createElement('span');
                    ticketName.className = 'text-xs font-semibold block text-gray-700';
                    ticketName.innerText = ticket.type === 'adult' ? 'Dewasa' : 'Anak-anak';
                    
                    const ticketPrice = document.createElement('div');
                    ticketPrice.className = 'text-xs text-green-600 font-bold';
                    ticketPrice.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ticket.price);
                    
                    ticketInfo.appendChild(ticketName);
                    ticketInfo.appendChild(ticketPrice);

                    const addBtn = document.createElement('button');
                    addBtn.className = 'px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors';
                    addBtn.innerText = '+ Add';
                    
                    addBtn.onclick = (e) => {
                        e.stopPropagation();
                        // debugLog('🖱️ [ADD TO CART]', ticket.name); // Optional: keep hidden to avoid spam even in debug? Or show?
                        debugLog('🖱️ [ADD TO CART]', ticket.name);
                        
                        cartStore.addItem({
                            type: 'attraction',
                            itemId: ticket.productId || ticket.id,
                            name: ticket.name,
                            price: ticket.price,
                            quantity: 1,
                            ticketType: ticket.type,
                            image: args.product?.image,
                            metadata: { category: 'virtual-tour' }
                        });

                        addBtn.innerText = '✓';
                        addBtn.className = 'px-2 py-1 bg-gray-500 text-white text-xs rounded';
                        
                        setTimeout(() => {
                            addBtn.innerText = '+ Add';
                             addBtn.className = 'px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors';
                        }, 1000);
                    }

                    ticketRow.appendChild(ticketInfo);
                    ticketRow.appendChild(addBtn);
                    ticketsDiv.appendChild(ticketRow);
                });

                infoDiv.appendChild(ticketsDiv);
                card.appendChild(infoDiv);
                hotSpotDiv.appendChild(card);

                // Prevent card click from toggling visibility (keep open)
                card.onclick = (e) => {
                    e.stopPropagation()
                }

                // Adjust card position to prevent overflow
                requestAnimationFrame(() => {
                    const rect = hotSpotDiv.getBoundingClientRect();
                    const cardRect = card.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;

                    // Check boundaries
                    if (rect.left + cardRect.width / 2 > viewportWidth - 20) {
                        card.style.left = 'auto';
                        card.style.right = '0';
                        card.style.transform = 'translateX(0) translateY(-8px)';
                    } else if (rect.left - cardRect.width / 2 < 20) {
                        card.style.left = '0';
                        card.style.right = 'auto';
                        card.style.transform = 'translateX(0) translateY(-8px)';
                    }
                });

                debugLog('🎨 [TOOLTIP FUNC] Loket card created with tickets')

            } else {
                debugLog('🎨 [TOOLTIP FUNC] Creating INFO tooltip')
                // Info Tooltip - just shows on hover, no click action needed
                const tooltip = document.createElement('span');
                tooltip.className = 'hotspot-tooltip simple-tooltip';
                tooltip.innerText = args.title;
                hotSpotDiv.appendChild(tooltip);
                debugLog('🎨 [TOOLTIP FUNC] Info tooltip created and appended')
            }
        }

        debugLog('✅ [TOOLTIP FUNC] Completed for:', args.title)
        debugLog('✅ [TOOLTIP FUNC] Final DOM:', hotSpotDiv.outerHTML)
    }

    // Prepare hotspots for Pannellum
    // Uses hotspotTooltipFunc for all interactions (Pannellum Mastery Standard)
    const prepareHotspots = (hotspots: Scene['hotspots'] = []) => {
        debugLog('🎯 [HOTSPOT PREP] Starting preparation...')
        debugLog('🎯 [HOTSPOT PREP] Input hotspots count:', hotspots.length)
        debugLog('🎯 [HOTSPOT PREP] Raw hotspots:', JSON.stringify(hotspots, null, 2))

        if (hotspots.length === 0) {
            console.warn('⚠️ [HOTSPOT PREP] No hotspots to prepare!')
            return []
        }

        const mapped = hotspots.map((hotspot, index) => {
            // Validate coordinates to prevent massive clustering at 0,0 if missing
            const pitch = !isNaN(Number(hotspot.pitch)) ? Number(hotspot.pitch) : 0
            const yaw = !isNaN(Number(hotspot.yaw)) ? Number(hotspot.yaw) : 0

            debugLog(`📍 [HOTSPOT ${index + 1}/${hotspots.length}] "${hotspot.title}"`)
            debugLog(`   Type: ${hotspot.type}`)
            debugLog(`   Pitch: ${hotspot.pitch} → ${pitch} ${pitch === 0 ? '⚠️ ZERO!' : '✅'}`)
            debugLog(`   Yaw: ${hotspot.yaw} → ${yaw} ${yaw === 0 ? '⚠️ ZERO!' : '✅'}`)
            debugLog(`   CSS Class: pano-hotspot pano-hotspot--${hotspot.type}`)

            const config = {
                pitch,
                yaw,
                type: 'info', // Always 'info' type for Pannellum to allow custom HTML
                text: hotspot.title || 'Hotspot',
                cssClass: `pano-hotspot pano-hotspot--${hotspot.type}`,
                createTooltipFunc: hotspotTooltipFunc,
                createTooltipArgs: hotspot // Pass FULL hotspot object directly
            }

            debugLog(`   Config:`, config)
            return config
        })

        debugLog('✅ [HOTSPOT PREP] Mapped hotspots count:', mapped.length)
        debugLog('✅ [HOTSPOT PREP] Final config:', mapped)
        return mapped
    }

    // ---------------------------------------------------------
    // Main Functions
    // ---------------------------------------------------------

    // Initialize Pannellum viewer
    const initViewer = async (scene: Scene): Promise<boolean> => {
        debugLog('🚀 [INIT VIEWER] ==================== START ====================')
        debugLog('🚀 [INIT VIEWER] Scene ID:', scene.id)
        debugLog('🚀 [INIT VIEWER] Scene Name:', scene.name)
        debugLog('🚀 [INIT VIEWER] Scene Hotspots Count:', scene.hotspots?.length || 0)

        if (!containerRef.value) {
            console.error('❌ [INIT VIEWER] Panorama container not found!')
            console.error('❌ [INIT VIEWER] containerRef.value is null/undefined')
            return false
        }

        debugLog('✅ [INIT VIEWER] Container found:', containerRef.value)
        debugLog('✅ [INIT VIEWER] Container ID:', containerRef.value.id)
        debugLog('✅ [INIT VIEWER] Container dimensions:', {
            width: containerRef.value.offsetWidth,
            height: containerRef.value.offsetHeight
        })

        if (typeof window === 'undefined' || !(window as any).pannellum) {
            console.error('❌ [INIT VIEWER] Pannellum library not available!')
            console.error('❌ [INIT VIEWER] window.pannellum:', (window as any).pannellum)
            tourStore.error = 'Panorama viewer not available'
            return false
        }

        debugLog('✅ [INIT VIEWER] Pannellum library available')
        debugLog('✅ [INIT VIEWER] Pannellum version:', (window as any).pannellum.version || 'unknown')

        try {
            // Destroy existing viewer if any
            if (viewer) {
                debugLog('🔄 [INIT VIEWER] Destroying existing viewer...')
                viewer.destroy()
                viewer = null
                debugLog('✅ [INIT VIEWER] Existing viewer destroyed')
            }

            // Preload high quality image
            debugLog('📥 [INIT VIEWER] Preloading image:', scene.imageUrlHigh)
            await preloadImage(scene.imageUrlHigh)
            debugLog('✅ [INIT VIEWER] Image preloaded successfully')

            // Prepare hotspots
            const preparedHotspots = prepareHotspots(scene.hotspots || [])
            debugLog('🎯 [INIT VIEWER] Prepared hotspots count:', preparedHotspots.length)

            // Viewer config
            const viewerConfig = {
                type: 'equirectangular',
                panorama: scene.imageUrlHigh,
                autoLoad: true,
                hotSpotDebug: tourStore.settings.isDebugMode, // Use dynamic setting
                pitch: scene.defaultPitch,
                yaw: scene.defaultYaw,
                hfov: scene.hfov,
                showControls: false,
                compass: false,
                minHfov: 50,
                maxHfov: 120,
                autoRotate: false,
                friction: 0.15,
                dynamicUpdate: true,
                backgroundColor: [0, 0, 0],
                hotSpots: preparedHotspots
            }

            debugLog('⚙️ [INIT VIEWER] Viewer config:', viewerConfig)
            debugLog('⚙️ [INIT VIEWER] Creating Pannellum viewer...')

            // Initialize Pannellum
            viewer = (window as any).pannellum.viewer(containerRef.value, viewerConfig)

            debugLog('✅ [INIT VIEWER] Viewer created:', viewer)
            debugLog('✅ [INIT VIEWER] Viewer methods:', Object.keys(viewer))

            // Listen for load events
            viewer.on('load', () => {
                debugLog('📸 [PANNELLUM EVENT] Panorama loaded!')
                debugLog('📸 [PANNELLUM EVENT] Checking for hotspot DOM elements...')

                // Check if hotspots are in DOM
                const hotspotElements = containerRef.value?.querySelectorAll('.pnlm-hotspot')
                debugLog('📸 [PANNELLUM EVENT] Hotspot elements found:', hotspotElements?.length || 0)

                if (hotspotElements && hotspotElements.length > 0) {
                    hotspotElements.forEach((el, idx) => {
                        debugLog(`  Hotspot ${idx + 1}:`, {
                            classes: el.className,
                            visible: (el as HTMLElement).offsetParent !== null,
                            position: (el as HTMLElement).style.transform || 'no transform',
                            innerHTML: el.innerHTML.substring(0, 100)
                        })
                    })
                } else {
                    console.warn('⚠️ [PANNELLUM EVENT] No hotspot elements found in DOM!')
                }

                tourStore.isLoading = false
            })

            viewer.on('error', (err: any) => {
                console.error('❌ [PANNELLUM EVENT] Error:', err)
                tourStore.error = 'Failed to render panorama'
                tourStore.isLoading = false
            })

            // Sync viewer state
            viewer.on('mousedown', updateViewerState)
            viewer.on('mouseup', updateViewerState)
            viewer.on('animatefinished', updateViewerState)
            viewer.on('touchend', updateViewerState)

            // Close persistent hotspots on scene interaction
            const closeAllHotspots = () => {
                const allOpen = document.querySelectorAll('.custom-hotspot.force-show')
                allOpen.forEach(el => el.classList.remove('force-show'))
            }

            viewer.on('mousedown', closeAllHotspots)
            viewer.on('touchstart', closeAllHotspots)

            debugLog('✅ [INIT VIEWER] Event listeners attached')
            debugLog('🚀 [INIT VIEWER] ==================== SUCCESS ====================')
            return true
        } catch (error) {
            console.error('❌ [INIT VIEWER] ==================== FAILED ====================')
            console.error('❌ [INIT VIEWER] Error:', error)
            console.error('❌ [INIT VIEWER] Stack:', (error as Error).stack)
            tourStore.error = 'An error occurred while loading the tour'
            tourStore.isLoading = false
            return false
        }
    }

    // Destroy viewer
    const destroyViewer = () => {
        if (viewer) {
            viewer.destroy()
            viewer = null
        }
    }

    // Get viewer instance
    const getViewer = () => viewer

    return {
        initViewer,
        destroyViewer,
        getViewer,
        updateViewerState
    }
}
