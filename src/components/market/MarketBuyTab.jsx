import { Storefront, MagnifyingGlass, Funnel, ChartLineUp } from '@phosphor-icons/react';
import { PlayerAvatar } from '../../utils/avatar';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { PlayerAttributesGrid } from '../ui/PlayerAttributesGrid';

export function MarketBuyTab({ 
    filteredMarket, marketSearch, setMarketSearch, 
    marketFilter, setMarketFilter, marketSort, setMarketSort, 
    expandedPlayerId, setExpandedPlayerId, handleBuy, team 
}) {
    return (
        <EfPanel variant="default" padding="md">
            <div className="ef-market__section-title">
                <Storefront size={20} /> JOGADORES DISPONÍVEIS
            </div>

            <div className="ef-market__search-bar">
                <div className="ef-market__search-input-wrapper">
                    <MagnifyingGlass size={16} className="ef-market__search-input-icon" />
                    <input
                        type="text"
                        placeholder="NOME DO JOGADOR..."
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                        className="ef-mono ef-market__search-input"
                    />
                </div>
                <div className="ef-market__filter-wrapper">
                    <Funnel size={16} className="ef-market__filter-icon" />
                    <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="ef-mono ef-market__filter-select">
                        <option value="all">TODAS POS</option>
                        <option value="GOL">GOL</option>
                        <option value="DEF">DEF</option>
                        <option value="MEI">MEI</option>
                        <option value="ATA">ATA</option>
                    </select>
                </div>
                <div className="ef-market__sort-wrapper">
                    <ChartLineUp size={16} className="ef-market__sort-icon" />
                    <select value={marketSort} onChange={(e) => setMarketSort(e.target.value)} className="ef-mono ef-market__sort-select">
                        <option value="ovr">MAIOR OVR</option>
                        <option value="price">MAIOR PREÇO</option>
                        <option value="age">MAIS VELHO</option>
                        <option value="name">A-Z</option>
                    </select>
                </div>
            </div>

            {filteredMarket.length === 0 ? (
                <div className="ef-empty-state">
                    NENHUM JOGADOR ENCONTRADO.
                </div>
            ) : (
                <div className="ef-market__card-grid">
                    {filteredMarket.map(p => (
                                                <div key={p.id} className={`ef-anim-fade-in ef-market__player-card ${expandedPlayerId === p.id ? 'ef-dyn-grid-col' : ''}`} style={expandedPlayerId === p.id ? { '--ef-dyn-grid-col': '1 / -1' } : undefined}>
                            <div className="ef-market__card-top">
                                <div className="ef-market__card-portrait">
                                    <PlayerAvatar name={p.name} size={88} />
                                </div>
                                <div className="ef-market__card-stats">
                                    <div className={`ef-mono ef-market__card-ovr ${p.ovr >= 80 ? 'ef-market__card-ovr--elite' : ''}`}>
                                        {p.ovr}
                                    </div>
                                    <div className={`ef-mono ef-market__card-pos ef-market__card-pos--${p.position?.toLowerCase()}`}>
                                        {p.position}
                                    </div>
                                </div>
                            </div>
                            <div className="ef-market__card-identity">
                                <h3 className="ef-sans ef-market__card-name">{p.name.toUpperCase()}</h3>
                                <div className="ef-mono ef-market__card-meta">
                                    {p.age} ANOS
                                </div>
                            </div>
                            <div className="ef-market__card-footer">
                                <div className="ef-mono ef-market__card-price">
                                    R$ {(p.value / 1000000).toFixed(1)}M
                                </div>
                                <div className="ef-market__card-actions">
                                    <EfButton variant="secondary" size="md" title="Atributos Detalhados" onClick={() => setExpandedPlayerId(expandedPlayerId === p.id ? null : p.id)}>
                                        {expandedPlayerId === p.id ? 'OCULTAR' : 'DETALHES'}
                                    </EfButton>
                                    <EfButton variant="primary" size="md" title={`Compra ${p.name} por R$ ${(p.value / 1000000).toFixed(1)}M`} onClick={() => handleBuy(p)} disabled={team.balance < p.value}>
                                        COMPRAR
                                    </EfButton>
                                </div>
                            </div>
                            {expandedPlayerId === p.id && (
                                <div className="ef-market__card-details">
                                    <PlayerAttributesGrid player={p} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </EfPanel>
    );
}
