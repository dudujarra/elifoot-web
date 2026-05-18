
/**
 * PlayerDashboardView — Painel do Jogador (Player Career Mode)
 * Stitch v1.1 port (AKITA-398): match docs/stitch-designs/v1.1-all/74-painel-do-jogador-ol-fut-dashboard.html
 *
 * Visual alignment:
 *   - Hero header: bordered card, portrait, "PLAYER PROFILE" tag, position watermark, 4 info cells (CLUB/AGE/POSITION/OVERALL).
 *   - Attribute Matrix: SVG hexagon radar chart (6 axes derived from existing skills).
 *   - Career Performance: tabular season summary (uses live seasonGoals; older seasons archive placeholder).
 *   - Locker Room Standing: relationship bars with retro loading-block fill effect.
 *
 * Engine contract — UNCHANGED:
 *   - Reads engine.proPlayer / engine.manager / engine.getTeam(teamId).
 *   - Calls player.train / rest / buyEnergyDrink / consumeEnergyDrink / trainSubAttr / buyTrait / buyLifestyle.
 *   - OffPitchEventsDeck event-spawn logic preserved.
 *   - All four tabs (overview / skills / store / lifestyle) preserved.
 *   - Banner / mental-break / off-pitch modals preserved.
 *
 * SPEC-184 ceiling: inline style count ≤ 4 (dynamic width/color only).
 */

import { PERSONALITIES } from '../engine/PlayerCareer';
import { EfBanner } from './ui';
import { Star } from '@phosphor-icons/react';

import { PlayerProvider, usePlayer } from '../context/PlayerContext';
import { PlayerDashboardHero } from './dashboard/PlayerDashboardHero';
import { PlayerDashboardAlerts } from './dashboard/PlayerDashboardAlerts';
import { PlayerDashboardStatusBar } from './dashboard/PlayerDashboardStatusBar';
import { PlayerDashboardOverviewTab } from './dashboard/PlayerDashboardOverviewTab';
import { PlayerDashboardSkillsTab } from './dashboard/PlayerDashboardSkillsTab';
import { PlayerDashboardStoreTab } from './dashboard/PlayerDashboardStoreTab';
import { PlayerDashboardLifestyleTab } from './dashboard/PlayerDashboardLifestyleTab';
import { PlayerDashboardModals } from './dashboard/PlayerDashboardModals';
import { PlayerDashboardSidebar } from './dashboard/PlayerDashboardSidebar';
import { PlayerDashboardBottomNav } from './dashboard/PlayerDashboardBottomNav';

import '../styles/gdd-systems.css';
import '../styles/player-dashboard-view.css';

import { buildRadarAxes, buildRadarPoints } from './ui/HexagonRadar';

function PlayerDashboardViewContent() {
    const dashboard = usePlayer();

    if (!dashboard.player || !dashboard.team) return <div className="ef-player-dashboard__error ef-mono ef-text-main">Erro: jogador não encontrado.</div>;

    const {
        engine, player, team, changeView,
        log, setLog,
        offPitchEvent, setOffPitchEvent,
        offPitchResult,
        mentalBreakModal, setMentalBreakModal,
        banner, setBanner,
        showSubAttrs, setShowSubAttrs,
        tab, setTab,
        handleTrain, handleRest, handleBuyDrink, handleUseDrink, handleTrainSubAttr,
        handleBuyTrait, handleBuyLifestyle, handleAdvance, handleOffPitchChoice, handleMentalBreak
    } = dashboard;

    const starStr = Array(player.starRating).fill(<Star weight="fill" color="var(--accent)" size={16} />).concat(Array(5 - player.starRating).fill(<Star color="var(--border-panel)" size={16} />));
    const pers = PERSONALITIES[player.personality] || PERSONALITIES.maverick;
    const stressColor = player.stress >= 75 ? 'var(--danger)' : player.stress >= 50 ? 'var(--accent)' : 'var(--text-muted)';

    // === Stitch hexagon radar — six axes derived from skills + computed ===
    const ovr = Math.round(
        (player.skills.technique + player.skills.pace + player.skills.power + player.skills.vision) / 4
    );
    const radarAxes = buildRadarAxes(player.skills);
    const radarPoints = buildRadarPoints(radarAxes);

    const positionWatermark = (player.position || 'ATA').toUpperCase().slice(0, 3);

    return (
        <div className="ef-view-shell ef-view-shell--fixed">
            <div className="ef-view-container ef-view-container--wide">
                {banner && <EfBanner type={banner} onDismiss={() => setBanner(null)} />}

                <PlayerDashboardHero player={player} team={team} engine={engine} pers={pers} positionWatermark={positionWatermark} starStr={starStr} ovr={ovr} />
                <PlayerDashboardAlerts player={player} />

                {/* === BENTO GRID LAYOUT === */}
                <div className="ef-player-dashboard__container">
                    {/* LEFT COLUMN: Navigation & Actions */}
                    <PlayerDashboardSidebar tab={tab} setTab={setTab} handleAdvance={handleAdvance} />

                    {/* RIGHT COLUMN: Content Area */}
                    <div className="ef-player-dashboard__content">
                        <PlayerDashboardStatusBar player={player} stressColor={stressColor} handleRest={handleRest} handleBuyDrink={handleBuyDrink} handleUseDrink={handleUseDrink} />

                        {/* TAB CONTENTS */}
                        {tab === 'overview' && <PlayerDashboardOverviewTab player={player} engine={engine} radarAxes={radarAxes} radarPoints={radarPoints} offPitchResult={offPitchResult} />}
                        {tab === 'skills' && <PlayerDashboardSkillsTab player={player} handleTrain={handleTrain} showSubAttrs={showSubAttrs} setShowSubAttrs={setShowSubAttrs} handleTrainSubAttr={handleTrainSubAttr} />}
                        {tab === 'store' && <PlayerDashboardStoreTab player={player} handleBuyTrait={handleBuyTrait} />}
                        {tab === 'lifestyle' && <PlayerDashboardLifestyleTab player={player} handleBuyLifestyle={handleBuyLifestyle} />}
                    </div>
                </div>

                {/* BOTTOM NAVIGATION */}
                <PlayerDashboardBottomNav changeView={changeView} />

                {/* Event Modals and Toasts */}
                {log && <div className="event-toast success" onClick={() => setLog('')}>{log}</div>}

                <PlayerDashboardModals
                    offPitchEvent={offPitchEvent}
                    setOffPitchEvent={setOffPitchEvent}
                    handleOffPitchChoice={handleOffPitchChoice}
                    mentalBreakModal={mentalBreakModal}
                    setMentalBreakModal={setMentalBreakModal}
                    player={player}
                    handleMentalBreak={handleMentalBreak}
                />

            </div>
        </div>
    );
}

export function PlayerDashboardView() {
    return (
        <PlayerProvider>
            <PlayerDashboardViewContent />
        </PlayerProvider>
    );
}

export default PlayerDashboardView;
