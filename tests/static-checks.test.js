/**
 * static-checks.test.js — Verificações estáticas de source code
 * 
 * Valida padrões que não são testáveis via unit test (UI state, imports, etc)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const readSrc = (path) => readFileSync(resolve(import.meta.dirname, '..', 'src', path), 'utf-8');

describe('BUG-003: SpeedRef pattern in Match Engine', () => {
    const matchEngine = readSrc('components/match/useMatchEngine.js');

    it('deve usar speedRef ao invés de speed no setInterval', () => {
        expect(matchEngine).toContain('speedRef.current');
    });

    it('deve sincronizar speedRef quando speed muda', () => {
        expect(matchEngine).toContain('speedRef.current = speed');
    });
});

describe('BUG-004: Reset preStep/talkDone no fulltime', () => {
    const matchPostGame = readSrc('components/match/MatchPostGame.jsx');

    it('botão dashboard deve resetar preStep', () => {
        expect(matchPostGame).toContain('setPreStep');
    });

    it('botão dashboard deve resetar talkDone', () => {
        expect(matchPostGame).toContain('setTalkDone');
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
    const matchEngine = readSrc('components/match/useMatchEngine.js');

    it('skipToEnd deve filtrar por endMin', () => {
        expect(matchEngine).toContain('e.minute <= endMin');
    });
});
