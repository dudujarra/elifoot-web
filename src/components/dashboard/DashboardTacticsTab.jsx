import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Megaphone } from '@phosphor-icons/react';
import { FORMATIONS, TACTICS, TEAM_TALKS } from '../../engine/ManagerSystems';

export function DashboardTacticsTab({ engine, team, forceUpdate, handleTeamTalk }) {
    return (
        <div className="ef-dashboard-tactics-grid">
            <EfPanel padding="lg">
                <div className="ef-dashboard-tactics__section-title">FORMAÇÃO</div>
                <div className="ef-dashboard-tactics__buttons">
                    {Object.keys(FORMATIONS).map((f) => (
                        <EfButton key={f} variant={team.formation === f ? 'primary' : 'secondary'} size="md" onClick={() => { engine.setFormation(f); forceUpdate(); }}>
                            {f}
                        </EfButton>
                    ))}
                </div>
                <div className="ef-dashboard-tactics__section-title ef-dashboard-tactics__section-title--secondary">TÁTICA DE JOGO</div>
                <div className="ef-dashboard-tactics__buttons">
                    {Object.entries(TACTICS).map(([k, v]) => (
                        <EfButton key={k} variant={engine.currentTactic === k ? 'primary' : 'secondary'} size="md" onClick={() => { engine.setTactic(k); forceUpdate(); }}>
                            {v.name}
                        </EfButton>
                    ))}
                </div>
                <p className="ef-dashboard-tactics__description">{TACTICS[engine.currentTactic]?.description}</p>
            </EfPanel>

            <EfPanel padding="lg">
                <div className="ef-panel-section-label ef-panel-section-label--strong ef-dashboard-section-label--prele"><Megaphone weight="fill" /> PRELEÇÃO</div>
                <div className="ef-dashboard-talks">
                    {TEAM_TALKS.map((t) => {
                        const moral = t.effect?.moralBoost ?? 0;
                        const energy = t.effect?.energyCost ?? 0;
                        const moralTxt = moral > 0 ? `moral +${moral}` : moral < 0 ? `moral ${moral}` : 'moral neutra';
                        const energyTxt = energy > 0 ? `, custa ${energy} energia` : energy < 0 ? `, recupera energia` : '';
                        return (
                        <EfButton key={t.id} variant="secondary" size="md" title={`${t.name}: ${moralTxt}${energyTxt}. "${t.text}"`} className="ef-dashboard-talk-btn" onClick={() => handleTeamTalk(t.id)}>
                            {t.name}
                        </EfButton>
                        );
                    })}
                </div>
            </EfPanel>
        </div>
    );
}
