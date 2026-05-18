import { ChartLineUp, WarningCircle, Lightning, Pulse } from '@phosphor-icons/react';

export function MonitorMetricsGrid({ stats, critCount, engineStatus, healthPct }) {
    return (
        <div className="ef-mon__metrics-grid">
            <div className="ef-mon__metric ef-mon__metric--info">
                <div className="ef-mon__metric-head">
                    <span className="ef-mon__metric-label">TOTAL_CALLS</span>
                    <ChartLineUp size={18} weight="bold" />
                </div>
                <div className="ef-mon__metric-value">{stats?.total ?? 0}</div>
                <div className="ef-mon__metric-bar">
                    <div
                        className={`ef-mon__metric-bar-fill w-${Math.round(Math.min(100, ((stats?.total ?? 0) / 500) * 100))}`} />
                </div>
            </div>
            <div
                className={`ef-mon__metric ${critCount > 0 ? 'ef-mon__metric--danger' : 'ef-mon__metric--ok'}`}
            >
                <div className="ef-mon__metric-head">
                    <span className="ef-mon__metric-label">CRITICAL_BUGS</span>
                    <WarningCircle size={18} weight="fill" />
                </div>
                <div className="ef-mon__metric-value">
                    {String(critCount).padStart(2, '0')}
                </div>
                <div className="ef-mon__metric-status">
                    {critCount > 0 ? 'STATUS: ATTENTION' : 'STATUS: NOMINAL'}
                </div>
            </div>
            <div className="ef-mon__metric ef-mon__metric--engine">
                <div className="ef-mon__metric-head">
                    <span className="ef-mon__metric-label">GAME_ENGINE</span>
                    <Lightning size={18} weight="fill" />
                </div>
                <div className="ef-mon__metric-value">{engineStatus}</div>
                <div className="ef-mon__metric-bars">
                    <span
                        className={`ef-mon__metric-pip ${healthPct >= 25 ? 'ef-mon__metric-pip--on' : ''}`}
                    />
                    <span
                        className={`ef-mon__metric-pip ${healthPct >= 50 ? 'ef-mon__metric-pip--on' : ''}`}
                    />
                    <span
                        className={`ef-mon__metric-pip ${healthPct >= 75 ? 'ef-mon__metric-pip--on' : ''}`}
                    />
                    <span
                        className={`ef-mon__metric-pip ${healthPct >= 95 ? 'ef-mon__metric-pip--on' : ''}`}
                    />
                </div>
            </div>
            <div className="ef-mon__metric ef-mon__metric--warn">
                <div className="ef-mon__metric-head">
                    <span className="ef-mon__metric-label">FEEDBACK_LOOP</span>
                    <Pulse size={18} weight="bold" />
                </div>
                <div className="ef-mon__metric-value">
                    {stats?.feedback ?? 0}
                </div>
                <div className="ef-mon__metric-status">
                    REPORTS: USER_SIGNAL
                </div>
            </div>
        </div>
    );
}
