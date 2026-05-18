import { EfClubBadge } from '../ui/EfClubBadge';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function MarketHeader({ team, changeView, getDashboardView }) {
    return (
        <EfPanel variant="elev" padding="md" className="ef-flex-row ef-market__header">
            <div className="ef-flex-row ef-market__header-left">
                <EfClubBadge name={team.name} size="md" />
                <div>
                    <h2 className="ef-sans ef-text-main ef-market__title">MERCADO DE TRANSFERÊNCIAS</h2>
                    <div className="ef-mono ef-market__subtitle">DIRETORIA FINANCEIRA — {team.name?.toUpperCase()}</div>
                </div>
            </div>
            <div className="ef-market__header-right">
                <div className={`ef-market__budget-badge ${team.balance > 0 ? 'ef-market__budget-badge--positive' : 'ef-market__budget-badge--negative'}`}>
                    <span className="ef-mono ef-market__budget-label">ORÇAMENTO</span>
                    <span className="ef-mono ef-market__budget-value">R$ {(team.balance / 1000000).toFixed(1)}M</span>
                </div>
                <EfButton variant="secondary" size="md" onClick={() => changeView(getDashboardView())}>SAIR</EfButton>
            </div>
        </EfPanel>
    );
}
