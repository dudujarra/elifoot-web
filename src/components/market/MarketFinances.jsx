import { Bank, Users } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

export function MarketFinances({ balance, squadSize }) {
    return (
        <EfPanel variant="sunk" padding="md" className="ef-market__finances">
            <div className="ef-market__finance-cell">
                <div className="ef-market__finance-label"><Bank size={16} /> SALDO DISPONÍVEL</div>
                <div className={`ef-mono ef-market__finance-value ${balance > 0 ? 'ef-market__finance-value--positive' : 'ef-market__finance-value--negative'}`}>
                    R$ {(balance / 1000000).toFixed(1)}M
                </div>
            </div>
            <div className="ef-market__finance-divider" />
            <div className="ef-market__finance-cell">
                <div className="ef-market__finance-label"><Users size={16} /> ELENCO</div>
                <div className="ef-mono ef-market__finance-value">{squadSize}</div>
            </div>
        </EfPanel>
    );
}
