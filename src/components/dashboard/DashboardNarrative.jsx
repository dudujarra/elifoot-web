import { EfPanel } from '../ui/EfPanel';
import { Newspaper } from '@phosphor-icons/react';

export function DashboardNarrative({ narrative }) {
    if (!narrative) return null;

    return (
        <div className="ef-dashboard-narrative-wrapper">
            <EfPanel padding="md" className="ef-dashboard-narrative">
                <div className="ef-dashboard-narrative__title">
                    <Newspaper weight="fill" /> CRÔNICA DA PARTIDA
                </div>
                <p className="ef-dashboard-narrative__text">{narrative}</p>
            </EfPanel>
        </div>
    );
}
