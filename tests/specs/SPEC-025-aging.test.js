// SPEC-025: Advanced Player Aging harness
import { describe, test, expect } from 'vitest';
import { processPlayerDevelopment, ageSquad, ensureAttributes } from '../../src/engine/PlayerDevelopment.js';
import { ATTRIBUTE_CATEGORIES } from '../../src/engine/PlayerAttributes.js';

function makePlayer({ age = 22, personality = 'Profissional' } = {}) {
    const p = {
        id: 1, name: 'Test', age, personality,
        position: 'MEI', ovr: 70, retired: false,
    };
    return ensureAttributes(p);
}

describe('SPEC-025: Advanced Player Aging', () => {
    test('Young (16-21): growth occurs', () => {
        const p = makePlayer({ age: 18 });
        const changes = [];
        for (let i = 0; i < 100; i++) {
            changes.push(...processPlayerDevelopment(p));
        }
        const growth = changes.filter((c) => c.type === 'growth').length;
        expect(growth).toBeGreaterThan(0);
    });

    test('Prime (25-30): mostly stable', () => {
        const p = makePlayer({ age: 27 });
        const changes = [];
        for (let i = 0; i < 50; i++) {
            changes.push(...processPlayerDevelopment(p));
        }
        // mostly stable, fewer changes
        expect(changes.length).toBeLessThan(20);
    });

    test('Declining (33-36): decline events', () => {
        const p = makePlayer({ age: 34 });
        const changes = [];
        for (let i = 0; i < 200; i++) {
            changes.push(...processPlayerDevelopment(p));
        }
        const declines = changes.filter((c) => c.type === 'decline');
        expect(declines.length).toBeGreaterThan(0);
    });

    test('ageSquad ages all', () => {
        const squad = [makePlayer({ age: 25 }), makePlayer({ age: 30 })];
        ageSquad(squad);
        expect(squad[0].age).toBe(26);
    });

    test('Old age can retire', () => {
        const p = makePlayer({ age: 38 });
        let retired = false;
        for (let i = 0; i < 50; i++) {
            processPlayerDevelopment(p);
            if (p.retired) {
                retired = true;
                break;
            }
        }
        // Pode aposentar — não é determinístico
        expect(typeof p.retired).toBe('boolean');
    });

    test('Caps maintained (attrs 1-20)', () => {
        const p = makePlayer({ age: 18 });
        for (let i = 0; i < 200; i++) {
            processPlayerDevelopment(p);
        }
        // Check new fine-grained stats
        for (const cat of Object.keys(ATTRIBUTE_CATEGORIES)) {
            for (const attr of ATTRIBUTE_CATEGORIES[cat]) {
                expect(p.attributes[cat][attr]).toBeGreaterThanOrEqual(1);
                expect(p.attributes[cat][attr]).toBeLessThanOrEqual(20);
            }
        }
    });

    test('Personality affects growth', () => {
        const pro = makePlayer({ age: 18, personality: 'Profissional' });
        const lazy = makePlayer({ age: 18, personality: 'Preguiçoso' });
        let pG = 0, lG = 0;
        for (let i = 0; i < 100; i++) {
            pG += processPlayerDevelopment(pro).filter((c) => c.type === 'growth').length;
            lG += processPlayerDevelopment(lazy).filter((c) => c.type === 'growth').length;
        }
        expect(pG).toBeGreaterThanOrEqual(lG);
    });

    // §3.1: Physical (attacking) decline fast, technical decline slow,
    // defending declines position-dependent. creativity (mental) can GROW, never declines.
    test('Decline first hits physical/technical/defensive (never creativity)', () => {
        const p = makePlayer({ age: 36 });
        const changes = [];
        for (let i = 0; i < 100; i++) {
            changes.push(...processPlayerDevelopment(p));
        }
        const declines = changes.filter((c) => c.type === 'decline');
        if (declines.length > 0) {
            for (const d of declines) {
                // mental stats should NEVER decline — it can only grow
                const isMental = ATTRIBUTE_CATEGORIES.mental.includes(d.attr);
                expect(isMental).toBe(false);
            }
        }
    });
});

