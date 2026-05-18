import { EfButton } from '../ui/EfButton';
import { ShoppingCart, CurrencyDollar, Gavel, GlobeHemisphereWest } from '@phosphor-icons/react';

export function MarketTabs({ tab, setTab, activeAuctionsCount }) {
    return (
        <div className="ef-market__tabs">
            <EfButton className="ef-market__tab-button" variant={tab === 'buy' ? 'primary' : 'secondary'} size="lg" onClick={() => setTab('buy')}>
                <ShoppingCart size={20} /> COMPRAR
            </EfButton>
            <EfButton className="ef-market__tab-button" variant={tab === 'sell' ? 'primary' : 'secondary'} size="lg" onClick={() => setTab('sell')}>
                <CurrencyDollar size={20} /> VENDER
            </EfButton>
            <EfButton className="ef-market__tab-button" variant={tab === 'auction' ? 'primary' : 'secondary'} size="lg" onClick={() => setTab('auction')}>
                <Gavel size={20} /> LEILÃO
                {activeAuctionsCount > 0 && <span className="ef-market__tab-badge">{activeAuctionsCount}</span>}
            </EfButton>
            <EfButton className="ef-market__tab-button" variant={tab === 'scout' ? 'primary' : 'secondary'} size="lg" onClick={() => setTab('scout')}>
                <GlobeHemisphereWest size={20} /> SCOUTING
            </EfButton>
        </div>
    );
}
