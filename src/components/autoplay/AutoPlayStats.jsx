/* eslint-disable no-restricted-syntax -- dynamic runtime styles */
/**
 * AutoPlayStats — Statistics & Insights panels extracted from AutoPlayView
 */

import { EfPanel } from '../ui/EfPanel';
import { ChartBar, TrendUp } from '@phosphor-icons/react';

function Stat({ label, value, color }) {
    return (
        <div className="ef-arcade-stat">
            <div className="ef-arcade-stat__label">{label}</div>
            <div className="ef-arcade-stat__value" style={color ? { color } : undefined}>{value}</div>
        </div>
    );
}

export default function AutoPlayStats({ stats }) {
    if (!stats) return null;
    const elapsedSec = (stats.elapsedMs / 1000).toFixed(1);
    const wps = stats.weeksPerSecond?.toFixed(1) || '0';

    return (
        <>
            <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                <h3 className="ef-arcade-h ef-arcade-h--lg ef-ap__h-mb-8">
                    <ChartBar size={16} weight="bold" className="ef-icon-inline-sm" />ESTATÍSTICAS LIVE
                </h3>
                <div className="ef-ap__stats-grid">
                    <Stat label="Semanas" value={stats.weeksPlayed} />
                    <Stat label="Temporadas" value={stats.seasonsPlayed} />
                    <Stat label="Matches" value={stats.matchesPlayed} />
                    <Stat label="V/E/D" value={`${stats.wins}/${stats.draws}/${stats.losses}`} />
                    <Stat label="Weeks/sec" value={wps} />
                    <Stat label="Tempo (s)" value={elapsedSec} />
                    <Stat label="Errors" value={stats.errorCount} color={stats.errorCount > 0 ? 'var(--danger)' : undefined} />
                    <Stat label="Anomalies" value={stats.anomalies?.length || 0} />
                </div>
            </EfPanel>
            {stats.insights && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <h3 className="ef-arcade-h ef-arcade-h--lg ef-ap__h-mb-8">
                        <TrendUp size={16} weight="bold" className="ef-icon-inline-sm" />INSIGHTS
                    </h3>
                    <div className="ef-ap__insights-grid">
                        <Stat label="Títulos" value={stats.insights.titlesWon} color="var(--accent)" />
                        <Stat label="Promoções" value={stats.insights.promotionsWon} color="var(--primary)" />
                        <Stat label="Rebaixamentos" value={stats.insights.relegationsTaken} color="var(--danger)" />
                        <Stat label="Peak posição" value={stats.insights.peakStanding === Infinity ? '-' : stats.insights.peakStanding + 'º'} />
                    </div>
                </EfPanel>
            )}
        </>
    );
}

export { Stat };
