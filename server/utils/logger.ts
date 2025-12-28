import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

winston.addColors(colors)

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
)

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        return `${timestamp} [${level}]: ${message} ${metaStr}`
    })
)

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs')

// Define transports
const transports: winston.transport[] = [
    // Error logs
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // Combined logs
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // HTTP logs
    new winston.transports.File({
        filename: path.join(logsDir, 'http.log'),
        level: 'http',
        maxsize: 5242880, // 5MB
        maxFiles: 3,
    }),
]

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
        })
    )
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format,
    transports,
    exitOnError: false,
})

/**
 * Log HTTP request
 */
export const logRequest = (data: {
    method: string
    url: string
    statusCode: number
    responseTime: number
    ip?: string
    userAgent?: string
    userId?: string
}) => {
    logger.http('HTTP Request', data)
}

/**
 * Log authentication event
 */
export const logAuth = (data: {
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'email_verify'
    userId?: string
    email?: string
    success: boolean
    ip?: string
    userAgent?: string
    error?: string
}) => {
    logger.info('Auth Event', data)
}

/**
 * Log database query
 */
export const logQuery = (data: {
    model: string
    operation: string
    duration: number
    error?: string
}) => {
    if (data.error) {
        logger.error('Database Query Failed', data)
    } else {
        logger.debug('Database Query', data)
    }
}

/**
 * Log error with context
 */
export const logError = (error: unknown, context?: Record<string, any>) => {
    if (typeof error === 'string') {
        logger.error(error, context)
    } else if (error instanceof Error) {
        logger.error(error.message, {
            ...context,
            stack: error.stack,
            name: error.name,
        })
    } else {
        logger.error('Unknown Error', {
            ...context,
            error: error,
        })
    }
}

/**
 * Log warning
 */
export const logWarn = (message: string, context?: Record<string, any>) => {
    logger.warn(message, context)
}

/**
 * Log info
 */
export const logInfo = (message: string, context?: Record<string, any>) => {
    logger.info(message, context)
}

/**
 * Log debug
 */
export const logDebug = (message: string, context?: Record<string, any>) => {
    logger.debug(message, context)
}

/**
 * Log security event
 */
export const logSecurity = (data: {
    event: 'rate_limit_exceeded' | 'invalid_token' | 'unauthorized_access' | 'suspicious_activity'
    ip?: string
    userId?: string
    userAgent?: string
    details?: Record<string, any>
}) => {
    logger.warn('Security Event', data)
}

/**
 * Log payment event
 */
export const logPayment = (data: {
    event: 'payment_initiated' | 'payment_success' | 'payment_failed' | 'refund'
    transactionId: string
    amount: number
    currency: string
    userId?: string
    error?: string
}) => {
    logger.info('Payment Event', data)
}

export default logger
