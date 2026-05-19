// SPEC-192: no orphan realPlayers.json
// AKITA-422: delete monolithic 2MB JSON + dead vite fallback (post SPEC-177 split)
import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

describe('SPEC-192: no orphan realPlayers.json', () => {
    test('src/data/realPlayers.json removed', () => {
        expect(existsSync(join(projectRoot, 'src/data/realPlayers.json'))).toBe(false);
    });

    test('regional chunks intact (BRA, EUR, SAM, pool)', () => {
        for (const region of ['BRA', 'EUR', 'SAM', 'pool']) {
            expect(existsSync(join(projectRoot, `src/data/realPlayers_${region}.json`))).toBe(true);
        }
    });

    test('vite.config has no legacy bare realPlayers.json fallback', () => {
        const cfg = readFileSync(join(projectRoot, 'vite.config.js'), 'utf-8');
        // Must NOT contain bare realPlayers.json check (only regional matchers)
        expect(cfg).not.toMatch(/id\.includes\('realPlayers\.json'\)/);
        // Regional matchers MUST remain
        expect(cfg).toMatch(/realPlayers_BRA\.json/);
        expect(cfg).toMatch(/realPlayers_pool\.json/);
    });

    test('engine/data.js still imports only regional chunks', () => {
        const data = readFileSync(join(projectRoot, 'src/engine/data.js'), 'utf-8');
        expect(data).not.toMatch(/import\(['"]\.\.\/data\/realPlayers\.json['"]\)/);
        expect(data).toMatch(/realPlayers_BRA\.json/);
        expect(data).toMatch(/realPlayers_pool\.json/);
    });
});
