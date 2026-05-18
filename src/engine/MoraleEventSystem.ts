import { rng as systemRng } from './rng.js';
import { Player } from './types.js';

export interface MoraleEventDef {
    id: string;
    text: string;
    effect: { targetMoral: number; teamMoral: number; boardConfidence?: number };
    chance: number;
    req?: (p: Player) => boolean;
    dual?: boolean;
}

export const MORALE_EVENTS: MoraleEventDef[] = [
    // Positive
    { id: "birthday", text: "🎂 {player} fez aniversário! O grupo celebrou no vestiário.", effect: { targetMoral: 5, teamMoral: 1 }, chance: 0.03 },
    { id: "fan_chant", text: "🎵 A torcida criou um canto especial para {player}!", effect: { targetMoral: 8, teamMoral: 0 }, chance: 0.02 },
    { id: "charity", text: "🤝 {player} fez trabalho social na comunidade. Imprensa elogiou.", effect: { targetMoral: 5, teamMoral: 2 }, chance: 0.015 },
    { id: "national_call", text: "🇧🇷 {player} foi convocado para a seleção!", effect: { targetMoral: 10, teamMoral: 2 }, chance: 0.02, req: (p: Player) => p.ovr >= 75 },
    { id: "award_nominee", text: "🏅 {player} foi indicado ao prêmio de melhor do mês!", effect: { targetMoral: 7, teamMoral: 1 }, chance: 0.02, req: (p: Player) => p.form?.trend === 'hot' },
    { id: "team_dinner", text: "🍽️ O elenco saiu para jantar juntos. Clima excelente.", effect: { targetMoral: 0, teamMoral: 3 }, chance: 0.03 },
    { id: "new_boots", text: "👟 {player} ganhou chuteira nova do patrocinador. Animado!", effect: { targetMoral: 4, teamMoral: 0 }, chance: 0.025 },

    // Negative
    { id: "nightclub", text: "🕺 {player} foi flagrado na balada antes do jogo. Diretoria irritada.", effect: { targetMoral: -8, teamMoral: -2, boardConfidence: -3 }, chance: 0.015 },
    { id: "controversy", text: "💬 {player} criticou o treinador nas redes sociais.", effect: { targetMoral: -10, teamMoral: -3 }, chance: 0.01 },
    { id: "homesick", text: "😢 {player} está com saudade de casa. Quer sair.", effect: { targetMoral: -12, teamMoral: 0 }, chance: 0.01, req: (p: Player) => (p.age || 25) <= 21 },
    { id: "salary_complaint", text: "💰 {player} reclamou do salário para os colegas.", effect: { targetMoral: -5, teamMoral: -2 }, chance: 0.02, req: (p: Player) => (p.moral || 50) < 40 },
    { id: "fight", text: "🥊 {player1} e {player2} brigaram no treino!", effect: { targetMoral: -10, teamMoral: -4 }, chance: 0.008, dual: true },
    { id: "media_leak", text: "📰 Alguém do vestiário vazou informações para a imprensa.", effect: { targetMoral: 0, teamMoral: -5, boardConfidence: -2 }, chance: 0.01 },

    // Neutral/Complex
    { id: "agent_call", text: "📞 O empresário de {player} ligou para sondar mercado.", effect: { targetMoral: -3, teamMoral: 0 }, chance: 0.02, req: (p: Player) => p.ovr >= 70 },
    { id: "rumor_transfer", text: "📰 Rumores: {player} interessa ao exterior.", effect: { targetMoral: -2, teamMoral: -1 }, chance: 0.02, req: (p: Player) => p.ovr >= 72 },
];

/**
 * Process morale events for the week. Returns array of event descriptions.
 */
export function processMoraleEvents(squad: any[], board?: any): string[] {
    const events = [];

    for (const ev of MORALE_EVENTS) {
        if (systemRng() > ev.chance) continue;

        if (ev.dual) {
            // Fight event — pick 2 random players
            if (squad.length < 2) continue;
            const shuffled = [...squad].sort(() => systemRng() - 0.5);
            const p1 = shuffled[0], p2 = shuffled[1];
            p1.moral = Math.max(0, (p1.moral || 50) + ev.effect.targetMoral);
            p2.moral = Math.max(0, (p2.moral || 50) + ev.effect.targetMoral);
            if (ev.effect.teamMoral) squad.forEach((p: Player) => { p.moral = Math.max(0, Math.min(100, (p.moral || 50) + ev.effect.teamMoral)); });
            if (ev.effect.boardConfidence && board) board.confidence = Math.max(0, Math.min(100, board.confidence + ev.effect.boardConfidence));
            events.push(ev.text.replace('{player1}', p1.name).replace('{player2}', p2.name));
            continue;
        }

        // Pick a random eligible player
        const eligible = squad.filter((p: Player) => !p.injury && (!ev.req || ev.req(p)));
        if (eligible.length === 0) continue;
        const target = eligible[Math.floor(systemRng() * eligible.length)];

        target.moral = Math.max(0, Math.min(100, (target.moral || 50) + ev.effect.targetMoral));
        if (ev.effect.teamMoral) squad.forEach((p: Player) => { p.moral = Math.max(0, Math.min(100, (p.moral || 50) + ev.effect.teamMoral)); });
        if (ev.effect.boardConfidence && board) board.confidence = Math.max(0, Math.min(100, board.confidence + ev.effect.boardConfidence));

        events.push(ev.text.replace('{player}', target.name));
        break; // Max 1 event per week (to avoid spam)
    }

    return events;
}
