import { ChartBar } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { HexagonChart } from '../HexagonChart';

const getPosColor = (pos) => {
    if (pos === 'GOL') return 'var(--accent)';
    if (pos === 'DEF') return 'var(--info)';
    if (pos === 'MEI') return 'var(--primary)';
    if (pos === 'ATA') return 'var(--danger)';
    return 'var(--text-muted)';
};

export function SquadAnalysis({ sorted }) {
    return (
        <EfPanel padding="md">
            <div className="ef-squad__section-header-mb">
                <ChartBar size={24} color="var(--primary)" weight="fill" />
                <h3>ANÁLISE TITULARES (TOP 11)</h3>
            </div>
            <div className="ef-squad__grid-md">
                {sorted.filter(p => p.isTitular).slice(0, 11).map(p => (
                    <div key={p.id} className="ef-squad__analysis-card">
                        <div className="ef-sans ef-text-main ef-squad__analysis-name">{p.name}</div>
                        <div className="ef-mono ef-squad__analysis-pos ef-dyn-color" style={{ "--ef-dyn-color": getPosColor(p.position) }}>{p.naturalPosition || p.position}</div>
                        <HexagonChart player={p} size={160} />
                    </div>
                ))}
            </div>
        </EfPanel>
    );
}
