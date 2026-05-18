import { EfPanel } from './EfPanel';

export function PlayerCareerTable({ player, currentWeek, currentSeason }) {
    return (
        <EfPanel padding="md">
            <div className="ef-player-dashboard__career-head">
                <span className="ef-sans ef-text-accent">CAREER PERFORMANCE</span>
                <span className="ef-mono ef-text-muted">SEM {currentWeek}/38</span>
            </div>
            <div className="ef-player-dashboard__career-tablewrap">
                <table className="ef-player-dashboard__career-table">
                    <thead>
                        <tr>
                            <th className="ef-mono ef-text-muted">SEASON</th>
                            <th className="ef-mono ef-text-muted">JOGOS</th>
                            <th className="ef-mono ef-text-muted">GOLS</th>
                            <th className="ef-mono ef-text-muted">ASSISTS</th>
                            <th className="ef-mono ef-text-muted">MOTM</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="ef-mono ef-text-main">{currentSeason ?? '95/96'}</td>
                            <td className="ef-mono ef-text-main">{currentWeek}</td>
                            <td className="ef-mono ef-text-accent">{player.seasonGoals}</td>
                            <td className="ef-mono ef-text-main">{player.career?.seasonAssists ?? 0}</td>
                            <td className="ef-mono ef-text-warn">{player.career?.seasonMotm ?? 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </EfPanel>
    );
}
