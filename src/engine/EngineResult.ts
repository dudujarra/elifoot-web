/**
 * EngineResult — Standardized result type for all engine/service operations.
 *
 * AKITA-410: Every service method that can succeed or fail MUST return an EngineResult.
 */

export interface EngineResult<T extends Record<string, unknown> = Record<string, unknown>> {
    success: boolean;
    msg: string;
    [key: string]: unknown;
}

export type OkResult<T extends Record<string, unknown> = Record<string, unknown>> = EngineResult<T> & { success: true };
export type FailResult<T extends Record<string, unknown> = Record<string, unknown>> = EngineResult<T> & { success: false };

/**
 * Creates a success result.
 * @param msg — Human-readable message.
 * @param extra — Additional fields merged into the result.
 */
export function ok<T extends Record<string, unknown> = Record<string, unknown>>(
    msg: string = 'OK',
    extra: T = {} as T
): OkResult<T> {
    return { success: true as const, msg, ...extra };
}

/**
 * Creates a failure result.
 * @param msg — Human-readable message.
 * @param extra — Additional fields merged into the result.
 */
export function fail<T extends Record<string, unknown> = Record<string, unknown>>(
    msg: string = 'Erro desconhecido.',
    extra: T = {} as T
): FailResult<T> {
    return { success: false as const, msg, ...extra };
}
