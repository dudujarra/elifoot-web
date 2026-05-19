// SPEC-190: LandingIntro regression
// AKITA-425: first-time visitor intro screen, gated by localStorage flag
import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../..');

describe('SPEC-190: LandingIntro', () => {
    test('LandingIntro.jsx exists with named export', async () => {
        const mod = await import('../../src/components/LandingIntro.jsx');
        expect(typeof mod.LandingIntro).toBe('function');
    });

    test('LandingIntro.css exists with key classes', () => {
        const css = fs.readFileSync(path.join(projectRoot, 'src/components/LandingIntro.css'), 'utf-8');
        expect(css).toMatch(/\.landing-intro\b/);
        expect(css).toMatch(/\.landing-hero\b/);
        expect(css).toMatch(/\.landing-cta-primary\b/);
        expect(css).toMatch(/\.landing-cta-skip\b/);
        expect(css).toMatch(/\.landing-features\b/);
        expect(css).toMatch(/\.landing-github\b/);
    });

    test('LandingIntro.jsx renders title, tagline, 3 features, 2 CTAs, github link', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/components/LandingIntro.jsx'), 'utf-8');
        expect(src).toMatch(/OléFUT/);
        expect(src).toMatch(/Simulador de futebol/);
        expect(src).toMatch(/170 clubes reais/);
        expect(src).toMatch(/Engine determinística/);
        expect(src).toMatch(/100% offline/);
        expect(src).toMatch(/Jogar agora/);
        expect(src).toMatch(/Pular intro/);
        expect(src).toMatch(/github\.com\/dudujarra\/olefut/);
        expect(src).toMatch(/rel="noopener noreferrer"/);
        expect(src).toMatch(/target="_blank"/);
    });

    test('LandingIntro sets localStorage flag on CTA click', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/components/LandingIntro.jsx'), 'utf-8');
        expect(src).toMatch(/localStorage\.setItem\(['"]olefut_seen_intro['"]/);
    });

    test('LandingIntro.jsx has NO inline styles (Mandamento brutal #4)', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/components/LandingIntro.jsx'), 'utf-8');
        // Allow style={{}} ZERO times (CSS classes only)
        expect(src).not.toMatch(/style=\{\{/);
    });

    test('App.jsx imports LandingIntro + gates behind olefut_seen_intro flag', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/App.jsx'), 'utf-8');
        expect(src).toMatch(/import \{ LandingIntro \}/);
        expect(src).toMatch(/olefut_seen_intro/);
        expect(src).toMatch(/<LandingIntro/);
    });

    test('App.jsx LandingIntro gate respects gameState.started (returning users skip)', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/App.jsx'), 'utf-8');
        // Gate condition must include both showIntro AND !gameState.started
        expect(src).toMatch(/showIntro && !gameState\.started/);
    });

    test('LandingIntro CSS has mobile + tablet breakpoints', () => {
        const css = fs.readFileSync(path.join(projectRoot, 'src/components/LandingIntro.css'), 'utf-8');
        expect(css).toMatch(/@media \(min-width: 768px\)/);
        expect(css).toMatch(/@media \(max-width: 480px\)/);
    });
});
