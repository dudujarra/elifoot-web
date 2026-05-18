// PlayerDashboardSkillsTab
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { TrendUp, Target, Lightning, Heartbeat, Brain, ChartBar } from '@phosphor-icons/react';
import { SUB_ATTRIBUTES } from '../../engine/PlayerCareer';

export function PlayerDashboardSkillsTab({ player, handleTrain, showSubAttrs, setShowSubAttrs, handleTrainSubAttr }) {
    return (
        <div className="ef-player-dashboard__col-stack">
            <EfPanel padding="md">
                <div className="ef-sans ef-text-muted ef-player-dashboard__panel-title-row"><TrendUp weight="fill" /> TREINAMENTO PRINCIPAL</div>
                <div className="ef-player-dashboard__training-grid">
                    <EfButton variant="primary" size="lg" onClick={() => handleTrain('technique')} disabled={!player.canAct} className="ef-player-dashboard__training-btn">
                        <Target size={24} /> <span>TÉCNICA</span>
                    </EfButton>
                    <EfButton variant="primary" size="lg" onClick={() => handleTrain('pace')} disabled={!player.canAct} className="ef-player-dashboard__training-btn">
                        <Lightning size={24} /> <span>VELOCIDADE</span>
                    </EfButton>
                    <EfButton variant="primary" size="lg" onClick={() => handleTrain('power')} disabled={!player.canAct} className="ef-player-dashboard__training-btn">
                        <Heartbeat size={24} /> <span>FORÇA</span>
                    </EfButton>
                    <EfButton variant="primary" size="lg" onClick={() => handleTrain('vision')} disabled={!player.canAct} className="ef-player-dashboard__training-btn">
                        <Brain size={24} /> <span>VISÃO</span>
                    </EfButton>
                </div>
            </EfPanel>
            <EfPanel padding="md">
                <div className="ef-player-dashboard__subattr-header-row">
                    <div className="ef-sans ef-text-muted ef-player-dashboard__subattr-title"><ChartBar weight="fill" /> SUB-ATRIBUTOS ESPECÍFICOS</div>
                    <EfButton size="sm" variant="secondary" onClick={() => setShowSubAttrs(!showSubAttrs)}>{showSubAttrs ? 'OCULTAR' : 'MOSTRAR'}</EfButton>
                </div>
                {showSubAttrs && player.subAttrs && (
                    <div className="ef-player-dashboard__subattrs-grid">
                        {Object.entries(SUB_ATTRIBUTES).map(([base, subs]) => (
                            <div key={base} className="ef-player-dashboard__subattr-cat">
                                <div className="ef-sans ef-text-accent ef-player-dashboard__subattr-cat-title">{base}</div>
                                {subs.map(sub => {
                                    const lvl = player.subAttrs[sub] ?? 0;
                                    const prog = player.subAttrProgress?.[sub] ?? 0;
                                    return (
                                        <div key={sub} className="ef-player-dashboard__subattr-item-mb">
                                            <div className="ef-sans ef-text-main ef-player-dashboard__subattr-item-head">
                                                <span>{sub} <strong className="ef-mono ef-text-info">{lvl}</strong></span>
                                                <EfButton size="sm" variant="secondary" onClick={() => handleTrainSubAttr(sub)} disabled={!player.canAct} className="ef-player-dashboard__subattr-train-btn">TREINAR</EfButton>
                                            </div>
                                            <div className="ef-bar ef-bar--xs">
                                                {}
                                                <div className={`ef-bar__fill w-${Math.round(prog)}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </EfPanel>
        </div>
    );
}
