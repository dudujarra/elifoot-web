import { useState } from 'react';
import '../styles/squad-view.css';
import { useGame } from '../context/GameContext';
import { ViewOnboarding } from './ViewOnboarding';
import { injectSquadIntoTeam } from '../services/SquadDataService';
import { getClubColors } from '../data/clubColors';

import { SquadHeader } from './squad/SquadHeader';
import { SquadToolbar } from './squad/SquadToolbar';
import { SquadPlantel } from './squad/SquadPlantel';
import { SquadSummary } from './squad/SquadSummary';
import { SquadAnalysis } from './squad/SquadAnalysis';
import { SquadContracts } from './squad/SquadContracts';
import { SquadLoans } from './squad/SquadLoans';

export function SquadView() {
    const { gameState, changeView, getEngine, forceUpdate } = useGame();
    const engine = getEngine();
    const team = engine.getTeam(gameState.teamId);

    const [filterPos, setFilterPos] = useState('all');
    const [sortBy, setSortBy] = useState('position');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [loadingReal, setLoadingReal] = useState(false);
    const [tab, setTab] = useState('plantel');

    if (!team) return null;

    const handleLoadRealSquad = async () => {
        setLoadingReal(true);
        const result = await injectSquadIntoTeam(engine, team.id, team.name);
        setLoadingReal(false);
        if (result.success) forceUpdate();
        else alert(`Squad real não disponível: ${result.msg || 'pre-bake pendente'}`);
    };

    const posOrder = { GOL: 0, DEF: 1, MEI: 2, ATA: 3 };
    let filtered = [...team.squad];
    if (filterPos !== 'all') filtered = filtered.filter(p => p.position === filterPos);
    if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    const sorters = {
        position: (a, b) => posOrder[a.position] - posOrder[b.position] || b.ovr - a.ovr,
        ovr: (a, b) => b.ovr - a.ovr,
        age: (a, b) => a.age - b.age,
        energy: (a, b) => b.energy - a.energy,
        name: (a, b) => a.name.localeCompare(b.name),
        moral: (a, b) => (b.moral || 50) - (a.moral || 50),
    };
    const sorted = filtered.sort(sorters[sortBy] || sorters.position);

    const toggleTitular = (playerId) => {
        const p = team.squad.find(x => x.id === playerId);
        if (p) { p.isTitular = !p.isTitular; forceUpdate(); }
    };

    const handleLoan = (playerId) => {
        if (engine.loanPlayer(playerId).success) forceUpdate();
    };

    const handleSell = (player) => {
        engine.sellPlayer(player.id, player.value || (player.ovr * 100000));
        forceUpdate();
    };

    const back = gameState.mode === 'player' ? 'player_dashboard' : 'dashboard';
    const loanedOut = engine.loanedOut || [];
    const teamColors = getClubColors(team.name);

    return (
                <div className="ef-view-shell ef-view-shell--fixed" style={{
            '--team-primary': teamColors.primary,
            '--team-secondary': teamColors.secondary,
            '--team-accent': teamColors.accent
        }}>
            <ViewOnboarding viewId="squad" />
            <div className="ef-view-container ef-view-container--wide">
                <SquadHeader team={team} loadingReal={loadingReal} handleLoadRealSquad={handleLoadRealSquad} back={back} changeView={changeView} />
                <SquadToolbar tab={tab} setTab={setTab} search={search} setSearch={setSearch} filterPos={filterPos} setFilterPos={setFilterPos} sortBy={sortBy} setSortBy={setSortBy} />
                
                {tab === 'plantel' && (
                    <>
                        <SquadPlantel sorted={sorted} sortBy={sortBy} handleSort={setSortBy} expandedId={expandedId} setExpandedId={setExpandedId} toggleTitular={toggleTitular} handleLoan={handleLoan} handleSell={handleSell} engine={engine} forceUpdate={forceUpdate} />
                        <SquadSummary sorted={sorted} />
                    </>
                )}
                {tab === 'stats' && <SquadAnalysis sorted={sorted} />}
                {tab === 'contratos' && <SquadContracts sorted={sorted} />}
                <SquadLoans loanedOut={loanedOut} />
            </div>
        </div>
    );
}

export default SquadView;
