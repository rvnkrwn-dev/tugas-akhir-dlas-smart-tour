/**
 * OpenAPI Documentation for DLAS Smart Tour API
 * 
 * This file contains OpenAPI metadata and schemas for all API endpoints.
 * It's used by Nitro's experimental OpenAPI feature to generate documentation.
 */

export const openAPIInfo = {
    title: 'DLAS Smart Tour API',
    version: '1.0.0',
    description: 'Complete API documentation for DLAS Smart Tour - Tourism Ticket Management System',
    termsOfService: 'https://dlassmarttour.com/terms',
    contact: {
        name: 'API Support',
        email: 'support@dlassmarttour.com',
    },
    license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
    },
}

export const openAPIServers = [
    {
        url: 'http://localhost:3000',
        description: 'Development server',
    },
    {
        url: 'https://api.dlassmarttour.com',
        description: 'Production server',
    },
]

export const openAPITags = [
    {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
    },
    {
        name: 'Attractions',
        description: 'Public attraction browsing endpoints',
    },
    {
        name: 'Cart',
        description: 'Shopping cart management (Customer only)',
    },
    {
        name: 'Purchase',
        description: 'Purchase and transaction endpoints (Customer only)',
    },
    {
        name: 'Admin - Dashboard',
        description: 'Admin dashboard analytics and statistics',
    },
    {
        name: 'Admin - Users',
        description: 'User management (Admin only)',
    },
    {
        name: 'Admin - Transactions',
        description: 'Transaction management (Admin only)',
    },
    {
        name: 'Admin - Payments',
        description: 'Payment management (Admin only)',
    },
    {
        name: 'Admin - Tickets',
        description: 'Ticket management (Admin only)',
    },
    {
        name: 'Admin - Attractions',
        description: 'Attraction management (Admin only)',
    },
    {
        name: 'Admin - Activity Logs',
        description: 'Activity log monitoring (Admin only)',
    },
    {
        name: 'Scanner',
        description: 'Ticket scanning and validation (Scanner only)',
    },
]

// Common response schemas
export const commonSchemas = {
    SuccessResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
        },
    },
    ErrorResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
        },
    },
    PaginatedResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },
        },
    },
}

// Security schemes
export const securitySchemes = {
    bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from login endpoint',
    },
    cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token stored in HTTP-only cookie',
    },
}
