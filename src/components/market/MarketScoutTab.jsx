import { GlobeHemisphereWest, Users } from '@phosphor-icons/react';
import { SCOUT_REGIONS } from '../../engine/StadiumSystem';
import { PlayerAvatar } from '../../utils/avatar';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function MarketScoutTab({ engine, handleScout, setLog, forceUpdate }) {
    return (
        <EfPanel variant="default" padding="md">
            <div className="ef-market__section-title">
                <GlobeHemisphereWest size={20} /> AGÊNCIA DE SCOUTING (OLHEIROS)
            </div>
            <div className="ef-market__scout-grid">
                {SCOUT_REGIONS.map(r => (
                    <EfButton key={r.id} className="ef-market__scout-button" variant="secondary" size="lg" title={`Manda olheiro para ${r.name} (custo R$ ${(r.cost/1000).toFixed(0)}K, debita do caixa, retorna lista de jogadores)`} onClick={() => handleScout(r.id)}>
                        <span className="ef-market__scout-emoji" aria-hidden="true">{r.emoji}</span>
                        <div className="ef-market__scout-info">
                            <div className="ef-sans ef-market__scout-region-name">{r.name.toUpperCase()}</div>
                            <div className="ef-mono ef-market__scout-cost">CUSTO: R$ {(r.cost/1000).toFixed(0)}K</div>
                        </div>
                    </EfButton>
                ))}
            </div>

            {engine.scoutedPlayers?.length > 0 && (
                <div className="ef-market__scouted-section">
                    <div className="ef-market__scouted-title">
                        <Users size={16} /> JOGADORES ENCONTRADOS
                    </div>
                    <div className="ef-market__scouted-list">
                        {engine.scoutedPlayers.map((p, i) => (
                            <div key={i} className="ef-anim-fade-in ef-list-row ef-list-row--primary">
                                <div className="ef-market__player-info">
                                    <PlayerAvatar name={p.name} size={40} />
                                    <div className="ef-market__player-details">
                                        <div className="ef-player-name">
                                            {p.name.toUpperCase()}
                                        </div>
                                        <div className="ef-player-meta">
                                            <span className="ef-pos-badge">{p.position}</span>
                                            <span>OVR <strong className={p.ovr >= 80 ? 'ef-text-accent' : 'ef-text-main'}>{p.ovr}</strong></span>
                                            <span>•</span>
                                            <span>{p.age} ANOS</span>
                                        </div>
                                    </div>
                                </div>
                                <EfButton variant="primary" size="md" title={`Assina ${p.name} direto (debita valor do caixa e gera salário semanal)`} onClick={() => {
                                    const result = engine.signScoutedPlayer(i);
                                    setLog(result?.msg.toUpperCase() || 'CONTRATADO!');
                                    forceUpdate();
                                }}>CONTRATAR</EfButton>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </EfPanel>
    );
}
