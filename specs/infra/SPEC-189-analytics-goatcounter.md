# SPEC-189: Analytics — GoatCounter (privacy-respecting, cookieless)

> **Bloco 3.4 Fase D part 2**. Sem dados de uso, launch é cego. Adicionar analytics minimal viable, privacy-respecting (no cookies, no PII, GDPR-friendly). Permitir Dudu medir: visitas, países, referrer, top pages, eventos opcionais (game-start, season-complete).

---

## O que é

Integrar **GoatCounter** (https://www.goatcounter.com/) — open-source analytics, privacy-respecting, no cookies, free tier (100k pageviews/mo). 1 script tag `<script async src="//gc.zgo.at/count.js">`.

Implementação **env-gated**: script só injeta se `VITE_GOATCOUNTER_CODE` env var setado. Sem env = sem analytics = sem regressão. Permite ship código agora, Dudu seta env quando criar conta.

**Por que GoatCounter** (vs alternativas):
- ✅ Privacy-first: zero cookies, hash IP, GDPR-friendly out-of-box
- ✅ Free tier 100k pageviews/mo (suficiente pra soft launch)
- ✅ 1 script tag, zero config além do site code
- ✅ Open-source (self-host possível futuro)
- ✅ Custom events API simples (`window.goatcounter.count({path: 'evt-game-start'})`)
- ❌ Plausible: paid only, $9/mo mínimo
- ❌ umami: requires self-hosting
- ❌ Google Analytics: violates privacy-first mandate

---

## Input

### Arquivos a tocar
- `src/utils/analytics.js` — NEW, env-gated injector + custom event helper
- `src/main.jsx` — call `initAnalytics()` no boot
- `index.html` — comment SPEC-189 reference (script injetado runtime via JS)
- `README.md` — section "Analytics setup" com signup instructions
- `.env.example` — NEW template documentando `VITE_GOATCOUNTER_CODE`
- `tests/integration/spec-189-analytics.test.js` — NEW harness

### Env var
```bash
VITE_GOATCOUNTER_CODE=olefut  # = handle Dudu cria em goatcounter.com signup
```

Script source URL fixo: `https://gc.zgo.at/count.js`. Data attribute `data-goatcounter` = `https://${VITE_GOATCOUNTER_CODE}.goatcounter.com/count`.

### Origem
- Dudu signup futuro em https://www.goatcounter.com/signup (~2min, free)
- Vite docs envvar: https://vite.dev/guide/env-and-mode.html

---

## Output esperado

### 1. `src/utils/analytics.js` (NEW)

```javascript
// SPEC-189: GoatCounter analytics, privacy-respecting, env-gated.
// No-op if VITE_GOATCOUNTER_CODE unset (dev local, tests, pre-signup).

const CODE = import.meta.env?.VITE_GOATCOUNTER_CODE;
const SCRIPT_SRC = 'https://gc.zgo.at/count.js';

let _initialized = false;

export function initAnalytics() {
    if (_initialized) return;
    if (!CODE) return; // env unset → no-op (dev, test, pre-signup)
    if (typeof document === 'undefined') return; // SSR/Node safety

    const endpoint = `https://${CODE}.goatcounter.com/count`;
    const script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT_SRC;
    script.setAttribute('data-goatcounter', endpoint);
    document.head.appendChild(script);
    _initialized = true;
}

export function trackEvent(eventName) {
    if (!CODE) return;
    if (typeof window === 'undefined') return;
    if (typeof window.goatcounter?.count !== 'function') return;
    window.goatcounter.count({
        path: `evt-${eventName}`,
        event: true,
    });
}

export function isAnalyticsEnabled() {
    return !!CODE;
}
```

### 2. `src/main.jsx` (edit)

Adicionar import + call no boot:
```javascript
import { initAnalytics } from './utils/analytics.js';

initAnalytics();
```

### 3. `.env.example` (NEW)

```bash
# SPEC-189: GoatCounter analytics (optional)
# Signup: https://www.goatcounter.com/signup (free, ~2min)
# After signup, set this to your chosen handle (e.g., "olefut"):
# VITE_GOATCOUNTER_CODE=olefut
```

### 4. `README.md` (edit)

Adicionar section:
```markdown
## Analytics setup (optional)

OléFUT integra **GoatCounter** — analytics privacy-respecting (no cookies, no PII).

**Setup**:
1. Signup grátis em https://www.goatcounter.com/signup
2. Choose handle (ex: `olefut` → site fica em `olefut.goatcounter.com`)
3. Crie `.env.production`:
   ```bash
   VITE_GOATCOUNTER_CODE=olefut
   ```
4. `npm run build` → script tag inserido automaticamente
5. Deploy → métricas em `https://olefut.goatcounter.com`

**Sem env var**: zero impacto, zero script extra. Production builds sem analytics são válidos.
```

### 5. `tests/integration/spec-189-analytics.test.js` (NEW harness)

```javascript
import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../..');

describe('SPEC-189: GoatCounter analytics', () => {
    test('src/utils/analytics.js exports initAnalytics + trackEvent', async () => {
        const mod = await import('../../src/utils/analytics.js');
        expect(typeof mod.initAnalytics).toBe('function');
        expect(typeof mod.trackEvent).toBe('function');
        expect(typeof mod.isAnalyticsEnabled).toBe('function');
    });

    test('isAnalyticsEnabled returns false when env unset', async () => {
        // Vitest doesn't load VITE_GOATCOUNTER_CODE by default
        const { isAnalyticsEnabled } = await import('../../src/utils/analytics.js');
        expect(isAnalyticsEnabled()).toBe(false);
    });

    test('initAnalytics is no-op when env unset (no script injected)', async () => {
        // Mock document
        const mockHead = { appendChild: () => {} };
        let appendCount = 0;
        const originalDocument = globalThis.document;
        globalThis.document = {
            head: { appendChild: () => { appendCount++; } },
            createElement: () => ({ setAttribute: () => {} }),
        };

        const { initAnalytics } = await import('../../src/utils/analytics.js');
        initAnalytics();

        expect(appendCount).toBe(0); // no script injected because no env

        globalThis.document = originalDocument;
    });

    test('main.jsx calls initAnalytics on boot', () => {
        const src = fs.readFileSync(path.join(projectRoot, 'src/main.jsx'), 'utf-8');
        expect(src).toMatch(/from ['"]\.\/utils\/analytics/);
        expect(src).toMatch(/initAnalytics\(\)/);
    });

    test('.env.example documents VITE_GOATCOUNTER_CODE', () => {
        const env = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf-8');
        expect(env).toMatch(/VITE_GOATCOUNTER_CODE/);
    });

    test('README has Analytics setup section', () => {
        const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
        expect(readme).toMatch(/Analytics setup/i);
        expect(readme).toMatch(/GoatCounter/);
        expect(readme).toMatch(/VITE_GOATCOUNTER_CODE/);
    });
});
```

---

## Regras de validação

- [ ] `src/utils/analytics.js` exporta 3 funções
- [ ] `import.meta.env.VITE_GOATCOUNTER_CODE` lido (vite env mechanism)
- [ ] Sem env: zero side effects (no script tag injetado)
- [ ] Com env: script tag injetado runtime, `data-goatcounter` apontando endpoint correto
- [ ] `main.jsx` chama `initAnalytics()` no boot
- [ ] `.env.example` documenta env var
- [ ] README seção "Analytics setup" presente
- [ ] Build clean
- [ ] Suite 1839 → 1845 (+6 SPEC-189)
- [ ] Lint 0 errors

### Smoke test manual (pós-deploy + signup)
- [ ] Dudu signup em goatcounter.com com handle `olefut` (sugerido)
- [ ] Set `VITE_GOATCOUNTER_CODE=olefut` em ambiente de build (GitHub Actions secret)
- [ ] Re-deploy
- [ ] Abrir `https://olefut.goatcounter.com` — confirma pageview chega

---

## Forbidden

1. **Google Analytics** — violates privacy-first mandate (cookies, PII).
2. **Hard-coded handle no código** — env var só.
3. **Script tag estático em index.html** — env-gated runtime injection.
4. **Custom event spam** — começar minimal (só pageview default). Eventos opcionais via `trackEvent()` apenas quando metric específica é decided.
5. **PII em event names** — `trackEvent('user-12345-clicked')` PROIBIDO. Eventos genéricos: `'game-start'`, `'season-complete'`, etc.
6. **Endpoint http://** — só https.
7. **Outras analytics ao mesmo tempo** — só GoatCounter neste PR.

---

## Dependências
- Vite env vars (built-in)
- GoatCounter free tier (Dudu signup post-merge)

## Estimativa
- analytics.js: 10min
- main.jsx edit: 2min
- .env.example: 2min
- README section: 5min
- harness: 15min
- build + test + commit + PR: 15min
- **Total: ~50min**

## Pós-merge ação Dudu
1. Signup goatcounter.com → handle `olefut`
2. Set GitHub Actions secret `VITE_GOATCOUNTER_CODE=olefut`
3. Trigger deploy
4. Verify metrics chegam em `https://olefut.goatcounter.com`
