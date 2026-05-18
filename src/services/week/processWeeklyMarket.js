import { resolveAuctions } from '../../engine/StarAuctionSystem.js';
import { generateRealTransferOffers } from '../../engine/MarketPricer.js';

export function processWeeklyMarket(engine, team) {
    // Elifoot Classic: Star Auction — resolver leilões vencidos
    const auctionResults = resolveAuctions(engine);
    auctionResults.forEach(r => {
        engine.weekEvents.push(r.msg);
        if (r.won && r.playerId) {
            let player = null;

            if (r.source === 'league' && r.sourceTeamId) {
                // BUG-AUDIT-3: League source — player is in seller's squad
                const seller = engine.getTeam(r.sourceTeamId);
                if (seller) {
                    player = (seller.squad || []).find(p => p.id === r.playerId);
                    if (player) {
                        seller.squad = seller.squad.filter(p => p.id !== r.playerId);
                        seller.balance = (seller.balance || 0) + r.bid;
                    }
                }
            } else {
                // Market source — player is in engine.marketPlayers
                player = (engine.marketPlayers || []).find(p => p.id === r.playerId);
                if (player) {
                    engine.marketPlayers = engine.marketPlayers.filter(p => p.id !== r.playerId);
                }
            }

            if (player) {
                player.isTitular = false;
                player.energy = 100;
                player.injury = null;
                delete player.suspension;
                if (player.clearFlag) player.clearFlag('suspended');
                team.balance -= r.bid;
                team.squad.push(player);
            }
        }
    });

    // Transfer offers (janelas) — SPEC-133: precificação real
    // BUG-084: Limpar ofertas expiradas antes de gerar novas
    if (engine.transferOffers.length > 0) {
        engine.transferOffers = engine.transferOffers.filter(
            o => !o.deadline || o.deadline > engine.currentWeek
        );
    }
    const newOffers = generateRealTransferOffers(team, engine.currentWeek, engine.teams);
    if (newOffers.length > 0) {
        engine.transferOffers.push(...newOffers);
    }
}
