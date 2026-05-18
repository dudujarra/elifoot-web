import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { GraduationCap, SoccerBall } from '@phosphor-icons/react';

export function DashboardNav({ tab, setTab, hasTransferOffers, onPlayMatch, handleAuxiliarAdvice }) {
    const tabs = [
        { id: 'overview', label: 'Visão Geral' },
        { id: 'tactics', label: 'Táticas' },
        { id: 'training', label: 'Treino' },
        { id: 'club', label: 'Clube' },
    ];
    if (hasTransferOffers) {
        tabs.push({ id: 'transfers', label: 'Ofertas' });
    }

    return (
        <div className="ef-dashboard-nav">
            <EfPanel padding="md" className="ef-dashboard-nav__tabs">
                {tabs.map((t) => (
                    <EfButton key={t.id} variant={tab === t.id ? 'primary' : 'secondary'} size="md" onClick={() => setTab(t.id)} className="ef-dashboard-nav-tab-btn">
                        {t.label}
                    </EfButton>
                ))}
            </EfPanel>
            <div className="ef-dashboard-nav__actions">
                <EfButton variant="secondary" size="md" title="Sugestão tática do auxiliar técnico baseada no adversário" className="ef-dashboard-nav-action-btn" onClick={handleAuxiliarAdvice}>
                    <GraduationCap weight="bold" /> Conselho do Auxiliar
                </EfButton>
                <EfButton variant="primary" size="lg" title="Joga a próxima partida e avança 1 semana (processa treino, finanças, lesões, eventos)" className="ef-dashboard-nav-play-btn" onClick={onPlayMatch}>
                    <SoccerBall weight="fill" /> JOGAR PARTIDA
                </EfButton>
            </div>
        </div>
    );
}
