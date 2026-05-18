import { IdentificationCard } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

const getPosColor = (pos) => {
    if (pos === 'GOL') return 'var(--accent)';
    if (pos === 'DEF') return 'var(--info)';
    if (pos === 'MEI') return 'var(--primary)';
    if (pos === 'ATA') return 'var(--danger)';
    return 'var(--text-muted)';
};

export function SquadContracts({ sorted }) {
    return (
        <EfPanel padding="none" className="ef-squad__panel-table">
            <div className="ef-section-header ef-squad__contract-header">
                <IdentificationCard size={24} color="var(--accent)" weight="fill" />
                <h3>GESTÃO DE CONTRATOS</h3>
            </div>
            <table className="ef-squad__table">
                <thead className="ef-squad__thead">
                    <tr>
                        <th className="ef-text-muted ef-squad__contract-th">JOGADOR</th>
                        <th className="ef-text-muted ef-squad__contract-th ef-squad__contract-th--center">POS</th>
                        <th className="ef-text-muted ef-squad__contract-th ef-squad__contract-th--center">IDADE</th>
                        <th className="ef-squad__th ef-squad__th--wage-right">WAGE/SEM</th>
                        <th className="ef-squad__th ef-squad__th--wage-right">RESTANTE</th>
                        <th className="ef-squad__th ef-squad__th--wage-right">CLÁUSULA</th>
                        <th className="ef-squad__th ef-squad__th--wage-right">VALOR</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p) => (
                        <tr key={p.id} className="ef-squad__contract-row">
                            <td className="ef-text-main ef-squad__contract-td ef-squad__contract-td--name">{p.name}</td>
                            <td className="ef-mono ef-squad__contract-td ef-squad__contract-td--pos ef-dyn-color" style={{ "--ef-dyn-color": getPosColor(p.position) }}>{p.naturalPosition || p.position}</td>
                            <td className="ef-mono ef-text-muted ef-squad__contract-td ef-squad__contract-td--center">{p.age}</td>
                            <td className="ef-mono ef-text-danger ef-squad__contract-td ef-squad__contract-td--right">R$ {(p.contract?.weeklyWage || 0).toLocaleString('pt-BR')}</td>
                            <td className="ef-mono ef-text-muted ef-squad__contract-td ef-squad__contract-td--right">{p.contract?.weeksRemaining || p.contract?.weeksLeft || '-'} sem</td>
                            <td className="ef-mono ef-text-info ef-squad__contract-td ef-squad__contract-td--right">{p.contract?.releaseClause ? `R$ ${(p.contract.releaseClause / 1e6).toFixed(1)}M` : '-'}</td>
                            <td className="ef-mono ef-text-accent ef-squad__contract-td ef-squad__contract-td--right">{p.marketValue ? `R$ ${(p.marketValue / 1e6).toFixed(1)}M` : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </EfPanel>
    );
}
