import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Envelope } from '@phosphor-icons/react';

export function DashboardTransfersTab({ engine, handleAcceptOffer, handleRejectOffer }) {
    if (!engine.transferOffers || engine.transferOffers.length === 0) return null;
    
    return (
        <EfPanel padding="lg">
            <div className="ef-panel-section-label ef-panel-section-label--strong"><Envelope weight="fill" /> OFERTAS RECEBIDAS</div>
            <table className="ef-dashboard-transfers__table">
                <tbody>
                    {engine.transferOffers.map((offer, i) => (
                        <tr key={i} className="ef-dashboard-transfers__row">
                            <td className="ef-dashboard-transfers__offer">
                                <strong className="ef-dashboard-transfers__player-name">{offer.playerName}</strong> <span className="ef-dashboard-transfers__ovr">(OVR {offer.playerOvr})</span>
                                <div className="ef-dashboard-transfers__offer-detail">{offer.buyerClub} • <span className="ef-dashboard-transfers__amount">R$ {(offer.offerAmount / 1000000).toFixed(1)}M</span></div>
                            </td>
                            <td className="ef-dashboard-transfers__actions">
                                <div className="ef-dashboard-transfers__buttons">
                                    <EfButton variant="primary" size="sm" title="Aceitar oferta (irreversível: jogador sai do plantel imediatamente)" onClick={() => handleAcceptOffer(offer.playerId)}>ACEITAR</EfButton>
                                    <EfButton variant="danger" size="sm" title="Recusar oferta (cuidado: jogador pode ficar insatisfeito e pedir saída)" onClick={() => handleRejectOffer(offer.playerId)}>RECUSAR</EfButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </EfPanel>
    );
}
