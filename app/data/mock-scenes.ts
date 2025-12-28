import type { Scene } from '../types/virtual-tour'

// Mock data for development - 3 scenes with 15 hotspots total

export const mockScenes: Scene[] = [
    {
        id: 'entrance',
        name: 'Main Entrance',
        description: 'Welcome to D\'LAS Purbalingga - Your adventure starts here!',
        imageUrlLow: '/images/360/testing-360.jpeg',
        imageUrlHigh: '/images/360/testing-360.jpeg',
        defaultYaw: 0,
        defaultPitch: 0,
        hfov: 100,
        sequence: 1,
        adjacentScenes: ['playground', 'ticket-booth'],
        hotspots: [
            {
                id: 'entrance-loket-1',
                type: 'loket',
                pitch: 0,
                yaw: 90,
                title: 'Ticket Booth - Main Entrance',
                description: 'Purchase your tickets here for all attractions',
                icon: '🎫',
                tickets: [
                    {
                        id: 'ticket-adult-general',
                        name: 'Adult General Admission',
                        description: 'Full access to all attractions',
                        price: 50000,
                        type: 'adult',
                        available: true,
                        maxQuantity: 10
                    },
                    {
                        id: 'ticket-child-general',
                        name: 'Child General Admission',
                        description: 'Full access for children (3-12 years)',
                        price: 35000,
                        type: 'child',
                        available: true,
                        maxQuantity: 10
                    },
                    {
                        id: 'ticket-senior',
                        name: 'Senior Citizen',
                        description: 'Discounted rate for seniors (60+)',
                        price: 40000,
                        type: 'senior',
                        available: true,
                        maxQuantity: 5
                    }
                ]
            },
            {
                id: 'entrance-info-1',
                type: 'info',
                pitch: -10,
                yaw: 180,
                title: 'Playground Area',
                description: 'Safe and fun playground for children of all ages. Features include slides, swings, climbing frames, and more!',
                icon: '🎪'
            },
            {
                id: 'entrance-nav-1',
                type: 'navigate',
                pitch: -5,
                yaw: 180,
                title: 'Go to Playground',
                description: 'Navigate to the playground area',
                targetSceneId: 'playground',
                icon: '➡️'
            },
            {
                id: 'entrance-info-2',
                type: 'info',
                pitch: 5,
                yaw: 270,
                title: 'Food Court',
                description: 'Variety of local and international cuisines available',
                icon: '🍔'
            },
            {
                id: 'entrance-info-3',
                type: 'info',
                pitch: 0,
                yaw: 45,
                title: 'Restrooms',
                description: 'Clean facilities available',
                icon: '🚻'
            }
        ]
    },
    {
        id: 'playground',
        name: 'Playground Area',
        description: 'Fun and safe play area for children',
        imageUrlLow: '/images/360/testing-360.jpeg',
        imageUrlHigh: '/images/360/testing-360.jpeg',
        defaultYaw: 0,
        defaultPitch: 0,
        hfov: 100,
        sequence: 2,
        adjacentScenes: ['entrance', 'ticket-booth'],
        hotspots: [
            {
                id: 'playground-info-1',
                type: 'info',
                pitch: 0,
                yaw: 0,
                title: 'Playground Rules',
                description: 'Please supervise children at all times. Age limit: 3-12 years. No food or drinks in play area.',
                icon: 'ℹ️'
            },
            {
                id: 'playground-loket-1',
                type: 'loket',
                pitch: 5,
                yaw: 90,
                title: 'Playground Tickets',
                description: 'Special playground access tickets',
                icon: '🎫',
                tickets: [
                    {
                        id: 'ticket-playground-1hour',
                        name: '1 Hour Playground Pass',
                        description: 'Unlimited play for 1 hour',
                        price: 25000,
                        type: 'child',
                        available: true,
                        maxQuantity: 5
                    },
                    {
                        id: 'ticket-playground-allday',
                        name: 'All Day Playground Pass',
                        description: 'Unlimited play all day',
                        price: 50000,
                        type: 'child',
                        available: true,
                        maxQuantity: 5
                    }
                ]
            },
            {
                id: 'playground-nav-1',
                type: 'navigate',
                pitch: 0,
                yaw: 270,
                title: 'Back to Entrance',
                description: 'Return to main entrance',
                targetSceneId: 'entrance',
                icon: '⬅️'
            },
            {
                id: 'playground-nav-2',
                type: 'navigate',
                pitch: 0,
                yaw: 180,
                title: 'Go to Ticket Booth',
                description: 'Visit the main ticket booth',
                targetSceneId: 'ticket-booth',
                icon: '➡️'
            },
            {
                id: 'playground-info-2',
                type: 'info',
                pitch: -5,
                yaw: 135,
                title: 'Safety Guidelines',
                description: 'Wear appropriate footwear. Remove sharp objects. Follow staff instructions.',
                icon: '⚠️'
            }
        ]
    },
    {
        id: 'ticket-booth',
        name: 'Main Ticket Booth',
        description: 'Central ticketing and information center',
        imageUrlLow: '/images/360/testing-360.jpeg',
        imageUrlHigh: '/images/360/testing-360.jpeg',
        defaultYaw: 0,
        defaultPitch: 0,
        hfov: 100,
        sequence: 3,
        adjacentScenes: ['entrance', 'playground'],
        hotspots: [
            {
                id: 'booth-loket-1',
                type: 'loket',
                pitch: 0,
                yaw: 0,
                title: 'Main Ticket Counter',
                description: 'All tickets and packages available here',
                icon: '🎫',
                tickets: [
                    {
                        id: 'ticket-family-package',
                        name: 'Family Package (2 Adults + 2 Children)',
                        description: 'Best value for families',
                        price: 150000,
                        type: 'group',
                        available: true,
                        maxQuantity: 3
                    },
                    {
                        id: 'ticket-vip',
                        name: 'VIP All Access',
                        description: 'Skip lines + exclusive areas',
                        price: 100000,
                        type: 'adult',
                        available: true,
                        maxQuantity: 5
                    },
                    {
                        id: 'ticket-weekend-special',
                        name: 'Weekend Special',
                        description: 'Discounted weekend rate',
                        price: 45000,
                        type: 'adult',
                        available: true,
                        maxQuantity: 10
                    }
                ]
            },
            {
                id: 'booth-info-1',
                type: 'info',
                pitch: 10,
                yaw: 90,
                title: 'Operating Hours',
                description: 'Open daily 9 AM - 6 PM. Extended hours on weekends and holidays.',
                icon: '🕐'
            },
            {
                id: 'booth-nav-1',
                type: 'navigate',
                pitch: 0,
                yaw: 180,
                title: 'Back to Entrance',
                description: 'Return to main entrance',
                targetSceneId: 'entrance',
                icon: '⬅️'
            },
            {
                id: 'booth-info-2',
                type: 'info',
                pitch: -5,
                yaw: 270,
                title: 'Payment Methods',
                description: 'We accept cash, credit cards, and digital payments (GoPay, OVO, Dana)',
                icon: '💳'
            },
            {
                id: 'booth-info-3',
                type: 'info',
                pitch: 5,
                yaw: 315,
                title: 'Group Bookings',
                description: 'Special rates for groups of 20+. Contact us for details.',
                icon: '👥'
            }
        ]
    }
]