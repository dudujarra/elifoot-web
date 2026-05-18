import { Lightning, Brain, ShoppingCart, Storefront } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function PlayerDashboardStatusBar({ player, stressColor, handleRest, handleBuyDrink, handleUseDrink }) {
    return (
        <EfPanel padding="md" className="ef-player-dashboard__status-bar">
            <div className="ef-player-dashboard__status-cells">
                <div className="ef-player-dashboard__overview-cell">
                    <span className={`ef-player-dashboard__cell-value ${player.energy < 30 ? 'ef-player-dashboard__cell-value--critical' : 'ef-player-dashboard__cell-value--healthy'}`}>
                        <Lightning weight="fill" /> {player.energy}%
                    </span>
                    <span className="ef-player-dashboard__cell-label">ENERGIA</span>
                </div>
                <div className="ef-player-dashboard__overview-cell">
                    {/* eslint-disable-next-line no-restricted-syntax -- dynamic stress color */}
                    <span className="ef-player-dashboard__cell-value" style={{ color: stressColor }}>
                        <Brain weight="fill" /> {player.stress}%
                    </span>
                    <span className="ef-player-dashboard__cell-label">STRESS</span>
                </div>
                <div className="ef-player-dashboard__overview-cell">
                    <span className="ef-player-dashboard__cell-value ef-text-info">
                        <Storefront weight="fill" /> {player.energyDrinks}
                    </span>
                    <span className="ef-player-dashboard__cell-label">ENERGÉTICOS</span>
                </div>
            </div>
            <div className="ef-player-dashboard__status-actions">
                <EfButton variant="secondary" size="sm" onClick={handleRest} disabled={!player.canAct}>
                    <Lightning /> DESCANSAR
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={handleBuyDrink}>
                    <ShoppingCart /> COMPRAR (R$100)
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={handleUseDrink} disabled={player.energyDrinks <= 0}>
                    <Storefront /> USAR BEBIDA
                </EfButton>
            </div>
        </EfPanel>
    );
}
