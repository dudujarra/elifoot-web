import { Users, ChartBar, IdentificationCard, MagnifyingGlass } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function SquadToolbar({ tab, setTab, search, setSearch, filterPos, setFilterPos, sortBy, setSortBy }) {
    return (
        <EfPanel padding="md" className="ef-squad__tab-toolbar">
            <div className="ef-squad__flex-gap">
                {[
                    { id: 'plantel', label: 'PLANTEL', icon: <Users size={16} /> },
                    { id: 'stats', label: 'ANÁLISE TÁTICA', icon: <ChartBar size={16} /> },
                    { id: 'contratos', label: 'FINANÇAS', icon: <IdentificationCard size={16} /> }
                ].map(t => (
                    <EfButton key={t.id} onClick={() => setTab(t.id)} variant={tab === t.id ? 'primary' : 'secondary'} size="md" className="ef-squad__tab-btn">
                        {t.icon} {t.label}
                    </EfButton>
                ))}
            </div>

            <div className="ef-squad__flex-gap">
                <div className="ef-search-wrap">
                    <MagnifyingGlass size={16} className="ef-search-wrap__icon" />
                    <input type="text" placeholder="Buscar jogador..." value={search} onChange={(e) => setSearch(e.target.value)} className="ef-input ef-input--search" />
                </div>
                <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} className="ef-select">
                    <option value="all">Todas as posições</option>
                    <option value="GOL">GOL</option>
                    <option value="DEF">DEF</option>
                    <option value="MEI">MEI</option>
                    <option value="ATA">ATA</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ef-select">
                    <option value="position">Ordenação: POS</option>
                    <option value="ovr">Ordenação: OVR ↓</option>
                    <option value="age">Ordenação: IDADE</option>
                    <option value="energy">Ordenação: COND ↓</option>
                </select>
            </div>
        </EfPanel>
    );
}
