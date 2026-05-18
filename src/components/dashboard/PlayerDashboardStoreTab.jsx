// PlayerDashboardStoreTab
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Storefront, CheckCircle, User } from '@phosphor-icons/react';
import { TRAITS_CATALOG } from '../../engine/PlayerCareer';

export function PlayerDashboardStoreTab({ player, handleBuyTrait }) {
    return (
        <EfPanel padding="md">
            <div className="ef-sans ef-text-muted ef-player-dashboard__panel-title-row"><Storefront weight="fill" /> TRAITS ESPECIAIS</div>
            <div className="ef-player-dashboard__store-grid-2">
                {Object.entries(TRAITS_CATALOG).map(([id, t]) => {
                    const owned = player.traits?.includes(id);
                    const canAfford = player.money >= t.cost;
                    const bossOk = player.relationships.boss >= t.requiredBoss;
                    const disabled = owned || !canAfford || !bossOk;
                    const cardClass = `ef-shop-card${owned ? ' ef-shop-card--owned' : ''}${disabled && !owned ? ' ef-shop-card--disabled' : ''}`;
                    return (
                        <div key={id} className={cardClass}>
                            <div className="ef-sans ef-text-main ef-player-dashboard__store-card-title">
                                {owned && <CheckCircle weight="fill" size={14} className="ef-text-primary" />}
                                {t.name}
                            </div>
                            <div className="ef-sans ef-text-muted ef-player-dashboard__store-card-desc">{t.description}</div>
                            <div className="ef-mono ef-player-dashboard__store-card-footer">
                                <span className={canAfford ? 'ef-text-primary' : 'ef-text-danger'}>R$ {t.cost.toLocaleString('pt-BR')}</span>
                                <span className={`ef-player-dashboard__store-card-req ${bossOk ? 'ef-text-info' : 'ef-text-danger'}`}><User /> {t.requiredBoss}%</span>
                            </div>
                            <EfButton size="sm" variant={owned ? 'secondary' : 'primary'} onClick={() => handleBuyTrait(id)} disabled={disabled} className="ef-player-dashboard__store-card-btn">
                                {owned ? 'ADQUIRIDO' : !canAfford ? 'SEM DINHEIRO' : !bossOk ? 'CONFIANÇA BAIXA' : 'COMPRAR'}
                            </EfButton>
                        </div>
                    );
                })}
            </div>
        </EfPanel>
    );
}
