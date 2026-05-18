
import { WarningCircle, Brain, Lightning } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

export function PlayerDashboardAlerts({ player }) {
    if (!player.isBenched && player.stress < 75 && player.energy >= 30) {
        return null;
    }

    return (
        <div className="ef-player-dashboard__alerts">
            {player.isBenched && (
                <EfPanel padding="sm" className="ef-player-dashboard__alert-panel">
                    <WarningCircle color="var(--color-danger)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-mono">VOCÊ ESTÁ NO BANCO!</span>
                </EfPanel>
            )}
            {player.stress >= 75 && (
                <EfPanel padding="sm" className="ef-player-dashboard__alert-panel">
                    <Brain color="var(--color-danger)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-mono">STRESS CRÍTICO ({player.stress}%)</span>
                </EfPanel>
            )}
            {player.energy < 30 && (
                <EfPanel padding="sm" className="ef-player-dashboard__alert-panel">
                    <Lightning color="var(--color-danger)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-mono">EXAUSTÃO ({player.energy}%)</span>
                </EfPanel>
            )}
        </div>
    );
}
