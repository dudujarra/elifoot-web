import { Handshake } from '@phosphor-icons/react';
import { PlayerAvatar } from '../../utils/avatar';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function MarketSellTab({ sellable, negotiation, setNegotiation, handleSell, confirmSell, setLog }) {
    return (
        <EfPanel variant="default" padding="md">
            <div className="ef-market__section-title">
                <Handshake size={20} /> SEU ELENCO (VENDÁVEIS)
            </div>

            {sellable.length === 0 ? (
                <div className="ef-empty-state">
                    NENHUM JOGADOR VENDÁVEL. TIRE-OS DA TITULARIDADE PRIMEIRO.
                </div>
            ) : (
                <div className="ef-market__list">
                    {sellable.map(p => (
                        <div key={p.id} className="ef-list-row">
                            <div className="ef-market__player-info">
                                <PlayerAvatar name={p.name} size={40} />
                                <div className="ef-market__player-details">
                                    <div className="ef-player-name">
                                        {p.name.toUpperCase()}
                                    </div>
                                    <div className="ef-player-meta">
                                        <span className="ef-pos-badge">{p.position}</span>
                                        <span>OVR <strong className="ef-text-main">{p.ovr}</strong></span>
                                        <span>•</span>
                                        <span>{p.age} ANOS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ef-market__player-price">
                                <span className="ef-market__price-amount">
                                    ~R$ {((p.ovr * 100000) / 1000000).toFixed(1)}M
                                </span>
                                <EfButton variant="danger" size="md" title="Inicia negociação de venda (3 rodadas; comprador pode pedir desconto, jogador sai do plantel se fechar)" onClick={() => handleSell(p)}>VENDER</EfButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {negotiation && (
                <div className="ef-anim-fade-in ef-market__negotiation-panel">
                    <div className="ef-market__negotiation-msg">
                        <Handshake size={16} /> {negotiation.msg}
                    </div>
                    <div className="ef-market__negotiation-amount">
                        R$ {(negotiation.counterAmount / 1000000).toFixed(1)}M
                    </div>
                    <div className="ef-market__negotiation-actions">
                        <EfButton variant="primary" size="md" title="Aceitar valor atual e fechar venda (irreversível)" onClick={confirmSell}>ACEITAR</EfButton>
                        <EfButton variant="secondary" size="md" title="Pedir contra-proposta +15% (máximo 3 tentativas, encerra negociação após)" onClick={() => {
                            const newAmount = Math.floor(negotiation.counterAmount * 1.15);
                            if (negotiation.round >= 2) {
                                setLog('NEGOCIAÇÃO ENCERRADA.');
                                setNegotiation(null);
                            } else {
                                setNegotiation({
                                    ...negotiation,
                                    round: negotiation.round + 1,
                                    counterAmount: newAmount,
                                    msg: `CONTRA-PROPOSTA (TENTATIVA ${negotiation.round + 2}/3)`,
                                });
                            }
                        }}>PEDIR MAIS</EfButton>
                        <EfButton variant="danger" size="md" onClick={() => setNegotiation(null)}>CANCELAR</EfButton>
                    </div>
                </div>
            )}
        </EfPanel>
    );
}
