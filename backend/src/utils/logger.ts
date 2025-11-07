import pino from 'pino';

/**
 * Enhanced Logging System for ScreenBoard Backend
 * Features: Colorful output, structured logging, performance tracking
 */

// Enhanced Logger Configuration
const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

// Alternative: Console Logger für bessere Lesbarkeit in Production
const createReadableLog = (level: string, message: string, meta: any = {}) => {
    if (isProduction && process.env.READABLE_LOGS === 'true') {
        const time = new Date().toISOString().substring(11, 19);
        const context = meta.context || 'APP';
        const module = meta.module || 'LOG';
        console.log(`[${time}] ${level} [${context}:${module}] ${message}`);
        return;
    }
};

/**
 * Enhanced Logger Class with Categories and Colors
 */
class EnhancedLogger {
    private baseLogger = logger;

    // Standard Logging Methods
    info(message: string, meta?: object, context?: string) {
        const formattedMessage = this.formatMessage(message, context);
        createReadableLog('INFO', formattedMessage, { ...meta, context, module: 'INFO' });
        this.baseLogger.info({ ...meta, context, module: 'INFO' }, formattedMessage);
    }

    error(message: string, error?: Error | object, context?: string) {
        const formattedMessage = this.formatMessage(message, context);
        const errorMeta = {
            ...error,
            context,
            module: 'ERROR',
            stack: error instanceof Error ? error.stack : undefined
        };
        createReadableLog('ERROR', formattedMessage, errorMeta);
        this.baseLogger.error(errorMeta, formattedMessage);
    }

    warn(message: string, meta?: object, context?: string) {
        const formattedMessage = this.formatMessage(message, context);
        createReadableLog('WARN', formattedMessage, { ...meta, context, module: 'WARN' });
        this.baseLogger.warn({ ...meta, context, module: 'WARN' }, formattedMessage);
    }

    debug(message: string, meta?: object, context?: string) {
        const formattedMessage = this.formatMessage(message, context);
        createReadableLog('DEBUG', formattedMessage, { ...meta, context, module: 'DEBUG' });
        this.baseLogger.debug({ ...meta, context, module: 'DEBUG' }, formattedMessage);
    }

    success(message: string, meta?: object, context?: string) {
        const formattedMessage = this.formatMessage(`✅ ${message}`, context);
        createReadableLog('SUCCESS', formattedMessage, { ...meta, context, module: 'SUCCESS' });
        this.baseLogger.info({ ...meta, context, module: 'SUCCESS' }, formattedMessage);
    }

    // Category-Specific Logging Methods

    /** HTTP Request/Response Logging */
    http(method: string, url: string, statusCode?: number, duration?: number, userId?: string) {
        const status = statusCode ? this.getStatusEmoji(statusCode) : '';
        const time = duration ? ` (${duration}ms)` : '';
        const user = userId ? ` [User: ${userId}]` : '';

        this.baseLogger.info({
            method,
            url,
            statusCode,
            duration,
            userId,
            context: 'HTTP',
            module: 'REQUEST'
        }, `${status} ${method} ${url}${time}${user}`);
    }

    /** Database Operations */
    database(operation: string, collection?: string, duration?: number, recordCount?: number) {
        const time = duration ? ` (${duration}ms)` : '';
        const count = recordCount !== undefined ? ` [${recordCount} records]` : '';

        this.baseLogger.info({
            operation,
            collection,
            duration,
            recordCount,
            context: 'DATABASE',
            module: 'DB'
        }, `🗄️  ${operation}${collection ? ` on ${collection}` : ''}${time}${count}`);
    }

    /** Authentication Events */
    auth(event: string, userId?: string, provider?: string, success: boolean = true) {
        const emoji = success ? '🔐' : '🚫';
        const user = userId ? ` [${userId}]` : '';
        const prov = provider ? ` via ${provider}` : '';

        this.baseLogger.info({
            event,
            userId,
            provider,
            success,
            context: 'AUTH',
            module: 'SECURITY'
        }, `${emoji} ${event}${user}${prov}`);
    }

    /** Webhook Events */
    webhook(provider: string, event: string, status: 'received' | 'processed' | 'failed', meta?: object) {
        const emoji = status === 'processed' ? '✅' : status === 'failed' ? '❌' : '📨';

        this.baseLogger.info({
            provider,
            event,
            status,
            ...meta,
            context: 'WEBHOOK',
            module: provider.toUpperCase()
        }, `${emoji} ${provider} webhook ${event} - ${status}`);
    }

    /** Service Operations */
    service(serviceName: string, operation: string, success: boolean, duration?: number, meta?: object) {
        const emoji = success ? '⚡' : '💥';
        const time = duration ? ` (${duration}ms)` : '';

        this.baseLogger.info({
            serviceName,
            operation,
            success,
            duration,
            ...meta,
            context: 'SERVICE',
            module: serviceName.toUpperCase()
        }, `${emoji} ${serviceName}.${operation}${time}`);
    }

    /** Token Operations */
    token(action: 'encrypt' | 'decrypt' | 'refresh' | 'create' | 'delete', service: string, userId?: string) {
        const emojis = {
            encrypt: '🔒',
            decrypt: '🔓',
            refresh: '🔄',
            create: '🆕',
            delete: '🗑️'
        };

        this.baseLogger.info({
            action,
            service,
            userId,
            context: 'TOKEN',
            module: 'SECURITY'
        }, `${emojis[action]} Token ${action} for ${service}${userId ? ` [${userId}]` : ''}`);
    }

    /** API Calls to External Services */
    apiCall(service: string, endpoint: string, method: string, statusCode?: number, duration?: number) {
        const status = statusCode ? this.getStatusEmoji(statusCode) : '📡';
        const time = duration ? ` (${duration}ms)` : '';

        this.baseLogger.info({
            service,
            endpoint,
            method,
            statusCode,
            duration,
            context: 'API_CALL',
            module: service.toUpperCase()
        }, `${status} ${service} API: ${method} ${endpoint}${time}`);
    }

    /** Performance Monitoring */
    performance(operation: string, duration: number, context?: string) {
        const emoji = duration > 5000 ? '🐌' : duration > 1000 ? '⏱️' : '⚡';

        this.baseLogger.info({
            operation,
            duration,
            context: context || 'PERFORMANCE',
            module: 'PERF'
        }, `${emoji} ${operation} took ${duration}ms`);
    }

    /** System Events */
    system(event: string, meta?: object) {
        this.baseLogger.info({
            event,
            ...meta,
            context: 'SYSTEM',
            module: 'SYS'
        }, `🖥️  System: ${event}`);
    }

    // Helper Methods
    private formatMessage(message: string, context?: string): string {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            // Production: Simple message format
            return context ? `[${context}] ${message}` : message;
        } else {
            // Development: Original message (pino-pretty will handle formatting)
            return message;
        }
    }

    private getStatusEmoji(statusCode: number): string {
        if (statusCode >= 200 && statusCode < 300) return '✅';
        if (statusCode >= 300 && statusCode < 400) return '↗️';
        if (statusCode >= 400 && statusCode < 500) return '⚠️';
        if (statusCode >= 500) return '❌';
        return '📡';
    }

    // Performance Tracking Utilities
    startTimer(label: string): () => void {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.performance(label, duration);
        };
    }

    // Middleware for Express
    expressMiddleware() {
        return (req: any, res: any, next: any) => {
            const start = Date.now();
            const originalSend = res.send;

            res.send = function (data: any) {
                const duration = Date.now() - start;
                enhancedLogger.http(
                    req.method,
                    req.originalUrl,
                    res.statusCode,
                    duration,
                    req.auth?.payload?.sub
                );
                return originalSend.call(this, data);
            };

            next();
        };
    }
}

// Export singleton instance
const enhancedLogger = new EnhancedLogger();
export default enhancedLogger;
export { EnhancedLogger };