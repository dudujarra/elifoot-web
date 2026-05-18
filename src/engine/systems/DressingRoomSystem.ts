import { pickNarrative } from './NarrativeSystem.js';
import { Team, Player } from "../types.js";

/**
 * Dressing Room Dynamics — relações no vestiário
 * - Cliques: jogadores com alta moral formam grupo positivo
 * - Cancers: jogadores insatisfeitos contaminam moral
 * - Leader: jogador mais velho com moral alta estabiliza o grupo
 *
 * @param {object[]} squad
 * @param {{ position?: number, totalTeams?: number, streak?: number }} [ctx={}]  SPEC-146 context
 */
export function processDressingRoom(squad: Player[], ctx: any = {}) {
    const events = [];

    // Find leader
    const candidates = squad
        .filter((p: Player) => (p.age || 25) >= 28 && (p.moral || 50) >= 65 && !p.injury)
        .sort((a: Player, b: Player) => (b.moral || 50) - (a.moral || 50));
    const leader = candidates[0] || null;

    // Count unhappy players
    const unhappy = squad.filter((p: Player) => (p.moral || 50) < 30 && !p.injury);
    const happy = squad.filter((p: Player) => (p.moral || 50) > 75);

    // Average moral for narrative context
    const avgMoral = squad.length
        ? squad.reduce((s: number, p: Player) => s + (p.moral || 50), 0) / squad.length
        : 50;

    // Leader stabilizes
    if (leader && unhappy.length > 0 && unhappy.length <= 3) {
        unhappy.forEach((p: Player) => {
            p.moral = Math.min(100, (p.moral || 50) + 3);
        });
        events.push(`👔 ${leader.name} conversou com jogadores insatisfeitos. Moral melhorou.`);
    }

    // Cancer effect: if 4+ unhappy, they drag others down
    if (unhappy.length >= 4) {
        squad.forEach((p: Player) => {
            if ((p.moral || 50) > 40) {
                p.moral = Math.max(0, (p.moral || 50) - 2);
            }
        });
        events.push(`☠️ Vestiário em crise! ${unhappy.length} jogadores insatisfeitos contaminam o grupo.`);
    }

    // Good vibes: if 6+ happy, emit contextual narrative (SPEC-146 expansion)
    if (happy.length >= 6) {
        squad.forEach((p: Player) => {
            p.moral = Math.min(100, (p.moral || 50) + 1);
        });
        events.push(pickNarrative({
            position: ctx.position,
            totalTeams: ctx.totalTeams,
            moral: avgMoral,
            streak: ctx.streak,
        }));
    }

    // Captain system: highest OVR veteran gets +2 moral stability
    if (leader) {
        leader._isCaptain = true;
    }

    return { events, leader };
}
