// @ts-check
import { defineConfig } from '@playwright/test';

/**
 * §11: E2E Testing Configuration
 * Full game flows: start → simulate season → verify standings
 */
export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/results',
    timeout: 60_000,
    retries: 1,
    workers: 1, // Sequential — deterministic
    use: {
        baseURL: 'http://localhost:4173',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        viewport: { width: 1280, height: 800 },
    },
    // AKITA-415: serve built dist via plain static server. Avoids vite dev mode
    // (slow first-compile timeouts in CI) AND vite preview (which re-applies
    // base='/olefut/' from config). `npx serve` ships with node, serves dist at
    // root. CI workflow does the build (with E2E_BUILD=1 for root base).
    webServer: {
        command: 'npx serve -s dist -l tcp://localhost:4173',
        port: 4173,
        timeout: 30_000,
        reuseExistingServer: true,
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
