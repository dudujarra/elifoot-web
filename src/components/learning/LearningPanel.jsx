/**
 * LearningPanel — SPEC-123
 *
 * Real-time visualization of bot learning state.
 * Embedded in AutoPlayView. Polls controller every 1s.
 *
 * Sections:
 * - Q-table top actions (color-coded)
 * - Episodic memory log (scrollable)
 * - Win rate sparkline per season
 * - Brain stats (states, updates, total memory)
 */
import { useState, useEffect } from 'react';
import { EfPanel } from '../ui/EfPanel';
import { TrendUp } from '@phosphor-icons/react';

function Sparkline({ data, width = 200, height = 40, color = 'var(--color-success-mid)' }) {
    if (!Array.isArray(data) || data.length < 2) {
        return <div className="ef-text-sm-muted">need ≥2 data points</div>;
    }
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const points = data.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg
            width={width}
            height={height}
            style={{ "--ef-dyn-background": 'var(--color-shadow-deep)', }}
            className="ef-dyn-background">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
            />
        </svg>
    );
}

function ActionBar({ action, q, max }) {
    const positive = q >= 0;
    const widthPct = Math.min(100, (Math.abs(q) / Math.max(1, max)) * 100);
    return (
        <div
            style={{
                "--ef-dyn-display": 'flex',
                "--ef-dyn-alignItems": 'center',
                "--ef-dyn-gap": '6px',
                "--ef-dyn-fontSize": '0.7rem',
                "--ef-dyn-marginBottom": '2px'
            }}
            className="ef-dyn-display ef-dyn-alignItems ef-dyn-gap ef-dyn-fontSize ef-dyn-marginBottom">
            <div
                style={{ "--ef-dyn-minWidth": '120px', "--ef-dyn-fontFamily": 'var(--font-mono)' }}
                className="ef-dyn-minWidth ef-dyn-fontFamily">{action}</div>
            <div
                style={{
                    "--ef-dyn-flex": 1,
                    "--ef-dyn-background": 'var(--color-shadow-deep)',
                    "--ef-dyn-height": '12px',
                    "--ef-dyn-overflow": 'hidden'
                }}
                className="ef-dyn-flex ef-dyn-background ef-dyn-height ef-dyn-overflow">
                <div
                    style={{
                        "--ef-dyn-height": '100%',
                        "--ef-dyn-background": positive ? 'var(--color-success-mid)' : 'var(--danger)',
                        "--ef-dyn-transition": 'width 300ms'
                    }}
                    className={`w-${Math.round(widthPct)} ef-dyn-height ef-dyn-background ef-dyn-transition`} />
            </div>
            <div
                style={{
                    "--ef-dyn-minWidth": '50px',
                    "--ef-dyn-textAlign": 'right',
                    "--ef-dyn-color": positive ? 'var(--color-success-mid)' : 'var(--danger)',
                    "--ef-dyn-fontFamily": 'var(--font-mono)'
                }}
                className="ef-dyn-minWidth ef-dyn-textAlign ef-dyn-color ef-dyn-fontFamily">
                {positive ? '+' : ''}{q.toFixed(1)}
            </div>
        </div>
    );
}

function MemoryEntry({ entry }) {
    const reward = entry.reward;
    const color = reward > 0 ? 'var(--color-success-mid)' : reward < 0 ? 'var(--danger)' : 'var(--text-muted)';
    return (
        <div
            style={{
                "--ef-dyn-display": 'flex',
                "--ef-dyn-justifyContent": 'space-between',
                "--ef-dyn-fontSize": '0.7rem',
                "--ef-dyn-padding": '2px 4px',
                "--ef-dyn-borderBottom": '1px solid var(--color-bg-deep)',
                "--ef-dyn-fontFamily": 'var(--font-mono)'
            }}
            className="ef-dyn-display ef-dyn-justifyContent ef-dyn-fontSize ef-dyn-padding ef-dyn-borderBottom ef-dyn-fontFamily">
            <span>
                <strong>wk{entry.week ?? '?'}/s{entry.season ?? '?'}</strong>{' '}
                {entry.action || entry.decision || '—'}
            </span>
            <span style={{ "--ef-dyn-color": color }} className="ef-dyn-color">
                {entry.result || ''} {reward != null && (
                    <strong>{reward >= 0 ? '+' : ''}{reward.toFixed(1)}</strong>
                )}
            </span>
        </div>
    );
}

export default function LearningPanel({ controllerRef }) {
    const [snapshot, setSnapshot] = useState({
        brainSummary: null,
        memory: [],
        seasonHistory: []
    });
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const id = setInterval(() => {
            const c = controllerRef.current;
            if (!c) return;
            const stats = c.getStats?.();
            setSnapshot({
                brainSummary: c.brain?.summary?.() || null,
                memory: c.brain?.memory?.slice?.(-20) || [],
                seasonHistory: stats?.seasonHistory || []
            });
        }, 1000);
        return () => clearInterval(id);
    }, [controllerRef]);

    if (!snapshot.brainSummary) return null;

    const { brainSummary, memory, seasonHistory } = snapshot;
    const topActions = brainSummary.topActions || [];
    const maxAbsQ = topActions.reduce((m, a) => Math.max(m, Math.abs(a.totalQ || 0)), 1);
    const winSeries = seasonHistory.map(s => s.seasonWins || 0);
    const transferSeries = seasonHistory.map(s => s.seasonTransfers || 0);

    return (
        <EfPanel
            variant="sunk"
            padding="md"
            style={{
                "--ef-dyn-marginTop": '0.5rem',
                "--ef-dyn-background": 'var(--color-forest-pulse)',
                "--ef-dyn-border": '1px solid var(--color-success-mid)',
            }}
            className="ef-dyn-marginTop ef-dyn-background ef-dyn-border">
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    "--ef-dyn-cursor": 'pointer',
                    "--ef-dyn-fontWeight": 700,
                    "--ef-dyn-color": 'var(--color-success-mid)',
                    "--ef-dyn-display": 'flex',
                    "--ef-dyn-justifyContent": 'space-between',
                    "--ef-dyn-alignItems": 'center'
                }}
                className="ef-dyn-cursor ef-dyn-fontWeight ef-dyn-color ef-dyn-display ef-dyn-justifyContent ef-dyn-alignItems">
                <span><TrendUp size={14} weight="bold" className="ef-icon-inline-md" />LEARNING REAL-TIME (SPEC-123) {open ? '▼' : '▶'}</span>
                <span
                    style={{ "--ef-dyn-fontSize": '0.72rem', "--ef-dyn-color": 'var(--text-muted)' }}
                    className="ef-dyn-fontSize ef-dyn-color">
                    {brainSummary.states} states · {brainSummary.totalUpdates} upd · {memory.length} mem
                    {brainSummary.replayBuffer > 0 && ` · ${brainSummary.replayBuffer} replay`}
                    {brainSummary.activeTraces > 0 && ` · ${brainSummary.activeTraces} traces`}
                </span>
            </div>
            {open && (
                <>
                    {/* Win/Transfer sparklines */}
                    {seasonHistory.length >= 2 && (
                        <div
                            style={{ "--ef-dyn-display": 'flex', "--ef-dyn-gap": '12px', "--ef-dyn-marginTop": '8px', "--ef-dyn-flexWrap": 'wrap' }}
                            className="ef-dyn-display ef-dyn-gap ef-dyn-marginTop ef-dyn-flexWrap">
                            <div>
                                <div
                                    style={{ "--ef-dyn-fontSize": '0.7rem', "--ef-dyn-color": 'var(--text-muted)', "--ef-dyn-marginBottom": '2px' }}
                                    className="ef-dyn-fontSize ef-dyn-color ef-dyn-marginBottom">
                                    Wins per season ({seasonHistory.length} samples)
                                </div>
                                <Sparkline data={winSeries} color="var(--color-success-mid)" />
                            </div>
                            <div>
                                <div
                                    style={{ "--ef-dyn-fontSize": '0.7rem', "--ef-dyn-color": 'var(--text-muted)', "--ef-dyn-marginBottom": '2px' }}
                                    className="ef-dyn-fontSize ef-dyn-color ef-dyn-marginBottom">
                                    Transfers per season
                                </div>
                                <Sparkline data={transferSeries} color="var(--accent)" />
                            </div>
                        </div>
                    )}

                    {/* Top Q-actions */}
                    {topActions.length > 0 && (
                        <div style={{ "--ef-dyn-marginTop": '12px' }} className="ef-dyn-marginTop">
                            <div className="ef-text-xs-muted">
                                Top actions Q-values:
                            </div>
                            {topActions.slice(0, 5).map((a, i) => (
                                <ActionBar key={i} action={a.action} q={a.totalQ || 0} max={maxAbsQ} />
                            ))}
                        </div>
                    )}

                    {/* Episodic memory */}
                    {memory.length > 0 && (
                        <div style={{ "--ef-dyn-marginTop": '12px' }} className="ef-dyn-marginTop">
                            <div className="ef-text-xs-muted">
                                Recent memories (last {memory.length}):
                            </div>
                            <div
                                style={{
                                    "--ef-dyn-maxHeight": '160px',
                                    "--ef-dyn-overflowY": 'auto',
                                    "--ef-dyn-background": 'var(--color-shadow-deep)',
                                    "--ef-dyn-padding": '4px'
                                }}
                                className="ef-dyn-maxHeight ef-dyn-overflowY ef-dyn-background ef-dyn-padding">
                                {memory.slice().reverse().map((m, i) => (
                                    <MemoryEntry key={i} entry={m} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </EfPanel>
    );
}
