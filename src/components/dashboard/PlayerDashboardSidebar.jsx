import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { SoccerBall } from '@phosphor-icons/react';

export function PlayerDashboardSidebar({ tab, setTab, handleAdvance }) {
    return (
        <div className="ef-player-dashboard__sidebar">
            <EfPanel padding="md" className="ef-player-dashboard__nav-panel">
                {[{id:'overview',label:'Visão Geral'},{id:'skills',label:'Treinamento'},{id:'store',label:'Loja de Traits'},{id:'lifestyle',label:'Lifestyle'}].map(t => (
                    <EfButton key={t.id} variant={tab === t.id ? 'primary' : 'secondary'} size="md" onClick={() => setTab(t.id)} className="ef-sans ef-player-dashboard__nav-btn">
                        {t.label}
                    </EfButton>
                ))}
            </EfPanel>

            <EfButton variant="primary" size="lg" className="ef-sans ef-player-dashboard__advance-button ef-player-dashboard__advance-btn" onClick={handleAdvance}>
                <SoccerBall weight="fill" /> AVANÇAR SEMANA
            </EfButton>
        </div>
    );
}
