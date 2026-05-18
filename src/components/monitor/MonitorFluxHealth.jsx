export function MonitorFluxHealth({ loadBars, healthPct, engineSeason, engineWeek }) {
    return (
        <div className="ef-mon__flux-row">
            <div className="ef-mon__flux">
                <div className="ef-mon__flux-head">
                    <h3 className="ef-mon__panel-title">ENGINE_LOAD_FLUX</h3>
                    <div className="ef-mon__flux-legend">
                        <span className="ef-mon__flux-legend-dot" />
                        <span>EVENTS / 5s</span>
                    </div>
                </div>
                <div className="ef-mon__bars">
                    {loadBars.map((h, i) => (
                        <div
                            key={i}
                            className={`ef-mon__bar ${h > 70 ? 'ef-mon__bar--peak' : ''} ef-dyn-height`}
                                                        style={{ "--ef-dyn-height": `${h}%` }}
                        />
                    ))}
                </div>
                <div className="ef-mon__flux-axis">
                    <span>T - 90s</span>
                    <span>T - 60s</span>
                    <span>T - 30s</span>
                    <span>NOW</span>
                </div>
            </div>
            <div className="ef-mon__health">
                <h3 className="ef-mon__panel-title">SYSTEM_HEALTH_INDEX</h3>
                <div className="ef-mon__gauge">
                    <svg viewBox="0 0 160 160" className="ef-mon__gauge-svg">
                        <circle
                            className="ef-mon__gauge-track"
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            strokeWidth="8"
                        />
                        <circle
                            className="ef-mon__gauge-arc"
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            strokeWidth="8"
                            strokeDasharray={`${(healthPct / 100) * 440} 440`}
                            transform="rotate(-90 80 80)"
                        />
                    </svg>
                    <div className="ef-mon__gauge-center">
                        <span className="ef-mon__gauge-value">{healthPct}%</span>
                        <span className="ef-mon__gauge-label">
                            {healthPct >= 90 ? 'OPTIMAL' : healthPct >= 60 ? 'STABLE' : 'DEGRADED'}
                        </span>
                    </div>
                </div>
                <div className="ef-mon__health-grid">
                    <div className="ef-mon__health-cell">
                        <div className="ef-mon__health-cell-label">SESSION</div>
                        <div className="ef-mon__health-cell-value">S{engineSeason}</div>
                    </div>
                    <div className="ef-mon__health-cell">
                        <div className="ef-mon__health-cell-label">WEEK</div>
                        <div className="ef-mon__health-cell-value">{engineWeek}/38</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
