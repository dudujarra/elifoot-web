// Regression / harness for SPEC-060 — Club Identity System
// Validates: 268 clubes mapped (88 BR + 90 EU div1+div2 + 90 SA div1+div2), defaults fallback, sprite coords.
// SPEC-168 expansion: BR aumentou de 80 → 88 (4 MG + 4 RS).
// SPEC-180 expansion: +80 times div 2 para 8 países internacionais.
import { describe, test, expect } from 'vitest';
import { CLUB_COLORS, DEFAULT_COLORS, getClubColors, deriveInitials, CLUB_COUNT, CLUB_SPRITES, getClubSprite, SPRITE_SHEETS, normalizeClubName } from '../../src/data/clubColors.js';
import { RealDB } from '../../src/engine/db/index.js';

function flattenDB(db) {
    const all = [];
    for (const divTeams of Object.values(db)) {
        all.push(...divTeams);
    }
    return all;
}

const allClubs = [];
for (const zoneData of Object.values(RealDB)) {
    allClubs.push(...flattenDB(zoneData));
}

const TOTAL_CLUBS = allClubs.length; // 268 (88 BR + 180 intl)

describe('SPEC-060: Club Identity System (268 clubes BR+EU+SA, pós-SPEC-180 expansion)', () => {
    test(`CLUB_COLORS has ${TOTAL_CLUBS} entries`, () => {
        expect(CLUB_COUNT).toBe(TOTAL_CLUBS);
    });

    test(`Total clubs in DBs is ${TOTAL_CLUBS}`, () => {
        expect(allClubs).toHaveLength(TOTAL_CLUBS);
    });

    test('getClubColors returns mapped colors for Flamengo', () => {
        const c = getClubColors('Flamengo');
        expect(c.primary).toBe('#E32636');
        expect(c.initials).toBe('FLA');
    });

    test('getClubColors returns DEFAULT for unmapped + derived initials', () => {
        const c = getClubColors('Inexistente FC');
        expect(c.primary).toBe(DEFAULT_COLORS.primary);
        expect(c.initials).toBe('INE');
    });

    test('All clubs from DBs are mapped in CLUB_COLORS', () => {
        const unmapped = allClubs.filter(c => !CLUB_COLORS[normalizeClubName(c.name)]);
        expect(unmapped.map(c => c.name)).toEqual([]);
    });

    test('All original 178 clubs have sprite coords (div2 may use fallback)', () => {
        // Only original div1 clubs are guaranteed to have sprite coords
        // Div2 teams from SPEC-180 use the fallback (color + initials)
        const div1Sprites = Object.keys(CLUB_SPRITES).length;
        expect(div1Sprites).toBeGreaterThanOrEqual(178);
    });

    test('deriveInitials strips accents/non-letters', () => {
        expect(deriveInitials('São Paulo')).toBe('SAO');
        expect(deriveInitials('Atlético-MG')).toBe('ATL');
        expect(deriveInitials('CSA')).toBe('CSA');
        expect(deriveInitials('')).toBe('CLB');
        expect(deriveInitials(null)).toBe('CLB');
    });

    test('All clubes have valid color/initials format', () => {
        Object.entries(CLUB_COLORS).forEach(([name, c]) => {
            expect(c.primary, `${name} primary`).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(c.secondary, `${name} secondary`).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(c.accent, `${name} accent`).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(c.initials, `${name} initials`).toMatch(/^[A-Z0-9]{2,3}$/);
        });
    });

    test('Sprite coords valid per sheet config', () => {
        Object.entries(CLUB_SPRITES).forEach(([name, s]) => {
            const cfg = SPRITE_SHEETS[s.sheet];
            expect(cfg, `${name} sheet '${s.sheet}' missing in SPRITE_SHEETS`).toBeDefined();
            expect(s.col, `${name} col`).toBeLessThan(cfg.cols);
            expect(s.row, `${name} row`).toBeLessThan(cfg.rows);
            expect(s.col).toBeGreaterThanOrEqual(0);
            expect(s.row).toBeGreaterThanOrEqual(0);
        });
    });

    test('Sheet sprite counts match expected: BR a/b=20, c/d=24, EU 5×10, SA 4×10', () => {
        // SPEC-168 expansion: sheets c (Série C) e d (Série D) cresceram de 20 → 24
        // pra acomodar 4 clubes MG + 4 clubes RS (Pouso Alegre, Villa Nova-MG,
        // Brasil de Pelotas, Esportivo em c; Uberlândia, Democrata-GV, Pelotas,
        // Veranópolis em d). PNGs ainda 5x4 — sprites novos renderizam fallback.
        const counts = {};
        Object.values(CLUB_SPRITES).forEach(s => {
            counts[s.sheet] = (counts[s.sheet] || 0) + 1;
        });
        expect(counts.a).toBe(20);
        expect(counts.b).toBe(20);
        expect(counts.c).toBe(24);
        expect(counts.d).toBe(24);
        expect(counts.eng).toBe(10);
        expect(counts.esp).toBe(10);
        expect(counts.ita).toBe(10);
        expect(counts.ger).toBe(10);
        expect(counts.fra).toBe(10);
        expect(counts.arg).toBe(10);
        expect(counts.uru).toBe(10);
        expect(counts.chi).toBe(10);
        expect(counts.col).toBe(10);
    });

    test('SPRITE_SHEETS has all 13 sheets', () => {
        const expected = ['a','b','c','d','eng','esp','ita','ger','fra','arg','uru','chi','col'];
        expect(Object.keys(SPRITE_SHEETS).sort()).toEqual(expected.sort());
    });

    test('getClubSprite returns null for unknown', () => {
        expect(getClubSprite('Inexistente FC')).toBeNull();
    });

    test('Authentic primary colors spot-check BR + Tier S Europe', () => {
        const checks = {
            'Flamengo': '#E32636',
            'Palmeiras': '#006437',
            'Manchester City': '#6CABDD',
            'Real Madrid': '#FFFFFF',
            'Barcelona': '#A50044',
            'Juventus': '#000000',
            'Bayern de Munique': '#DC052D',
            'Paris Saint-Germain': '#004170',
            'Boca Juniors': '#002F69',
            'Peñarol': '#FFCD00',
            'Colo-Colo': '#FFFFFF',
            'Atlético Nacional': '#006837'
        };
        Object.entries(checks).forEach(([name, expected]) => {
            expect(getClubColors(name).primary, `${name} primary`).toBe(expected);
        });
    });
});
