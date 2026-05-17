/**
 * BrainDashboard — Visual ML Dashboard for AutoPlay
 *
 * Shows what the AdaptiveBrain is learning:
 * - Personality traits (OCEAN-derived)
 * - Q-Table stats
 * - Learning curve (reward sparkline)
 * - Action distribution (bar chart)
 * - State exploration map
 * - Episodic memory timeline
 */

import { useState, useMemo, useEffect } from 'react';
import { EfPanel } from '../ui/EfPanel';
import { Brain, ChartBar, Lightning, Trophy, TrendUp } from '@phosphor-icons/react';
import '../../styles/brain-dashboard.css';

// Colors for bar visualization
const BAR_COLORS = [
    'var(--color-success-mid)', 'var(--color-learning-blue)', 'var(--color-amber-warning)', 'var(--color-red-bright)', 'var(--color-learning-violet)',
    'var(--color-learning-teal)', 'var(--color-learning-orange)', 'var(--color-learning-pink)', 'var(--color-learning-cyan)', 'var(--color-learning-lime)'
];

const EMPTY = {
    qTable: {}, visitCount: {}, totalUpdates: 0,
    memory: [], traits: {}, archetypeLabel: 'Bot',
    topActions: [], decisions: [],
    replayBuffer: 0, replayImpactful: 0,
    activeTraces: 0, emotionalState: 'CALM',
    effectiveAlpha: 0.1, effectiveEpsilon: 0.15,
};

export function BrainDashboard({ controllerRef }) {
    const [expanded, setExpanded] = useState(true);
    const [brainData, setBrainData] = useState(EMPTY);

    // Poll brain data every 500ms (safe ref access inside effect)
    useEffect(() => {
        const interval = setInterval(() => {
            const ctrl = controllerRef?.current;
            if (!ctrl?.brain) return;
            const b = ctrl.brain;
            setBrainData({
                qTable: b.qTable || {},
                visitCount: b.visitCount || {},
                totalUpdates: b.totalUpdates || 0,
                memory: b.memory || [],
                traits: b.personality?.traits || b.personality?.ocean || {},
                archetypeLabel: b.personality?.label || b.personality?.id || 'Bot',
                topActions: typeof b.topActions === 'function' ? b.topActions(10) : [],
                decisions: ctrl.stats?.decisions || [],
                // Phase D convergence metrics
                replayBuffer: b.replayBuffer?.length || 0,
                replayImpactful: b.replayBuffer?.filter?.(e => Math.abs(e.r) > 3)?.length || 0,
                activeTraces: Object.values(b.traces || {}).reduce((s, t) => s + Object.keys(t).length, 0),
                emotionalState: b.emotions?.state || 'CALM',
                effectiveAlpha: Math.max(0.01, 0.1 / (1 + (b.totalUpdates || 0) * 0.0001)),
                effectiveEpsilon: (() => {
                    const maxVisits = Math.max(1, ...Object.values(b.visitCount || {}).map(Number).filter(n => !isNaN(n)));
                    return Math.max(0.02, 0.15 / (1 + maxVisits * 0.03));
                })(),
            });
        }, 500);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ALL hooks MUST be called before any early return (Rules of Hooks)
    const { qTable, visitCount, totalUpdates, memory, traits, archetypeLabel, topActions, decisions,
            replayBuffer, replayImpactful, activeTraces, emotionalState,
            effectiveAlpha, effectiveEpsilon } = brainData;
    const stateKeys = Object.keys(qTable);

    const actionFreq = useMemo(() => {
        const freq = {};
        (decisions || []).forEach(d => {
            freq[d.action] = (freq[d.action] || 0) + 1;
        });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);
    }, [decisions]);

    const totalDecisions = actionFreq.reduce((s, [, n]) => s + n, 0);

    const stateVisits = useMemo(() => {
        return stateKeys
            .map(k => ({ state: k, visits: visitCount[k] || 0 }))
            .sort((a, b) => b.visits - a.visits);
    }, [stateKeys.length, totalUpdates]); // eslint-disable-line react-hooks/exhaustive-deps

    const rewardHistory = useMemo(() => {
        return (memory || [])
            .filter(m => m.reward != null)
            .map((m, i) => ({ idx: i, reward: m.reward, action: m.action || m.decision || '?', week: m.week }));
    }, [memory]);

    const cumulativeReward = useMemo(() => {
        let total = 0;
        return rewardHistory.map(r => { total += r.reward; return total; });
    }, [rewardHistory]);

    const allQValues = stateKeys.flatMap(s => Object.values(qTable[s] || {}));
    const qMin = allQValues.length > 0 ? Math.min(...allQValues) : 0;
    const qMax = allQValues.length > 0 ? Math.max(...allQValues) : 1;
    const allActions = [...new Set(stateKeys.flatMap(s => Object.keys(qTable[s] || {})))].sort();

    // Now safe to early return — all hooks called above
    if (totalUpdates === 0 && stateKeys.length === 0 && decisions.length === 0) return null;

    const emotionColor =
        emotionalState === 'CALM' ? 'var(--color-success-mid)' :
        emotionalState === 'CONFIDENT' ? 'var(--color-learning-blue)' :
        emotionalState === 'ANXIOUS' ? 'var(--color-amber-warning)' :
        emotionalState === 'TILTED' ? 'var(--color-red-bright)' :
        emotionalState === 'DESPERATE' ? 'var(--color-learning-red-dark)' : 'var(--text-muted)';

    return (
        <EfPanel variant="elev" padding="md" className="bd-card--mb">
            <div className="bd-header" onClick={() => setExpanded(!expanded)}>
                <h3>
                    <Brain size={14} weight="fill" className="ef-icon-inline-md" />Brain ML Dashboard
                    <span className="bd-header-meta">
                        {totalUpdates} updates • {stateKeys.length} states • {allActions.length} actions
                    </span>
                </h3>
                <span className="bd-toggle">{expanded ? '▼' : '▶'}</span>
            </div>

            {expanded && (
                <div className="bd-body">
                    {/* Row 1: Personality + Overview */}
                    <div className="bd-row-2col">
                        {/* Personality */}
                        <div className="bd-card">
                            <div className="bd-card-title">[P] Personalidade — {String(archetypeLabel)}</div>
                            <div className="bd-traits">
                                {Object.entries(traits).map(([trait, val]) => {
                                    if (typeof val !== 'number') return null;
                                    const pct = Math.round(val * 100);
                                    return (
                                        <div key={trait} className="bd-trait-row">
                                            <div className="bd-trait-header">
                                                <span className="bd-trait-name">{String(trait)}</span>
                                                <span className="bd-trait-value">{pct}%</span>
                                            </div>
                                            <div className="bd-bar-bg">
                                                <div className="bd-bar-fill" style={{ width: `${pct}%`, background: traitColor(trait) }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Learning Overview */}
                        <div className="bd-card">
                            <div className="bd-card-title"><ChartBar size={12} weight="bold" className="ef-icon-inline" />Aprendizado</div>
                            <div className="bd-stats-grid">
                                <MiniStat label="Q Updates" value={totalUpdates} />
                                <MiniStat label="States" value={stateKeys.length} />
                                <MiniStat label="Actions" value={allActions.length} />
                                <MiniStat label="Memórias" value={memory.length} />
                                <MiniStat label="Q min" value={qMin.toFixed(1)} color="var(--color-red-bright)" />
                                <MiniStat label="Q max" value={qMax.toFixed(1)} color="var(--color-success-mid)" />
                                <MiniStat label="Reward média"
                                    value={rewardHistory.length > 0
                                        ? (rewardHistory.reduce((s, r) => s + r.reward, 0) / rewardHistory.length).toFixed(1)
                                        : '—'}
                                    color="var(--color-learning-blue)" />
                                <MiniStat label="Reward acum."
                                    value={cumulativeReward.length > 0
                                        ? cumulativeReward[cumulativeReward.length - 1].toFixed(0)
                                        : '0'}
                                    color={cumulativeReward.length > 0 && cumulativeReward[cumulativeReward.length - 1] > 0 ? 'var(--color-success-mid)' : 'var(--color-red-bright)'} />
                            </div>
                        </div>
                    </div>

                    {/* Row 1.5: Convergence Metrics (Phase D) */}
                    <div className="bd-card bd-card--mb">
                        <div className="bd-card-title"><Lightning size={12} weight="fill" className="ef-icon-inline" />Convergência ML (Fase D)</div>
                        <div className="bd-row-4col">
                            <MiniStat label="Replay Buffer" value={replayBuffer} color="var(--color-learning-violet)" />
                            <MiniStat label="High Impact" value={replayImpactful} color="var(--color-amber-warning)" />
                            <MiniStat label="Active Traces" value={activeTraces} color="var(--color-learning-blue)" />
                            <MiniStat label="Emotional" value={emotionalState} color={emotionColor} />
                        </div>
                        <div className="bd-convergence-bars">
                            {/* Alpha decay bar */}
                            <div className="bd-decay-block">
                                <div className="bd-decay-header">
                                    <span className="ef-text-muted">α (learning rate)</span>
                                    <span className="bd-alpha-value">{effectiveAlpha.toFixed(4)}</span>
                                </div>
                                <div className="bd-bar-bg">
                                    <div className="bd-bar-fill" style={{ width: `${(effectiveAlpha / 0.1) * 100}%`, background: 'var(--color-learning-teal)' }} />
                                </div>
                            </div>
                            {/* Epsilon decay bar */}
                            <div className="bd-decay-block">
                                <div className="bd-decay-header">
                                    <span className="ef-text-muted">ε (exploration)</span>
                                    <span className="bd-epsilon-value">{effectiveEpsilon.toFixed(4)}</span>
                                </div>
                                <div className="bd-bar-bg">
                                    <div className="bd-bar-fill" style={{ width: `${(effectiveEpsilon / 0.15) * 100}%`, background: 'var(--color-learning-pink)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Action Distribution (visual bar chart) */}
                    <div className="bd-card bd-card--mb">
                        <div className="bd-card-title">[=] Distribuição de Ações ({totalDecisions} total)</div>
                        <div className="bd-actions-list">
                            {actionFreq.map(([action, count], i) => {
                                const pct = totalDecisions > 0 ? (count / totalDecisions) * 100 : 0;
                                return (
                                    <div key={action} className="bd-action-row">
                                        <span className="bd-action-label">{String(action)}</span>
                                        <div className="bd-bar-bg bd-bar-bg--tall" style={{ flex: 1 }}>
                                            <div
                                                className="bd-bar-fill--tall"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: BAR_COLORS[i % BAR_COLORS.length],
                                                    minWidth: pct > 5 ? 'auto' : '0'
                                                }}
                                            >
                                                {pct > 8 ? `${pct.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                        <span className="bd-action-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Row 3: Q-Value Rankings + Reward Curve */}
                    <div className="bd-row-2col">
                        {/* Top Q-Value Actions */}
                        <div className="bd-card">
                            <div className="bd-card-title"><Trophy size={12} weight="fill" className="ef-icon-inline" />Top Ações (Q-value total)</div>
                            {topActions.length === 0 && <div className="ef-text-sm-muted">Sem dados — rode o autoplay</div>}
                            {topActions.map((a, i) => (
                                <div key={String(a.action)} className="bd-q-row">
                                    <span>{i + 1}. {String(a.action)}</span>
                                    <strong style={{ color: a.totalQ >= 0 ? 'var(--color-success-mid)' : 'var(--color-red-bright)' }}>
                                        {a.totalQ >= 0 ? '+' : ''}{Number(a.totalQ).toFixed(1)}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        {/* Reward Sparkline */}
                        <div className="bd-card">
                            <div className="bd-card-title"><TrendUp size={12} weight="bold" className="ef-icon-inline" />Reward Curve (últimas {rewardHistory.length} decisões)</div>
                            {rewardHistory.length === 0 && <div className="ef-text-sm-muted">Sem dados — rode o autoplay</div>}
                            {rewardHistory.length > 0 && (
                                <div className="bd-sparkline">
                                    {rewardHistory.slice(-30).map((r, i) => {
                                        const maxAbs = Math.max(1, ...rewardHistory.slice(-30).map(x => Math.abs(x.reward)));
                                        const normalized = r.reward / maxAbs;
                                        const height = Math.abs(normalized) * 50;
                                        return (
                                            <div
                                                key={i}
                                                className="bd-spark-bar"
                                                title={`wk${r.week}: ${r.action} → ${Number(r.reward).toFixed(1)}`}
                                                style={{
                                                    height: `${height}px`,
                                                    background: r.reward >= 0 ? 'var(--color-success-mid)' : 'var(--color-red-bright)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 4: State Exploration */}
                    <div className="bd-card bd-card--mb">
                        <div className="bd-card-title">[#] States Explorados ({stateVisits.length})</div>
                        <div className="bd-states-grid">
                            {stateVisits.slice(0, 30).map(sv => {
                                const maxVisits = stateVisits.length > 0 ? stateVisits[0].visits : 1;
                                const intensity = Math.min(1, sv.visits / Math.max(1, maxVisits));
                                return (
                                    <div
                                        key={sv.state}
                                        className="bd-state-chip"
                                        title={`${sv.state} — ${sv.visits} visitas`}
                                        style={{ color: intensity > 0.5 ? 'var(--text-main)' : 'var(--text-muted)' }}
                                    >
                                        {String(sv.state)} <strong>({sv.visits})</strong>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Row 5: Episodic Memory Timeline */}
                    <div className="bd-card">
                        <div className="bd-card-title">[~] Memória Episódica (últimas {Math.min(10, memory.length)})</div>
                        <div className="bd-memory-scroll">
                            {memory.slice(-10).reverse().map((m, i) => (
                                <div key={i} className="bd-memory-row">
                                    <span className="ef-text-muted">wk{m.week ?? '?'}</span>
                                    <span className="bd-memory-action">{String(m.action || m.decision || '?')}</span>
                                    <span style={{ color: m.result === 'W' ? 'var(--color-success-mid)' : m.result === 'L' ? 'var(--color-red-bright)' : 'var(--color-amber-warning)' }}>
                                        {String(m.result || '')}
                                    </span>
                                    {m.reward != null && (
                                        <strong className="bd-reward-badge" style={{ color: m.reward >= 0 ? 'var(--color-success-mid)' : 'var(--color-red-bright)' }}>
                                            {m.reward >= 0 ? '+' : ''}{Number(m.reward).toFixed(1)}
                                        </strong>
                                    )}
                                </div>
                            ))}
                            {memory.length === 0 && (
                                <div className="ef-text-sm-muted">
                                    Sem memórias — rode o autoplay
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </EfPanel>
    );
}

// Helper components
function MiniStat({ label, value, color }) {
    return (
        <div className="bd-mini-stat">
            <div className="bd-mini-stat__label">{String(label)}</div>
            <div className="bd-mini-stat__value" style={color ? { color } : undefined}>{String(value)}</div>
        </div>
    );
}

function traitColor(trait) {
    const map = {
        ambition: 'var(--color-amber-warning)',
        riskAversion: 'var(--color-red-bright)',
        riskAppetite: 'var(--color-red-bright)',
        loyalty: 'var(--color-learning-blue)',
        creativity: 'var(--color-learning-violet)',
        patience: 'var(--color-learning-teal)',
        temperament: 'var(--color-learning-teal)',
        tacticalFlex: 'var(--color-learning-violet)',
        O: 'var(--color-amber-warning)',
        C: 'var(--color-learning-blue)',
        E: 'var(--color-red-bright)',
        A: 'var(--color-learning-teal)',
        N: 'var(--color-learning-violet)',
    };
    return map[trait] || 'var(--color-success-mid)';
}

export default BrainDashboard;
