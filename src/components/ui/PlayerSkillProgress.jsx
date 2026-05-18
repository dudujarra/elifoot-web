import { EfPanel } from './EfPanel';
import { Target } from '@phosphor-icons/react';

export function PlayerSkillProgress({ player }) {
    return (
        <EfPanel padding="md" className="ef-player-dashboard__skillxp-panel">
            <div className="ef-sans ef-text-accent ef-player-dashboard__panel-title-row">
                <Target weight="fill" /> ATRIBUTOS PRINCIPAIS
            </div>
            <div className="ef-player-dashboard__skillxp-grid">
                {[
                    { key: 'technique', label: 'Técnica', color: 'var(--info)' },
                    { key: 'pace',      label: 'Velocidade', color: 'var(--primary)' },
                    { key: 'power',     label: 'Força', color: 'var(--danger)' },
                    { key: 'vision',    label: 'Visão', color: 'var(--accent)' }
                ].map((s) => {
                    const lvl = player.skills[s.key] ?? 0;
                    const prog = player.skillProgress?.[s.key] ?? 0;
                    return (
                        <div key={s.key} className="ef-player-dashboard__skill-row-mb">
                            <div className="ef-sans ef-text-main ef-player-dashboard__skill-head">
                                <span>{s.label}</span>
                                <span className="ef-mono">{lvl} <span className="ef-text-muted ef-player-dashboard__skill-xp">({prog}/100 XP)</span></span>
                            </div>
                            <div className="ef-bar">
                                <div className={`ef-bar__fill w-${Math.round(prog)} ef-dyn-background`} style={{
                                    "--ef-dyn-background": s.color
                                }}  />
                            </div>
                        </div>
                    );
                })}
            </div>
        </EfPanel>
    );
}
