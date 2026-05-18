// PlayerDashboardLifestyleTab
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { House, Car, Heart, Smiley, CheckCircle } from '@phosphor-icons/react';
import { LIFESTYLE_CATALOG } from '../../engine/PlayerCareer';

export function PlayerDashboardLifestyleTab({ player, handleBuyLifestyle }) {
    return (
        <EfPanel padding="md">
            <div className="ef-sans ef-text-muted ef-player-dashboard__panel-title-row"><House weight="fill" /> LIFESTYLE & BENS</div>
            <div className="ef-sans ef-text-main ef-player-dashboard__lifestyle-status-row">
                <span className="ef-player-dashboard__lifestyle-item-row"><House color="var(--info)" weight="fill" /> {player.lifestyle?.ownedHouse ? LIFESTYLE_CATALOG[player.lifestyle.ownedHouse]?.name : 'Sem casa'}</span>
                <span className="ef-player-dashboard__lifestyle-item-row"><Car color="var(--accent)" weight="fill" /> {player.lifestyle?.ownedCar ? LIFESTYLE_CATALOG[player.lifestyle.ownedCar]?.name : 'Sem carro'}</span>
                <span className="ef-player-dashboard__lifestyle-item-row"><Heart color="var(--danger)" weight="fill" /> {player.lifestyle?.isMarried ? 'Casado' : 'Solteiro'}</span>
                <span className="ef-player-dashboard__lifestyle-item-row"><Smiley color="var(--primary)" weight="fill" /> Mood {player.lifestyle?.mood ?? 50}%</span>
            </div>
            <div className="ef-player-dashboard__lifestyle-grid-2">
                {Object.entries(LIFESTYLE_CATALOG).map(([id, it]) => {
                    const owned = (it.type === 'house' && player.lifestyle?.ownedHouse === id) ||
                                  (it.type === 'car' && player.lifestyle?.ownedCar === id) ||
                                  (it.type === 'event' && id === 'wedding' && player.lifestyle?.isMarried);
                    const canAfford = player.money >= it.cost;
                    const disabled = owned || !canAfford;
                    const cardClass = `ef-shop-card${owned ? ' ef-shop-card--owned' : ''}${disabled && !owned ? ' ef-shop-card--disabled' : ''}`;
                    return (
                        <div key={id} className={cardClass}>
                            <div className="ef-sans ef-text-main ef-player-dashboard__lifestyle-card-title">
                                <span aria-hidden>{it.emoji}</span>
                                {owned && <CheckCircle weight="fill" size={14} className="ef-text-primary" />}
                                {it.name}
                            </div>
                            <div className={`ef-mono ef-player-dashboard__lifestyle-cost ${canAfford ? 'ef-text-primary' : 'ef-text-danger'}`}>R$ {it.cost.toLocaleString('pt-BR')}</div>
                            <EfButton size="sm" variant={owned ? 'secondary' : 'primary'} onClick={() => handleBuyLifestyle(id)} disabled={disabled} className="ef-player-dashboard__store-card-btn">
                                {owned ? 'ADQUIRIDO' : !canAfford ? 'SEM DINHEIRO' : it.oneShot ? 'FAZER' : 'COMPRAR'}
                            </EfButton>
                        </div>
                    );
                })}
            </div>
        </EfPanel>
    );
}
