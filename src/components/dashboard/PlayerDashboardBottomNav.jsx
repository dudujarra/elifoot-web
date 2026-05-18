import React from 'react';
import { EfButton } from '../ui/EfButton';
import { Target, ChartBar } from '@phosphor-icons/react';

export function PlayerDashboardBottomNav({ changeView }) {
    return (
        <div className="ef-player-dashboard__bottom-nav-row">
            {[{view:'standings',icon:<ChartBar weight="fill"/>,label:'Tabela'},{view:'achievements',icon:<Target weight="fill"/>,label:'Conquistas'}].map(n => (
                <EfButton key={n.view} variant="secondary" size="lg" className="ef-flex-1 ef-sans ef-player-dashboard__bottom-nav-btn" onClick={() => changeView(n.view)}>
                    {n.icon} {n.label}
                </EfButton>
            ))}
        </div>
    );
}
