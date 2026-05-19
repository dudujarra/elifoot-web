# SPEC-188: Soft Launch Fase D — Social Discoverability

> **Bloco 3.4 Caminho A**: minimal-risk soft launch artifacts. Site já live em https://dudujarra.github.io/olefut/. Esta spec adiciona discoverability social + crawler metadata + smoke-test browser. Analytics + landing page = specs separadas (189/190).

---

## O que é

Adicionar tags `og:*` + `twitter:card` em `index.html`, gerar `public/robots.txt` + `public/sitemap.xml`, gerar `public/og-image.png` (1200×630 derivado do logo), e documentar checklist de smoke-test browser manual (Chrome/Safari/Firefox).

Objetivo: quando alguém compartilhar `https://dudujarra.github.io/olefut/` em Twitter/WhatsApp/Discord/LinkedIn, link renderiza preview rico (título + descrição + imagem). E quando Google/Bing crawlear, sitemap orienta indexação.

**OUT of scope** (specs separadas):
- Analytics (plausible/umami/gtag) → SPEC-189
- Landing page pré-jogo → SPEC-190
- Custom domain → decisão Dudu (compra DNS)
- ProductHunt/Reddit launch kit → SPEC-191

---

## Input

### Arquivos a editar
- `index.html` (root) — adicionar bloco `<meta>` OG + Twitter
- `public/` — criar `robots.txt`, `sitemap.xml`, `og-image.png`

### Constantes
```typescript
{
  url: 'https://dudujarra.github.io/olefut/',
  title: 'OléFUT — Simulador de futebol brasileiro estilo SNES',
  description: 'Gerencie seu time, conquiste títulos. Engine determinística, 100% offline, joga no navegador. Inspirado em Elifoot + ISS.',
  imageUrl: 'https://dudujarra.github.io/olefut/og-image.png',
  imageWidth: 1200,
  imageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterCreator: '@dudujarra',  // confirmar handle com Dudu
  locale: 'pt_BR',
  type: 'website'
}
```

### Origem
- Brand: `docs/brand-guidelines.md` (v1.1 Pixelify final)
- Logo: `src/assets/olefut_logo.png` (1024×1024, base do og-image)
- Live URL: `vite.config.js` base `/olefut/` (GitHub Pages)

---

## Output esperado

### 1. `index.html` head com tags OG + Twitter (acrescentar antes de `<title>`):

```html
<!-- SEO -->
<meta name="description" content="OléFUT — Simulador de futebol brasileiro estilo SNES. Gerencie seu time, conquiste títulos. 100% offline." />

<!-- Open Graph (Facebook, WhatsApp, LinkedIn, Discord) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://dudujarra.github.io/olefut/" />
<meta property="og:title" content="OléFUT — Simulador de futebol brasileiro estilo SNES" />
<meta property="og:description" content="Gerencie seu time, conquiste títulos. Engine determinística, 100% offline, joga no navegador." />
<meta property="og:image" content="https://dudujarra.github.io/olefut/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="OléFUT" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://dudujarra.github.io/olefut/" />
<meta name="twitter:title" content="OléFUT — Simulador de futebol brasileiro estilo SNES" />
<meta name="twitter:description" content="Gerencie seu time, conquiste títulos. Engine determinística, 100% offline, joga no navegador." />
<meta name="twitter:image" content="https://dudujarra.github.io/olefut/og-image.png" />
```

### 2. `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://dudujarra.github.io/olefut/sitemap.xml
```

### 3. `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dudujarra.github.io/olefut/</loc>
    <lastmod>2026-05-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 4. `public/og-image.png` (1200×630)
Derivado do `src/assets/olefut_logo.png`. Padding centrado, fundo verde estádio `#2D5A27` (theme-color do manifest), logo no centro, tagline "Simulador SNES — 100% offline" abaixo. Gerar via script ou ferramenta gráfica.

**Aceitar 1ª iteração simples**: logo centrado em fundo verde, sem tagline. Polish em SPEC-191.

---

## Regras de validação

### Checklist obrigatória

#### 1. Build inclui artefatos
- [ ] `dist/index.html` contém `og:title`, `og:description`, `og:image`, `twitter:card`
- [ ] `dist/robots.txt` existe e contém `Sitemap:`
- [ ] `dist/sitemap.xml` existe e referencia URL canônica
- [ ] `dist/og-image.png` existe com dimensões 1200×630 (±10px tolerance)

#### 2. URLs absolutas
- [ ] Todas as URLs em meta tags são absolutas (`https://dudujarra.github.io/olefut/...`), nunca relativas
- [ ] Razão: scrapers (FB, Twitter) precisam de absolutas pra resolver imagem

#### 3. Conteúdo
- [ ] `og:title` ≤ 60 chars (best practice Facebook)
- [ ] `og:description` ≤ 160 chars
- [ ] `twitter:card` = `summary_large_image` (não `summary`)
- [ ] `og:locale` = `pt_BR`

#### 4. Crawler
- [ ] `robots.txt` permite `/` (não bloqueia)
- [ ] `sitemap.xml` válido per https://www.sitemaps.org/protocol.html

### Harness (Regra 0 — obrigatório no mesmo PR)

**Arquivo**: `tests/integration/soft-launch-meta.test.js`

```javascript
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = path.resolve(__dirname, '../..');
const distDir = path.join(projectRoot, 'dist');

describe('SPEC-188: Soft launch metadata', () => {
  beforeAll(() => {
    // Garantir dist atualizado (feedback_stale_dist_hides_budget memory)
    if (!fs.existsSync(distDir)) {
      execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    }
  });

  test('dist/index.html has all OG tags', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    expect(html).toMatch(/property="og:title"/);
    expect(html).toMatch(/property="og:description"/);
    expect(html).toMatch(/property="og:image" content="https:\/\/dudujarra\.github\.io\/olefut\/og-image\.png"/);
    expect(html).toMatch(/property="og:url" content="https:\/\/dudujarra\.github\.io\/olefut\/"/);
    expect(html).toMatch(/property="og:locale" content="pt_BR"/);
  });

  test('dist/index.html has Twitter card tags', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    expect(html).toMatch(/name="twitter:card" content="summary_large_image"/);
    expect(html).toMatch(/name="twitter:image"/);
  });

  test('dist/robots.txt exists and references sitemap', () => {
    const robots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).toMatch(/Allow: \//);
    expect(robots).toMatch(/Sitemap: https:\/\/dudujarra\.github\.io\/olefut\/sitemap\.xml/);
  });

  test('dist/sitemap.xml exists and is well-formed', () => {
    const xml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
    expect(xml).toMatch(/<\?xml version="1\.0"/);
    expect(xml).toMatch(/xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
    expect(xml).toMatch(/<loc>https:\/\/dudujarra\.github\.io\/olefut\/<\/loc>/);
  });

  test('dist/og-image.png exists with correct dimensions', () => {
    const ogPath = path.join(distDir, 'og-image.png');
    expect(fs.existsSync(ogPath)).toBe(true);
    const stat = fs.statSync(ogPath);
    expect(stat.size).toBeGreaterThan(1000); // > 1KB sanity check
    // Dimension check via png-size or sharp se quiser strict
  });

  test('og:title length under 60 chars (FB best practice)', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    const m = html.match(/property="og:title" content="([^"]+)"/);
    expect(m).toBeTruthy();
    expect(m[1].length).toBeLessThanOrEqual(60);
  });

  test('og:description length under 160 chars', () => {
    const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    const m = html.match(/property="og:description" content="([^"]+)"/);
    expect(m).toBeTruthy();
    expect(m[1].length).toBeLessThanOrEqual(160);
  });
});
```

### Smoke test browser (manual, post-deploy)
Checklist a rodar após merge + deploy:
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator → cola URL → renderiza imagem
- [ ] Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/ → preview rico
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/ → preview rico
- [ ] Discord: paste URL em canal → preview rico
- [ ] WhatsApp: send URL pra contato → preview rico
- [ ] Chrome desktop: abre URL, joga 5 min, sem console errors
- [ ] Safari desktop: idem
- [ ] Firefox desktop: idem
- [ ] iOS Safari mobile: idem (touch + viewport)
- [ ] Android Chrome mobile: idem
- [ ] Google Search Console: submit sitemap.xml

---

## Forbidden

1. **URLs relativas** em meta OG — scrapers não resolvem; sempre absolutas.
2. **`twitter:card` ≠ `summary_large_image`** quando temos imagem 1200×630.
3. **`og:image` PNG > 1MB** — alguns scrapers rejeitam; manter ≤ 500KB.
4. **`robots.txt` com `Disallow: /`** — bloqueia indexação inteira do site.
5. **Sitemap com URLs `dist/...` ou caminhos build** — sempre URL final pública.
6. **Adicionar analytics neste PR** — fora de scope, SPEC-189 separada.
7. **Adicionar landing page** — fora de scope, SPEC-190 separada.
8. **Tracking pixels Facebook/Twitter** — privacy creep, fora de scope.

---

## Dependências
- `src/assets/olefut_logo.png` (input para og-image)
- `index.html` (target edit)
- `public/` (target write)
- `vite.config.js` base `/olefut/` (não tocar)

## Estimativa
- og-image generation: 15 min (script ou tool)
- index.html edit: 10 min
- robots.txt + sitemap.xml: 5 min
- harness: 15 min
- build + test: 10 min
- CHANGELOG + PR: 10 min
- **Total: ~1h15min**

## Validação pós-merge
1. `npm run build` clean
2. `npm test tests/integration/soft-launch-meta.test.js` verde
3. Deploy auto via `.github/workflows/deploy.yml` (push main)
4. Validators externos (Twitter/FB/LinkedIn) confirmam preview rico
5. Atualizar MEMORY.md CORE BLOCK → Fase D parte 1 done, parte 2 = SPEC-189 analytics
