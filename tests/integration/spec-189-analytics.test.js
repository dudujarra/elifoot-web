// SPEC-189: GoatCounter analytics regression
// AKITA-424: env-gated privacy-respecting analytics integration
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../..');

describe('SPEC-189: GoatCounter analytics', () => {
    test('src/utils/analytics.js exports initAnalytics + trackEvent + isAnalyticsEnabled', async () => {
        const mod = await import('../../src/utils/analytics.js');
        expect(typeof mod.initAnalytics).toBe('function');
        expect(typeof mod.trackEvent).toBe('function');
        expect(typeof mod.isAnalyticsEnabled).toBe('function');
    });

    test('isAnalyticsEnabled returns false when VITE_GOATCOUNTER_CODE unset', async () => {
        const { isAnalyticsEnabled } = await import('../../src/utils/analytics.js');
        expect(isAnalyticsEnabled()).toBe(false);
    });

    test('initAnalytics is no-op when env unset (no script injected)', async () => {
        const originalDocument = globalThis.document;
        let appendCount = 0;
        globalThis.document = {
            head: { appendChild: () => { appendCount++; } },
            createElement: () => ({ setAttribute: () => {}, async: true, src: '' }),
        };

        const { initAnalytics } = await import('../../src/utils/analytics.js');
        initAnalytics();

        expect(appendCount).toBe(0);

        globalThis.document = originalDocument;
    });

    test('trackEvent is no-op when env unset', async () => {
        const { trackEvent } = await import('../../src/utils/analytics.js');
        // Should not throw
        expect(() => trackEvent('test-event')).not.toThrow();
    });

    test('main.jsx imports + calls initAnalytics on boot', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/main.jsx'), 'utf-8');
        expect(src).toMatch(/from ['"]\.\/utils\/analytics/);
        expect(src).toMatch(/initAnalytics\(\)/);
    });

    test('.env.example documents VITE_GOATCOUNTER_CODE', () => {
        const env = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf-8');
        expect(env).toMatch(/VITE_GOATCOUNTER_CODE/);
        expect(env).toMatch(/goatcounter/i);
    });

    test('README has Analytics setup section', () => {
        const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
        expect(readme).toMatch(/Analytics setup/i);
        expect(readme).toMatch(/GoatCounter/);
        expect(readme).toMatch(/VITE_GOATCOUNTER_CODE/);
    });

    test('analytics.js uses https only (forbidden #6)', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/utils/analytics.js'), 'utf-8');
        expect(src).not.toMatch(/http:\/\//);
        expect(src).toMatch(/https:\/\//);
    });
});
