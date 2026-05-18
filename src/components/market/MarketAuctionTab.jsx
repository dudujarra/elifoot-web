import { Gavel, Star, Timer, ArrowUp } from '@phosphor-icons/react';
import { PlayerAvatar } from '../../utils/avatar';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function MarketAuctionTab({ engine, team, setLog, forceUpdate }) {
    return (
        <EfPanel variant="default" padding="md">
            <div className="ef-market__section-title">
                <Gavel size={20} /> LEILÕES ATIVOS
            </div>

            {(!engine.activeAuctions || engine.activeAuctions.length === 0) ? (
                <div className="ef-auction__empty">
                    <Star size={48} className="ef-auction__empty-icon" />
                    <div className="ef-auction__empty-text">
                        NENHUM LEILÃO ATIVO
                    </div>
                    <div className="ef-auction__empty-hint">
                        Jogadores com OVR ≥ 78 são automaticamente enviados a leilão ao tentar comprar.
                    </div>
                </div>
            ) : (
                <div className="ef-auction">
                    {engine.activeAuctions.map(auction => {
                        const allBids = [
                            { teamName: team.name, bid: auction.managerBid, isMine: true },
                            ...(auction.npcBids || []).map(b => ({ ...b, isMine: false })),
                        ].sort((a, b) => b.bid - a.bid);

                        const highestBid = allBids[0]?.bid || 0;
                        const isWinning = auction.managerBid >= highestBid;
                        const weeksLeft = Math.max(0, (auction.weekResolves || 0) - (engine.currentWeek || 0));

                        return (
                            <div key={auction.id} className="ef-auction__card">
                                <div className="ef-auction__player-row">
                                    <PlayerAvatar name={auction.playerName} size={64} />
                                    <div className="ef-auction__player-info">
                                        <div className="ef-auction__player-name">{auction.playerName}</div>
                                        <div className="ef-auction__player-meta">
                                            <span className="ef-pos-badge">{auction.playerPosition}</span>
                                            <span>Valor: R$ {((auction.playerValue || 0) / 1_000_000).toFixed(1)}M</span>
                                        </div>
                                    </div>
                                    <div className="ef-auction__ovr">{auction.playerOvr}</div>
                                </div>

                                <div className="ef-auction__bids-section">
                                    <div className="ef-auction__bid-title">LANCES</div>
                                    {allBids.map((b, i) => {
                                        const isHighest = b.bid === highestBid;
                                        let mod = '';
                                        if (b.isMine) mod = isHighest ? ' ef-auction__bid-row--winning' : ' ef-auction__bid-row--losing';
                                        else if (isHighest) mod = ' ef-auction__bid-row--winning';

                                        return (
                                            <div key={i} className={`ef-auction__bid-row${b.isMine ? ' ef-auction__bid-row--mine' : ''}${mod}`}>
                                                <span className="ef-auction__bid-team">
                                                    {b.isMine ? `${b.teamName} (VOCÊ)` : b.teamName}
                                                </span>
                                                <span className="ef-auction__bid-value">
                                                    R$ {(b.bid / 1_000_000).toFixed(1)}M
                                                    {isHighest && ' [TOP]'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="ef-auction__raise-form">
                                    <EfButton
                                        variant="primary"
                                        size="md"
                                        onClick={() => {
                                            const newBid = Math.floor(auction.managerBid * 1.15);
                                            const result = engine.raiseBid(auction.id, newBid);
                                            setLog(result.msg?.toUpperCase() || 'LANCE ATUALIZADO!');
                                            forceUpdate();
                                        }}
                                    >
                                        <ArrowUp size={16} /> AUMENTAR +15%
                                        (R$ {(Math.floor(auction.managerBid * 1.15) / 1_000_000).toFixed(1)}M)
                                    </EfButton>
                                </div>

                                <div className="ef-auction__countdown">
                                    <Timer size={16} className="ef-auction__countdown-icon" />
                                    {weeksLeft > 0
                                        ? `Resolve em ${weeksLeft} semana${weeksLeft > 1 ? 's' : ''}`
                                        : 'Resolução nesta rodada'
                                    }
                                    {' · '}
                                    {isWinning
                                        ? '[OK] Voce esta vencendo'
                                        : '[!] Ha lances maiores'
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </EfPanel>
    );
}
