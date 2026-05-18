import { useGame } from '../../context/GameContext';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Robot, ChartBar, TrendUp, Lightning, PersonSimpleWalk, PersonSimpleRun, Rocket, GitDiff } from '@phosphor-icons/react';

const SPEED_PRESETS = [
    { label: 'Slow', icon: GitDiff,           delay: 500 },
    { label: '1×',   icon: PersonSimpleWalk,  delay: 200 },
    { label: '5×',   icon: PersonSimpleRun,   delay: 50 },
    { label: '20×',  icon: Rocket,            delay: 10 },
    { label: 'Max',  icon: Lightning,         delay: 1 }
];

function Stat({ label, value, color }) {
    return (
        <div className="ef-arcade-stat">
            <div className="ef-arcade-stat__label">
                {label}
            </div>
            {}
            <div className={`ef-arcade-stat__value ${color ? 'ef-dyn-color' : ''}`} style={color ? { '--ef-dyn-color': color } : undefined}>
                {value}
            </div>
        </div>
    );
}

export function AutoPlayDashboard({ stats, speed, handleSpeedChange }) {
    const { changeView, getDashboardView } = useGame();

    const elapsedSec = stats ? (stats.elapsedMs / 1000).toFixed(1) : 0;
    const wps = stats ? stats.weeksPerSecond?.toFixed(1) : '0';

    const winRate = stats?.matchesPlayed > 0
        ? Math.round((stats.wins / stats.matchesPlayed) * 100)
        : 0;
    const titlesCount = stats?.insights?.titlesWon ?? 0;
    const anomaliesCount = stats?.anomalies?.length ?? 0;
    const seasonsCount = stats?.seasonsPlayed ?? 0;
    const isStable = anomaliesCount === 0;

    return (
        <>
            <EfPanel variant="elev" padding="md" className="ef-ap__hero-header">
                <div className="ef-ap__hero-left">
                    <h2 className="ef-arcade-h ef-arcade-h--xl ef-ap__crt-glow">
                        <Robot size={20} weight="fill" className="ef-icon-inline-lg" />
                        SOAK TEST DASHBOARD
                    </h2>
                    <div className="ef-ap__sim-badge">
                        <span className={`ef-ap__sim-dot${stats?.running ? ' ef-ap__sim-dot--active' : ''}`} />
                        <span className="ef-ap__sim-label">
                            {stats?.running ? 'SIMULATION ACTIVE' : 'SIMULATION IDLE'}
                        </span>
                    </div>
                </div>
                <EfButton variant="secondary" size="sm" onClick={() => changeView(getDashboardView())}>← VOLTAR</EfButton>
            </EfPanel>

            {/* Bento */}
            <div className="ef-ap__bento-row">
                <div className="ef-ap__bento-stats">
                    <div className="ef-ap__bento-cell">
                        <p className="ef-ap__bento-label">TEMPORADAS</p>
                        <p className="ef-ap__bento-value ef-ap__crt-glow">{seasonsCount}</p>
                    </div>
                    <div className="ef-ap__bento-cell">
                        <p className="ef-ap__bento-label">TAXA VITÓRIA</p>
                        <p className="ef-ap__bento-value ef-ap__bento-value--accent">{winRate}%</p>
                    </div>
                    <div className="ef-ap__bento-cell">
                        <p className="ef-ap__bento-label">TÍTULOS</p>
                        <p className="ef-ap__bento-value ef-ap__crt-glow">{titlesCount}</p>
                    </div>
                    <div className="ef-ap__bento-cell">
                        <p className="ef-ap__bento-label">ANOMALIAS</p>
                        <div className="ef-ap__bento-anomaly">
                            <p className={`ef-ap__bento-value${isStable ? ' ef-ap__crt-glow' : ' ef-ap__bento-value--danger'}`}>{anomaliesCount}</p>
                            <span className={`ef-ap__bento-tag${isStable ? ' ef-ap__bento-tag--stable' : ' ef-ap__bento-tag--unstable'}`}>
                                {isStable ? 'STABLE' : 'ALERT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="ef-ap__bento-velocity">
                    <p className="ef-ap__bento-label ef-ap__bento-velocity-title">SIMULATION VELOCITY</p>
                    <div className="ef-ap__velocity-grid">
                        {SPEED_PRESETS.map(p => {
                            const active = speed === p.delay;
                            const isMax = p.delay === 1;
                            const cellClass = active
                                ? `ef-ap__velocity-cell ef-ap__velocity-cell--active${isMax ? ' ef-ap__velocity-cell--max' : ''}`
                                : 'ef-ap__velocity-cell';
                            const IconComp = p.icon;
                            return (
                                <button
                                    key={p.delay}
                                    type="button"
                                    onClick={() => handleSpeedChange(p.delay)}
                                    className={cellClass}
                                    title={p.label}
                                    aria-label={`Velocidade ${p.label}`}
                                >
                                    <IconComp size={14} weight={active ? 'fill' : 'bold'} className="ef-icon-inline" />
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Live stats */}
            {stats && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <h3 className="ef-arcade-h ef-arcade-h--lg ef-ap__h-mb-8">
                        <ChartBar size={16} weight="bold" className="ef-icon-inline-sm" />
                        ESTATÍSTICAS LIVE
                    </h3>
                    <div className="ef-ap__stats-grid">
                        <Stat label="Status" value={stats.running ? 'Rodando' : 'Pausado'} />
                        <Stat label="Semanas" value={stats.weeksPlayed} />
                        <Stat label="Temporadas" value={stats.seasonsPlayed} />
                        <Stat label="Semana atual" value={`${stats.currentWeek || 0}/${(stats.currentSeason || 1) * 38}`} />
                        <Stat label="Tempo (s)" value={elapsedSec} />
                        <Stat label="Weeks/sec" value={wps} />
                        <Stat label="Matches" value={stats.matchesPlayed} />
                        <Stat label="V/E/D" value={`${stats.wins}/${stats.draws}/${stats.losses}`} />
                        <Stat label="Transfers" value={stats.transfers} />
                        <Stat label="Decisions" value={stats.decisions?.length || 0} />
                        <Stat label="Errors" value={stats.errorCount} color={stats.errorCount > 0 ? 'var(--danger)' : 'var(--primary)'} />
                        <Stat label="Anomalies" value={stats.anomalies?.length || 0} color={(stats.anomalies?.length || 0) > 0 ? 'var(--accent)' : 'var(--ef-ap-soft-text)'} />
                    </div>
                </EfPanel>
            )}

            {/* Insights */}
            {stats?.insights && (
                <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
                    <h3 className="ef-arcade-h ef-arcade-h--lg ef-ap__h-mb-8">
                        <TrendUp size={16} weight="bold" className="ef-icon-inline-sm" />
                        INSIGHTS DA CARREIRA
                    </h3>
                    <div className="ef-ap__insights-grid">
                        <Stat label="Títulos" value={stats.insights.titlesWon} color="var(--accent)" />
                        <Stat label="Promoções" value={stats.insights.promotionsWon} color="var(--primary)" />
                        <Stat label="Rebaixamentos" value={stats.insights.relegationsTaken} color="var(--danger)" />
                        <Stat label="Hat-tricks" value={stats.insights.hatTricks} />
                        <Stat label="Clean sheets" value={stats.insights.cleanSheets} />
                        <Stat label="Maior streak V" value={stats.insights.longestWinStreak} color="var(--primary)" />
                        <Stat label="Maior streak D" value={Math.abs(stats.insights.longestLossStreak || 0)} color="var(--danger)" />
                        <Stat label="Peak posição" value={stats.insights.peakStanding === Infinity ? '-' : stats.insights.peakStanding + 'º'} />
                        <Stat label="Pior posição" value={stats.insights.worstStanding ? stats.insights.worstStanding + 'º' : '-'} />
                        <Stat label="Pico R$" value={`${(stats.insights.peakBalance / 1e6).toFixed(0)}M`} color="var(--accent)" />
                        <Stat label="Maior goleada" value={stats.insights.biggestWin?.score || '-'} />
                        <Stat label="Pior derrota" value={stats.insights.worstLoss?.score || '-'} color="var(--danger)" />
                    </div>
                </EfPanel>
            )}
        </>
    );
}
