// SPEC-188: Soft launch metadata regression
// AKITA-420: og:* + twitter:card + robots.txt + sitemap.xml + og-image.png
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const distDir = path.join(projectRoot, 'dist');

describe('SPEC-188: Soft launch metadata (Fase D)', () => {
    beforeAll(() => {
        // Stale dist hides regressions (feedback_stale_dist_hides_budget memory).
        // Build only if dist missing — CI always builds first via npm run test:ci.
        if (!fs.existsSync(path.join(distDir, 'index.html'))) {
            execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
        }
    });

    test('dist/index.html has all OG tags', () => {
        const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        expect(html).toMatch(/property="og:type" content="website"/);
        expect(html).toMatch(/property="og:title"/);
        expect(html).toMatch(/property="og:description"/);
        expect(html).toMatch(/property="og:image" content="https:\/\/dudujarra\.github\.io\/olefut\/og-image\.png"/);
        expect(html).toMatch(/property="og:url" content="https:\/\/dudujarra\.github\.io\/olefut\/"/);
        expect(html).toMatch(/property="og:locale" content="pt_BR"/);
        expect(html).toMatch(/property="og:site_name" content="OléFUT"/);
        expect(html).toMatch(/property="og:image:width" content="1200"/);
        expect(html).toMatch(/property="og:image:height" content="630"/);
    });

    test('dist/index.html has Twitter card tags', () => {
        const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        expect(html).toMatch(/name="twitter:card" content="summary_large_image"/);
        expect(html).toMatch(/name="twitter:image"/);
        expect(html).toMatch(/name="twitter:title"/);
        expect(html).toMatch(/name="twitter:description"/);
        expect(html).toMatch(/name="twitter:url"/);
    });

    test('dist/robots.txt exists and references sitemap', () => {
        const robots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
        expect(robots).toMatch(/User-agent: \*/);
        expect(robots).toMatch(/Allow: \//);
        expect(robots).toMatch(/Sitemap: https:\/\/dudujarra\.github\.io\/olefut\/sitemap\.xml/);
        // Forbidden #4: must NOT block site
        expect(robots).not.toMatch(/Disallow: \/$/m);
    });

    test('dist/sitemap.xml exists and is well-formed', () => {
        const xml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
        expect(xml).toMatch(/<\?xml version="1\.0"/);
        expect(xml).toMatch(/xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
        expect(xml).toMatch(/<loc>https:\/\/dudujarra\.github\.io\/olefut\/<\/loc>/);
        // Forbidden #5: no build paths
        expect(xml).not.toMatch(/dist\//);
    });

    test('dist/og-image.png exists with correct dimensions and size', () => {
        const ogPath = path.join(distDir, 'og-image.png');
        expect(fs.existsSync(ogPath)).toBe(true);
        const stat = fs.statSync(ogPath);
        // > 1KB sanity, < 500KB per spec Forbidden #3
        expect(stat.size).toBeGreaterThan(1000);
        expect(stat.size).toBeLessThan(500_000);

        // Parse PNG IHDR (bytes 16-23: width then height, big-endian uint32)
        const buf = fs.readFileSync(ogPath);
        // PNG magic + IHDR offset: signature 8 bytes + chunk length 4 + chunk type 4 = 16
        expect(buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        expect(width).toBe(1200);
        expect(height).toBe(630);
    });

    test('og:title length ≤ 60 chars (FB best practice)', () => {
        const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        const m = html.match(/property="og:title" content="([^"]+)"/);
        expect(m).toBeTruthy();
        expect(m[1].length).toBeLessThanOrEqual(60);
    });

    test('og:description length ≤ 160 chars', () => {
        const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        const m = html.match(/property="og:description" content="([^"]+)"/);
        expect(m).toBeTruthy();
        expect(m[1].length).toBeLessThanOrEqual(160);
    });

    test('all OG/Twitter image URLs are absolute (scraper requirement)', () => {
        const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
        const matches = [...html.matchAll(/(?:property|name)="(?:og|twitter):(?:image|url)" content="([^"]+)"/g)];
        expect(matches.length).toBeGreaterThan(0);
        for (const m of matches) {
            expect(m[1]).toMatch(/^https:\/\//);
        }
    });
});
