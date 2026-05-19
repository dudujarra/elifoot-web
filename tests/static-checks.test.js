/**
 * static-checks.test.js — Verificações estáticas de source code
 * 
 * Valida padrões que não são testáveis via unit test (UI state, imports, etc)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const readSrc = (path) => readFileSync(resolve(import.meta.dirname, '..', 'src', path), 'utf-8');

describe('BUG-003: SpeedRef pattern in match ticker hook', () => {
    // SPEC-186: post-AKITA-411, ticker logic extracted to match/useMatchEngine.js.
    // tickerStateRef assertion dropped — refactor consolidated state into hook closure,
    // restart-via-ref no longer needed (hook re-mount handles it).
    const useMatchEngine = readSrc('components/match/useMatchEngine.js');

    it('deve usar speedRef ao invés de speed no setInterval', () => {
        expect(useMatchEngine).toContain('speedRef.current');
    });

    it('deve sincronizar speedRef quando speed muda', () => {
        expect(useMatchEngine).toContain('speedRef.current = speed');
    });
});

describe('BUG-004: Reset preStep/talkDone no fulltime', () => {
    // SPEC-186: post-AKITA-411, post-match reset logic moved to match/MatchPostGame.jsx.
    const matchPostGame = readSrc('components/match/MatchPostGame.jsx');

    it('botão dashboard deve resetar preStep', () => {
        expect(matchPostGame).toContain('setPreStep(1)');
    });

    it('botão dashboard deve resetar talkDone', () => {
        expect(matchPostGame).toContain('setTalkDone(false)');
    });

    it('reset deve ocorrer no fluxo de changeView para dashboard', () => {
        // BUG-022 mode-aware nav: post-match button leads back to dashboard with reset state.
        // Assert both reset calls + changeView coexist in the post-game component.
        expect(matchPostGame).toContain('setPreStep(1)');
        expect(matchPostGame).toContain('setTalkDone(false)');
        expect(matchPostGame).toContain('changeView');
    });
});

describe('BUG-005: No dead imports in MarketView', () => {
    const marketView = readSrc('components/MarketView.jsx');

    it('não deve importar generateCounterOffer', () => {
        expect(marketView).not.toContain('generateCounterOffer');
    });
});

describe('BUG-006: MarketView deve usar engine.sellPlayer', () => {
    const marketView = readSrc('components/MarketView.jsx');

    it('deve chamar engine.sellPlayer para vender', () => {
        expect(marketView).toContain('engine.sellPlayer');
    });

    it('não deve mutar team.squad diretamente', () => {
        // Should not have team.squad = team.squad.filter
        expect(marketView).not.toContain('team.squad = team.squad.filter');
    });
});

describe('Engine methods completeness', () => {
    const engineSrc = readSrc('engine/engine.js');

    it('deve ter scoutRegionAction', () => {
        expect(engineSrc).toContain('scoutRegionAction(');
    });

    it('deve ter signScoutedPlayer', () => {
        expect(engineSrc).toContain('signScoutedPlayer(');
    });

    it('deve ter sellPlayer', () => {
        expect(engineSrc).toContain('sellPlayer(');
    });

    it('deve ter doScouting', () => {
        expect(engineSrc).toContain('doScouting(');
    });
});

describe('BUG-007: MarketView handleBuy não deve usar filter assignment', () => {
    const marketView = readSrc('components/MarketView.jsx');

    it('não deve reatribuir engine.marketPlayers via filter', () => {
        expect(marketView).not.toContain('engine.marketPlayers = engine.marketPlayers.filter');
    });

    it('deve usar splice para remover do market', () => {
        expect(marketView).toContain('.splice(');
    });
});

describe('BUG-008: SquadView handleSell via engine', () => {
    const squadView = readSrc('components/SquadView.jsx');

    it('deve usar engine.sellPlayer', () => {
        expect(squadView).toContain('engine.sellPlayer');
    });

    it('não deve mutar team.squad diretamente', () => {
        expect(squadView).not.toContain('team.squad = team.squad.filter');
    });

    it('não deve mutar team.balance diretamente', () => {
        expect(squadView).not.toContain('team.balance +=');
    });
});

describe('BUG-009: skipToEnd não duplica eventos', () => {
    // SPEC-186: post-AKITA-411, skipToEnd lives in match/useMatchEngine.js.
    // Impl changed: full-replace with filtered list (events ≤ endMin) instead of merge.
    // Dedup guaranteed by single-source filter — no accumulation across skips.
    const useMatchEngine = readSrc('components/match/useMatchEngine.js');

    it('skipToEnd deve filtrar eventos até endMin', () => {
        expect(useMatchEngine).toMatch(/skipToEnd\s*=/);
        expect(useMatchEngine).toContain('e.minute <= endMin');
    });

    it('skipToEnd deve substituir displayedEvents (não acumular)', () => {
        // Look for the assignment pattern within the skipToEnd block:
        // setDisplayedEvents(eventsToShow) — full replace, not [...prev, ...]
        const skipBlock = useMatchEngine.slice(useMatchEngine.indexOf('skipToEnd'));
        expect(skipBlock).toMatch(/setDisplayedEvents\(eventsToShow\)/);
    });
});
