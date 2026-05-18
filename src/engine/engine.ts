/**
 * Engine — Thin Facade / State Container
 *
 * AKITA-404+: All business logic delegated to injected services.
 * Engine owns ONLY:
 *   1. State fields (constructor)
 *   2. One-line delegator methods (facade pattern)
 *   3. advanceWeek orchestrator (~30L core tick)
 *
 * Services are injected by engineFactory.js (Composition Root).
 * Engine has ZERO imports of business logic modules.
 */

import { canAccess } from './ViewUnlockSystem.js';
import { compute as computeManagerIdentity } from './ManagerIdentitySystem.js';
import { decrementSuspensions } from './DisciplineSystem.js';
import { setMatchBonus, MATCH_BONUS_TIERS } from './MatchBonusSystem.js';
import { setTicketPolicy, getActiveTicketPolicy, TICKET_POLICIES } from './TicketPricingSystem.js';
import { startAuction, raiseBid, getActiveAuctions, requiresAuction } from './StarAuctionSystem.js';
import { StaffManager } from './StadiumSystem.js';
import { Team, Tournament, Player, Manager, MatchResult } from './types.js';

/**
 * The core game engine — state container + thin facade.
 * All logic lives in services injected via engineFactory.
 */
export class Engine {
    [key: string]: unknown; // Permite injeção de serviços genéricos (_formationService, etc)
    
    teams: Team[];
    tournaments: Tournament[];
    currentWeek: number;
    mode: string;
    proPlayer: Player | null;
    manager: Manager;
    marketPlayers: Player[];
    currentTactic: string;
    currentTraining: string;
    lastTeamTalk: string | null;
    teamTalkModifiers: { ata: number; def: number };
    matchCondition: unknown;
    transferOffers: unknown[];
    weeklyFinance: unknown;
    managerStats: Record<string, unknown>;
    board: unknown;
    weekInjuries: unknown[];
    weekEvents: unknown[];
    academyLevel: number;
    loanedOut: Player[];
    pressQuestion: unknown;
    stadiumLevel: number;
    staff: unknown;
    scoutedPlayers: Player[];
    legacy: unknown;
    currentSponsor: unknown;
    seasonNumber: number;
    seasonAwards: unknown[];
    boardTension: number;
    hallOfLegends: unknown;
    rivalryHistory: Record<string, unknown>;
    formerCompanions: unknown[];
    chronicles: unknown[];
    pendingCoachProposal: unknown;
    activeChallenge: unknown;
    viewUnlockState: Record<string, unknown>;
    _squadMonitorCooldowns: Record<string, number>;
    activeLoan: unknown;
    pendingMatchBonus: unknown;
    ticketPolicy: string;
    activeAuctions: unknown[];
    starPlayerId: unknown;

    constructor() {
        // === CORE STATE ===
        this.teams = [];
        this.tournaments = [];
        this.currentWeek = 0;
        this.mode = 'manager';
        this.proPlayer = null;
        this.manager = { name: '', teamId: null, money: 0, salary: 5000, reputation: 10, tacticHistory: {}, careerHistory: [] };
        this.marketPlayers = [];

        // === MANAGER MODE STATE ===
        this.currentTactic = 'normal';
        this.currentTraining = 'fitness';
        this.lastTeamTalk = null;
        this.teamTalkModifiers = { ata: 1.0, def: 1.0 };
        this.matchCondition = null;
        this.transferOffers = [];
        this.weeklyFinance = null;
        this.managerStats = { wins: 0, draws: 0, losses: 0, streak: 0, lossStreak: 0, rollingForm: [], goalsFor: 0, goalsAgainst: 0, cleanSheets: 0, tacticStreak: 0, lastTactic: null, transferProfit: 0, giantKills: 0, crisisSaves: 0, longestUnbeaten: 0, consecutiveTitles: 0 };
        this.board = null;
        this.weekInjuries = [];
        this.weekEvents = [];
        this.academyLevel = 1;
        this.loanedOut = [];
        this.pressQuestion = null;
        this.stadiumLevel = 1;
        this.staff = new StaffManager();
        this.scoutedPlayers = [];
        this.legacy = null;
        this.currentSponsor = null;
        this.seasonNumber = 1;
        this.seasonAwards = [];

        // === SPEC STATE FIELDS ===
        this.boardTension = 50;          // SPEC-072
        this.hallOfLegends = null;       // SPEC-078
        this.rivalryHistory = {};        // SPEC-080
        this.formerCompanions = [];      // SPEC-081
        this.chronicles = [];            // SPEC-082
        this.pendingCoachProposal = null;// SPEC-073
        this.activeChallenge = null;     // SPEC-074
        this.viewUnlockState = {         // SPEC-135
            seasonsCompleted: 0,
            titlesWon: 0,
            totalTransfers: 0,
            managerReputation: 10,
            unlockedViews: [],
        };
        this._squadMonitorCooldowns = {};// SPEC-132
        this.activeLoan = null;
        this.pendingMatchBonus = null;
        this.ticketPolicy = 'normal';
        this.activeAuctions = [];
        this.starPlayerId = null;        // SPEC-C2
    }

    // ================================================================
    // INIT + QUERIES (pure delegators)
    // ================================================================

    initGame(name: string, teamId: string | number, mode: string = 'manager', scenario: string = 'livre', playerPosition: string = 'ATA') {
        return (this._gameInitializer as any).init(this, name, teamId, mode, scenario, playerPosition);
    }

    getTeam(id: string | number): Team | undefined {
        return this.teams.find((t: Team) => t.id === parseInt(id as string, 10));
    }

    getTournament(id: string): Tournament | undefined {
        return this.tournaments.find((t: Tournament) => t.id === id);
    }

    getStandings(zone: string, div: string): unknown[] {
        const league = this.getTournament(`${zone}_${div}`);
        return league ? (league.standings as unknown[]) || [] : [];
    }

    // SPEC-135: view unlock query
    getViewAccess(viewId: string) {
        return canAccess(viewId, this.viewUnlockState);
    }

    // SPEC-135: update unlock stats
    updateViewUnlockStats({ titlesWon, totalTransfers, managerReputation }: { titlesWon?: number, totalTransfers?: number, managerReputation?: number } = {}): void {
        if (titlesWon !== undefined) this.viewUnlockState.titlesWon = titlesWon;
        if (totalTransfers !== undefined) this.viewUnlockState.totalTransfers = totalTransfers;
        if (managerReputation !== undefined) this.viewUnlockState.managerReputation = managerReputation;
    }

    // SPEC-070: computed manager identity
    getManagerIdentity() {
        const th = this.manager.tacticHistory || {};
        const tacticHistory = Object.entries(th).map(([tactic, gamesUsed]: [string, number]) => ({
            tactic, gamesUsed, winRate: 0,
        }));
        return computeManagerIdentity({
            managerId: this.manager.teamId as number | undefined,
            name: this.manager.name,
            isPlayerManager: this.mode === 'manager',
            tacticHistory,
            careerHistory: (this.manager.careerHistory || []) as any[],
            currentReputation: this.manager.reputation || 10,
        });
    }

    // ================================================================
    // SERVICE DELEGATORS — Formation / Tactic / Training / Talk
    // ================================================================

    setTactic(tacticId: string)              { return (this._formationService as any).setTactic(this, tacticId); }
    setFormation(formationId: string)        { return (this._formationService as any).setFormation(this, formationId); }
    saveFormationLayout(opts: unknown)        { return (this._formationService as any).saveFormationLayout(this, opts); }
    getMatchContext()                { return (this._formationService as any).getMatchContext(this); }
    applyLiveSubstitution(o: unknown, i: unknown, m: MatchResult)  { return (this._formationService as any).applyLiveSubstitution(this, o, i, m); }
    autoPickSquad()                  { return this._formationService.autoPickSquad(this); }
    doTeamTalk(talkId: string)               { return this._formationService.doTeamTalk(this, talkId); }
    doTraining(trainingId: string)           { return this._formationService.doTraining(this, trainingId); }

    // ================================================================
    // SERVICE DELEGATORS — Transfer / Market / Scouting
    // ================================================================

    generateMarket()                             { return this._transferService.generateMarket(this); }
    acceptTransferOffer(offerId: string)                  { return this._transferService.acceptTransferOffer(this, offerId); }
    rejectTransferOffer(offerId: string)                  { return this._transferService.rejectTransferOffer(this, offerId); }
    sellPlayer(playerId: string, amount: number)                  { return this._transferService.sellPlayer(this, playerId, amount); }
    makeBuyOffer(teamId: string, playerId: string, amount: number)        { return this._transferService.makeBuyOffer(this, teamId, playerId, amount); }
    npcMakeBuyOffer(buyerId: string, sellerId: string, pid: string, amt: number)  { return this._transferService.npcMakeBuyOffer(this, buyerId, sellerId, pid, amt); }
    scoutLeague(pos: string | null = null, minOVR: number = 60, lim: number = 20, maxAge: number = 29) { return this._scoutingService.scoutLeague(this, pos, minOVR, lim, maxAge); }
    doScouting(regionId: string)                          { return this._scoutingService.doScouting(this, regionId); }
    scoutRegionAction(regionId: string)                   { return this.doScouting(regionId); }
    signScoutedPlayer(index: number)                      { return this._scoutingService.signScoutedPlayer(this, index); }

    // ================================================================
    // SERVICE DELEGATORS — Sectors / Pacing
    // ================================================================

    getTeamSectors(teamId: string) { return this._sectorService.getTeamSectors(this, teamId); }
    getPacingEvents()      { return this._sectorService.getPacingEvents(this); }

    // ================================================================
    // SERVICE DELEGATORS — Facilities / Staff / Academy
    // ================================================================

    triggerYouthIntake() { return this._facilityService.triggerYouthIntake(this); }
    upgradeAcademy()     { return this._facilityService.upgradeAcademy(this); }
    upgradeStadium()     { return this._facilityService.upgradeStadium(this); }
    hireStaff(roleId: string)    { return this._facilityService.hireStaff(this, roleId); }
    fireStaff(roleId: string)    { return this._facilityService.fireStaff(this, roleId); }

    // ================================================================
    // SERVICE DELEGATORS — Loans
    // ================================================================

    loanPlayer(playerId: string, weeks: number = 20) { return this._loanService.loanPlayer(this, playerId, weeks); }
    getLoanOptions()                  { return this._loanService.getLoanOptions(this); }
    takeLoan(amount: number)                  { return this._loanService.takeLoan(this, amount); }
    processLoanPayment()             { return this._loanService.processLoanPayment(this); }
    payOffLoan()                     { return this._loanService.payOffLoan(this); }

    // ================================================================
    // SERVICE DELEGATORS — Press / Contracts / Coach
    // ================================================================

    respondCoachProposal(accept: boolean) { return this._pressService.respondCoachProposal(this, accept); }
    checkPressConference()       { return this._pressService.checkPressConference(this); }
    answerPress(optionId: string)        { return this._pressService.answerPress(this, optionId); }
    getRenewalOffer(playerId: string)    { return this._pressService.getRenewalOffer(this, playerId); }
    renewContract(playerId: string)      { return this._pressService.renewContract(this, playerId); }

    // ================================================================
    // ELIFOOT CLASSIC — Match Bonus / Ticket / Star Auction
    // ================================================================

    setMatchBonus(tierId: string)                     { return setMatchBonus(this as any, tierId); }
    getMatchBonusTiers()                      { return MATCH_BONUS_TIERS; }
    setTicketPolicy(policyId: string)                 { return setTicketPolicy(this as any, policyId); }
    getTicketPolicies()                       { return TICKET_POLICIES; }
    getActiveTicketPolicy()                   { return getActiveTicketPolicy(this as any); }
    startAuction(player: Player, bid: number, src: string = 'market', srcTeamId: string | number | null = null) { return startAuction(this as any, player, bid, src, srcTeamId as any); }
    raiseBid(auctionId: string, newBid: number)               { return raiseBid(this, auctionId, newBid); }
    getActiveAuctions()                       { return getActiveAuctions(this); }
    requiresAuction(player: Player)                   { return requiresAuction(player); }

    // ================================================================
    // MATCH SIMULATION — delegated to MatchSimulator
    // ================================================================

    playMatch(homeId: string | number, awayId: string | number, isCup: boolean = false) {
        return this._matchSimulator.simulate(this, homeId, awayId, isCup);
    }

    playMatchFirstHalf(homeId: string | number, awayId: string | number, isCup: boolean = false) {
        return this._matchSimulator.simulateInterval(this, homeId, awayId, 1, 45, null, isCup, true);
    }

    playMatchSecondHalf(homeId: string | number, awayId: string | number, firstHalfResult: unknown, isCup: boolean = false) {
        return this._matchSimulator.simulateInterval(this, homeId, awayId, 46, 90, firstHalfResult, isCup);
    }

    playMatchFromMinute(homeId: string | number, awayId: string | number, startMin: number, endMin: number, baseResult: unknown, isCup: boolean = false) {
        return this._matchSimulator.simulateInterval(this, homeId, awayId, startMin, endMin, baseResult, isCup, true);
    }

    /**
     * Find the pending match for the human manager in the current week.
     * Tournament-aware: checks both League fixtures and KnockoutCup phases.
     */
    getPendingHumanMatch(): { tournament: Tournament, match: MatchResult, isCup: boolean } | null {
        if (!this.manager || !this.manager.teamId) return null;
        const myTeamId = this.manager.teamId;
        const week = this.currentWeek;

        for (const t of this.tournaments) {
            if (t.fixtures && week < (t.fixtures as unknown[][]).length) {
                const myMatch = (t.fixtures as MatchResult[][])[week].find((m: MatchResult) => (m.home === myTeamId || m.away === myTeamId) && !m.played);
                if (myMatch) return { tournament: t, match: myMatch, isCup: false };
            }
            if (t.currentMatches && t.scheduleWeeks && (t.scheduleWeeks as number[])[(t.currentPhaseIndex as number)] === week) {
                const myMatch = (t.currentMatches as MatchResult[]).find((m: MatchResult) => (m.home === myTeamId || m.away === myTeamId) && !m.played);
                if (myMatch) return { tournament: t, match: myMatch, isCup: true };
            }
        }
        return null;
    }

    /**
     * Inject a pre-simulated human match result into the tournament schedule
     * so advanceWeek() registers it without resimulating.
     */
    resolveHumanMatch(matchResult: unknown): void {
        const pending = this.getPendingHumanMatch();
        if (pending && pending.match) {
            pending.match.prePlayedResult = matchResult;
        }
    }

    // ================================================================
    // CORE ORCHESTRATOR — advanceWeek (the ONE method with real logic)
    // ================================================================

    advanceWeek(): Record<string, unknown> {
        this.weekEvents = [];

        // BUG-026: auto-rollover at season boundary
        if (this.currentWeek >= 38) {
            this.startNewSeason();
        }

        const weekResults: Record<string, unknown> = {};
        this.tournaments.forEach((t: Tournament) => {
            const results = t.advanceWeek ? t.advanceWeek(this, this.currentWeek) : null;
            if (results) weekResults[t.id] = results;
        });

        // Manager mode: delegated to WeekProcessor (RFCT-005)
        if (this.mode === 'manager') {
            (this._weekProcessor as any).process(this, weekResults);
        }

        // NPC management + AI Director (RFCT-019.1)
        (this._npcWeekProcessor as any).process(this, weekResults);

        // Manager salary
        if (this.mode === 'manager' && this.manager) {
            this.manager.money = (this.manager.money || 0) + (this.manager.salary || 0);
        }

        // Player career week (RFCT-019.1)
        if (this.mode === 'player' && this.proPlayer) {

        }

        // Global suspension decrement
        this.teams.forEach((t: Team) => decrementSuspensions(t));

        this.currentWeek++;
        return weekResults;
    }

    startNewSeason() {
        return (this._seasonProcessor as any).rolloverSeason(this);
    }

    // ================================================================
    // PLAYER MODE — minimal inline (2 methods)
    // ================================================================

    registerPlayerGoal(_type: string): void {
        if (!this.proPlayer) return;
        this.proPlayer.seasonGoals = (this.proPlayer.seasonGoals || 0) + 1;
    }

    previewPlayerMatch(): { isBenched?: boolean } | null {
        if (this.mode !== 'player') return null;
        if (this.proPlayer && this.proPlayer.checkBenchStatus) {
            this.proPlayer.checkBenchStatus();
            return { isBenched: this.proPlayer.isBenched };
        }
        return null;
    }

    _gameInitializer: any;
    _formationService: any;
    _transferService: any;
    _scoutingService: any;
    _sectorService: any;
    _facilityService: any;
    _loanService: any;
    _pressService: any;
    _matchSimulator: any;
    _weekProcessor: any;
    _npcWeekProcessor: any;
    _seasonProcessor: any;
    _mythService: any;
    _relationshipService: any;
    _narrativeService: any;
    _careerService: any;
    _inheritanceService: any;
    llmNarrative: any;
}
