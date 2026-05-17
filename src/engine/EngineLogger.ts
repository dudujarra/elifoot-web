/**
 * EngineLogger — Telemetria de Erros da Engine
 *
 * Substitui os blocos catch vazios por captura estruturada.
 * Nunca lança exceção, nunca quebra o fluxo.
 * Mantém um ring buffer de erros para auditoria pós-mortem.
 */

const MAX_ERRORS = 50;
const MAX_WARNINGS = 100;

interface LogEntry {
    ts: number;
    context: string;
    message: string;
    stack?: string | null;
    meta: Record<string, unknown>;
}

interface WarningEntry {
    ts: number;
    context: string;
    message: string;
    meta: Record<string, unknown>;
}

export interface HealthReport {
    totalErrors: number;
    totalWarnings: number;
    recentErrors: LogEntry[];
    recentWarnings: WarningEntry[];
    healthy: boolean;
}

class _EngineLogger {
    errors: LogEntry[] = [];
    warnings: WarningEntry[] = [];
    private _totalErrorCount = 0;
    private _totalWarningCount = 0;

    /**
     * Captura um erro sem jamais relançar.
     */
    capture(err: Error | string, context: string, meta: Record<string, unknown> = {}): void {
        this._totalErrorCount++;
        const entry: LogEntry = {
            ts: Date.now(),
            context,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack?.split('\n').slice(0, 4).join('\n') ?? null : null,
            meta,
        };

        this.errors.push(entry);
        if (this.errors.length > MAX_ERRORS) this.errors.shift();

        // Em dev, emitir no stderr para não poluir stdout do vitest
        if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
            console.warn(`[EngineLogger] ${context}: ${entry.message}`);
        }
    }

    /**
     * Captura um warning (não-fatal, mas suspeito).
     */
    warn(message: string, context: string, meta: Record<string, unknown> = {}): void {
        this._totalWarningCount++;
        const entry: WarningEntry = {
            ts: Date.now(),
            context,
            message,
            meta,
        };

        this.warnings.push(entry);
        if (this.warnings.length > MAX_WARNINGS) this.warnings.shift();
    }

    /**
     * Retorna snapshot de saúde para dashboards / testes.
     */
    getHealthReport(): HealthReport {
        return {
            totalErrors: this._totalErrorCount,
            totalWarnings: this._totalWarningCount,
            recentErrors: this.errors.slice(-10),
            recentWarnings: this.warnings.slice(-10),
            healthy: this._totalErrorCount === 0,
        };
    }

    /**
     * Reseta contadores (para início de soak test).
     */
    reset(): void {
        this.errors = [];
        this.warnings = [];
        this._totalErrorCount = 0;
        this._totalWarningCount = 0;
    }
}

// Singleton — toda a engine compartilha a mesma instância
export const EngineLogger = new _EngineLogger();
