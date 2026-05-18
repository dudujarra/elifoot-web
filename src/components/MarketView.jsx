import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { MarketProvider, useMarket } from '../context/MarketContext';
import { MarketBuyTab } from './market/MarketBuyTab';
import { MarketSellTab } from './market/MarketSellTab';
import { MarketAuctionTab } from './market/MarketAuctionTab';
import { MarketScoutTab } from './market/MarketScoutTab';
import { MarketHeader } from './market/MarketHeader';
import { MarketFinances } from './market/MarketFinances';
import { MarketTabs } from './market/MarketTabs';
import { MarketToast } from './market/MarketToast';
import '../styles/market-view.css';

function MarketViewContent() {
    const { changeView, getDashboardView, getEngine, forceUpdate } = useGame();
    const { team, log, setLog, handleBuy, handleSell, handleScout } = useMarket();
    const engine = getEngine();
    
    const [tab, setTab] = useState('buy');
    const [negotiation, setNegotiation] = useState(null);
    const [marketFilter, setMarketFilter] = useState('all');
    const [marketSort, setMarketSort] = useState('ovr');
    const [marketSearch, setMarketSearch] = useState('');
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);

    const confirmSell = () => {
        if (!negotiation) return;
        handleSell(negotiation.player.id, negotiation.counterAmount);
        setNegotiation(null);
    };

    const handleSellInit = (player) => {
        const value = player.ovr * 100000;
        setNegotiation({ player, round: 0, counterAmount: value, msg: `VALOR DE MERCADO: R$ ${(value / 1000000).toFixed(1)}M. DESEJA VENDER?` });
    };

    const filteredMarket = useMemo(() => {
        const sorts = {
            ovr: (a, b) => b.ovr - a.ovr,
            price: (a, b) => (b.value || 0) - (a.value || 0),
            age: (a, b) => b.age - a.age,
            name: (a, b) => a.name.localeCompare(b.name)
        };
        let market = [...(engine.marketPlayers || [])];
        if (marketFilter !== 'all') market = market.filter(p => p.position === marketFilter);
        if (marketSearch.trim()) {
            const q = marketSearch.toLowerCase();
            market = market.filter(p => p.name.toLowerCase().includes(q));
        }
        market.sort(sorts[marketSort] || sorts.ovr);
        return market;
    }, [engine.marketPlayers, marketFilter, marketSearch, marketSort]);

    const sellable = useMemo(() => {
        if (!team) return [];
        return team.squad.filter(p => !p.isTitular && !p.injury).sort((a, b) => b.ovr - a.ovr);
    }, [team]);

    if (!team) return null;

    return (
        <div className="ef-anim-fade-in ef-layout-pitch">
            <div className="ef-layout-container ef-market__container">
                <MarketHeader team={team} changeView={changeView} getDashboardView={getDashboardView} />
                <MarketFinances balance={team.balance} squadSize={team.squad.length} />
                <MarketToast log={log} setLog={setLog} />
                <MarketTabs tab={tab} setTab={setTab} activeAuctionsCount={engine.activeAuctions?.length || 0} />

                {tab === 'buy' && <MarketBuyTab filteredMarket={filteredMarket} marketSearch={marketSearch} setMarketSearch={setMarketSearch} marketFilter={marketFilter} setMarketFilter={setMarketFilter} marketSort={marketSort} setMarketSort={setMarketSort} expandedPlayerId={expandedPlayerId} setExpandedPlayerId={setExpandedPlayerId} handleBuy={handleBuy} team={team} />}
                {tab === 'sell' && <MarketSellTab sellable={sellable} negotiation={negotiation} setNegotiation={setNegotiation} handleSell={handleSellInit} confirmSell={confirmSell} setLog={setLog} />}
                {tab === 'auction' && <MarketAuctionTab engine={engine} team={team} setLog={setLog} forceUpdate={forceUpdate} />}
                {tab === 'scout' && <MarketScoutTab engine={engine} handleScout={handleScout} setLog={setLog} forceUpdate={forceUpdate} />}
            </div>
        </div>
    );
}

export function MarketView() {
    return (
        <MarketProvider>
            <MarketViewContent />
        </MarketProvider>
    );
}

