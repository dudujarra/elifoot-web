
import { TrendUp, TrendDown, Wallet } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

export function DashboardHeader({ pos, team, stats, boardStatus, engine }) {
    return (
        <EfPanel variant="hero" padding="lg" className="ef-dashboard-header">
            <div className="ef-dashboard-header__left">
                <div className="ef-dashboard-team-badge">
                    {pos}º • SÉRIE {['A','B','C','D'][team.division - 1]}
                </div>
                <h2 className="ef-dashboard-team-name">
                    {team.name}
                </h2>
                <span className="ef-dashboard-team-stats">
                    {stats.wins}V {stats.draws}E {stats.losses}D
                    {stats.streak > 0 ? (
                        <span className="ef-dashboard-team-stats__win">
                            <TrendUp weight="bold"/> {stats.streak}
                        </span>
                    ) : stats.streak < 0 ? (
                        <span className="ef-dashboard-team-stats__loss">
                            <TrendDown weight="bold"/> {Math.abs(stats.streak)}
                        </span>
                    ) : ''}
                </span>
            </div>
            <div className="ef-dashboard-header__right">
                <div className={`ef-dashboard-balance ${team.balance > 0 ? 'ef-dashboard-balance--positive' : 'ef-dashboard-balance--negative'}`}>
                    <Wallet weight="fill" className="ef-dashboard-balance__icon" />
                    R$ {(team.balance / 1000000).toFixed(1)}M
                </div>
                {boardStatus && (
                    <div className="ef-dashboard-board-status" title={`Diretoria: ${boardStatus.label} (${engine.board?.confidence ?? 60}%).`}>
                        <span>{boardStatus.emoji}</span> {boardStatus.label}
                    </div>
                )}
            </div>
        </EfPanel>
    );
}
