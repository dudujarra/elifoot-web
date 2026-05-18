import { Info } from '@phosphor-icons/react';
import { severityKey, severityTagLabel, CATEGORY_ICONS, CATEGORY_LABELS, formatLogTs } from './monitorUtils';

export function MonitorKernelTable({ entries }) {
    return (
        <div className="ef-mon__kernel-panel">
            <div className="ef-mon__kernel-head">
                <h3 className="ef-mon__kernel-title">SYSTEM_KERNEL_LOGS</h3>
                <div className="ef-mon__kernel-dots">
                    <span className="ef-mon__kernel-dot" />
                    <span className="ef-mon__kernel-dot" />
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="ef-mon__empty">
                    <Info size={40} />
                    <div>Nenhum registro encontrado. O sistema está limpo.</div>
                </div>
            ) : (
                <div className="ef-mon__kernel-body">
                    <table className="ef-mon__kernel-table">
                        <thead>
                            <tr>
                                <th>TIMESTAMP</th>
                                <th>SEVERITY</th>
                                <th>CATEGORY</th>
                                <th>TECHNICAL_MESSAGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.slice(0, 30).map(e => {
                                const sevKey = severityKey(e.severity);
                                return (
                                    <tr
                                        key={e.id}
                                        className={`ef-mon__kernel-row ef-mon__kernel-row--${sevKey}`}
                                    >
                                        <td className="ef-mon__kernel-ts">
                                            {formatLogTs(e.ts)}
                                        </td>
                                        <td>
                                            <span
                                                className={`ef-mon__sev-pill ef-mon__sev-pill--${sevKey}`}
                                            >
                                                {severityTagLabel(e.severity)}
                                            </span>
                                        </td>
                                        <td className="ef-mon__kernel-cat">
                                            <span className="ef-mon-cat-tag">
                                                {CATEGORY_ICONS[e.category]}{' '}
                                                {CATEGORY_LABELS[e.category] || e.category}
                                            </span>
                                        </td>
                                        <td className={`ef-mon__kernel-msg ef-mon__kernel-msg--${sevKey}`}>
                                            {(e.message || e.text || e.action || '(sem conteúdo)')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
