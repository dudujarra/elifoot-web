/**
 * SeasonProcessor — Extracted from engine.startNewSeason() (AKITA-RFCT-005)
 *
 * Processa transição de temporada do modo manager:
 * - Legacy (títulos, reputação)
 * - SPEC-070 (Manager Identity update)
 * - SPEC-071 (Contract resolution + novo contrato)
 * - Promo/relegação para todas as divisões
 * - Close season stats, aging, awards
 * - Sponsor + board reset
 * - SPEC-072 (Board Tension: title/contract)
 * - SPEC-082 (Chronicle)
 * - SPEC-078 (Hall of Legends)
 * - SPEC-079 (Heritage Traits)
 * - SPEC-080 (Rivalry Upgrade)
 * - SPEC-081 (Filhos Regen)
 *
 * Invariante RFCT-005:
 * - Mesma ordem de execução que startNewSeason original
 * - Mutações no engine via referência
 * - Zero mudança comportamental
 */

import { BoardSystem } from '../engine/BoardSystem';
import { evaluateSponsor } from '../engine/SeasonSystem';
import { getDifficulty } from '../engine/systems/DifficultyModes.js';
import { closeSeasonStats, calculateSeasonAwards } from '../engine/PlayerTraits';
import { ageSquad } from '../engine/PlayerDevelopment';
import { EngineLogger } from '../engine/EngineLogger.js';
import { processLegacy } from './season/processLegacy.js';
import { processManagerIdentity } from './season/processManagerIdentity.js';
import { processContractGoals } from './season/processContractGoals.js';
import { handlePromoRelegation } from './season/processPromoRelegation.js';

import { processBoardTension } from './season/processBoardTension.js';
import { processChronicle } from './season/processChronicle.js';
import { processHallOfLegends } from './season/processHallOfLegends.js';
import { processHeritageTraits } from './season/processHeritageTraits.js';
import { processRivalryUpgrade } from './season/processRivalryUpgrade.js';
import { processFilhosRegen } from './season/processFilhosRegen.js';
import { processLuxuryTax } from './season/processLuxuryTax.js';
import { processMetaProgression } from './season/processMetaProgression.js';
import { processTournamentPrizes } from './season/processTournamentPrizes.js';
import { handleSeasonRollover } from './season/processSeasonRollover.js';

export class SeasonProcessor {
  /**
   * Processa transição de temporada para o time do manager.
   *
   * @param {Engine} engine — referência mutável
   */
  process(engine) {
    const team = engine.getTeam(engine.manager?.teamId);
    if (!team || engine.mode !== 'manager') return;
    const standings = engine.getStandings(team.zone, team.division);
    const pos = standings.findIndex(s => s.teamId === team.id) + 1 || standings.length;

    // Defensive initialization to prevent undefined push error
    engine.weekEvents = engine.weekEvents || [];

    // Legacy: titles + reputation
    processLegacy(engine, team, standings, pos);

    // SPEC-070: update manager reputation + career history
    processManagerIdentity(engine, team, pos);

    // SPEC-071: resolve contract goals
    processContractGoals(engine, team, standings, pos);

    // BUG-077: processPromoRelegation for ALL leagues
    handlePromoRelegation(engine, team);

    // Tournament prize money for cups
    processTournamentPrizes(engine, team);

    // Close player season stats (resets seasonGoals/seasonApps etc.)
    team.squad.forEach(p => closeSeasonStats(p, engine.seasonNumber, team.name));

    // BUG-076: ageSquad — players age + handle retirement messages
    const ageEvents = ageSquad(team.squad);
    ageEvents.forEach(e => engine.weekEvents.push(e));

    // BUG-FIX: Market players also age at end of season — prevents frozen free agents
    if (engine.marketPlayers && engine.marketPlayers.length > 0) {
      const marketAgeEvents = ageSquad(engine.marketPlayers);
      // Remove retired market players and replenish
      const _retiredIds = marketAgeEvents.filter(e => typeof e === 'string' && e.includes('aposentou')).length;
      engine.marketPlayers = engine.marketPlayers.filter(p => !p._retired);
      // Replenish pool to maintain 20 players
      if (typeof engine.generateMarket === 'function' && engine.marketPlayers.length < 15) {
        engine.generateMarket();
      }
    }

    // Season awards
    try {
      engine.seasonAwards = calculateSeasonAwards(team.squad, team.name, engine.seasonNumber);
      engine.seasonAwards.forEach(a => {
        engine.weekEvents.push(`${a.emoji} ${a.name}: ${a.player} (${a.value})`);
      });
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.seasonAwards', {
        season: engine.seasonNumber
      });
    }

    // Update sponsor + board for new season
    try {
      engine.currentSponsor = evaluateSponsor(team.division, pos);
      if (engine.board && !engine.board.isFired) {
        const diff = getDifficulty();
        engine.board = new BoardSystem(team.division, team.balance, {
          fireCooldown: diff.modifiers.boardFireCooldown || 0,
          boardPatience: diff.modifiers.boardPatience || 1.0,
          currentWeek: engine.currentWeek || 0
        });
      }
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.sponsorBoard', {
        season: engine.seasonNumber
      });
    }

    // SPEC-072: board tension — title or contract
    processBoardTension(engine, pos);

    // SPEC-082: Chronicle
    processChronicle(engine, team, standings, pos);

    // SPEC-078: Hall of Legends
    processHallOfLegends(engine, team);

    // SPEC-079: Heritage Traits
    processHeritageTraits(engine, team);

    // SPEC-080: Rivalry Upgrade
    processRivalryUpgrade(engine, team);

    // SPEC-081: Filhos Regen
    processFilhosRegen(engine, team);

    // Luxury Tax (Wealth cap to prevent broken late-game economies)
    processLuxuryTax(engine, team);

    // §14.3: Meta-Progression — evaluate cross-career achievements at season end
    processMetaProgression(engine, team, pos);
  }

/** @private §16.2: Find top scorer for trophy ceremony */
  _findTopScorer(team) {
    if (!team?.squad?.length) return null;
    let best = null;
    for (const p of team.squad) {
      const goals = p.career?.seasonGoals ?? p.seasonGoals ?? 0;
      if (!best || goals > best.goals) {
        best = {
          name: p.name,
          goals
        };
      }
    }
    return best?.goals > 0 ? best : null;
  }

/**
   * SPEC-200: Processa fim de temporada para TODOS os times NPC.
   * - Recalcula prestige de cada time
   * - Ajusta budgets baseado em divisão (TV money)
   * - Envelhece contratos de NPC → gera free agents
   * - Incrementa _seasonsAtClub dos jogadores
   */

/** @private §14.3: Meta-Progression — evaluate achievements at season end */

/** @private — Award prize money for cup participation/victory */

// ========================================================================
  // RFCT-019.8: Full season rollover (extracted from engine.startNewSeason)
  // ========================================================================

  /**
   * Full season rollover: chama process() + emergency squad replenish +
   * re-init leagues + re-qualify continental cups + brain persistence + week reset.
   *
   * Extraído de engine.startNewSeason (135 LOC).
   */
  rolloverSeason(engine) {
    handleSeasonRollover(engine, this);
  }
}