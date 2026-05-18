import { WarningCircle, Info } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { severityKey, CATEGORY_ICONS, CATEGORY_LABELS, formatTs } from './monitorUtils';

export function MonitorDetailedEntries({ entries }) {
    if (entries.length === 0) return null;

    return (
        <div className="ef-mon__entries">
            <h3 className="ef-mon__panel-title ef-mon__entries-title">
                EVENT_DETAILS &middot; {entries.length}
            </h3>
            {entries.slice(0, 20).map(e => {
                const sevKey = severityKey(e.severity);
                return (
                    <EfPanel
                        key={e.id}
                        padding="lg"
                        className={`ef-mon__entry ef-mon__entry--${sevKey}`}
                    >
                        <div className="ef-mon__entry-header">
                            <div className="ef-mon__entry-left">
                                <div className="ef-mon-cat-tag">
                                    {CATEGORY_ICONS[e.category]}{' '}
                                    {CATEGORY_LABELS[e.category] || e.category}
                                </div>
                                <div className={`ef-mon-sev ef-mon__sev--${sevKey}`}>
                                    {e.severity === 'critical' || e.severity === 'error' ? (
                                        <WarningCircle weight="fill" />
                                    ) : (
                                        <Info weight="fill" />
                                    )}
                                    {e.severity}
                                </div>
                            </div>
                            <span className="ef-mono ef-text-muted ef-mon__entry-ts">
                                {formatTs(e.ts)}
                            </span>
                        </div>

                        <div className="ef-text-main ef-mon__entry-msg">
                            {e.message || e.text || e.action || '(sem conteúdo)'}
                        </div>

                        {e.action && e.ctx && (
                            <div className="ef-mon-codeblock">
                                {JSON.stringify(e.ctx)}
                            </div>
                        )}

                        {e.stack && (
                            <details className="ef-mon__entry-details">
                                <summary className="ef-text-info ef-mon__entry-summary">
                                    Ver Stack Trace
                                </summary>
                                <div className="ef-mon-codeblock ef-mon-codeblock--stack">
                                    {e.stack}
                                </div>
                            </details>
                        )}

                        {e.url && (
                            <div className="ef-mono ef-text-info ef-mon__entry-url">
                                URL: {e.url}
                            </div>
                        )}
                    </EfPanel>
                );
            })}
        </div>
    );
}
