/**
 * CareerInfoPanel — SPEC-124
 *
 * Mostra info contextual da carreira do bot:
 * - Time atual + divisão
 * - Reputação manager
 * - Títulos history
 * - Top scorers all-time
 * - Promoções/rebaixamentos timeline
 * - Milestones career
 */
import { useState, useEffect } from 'react';
import { EfPanel } from '../ui/EfPanel';
import { HexagonChart } from '../HexagonChart';
import { PlayerAttributesGrid } from '../ui/PlayerAttributesGrid';
import {
    Crown, Star, Sparkle, ClipboardText, Plant,
    SoccerBall, Trophy, ChartBar, Calendar, ArrowUp, ArrowDown
} from '@phosphor-icons/react';
import '../../styles/career-info-panel.css';

function RepIcon({ rep }) {
    if (rep >= 80) return <Crown size={12} weight="fill" className="ef-icon-inline" />;
    if (rep >= 60) return <Star size={12} weight="fill" className="ef-icon-inline" />;
    if (rep >= 40) return <Sparkle size={12} weight="fill" className="ef-icon-inline" />;
    if (rep >= 20) return <ClipboardText size={12} weight="bold" className="ef-icon-inline" />;
    return <Plant size={12} weight="bold" className="ef-icon-inline" />;
}

const DIV_NAMES = { 1: 'Série A', 2: 'Série B', 3: 'Série C', 4: 'Série D' };
const DIV_COLOR = { 1: 'var(--accent)', 2: 'var(--color-learning-silver-stat)', 3: 'var(--color-learning-bronze-stat)', 4: 'var(--color-learning-leather)' };

function formatRep(rep) {
    if (rep >= 80) return { label: 'Lendário', color: 'var(--accent)' };
    if (rep >= 60) return { label: 'Renomado', color: 'var(--color-learning-amber-bright)' };
    if (rep >= 40) return { label: 'Conhecido', color: 'var(--color-learning-lightgreen)' };
    if (rep >= 20) return { label: 'Iniciante', color: 'var(--color-learning-skyblue)' };
    return { label: 'Desconhecido', color: 'var(--text-muted)' };
}

export default function CareerInfoPanel({ controllerRef }) {
    const [snapshot, setSnapshot] = useState(null);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const id = setInterval(() => {
            const c = controllerRef.current;
            if (!c?.engine) return;
            const engine = c.engine;
            const team = engine.getTeam?.(engine.manager?.teamId);
            const standings = team ? engine.getStandings(team.zone, team.division) : [];
            const position = team ? (standings.findIndex(s => s.teamId === team.id) + 1) || 0 : 0;
            const stats = c.getStats?.() || {};
            const legacy = engine.legacy || {};

            // Top scorers current season
            const topScorers = (team?.squad || [])
                .map(p => ({
                    ...p,
                    goals: p.career?.seasonGoals || 0,
                    assists: p.career?.seasonAssists || 0,
                    apps: p.career?.seasonApps || 0,
                    totalGoals: p.career?.totalGoals || 0,
                }))
                .filter(p => p.goals > 0 || p.totalGoals > 0)
                .sort((a, b) => b.goals - a.goals || b.totalGoals - a.totalGoals)
                .slice(0, 5);

            // Manager Identity (SPEC-070)
            const identity = engine.getManagerIdentity?.() || null;

            setSnapshot({
                team,
                position,
                division: team?.division || 4,
                zone: team?.zone || 'BR',
                seasonNumber: engine.seasonNumber || 1,
                currentWeek: engine.currentWeek || 0,
                balance: team?.balance || 0,
                squadSize: team?.squad?.length || 0,
                avgOvr: team?.squad?.length
                    ? Math.round(team.squad.reduce((s, p) => s + (p.ovr || 0), 0) / (team.squad.length || 1))
                    : 0,
                reputation: legacy.reputation || 30,
                titles: legacy.titles || [],
                seasons: (legacy.seasons || []).slice(-10),
                topScorers,
                insights: stats.insights || {},
                identity,
            });
        }, 1000);
        return () => clearInterval(id);
    }, [controllerRef]);

    if (!snapshot || !snapshot.team) return null;

    const repBadge = formatRep(snapshot.reputation);
    const divName = DIV_NAMES[snapshot.division] || `Div ${snapshot.division}`;
    const divColor = DIV_COLOR[snapshot.division] || 'var(--text-muted)';
    const titlesByDiv = snapshot.titles.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});

    const posColor = snapshot.position <= 4 ? 'var(--color-success-mid)' : snapshot.position >= 17 ? 'var(--danger)' : 'var(--accent)';

    return (
        <EfPanel variant="sunk" padding="md" className="cip-root">
            <div className="cip-header" onClick={() => setOpen(o => !o)}>
                <span><SoccerBall size={14} weight="fill" className="ef-icon-inline-md" />CARREIRA INFO {open ? '▼' : '▶'}</span>
                <span className="cip-header-meta">Season {snapshot.seasonNumber} · Wk {snapshot.currentWeek}</span>
            </div>
            {open && (
                <>
                    {/* Team header */}
                    <div className="cip-team-bar">
                        <div>
                            <div className="ef-text-sm-muted">TIME</div>
                            <div className="cip-team-name">{snapshot.team.name}</div>
                            <div className="cip-division ef-dyn-color" style={{ "--ef-dyn-color": divColor }}>{divName} ({snapshot.zone})</div>
                        </div>
                        <div>
                            <div className="ef-text-sm-muted">POSIÇÃO</div>
                            <div className="cip-position ef-dyn-color" style={{ "--ef-dyn-color": posColor }}>{snapshot.position}º</div>
                        </div>
                        <div>
                            <div className="ef-text-sm-muted">SQUAD</div>
                            <div className="cip-squad-info">{snapshot.squadSize} jog · OVR {snapshot.avgOvr}</div>
                        </div>
                        <div>
                            <div className="ef-text-sm-muted">BALANÇO</div>
                            <div className="cip-balance ef-dyn-color" style={{ "--ef-dyn-color": snapshot.balance < 0 ? 'var(--danger)' : 'var(--color-success-mid)' }}>
                                R$ {(snapshot.balance / 1_000_000).toFixed(1)}M
                            </div>
                        </div>
                        <div>
                            <div className="ef-text-sm-muted">REPUTAÇÃO</div>
                            <div className="cip-reputation ef-dyn-color" style={{ "--ef-dyn-color": repBadge.color }}><RepIcon rep={snapshot.reputation} />{repBadge.label}</div>
                            <div className="ef-text-sm-muted">{snapshot.reputation}/100</div>
                        </div>
                    </div>

                    {/* Manager Identity (SPEC-070) */}
                    {snapshot.identity && (
                        <div className="cip-identity">
                            <div className="ef-text-xs-muted">
                                <Crown size={12} weight="fill" className="ef-icon-inline" />IDENTIDADE TÁTICA
                            </div>
                            <div className="cip-identity-grid">
                                <span className="ef-text-muted">Estilo:</span>
                                <strong className="cip-identity-style">
                                    {snapshot.identity.dominantStyle}
                                    {snapshot.identity.styleConfidence > 0 && ` (${snapshot.identity.styleConfidence}%)`}
                                </strong>
                                <span className="ef-text-muted">Tier:</span>
                                <strong>{snapshot.identity.reputationTier}</strong>
                                <span className="ef-text-muted">Destaque:</span>
                                <span className="cip-identity-highlight">{snapshot.identity.careerHighlight}</span>
                            </div>
                        </div>
                    )}

                    {/* Titles + insights row */}
                    <div className="cip-row">
                        <div className="cip-col">
                            <div className="ef-text-xs-muted">
                                <Trophy size={12} weight="fill" className="ef-icon-inline" />TÍTULOS ({snapshot.titles.length})
                            </div>
                            {snapshot.titles.length === 0 ? (
                                <div className="cip-empty-text">Nenhum título ainda</div>
                            ) : (
                                <div>
                                    {Object.entries(titlesByDiv).map(([title, count]) => (
                                        <div key={title} className="cip-title-item">• {title} <strong>×{count}</strong></div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="cip-col">
                            <div className="ef-text-xs-muted">
                                <ChartBar size={12} weight="bold" className="ef-icon-inline" />INSIGHTS CARREIRA
                            </div>
                            <div className="cip-insights-grid">
                                <span>Maior streak V:</span>
                                <strong>{snapshot.insights.longestWinStreak ?? 0}</strong>
                                <span>Maior goleada:</span>
                                <strong>{snapshot.insights.biggestWin?.score || '—'}</strong>
                                <span>Pior derrota:</span>
                                <strong style={{ "--ef-dyn-color": 'var(--danger)' }} className="ef-dyn-color">{snapshot.insights.worstLoss?.score || '—'}</strong>
                                <span>Clean sheets:</span>
                                <strong>{snapshot.insights.cleanSheets ?? 0}</strong>
                                <span>Promoções:</span>
                                <strong
                                    style={{ "--ef-dyn-color": 'var(--color-success-mid)' }}
                                    className="ef-dyn-color">{snapshot.insights.promotionsWon ?? 0}</strong>
                                <span>Rebaixamentos:</span>
                                <strong style={{ "--ef-dyn-color": 'var(--danger)' }} className="ef-dyn-color">{snapshot.insights.relegationsTaken ?? 0}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Top scorers */}
                    {snapshot.topScorers.length > 0 && (
                        <div className="cip-scorers">
                            <div className="ef-text-xs-muted">
                                <SoccerBall size={12} weight="fill" className="ef-icon-inline" />ARTILHEIROS (TEMPORADA ATUAL)
                            </div>
                            <div className="cip-scorers-list">
                                {snapshot.topScorers.length > 0 && (
                                    <>
                                    <div className="cip-highlight-card">
                                        <div className="cip-hexagon-wrap">
                                            <HexagonChart player={snapshot.topScorers[0]} size={120} showLabels={true} />
                                        </div>
                                        <div style={{ "--ef-dyn-flex": 1 }} className="ef-dyn-flex">
                                            <div className="cip-highlight-label"><Trophy size={11} weight="fill" className="ef-icon-inline" />DESTAQUE DA TEMPORADA</div>
                                            <div className="cip-highlight-name">{snapshot.topScorers[0].name}</div>
                                            <div className="cip-highlight-pos">
                                                {snapshot.topScorers[0].position} · OVR {snapshot.topScorers[0].ovr}
                                            </div>
                                            <div className="cip-highlight-stats">
                                                <strong
                                                    style={{ "--ef-dyn-color": 'var(--color-success-mid)' }}
                                                    className="ef-dyn-color">{snapshot.topScorers[0].goals}G</strong>{' '}
                                                <span className="ef-text-muted">
                                                    {snapshot.topScorers[0].assists}A · {snapshot.topScorers[0].apps}j
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cip-attrs-divider">
                                        <PlayerAttributesGrid player={snapshot.topScorers[0]} />
                                    </div>
                                    </>
                                )}

                                {/* Lista dos demais artilheiros */}
                                {snapshot.topScorers.slice(1).map((p, i) => (
                                    <div key={i + 1} className="cip-scorer-row ef-dyn-borderBottom"
                                        style={{ "--ef-dyn-borderBottom": i < snapshot.topScorers.length - 2 ? '1px solid var(--color-bg-deep)' : 'none' }}
                                    >
                                        <span>
                                            <strong className="ef-text-muted">{i + 2}.</strong>{' '}
                                            {p.name} ({p.position} · OVR {p.ovr})
                                        </span>
                                        <span>
                                            <strong
                                                style={{ "--ef-dyn-color": 'var(--color-success-mid)' }}
                                                className="ef-dyn-color">{p.goals}G</strong>{' '}
                                            <span className="ef-text-muted">
                                                {p.assists}A · {p.apps}j
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Last seasons compact */}
                    {snapshot.seasons.length > 0 && (
                        <div className="cip-seasons">
                            <div className="ef-text-xs-muted">
                                <Calendar size={12} weight="fill" className="ef-icon-inline" />ÚLTIMAS {snapshot.seasons.length} TEMPORADAS
                            </div>
                            <div className="cip-seasons-wrap">
                                {snapshot.seasons.map((s, i) => {
                                    const div = DIV_NAMES[s.division] || `D${s.division}`;
                                    let TitleIcon = null;
                                    if (s.title === 'Promovido') TitleIcon = ArrowUp;
                                    else if (s.title?.startsWith('Campeão')) TitleIcon = Trophy;
                                    else if (s.title === 'Rebaixado') TitleIcon = ArrowDown;
                                    return (
                                        <div key={i}
                                            className={`cip-season-chip ${TitleIcon ? 'cip-season-chip--highlight' : 'cip-season-chip--normal'}`}
                                            title={s.title || s.record}
                                        >
                                            {TitleIcon && <TitleIcon
                                                size={10}
                                                weight="fill"
                                                style={{"--ef-dyn-verticalAlign": '-1px',"--ef-dyn-marginRight": '3px'}}
                                                className="ef-dyn-verticalAlign ef-dyn-marginRight" />}{div}· {s.position}º
                                                                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </EfPanel>
    );
}
