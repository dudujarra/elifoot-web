/**
 * AutoPlayTelemetry — GDD Status + Telemetry + Anomalies + Decisions
 * Extracted from AutoPlayView (lines 645-892)
 */
import { useState } from 'react';
import { EfPanel } from '../ui/EfPanel';
import {
    Target, CheckCircle, XCircle, ChartBar, WarningCircle, ClipboardText
} from '@phosphor-icons/react';

function GDDStatus({ label, count }) {
    const fired = count > 0;
    return (
        <div className={`ef-arcade-cell${fired ? ' ef-arcade-cell--fired' : ' ef-ap__gdd-cell-empty'}`}>
            <span>
                {fired
                    ? <CheckCircle size={12} weight="fill" className="ef-icon-inline ef-text-primary" />
                    : <XCircle size={12} weight="fill" className="ef-icon-inline ef-text-danger" />}
                {label}
            </span>
            <strong className={`ef-ap__gdd-cell-count ${fired ? 'ef-text-primary' : 'ef-text-danger'}`}>
                {count}×
            </strong>
        </div>
    );
}

export default function AutoPlayTelemetry({ stats }) {
    const [telemetryOpen, setTelemetryOpen] = useState(false);
    const [expandedSpec, setExpandedSpec] = useState(null);
    const [anomalyFilter, setAnomalyFilter] = useState('all');

    if (!stats) return null;

    const scoreColor = (score) => {
        if (score >= 70) return 'var(--primary)';
        if (score >= 40) return 'var(--accent)';
        return 'var(--danger)';
    };

    const filteredAnomalies = stats.anomalies?.filter(a =>
        anomalyFilter === 'all' || a.type === anomalyFilter
    ) || [];

    const anomalyTypes = stats.anomalies?.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1; return acc;
    }, {}) || {};

    const successTypes = stats.successes?.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1; return acc;
    }, {}) || {};

    return (
        <>
            {/* GDD Status */}
            <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                <h3 className="ef-arcade-h ef-arcade-h--md ef-ap__h-mb-8">
                    <Target size={14} weight="fill" className="ef-icon-inline-md" />GDD SYSTEMS STATUS
                </h3>
                <div className="ef-ap__gdd-grid">
                    <GDDStatus label="Scarcity" count={stats.decisions?.filter(d => d.action === 'SCARCITY_WINDOW').length || 0} />
                    <GDDStatus label="Dread" count={stats.decisions?.filter(d => d.action === 'DREAD_RELEGATION').length || 0} />
                    <GDDStatus label="Challenge" count={stats.successes?.filter(s => s.type === 'CHALLENGE_WIN').length || 0} />
                    <GDDStatus label="Trophy" count={stats.successes?.filter(s => s.type === 'TROPHY_CEREMONY').length || 0} />
                    <GDDStatus label="Training" count={stats.decisions?.filter(d => d.action === 'TRAIN').length || 0} />
                    <GDDStatus label="Market" count={stats.decisions?.filter(d => d.action === 'BUY_OFFER' || d.action === 'MARKET_INQUIRY').length || 0} />
                </div>
            </EfPanel>
            {/* Telemetry */}
            {stats.telemetry?.results && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <div onClick={() => setTelemetryOpen(!telemetryOpen)} className="ef-ap__telemetry-header">
                        <h3 className="ef-arcade-h ef-arcade-h--md">
                            <ChartBar size={14} weight="bold" className="ef-icon-inline-md" />
                            Telemetria ({Object.keys(stats.telemetry.results).length})
                            <span className="ef-ap__telemetry-score ef-dyn-color" style={{ "--ef-dyn-color": scoreColor(stats.telemetry.overallScore) }}>
                                Score: {stats.telemetry.overallScore}
                            </span>
                        </h3>
                        <span className="ef-ap__telemetry-toggle">{telemetryOpen ? '▼' : '▶'}</span>
                    </div>
                    {telemetryOpen && (
                        <div className="ef-ap__telemetry-grid">
                            {Object.entries(stats.telemetry.results).map(([spec, res]) => (
                                <div key={spec} onClick={() => setExpandedSpec(expandedSpec === spec ? null : spec)}
                                    className="ef-ap__telemetry-card ef-dyn-border"
                                    style={{ "--ef-dyn-border": `3px solid ${scoreColor(res.score)}` }}>
                                    <div className="ef-ap__telemetry-card-head">
                                        <strong className="ef-ap__telemetry-card-name">{spec}</strong>
                                        <span
                                            style={{ "--ef-dyn-fontWeight": 700, "--ef-dyn-color": scoreColor(res.score) }}
                                            className="ef-dyn-fontWeight ef-dyn-color">{res.score}</span>
                                    </div>
                                    <div className="ef-ap__telemetry-card-desc">{res.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </EfPanel>
            )}
            {/* Successes */}
            {stats.successes?.length > 0 && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <h3 className="ef-arcade-h ef-arcade-h--md ef-arcade-h--primary ef-ap__h-mb-8">
                        <CheckCircle size={14} weight="fill" className="ef-icon-inline-md" />SUCCESSES ({stats.successes.length})
                    </h3>
                    <div className="ef-ap__entry-types-line">
                        Por tipo: {Object.entries(successTypes).map(([t, n]) => `${t}(${n})`).join(' • ')}
                    </div>
                    <div className="ef-ap__entry-scroll">
                        {stats.successes.slice(-20).reverse().map((s, i) => (
                            <div key={i} className="ef-ap__entry-success">
                                <strong className="ef-ap__entry-type-success">{s.type}</strong>
                                <span className="ef-ap__label-tag">Sem {s.week} • Temp {s.season}</span>
                                <div className="ef-ap__entry-msg">{s.msg}</div>
                            </div>
                        ))}
                    </div>
                </EfPanel>
            )}
            {/* Anomalies */}
            {stats.anomalies?.length > 0 && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <div className="ef-ap__anomaly-bar">
                        <h3 className="ef-arcade-h ef-arcade-h--md ef-arcade-h--danger">
                            <WarningCircle size={14} weight="fill" className="ef-icon-inline-md" />ANOMALIES ({stats.anomalies.length})
                        </h3>
                        <select value={anomalyFilter} onChange={e => setAnomalyFilter(e.target.value)} className="btn btn-sm ef-ap__anomaly-select">
                            <option value="all">Todas</option>
                            {Object.entries(anomalyTypes).map(([type, count]) => (
                                <option key={type} value={type}>{type} ({count})</option>
                            ))}
                        </select>
                    </div>
                    <div className="ef-ap__entry-scroll--tall">
                        {filteredAnomalies.slice(-30).reverse().map((a, i) => (
                            <div key={i} className="ef-ap__entry-anomaly">
                                <strong className="ef-ap__entry-type-danger">{a.type}</strong>
                                <div className="ef-ap__entry-msg">{a.msg}</div>
                            </div>
                        ))}
                    </div>
                </EfPanel>
            )}
            {/* Recent decisions */}
            {stats.decisions?.length > 0 && (
                <EfPanel variant="elev" padding="md">
                    <h3 className="ef-arcade-h ef-arcade-h--md ef-ap__h-mb-8">
                        <ClipboardText size={14} weight="bold" className="ef-icon-inline-md" />ÚLTIMAS DECISÕES (20)
                    </h3>
                    <div className="ef-mono ef-ap__decisions-list">
                        {stats.decisions.slice(-20).reverse().map((d, i) => (
                            <div key={i} className="ef-ap__decision-row">
                                <span className="ef-ap__decision-week">W{d.week}</span>{' '}
                                <strong className="ef-ap__decision-action">{d.action}</strong>{' '}
                                <span>{JSON.stringify(d.args)}</span>
                            </div>
                        ))}
                    </div>
                </EfPanel>
            )}
        </>
    );
}
