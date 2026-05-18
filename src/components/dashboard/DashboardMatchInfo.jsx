
import { AnimatedStat } from '../../hooks/useCountUp';
import { Help } from '../Help';
import { EfPanel } from '../ui/EfPanel';
import { TACTICS } from '../../engine/ManagerSystems';

export function DashboardMatchInfo({ team, engine, sectors }) {
    return (
        <EfPanel padding="md" className="ef-dashboard-match-info">
            <div className="ef-dashboard-match-info__left">
                <span className="ef-dashboard-match-info__label">Formação Atual</span>
                <div className="ef-dashboard-match-info__formation">
                    <span className="ef-dashboard-match-info__formation-name">{team.formation}</span>
                    <span className="ef-dashboard-match-info__separator">•</span>
                    <span className="ef-dashboard-match-info__tactics">{TACTICS[engine.currentTactic]?.name}</span>
                </div>
            </div>
            <div className="ef-dashboard-match-info__right">
                <div className="ef-stat-cell">
                    <span className="ef-stat-cell__value ef-text-accent"><AnimatedStat value={sectors.goalkeeper} /></span>
                    <span className="ef-stat-cell__label"><Help id="sector.gol" />GOL</span>
                </div>
                <div className="ef-stat-cell">
                    <span className="ef-stat-cell__value ef-text-info"><AnimatedStat value={sectors.defense} /></span>
                    <span className="ef-stat-cell__label"><Help id="sector.def" />DEF</span>
                </div>
                <div className="ef-stat-cell">
                    <span className="ef-stat-cell__value ef-text-primary"><AnimatedStat value={sectors.midfield} /></span>
                    <span className="ef-stat-cell__label"><Help id="sector.mei" />MEI</span>
                </div>
                <div className="ef-stat-cell">
                    <span className="ef-stat-cell__value ef-text-danger"><AnimatedStat value={sectors.attack} /></span>
                    <span className="ef-stat-cell__label"><Help id="sector.ata" />ATA</span>
                </div>
            </div>
        </EfPanel>
    );
}
