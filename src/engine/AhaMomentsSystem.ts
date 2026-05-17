/**
 * AhaMomentsSystem — SPEC-F5.2
 *
 * Cards estratégicos surgindo contextualmente baseado em milestones
 * da carreira do player.
 *
 * Pure module. Determinístico via contexto.
 */

import { EngineLogger } from './EngineLogger.js';

export interface AhaContext {
    matchesPlayed?: number;
    firstInjuryDetected?: boolean;
    offerExpiredCount?: number;
    lowMoraleStreak?: number;
    weeksSinceLastTransfer?: number;
    matchesWithSameTactic?: number;
    weeksWithoutYouthCheck?: number;
    balance?: number;
    [key: string]: any;
}

export interface AhaTemplate {
    id: string;
    trigger: (ctx: AhaContext) => boolean;
    title: string;
    body: string;
    once?: boolean;
}

const AHA_TEMPLATES: AhaTemplate[] = [
    {
        id: 'aha_home_advantage',
        trigger: ctx => (ctx.matchesPlayed || 0) === 5,
        title: 'VANTAGEM DE CASA',
        body: 'Você notou que vencer em casa é mais fácil? Considere táticas diferentes pra jogos fora.',
        once: true,
    },
    {
        id: 'aha_first_injury',
        trigger: ctx => (ctx.firstInjuryDetected || false),
        title: 'BANCO EXISTE POR ISSO',
        body: 'Reservas não são decoração. Veja PLANTEL pra ajustar antes do próximo jogo.',
        once: true,
    },
    {
        id: 'aha_offer_expired',
        trigger: ctx => (ctx.offerExpiredCount || 0) >= 1,
        title: 'OFERTAS TÊM PRAZO',
        body: 'Cada oferta de transferência tem deadline. Não procrastine, decida.',
        once: true,
    },
    {
        id: 'aha_morale_drop',
        trigger: ctx => (ctx.lowMoraleStreak || 0) >= 3,
        title: 'MORAL EM QUEDA',
        body: 'Time perdeu 3+ jogos seguidos. Faça PRELEÇÃO motivadora antes do próximo.',
        once: true,
    },
    {
        id: 'aha_market_inactive',
        trigger: ctx => (ctx.weeksSinceLastTransfer || 0) >= 8,
        title: 'PLANTEL ESTAGNADO',
        body: '8 semanas sem contratação. MERCADO tem ofertas — vale dar uma olhada.',
        once: true,
    },
    {
        id: 'aha_tactic_unchanged',
        trigger: ctx => (ctx.matchesWithSameTactic || 0) >= 10,
        title: 'TÁTICA PREVISÍVEL',
        body: '10 jogos com mesma tática. Adversários estão te lendo. Varia.',
        once: true,
    },
    {
        id: 'aha_youth_neglect',
        trigger: ctx => (ctx.weeksWithoutYouthCheck || 0) >= 15,
        title: 'BASE ABANDONADA',
        body: '15 semanas sem checar BASE. Promessas estão crescendo sem você ver.',
        once: true,
    },
    {
        id: 'aha_finance_warning',
        trigger: ctx => (ctx.balance || 100000) < 20000,
        title: 'COFRE BAIXO',
        body: 'Saldo abaixo de 20k. Considere vender reservas ou cortar staff.',
        once: true,
    },
];

const STORAGE_KEY = 'olefut_aha_seen';

function loadSeenIds(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr);
    } catch (err) {
        EngineLogger.capture(err, 'AhaMomentsSystem.loadSeenIds');
        return new Set();
    }
}

function persistSeenIds(set: Set<string>): void {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch (err) { EngineLogger.capture(err, 'AhaMomentsSystem.persistSeenIds'); }
}

export interface AhaMomentTriggered {
    id: string;
    title: string;
    body: string;
}

export function evaluateAhaMoments(context: AhaContext = {}): AhaMomentTriggered[] {
    const seen = loadSeenIds();
    const triggered = [];
    for (const template of AHA_TEMPLATES) {
        if (template.once && seen.has(template.id)) continue;
        try {
            if (template.trigger(context)) {
                triggered.push({
                    id: template.id,
                    title: template.title,
                    body: template.body,
                });
            }
        } catch (err) { EngineLogger.capture(err, 'AhaMomentsSystem.trigger'); }
    }
    return triggered;
}

export function markAhaSeen(ahaId: string): void {
    const seen = loadSeenIds();
    seen.add(ahaId);
    persistSeenIds(seen);
}

export function resetAhaSeen(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { EngineLogger.capture(err, 'AhaMomentsSystem.resetAhaSeen'); }
}

export { AHA_TEMPLATES, STORAGE_KEY };
