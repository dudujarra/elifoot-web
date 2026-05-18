import { Bug, GameController, ChatCircleText, Note } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { formatTs } from './monitorUtils';

export function MonitorStatsRow({ stats }) {
    if (!stats) return null;

    return (
        <EfPanel padding="lg" className="ef-mon__stats-panel">
            <div className="ef-mon__stats-row">
                <div className="ef-mon__stat-col">
                    <div className="ef-mono ef-text-muted ef-mon__stat-label">TOTAL</div>
                    <div className="ef-mono ef-mon__stat-value">{stats.total}</div>
                </div>
                <div className="ef-mon__stat-col">
                    <div className="ef-mono ef-text-muted ef-mon__stat-label">
                        <Bug size={12} /> BUGS
                    </div>
                    <div
                        className={`ef-mono ef-mon__stat-value ${stats.bugs > 0 ? 'ef-mon__stat-value--alert' : 'ef-mon__stat-value--neutral'}`}
                    >
                        {stats.bugs}
                    </div>
                </div>
                <div className="ef-mon__stat-col">
                    <div className="ef-mono ef-text-muted ef-mon__stat-label">
                        <GameController size={12} /> GAMEPLAY
                    </div>
                    <div className="ef-mono ef-mon__stat-value">{stats.gameplay}</div>
                </div>
                <div className="ef-mon__stat-col">
                    <div className="ef-mono ef-text-muted ef-mon__stat-label">
                        <ChatCircleText size={12} /> FEEDBACK
                    </div>
                    <div className="ef-mono ef-mon__stat-value">{stats.feedback}</div>
                </div>
                <div className="ef-mon__stat-col">
                    <div className="ef-mono ef-text-muted ef-mon__stat-label">
                        <Note size={12} /> NOTES
                    </div>
                    <div className="ef-mono ef-mon__stat-value">{stats.notes ?? 0}</div>
                </div>
            </div>
            {stats.firstEntry && (
                <div className="ef-mono ef-text-muted ef-mon__since">
                    DESDE {formatTs(stats.firstEntry)}
                </div>
            )}
        </EfPanel>
    );
}
