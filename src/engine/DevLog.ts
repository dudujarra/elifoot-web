/**
 * DevLog — Development-only logging utility.
 *
 * Wraps console.log/warn/error with environment check.
 * In production builds (import.meta.env.PROD), all logs are silenced.
 * In development, logs with structured prefix for easy grep.
 */

const IS_DEV: boolean = typeof import.meta !== 'undefined'
    ? !import.meta.env?.PROD
    : typeof process !== 'undefined'
        ? process.env?.NODE_ENV !== 'production'
        : true;

/**
 * Log only in development. Silenced in production builds.
 * @param tag - Module/subsystem tag (e.g., 'DAgger', 'PWA', 'Audio')
 * @param args - Arguments to log
 */
export function devLog(tag: string, ...args: unknown[]): void {
    if (IS_DEV) console.log(`[${tag}]`, ...args);
}

/**
 * Warn only in development.
 */
export function devWarn(tag: string, ...args: unknown[]): void {
    if (IS_DEV) console.warn(`[${tag}]`, ...args);
}

/**
 * Error always logs (even in production — errors should never be silent).
 */
export function devError(tag: string, ...args: unknown[]): void {
    console.error(`[${tag}]`, ...args);
}
