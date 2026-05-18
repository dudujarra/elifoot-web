import { EfPanel } from '../ui/EfPanel';
import { ChartBar, Handshake, User, HandsClapping, Coins, WarningCircle } from '@phosphor-icons/react';
import { HexagonRadar } from '../ui/HexagonRadar';
import { RelationshipBar } from '../ui/RelationshipBar';
import { PlayerCareerTable } from '../ui/PlayerCareerTable';
import { PlayerSkillProgress } from '../ui/PlayerSkillProgress';



export function PlayerDashboardOverviewTab({ player, engine, radarAxes, radarPoints, offPitchResult }) {
    return (
        <div className="ef-player-dashboard__overview-grid">
            {/* Attribute Matrix Hexagon Radar */}
            <EfPanel padding="md" className="ef-player-dashboard__radar-panel">
                <div className="ef-player-dashboard__radar-head">
                    <span className="ef-sans ef-text-accent">ATTRIBUTE MATRIX</span>
                    <ChartBar weight="fill" />
                </div>
                <HexagonRadar axes={radarAxes} points={radarPoints} />
            </EfPanel>

            {/* Career Performance Table + Locker Room Standing */}
            <div className="ef-player-dashboard__col-stack">
                <PlayerCareerTable player={player} currentWeek={engine.currentWeek} currentSeason={engine.currentSeason} />

                <EfPanel padding="md">
                    <div className="ef-player-dashboard__panel-title ef-sans ef-text-accent"><Handshake weight="fill" /> LOCKER ROOM STANDING</div>
                    <RelationshipBar label="Treinador" value={player.relationships.boss} type="boss" icon={<User weight="fill" />} />
                    <RelationshipBar label="Torcida" value={player.relationships.fans} type="fans" icon={<HandsClapping weight="fill" />} />
                    <RelationshipBar label="Companheiros" value={player.relationships.teammates} type="teammates" icon={<User weight="fill" />} />
                    <RelationshipBar label="Patrocinadores" value={player.relationships.sponsors} type="sponsors" icon={<Coins weight="fill" />} />
                </EfPanel>

                {offPitchResult && (
                    <EfPanel padding="md" className="ef-player-dashboard__event-panel-inline">
                        <div className="ef-sans ef-text-accent ef-player-dashboard__event-title-row"><WarningCircle weight="fill" /> ÚLTIMO EVENTO</div>
                        <p className="ef-sans ef-text-main ef-player-dashboard__event-body-text">{offPitchResult}</p>
                    </EfPanel>
                )}
            </div>

            {/* SKILL XP BARS — full-width row below the radar/career grid */}
            <PlayerSkillProgress player={player} />
        </div>
    );
}
