# SPEC-186: Stitch Dashboard Port (Tailwind v4 + Stitch-faithful layout)

**Status**: IMPLEMENTED (2026-05-13)
**Type**: UI / Visual rewrite
**Block**: B3.1 (Polish)
**Author**: Dudu + Claude Code (Haiku 4.5)
**Depends on**: SPEC-185 (bevel restoration, already merged in branch)
**Linked Stitch source**: `docs/stitch-designs/v1.1-final/dashboard.html` + Stitch MCP project `1129586751616590793`

---

## O que é

Port faithful do Stitch `dashboard.html` para `src/components/DashboardView.jsx`, preservando 100% da lógica/hooks/modais existentes mas substituindo a camada visual completamente.

Motivação: usuário relatou *"pra mim tá igual, nada mudou do Stitch"* após SPEC-185. SPEC-185 só restaurou box-shadows. SPEC-186 ataca o root cause real: **layout structure + componente shape + typography hierarchy** divergiam massivamente de Stitch.

---

## Input

### Stitch reference
- `docs/stitch-designs/v1.1-final/dashboard.html` (240 linhas)
- Stitch MCP project `1129586751616590793` "OléFUT ISSSD-Premium 32-bit" — fonts: Press Start 2P + Pixelify Sans + IBM Plex Mono
- styleGuidelines + design system asset `a960a984011c4407a2e04bce1a273b29`

### Estado atual React (pre-SPEC-186)
- `src/components/DashboardView.jsx` — 644 linhas, custom CSS classes (`ef-dashboard-*`)
- Sem Tailwind instalado
- Phosphor icons (não Material Symbols)
- Layout structure: header card + hero match panel + alerts row + 2-col grid (nav + content) + bottom-nav + footer-cta + modals

### Hooks/state a preservar
- `useGame()` — gameState, changeView, getEngine, forceUpdate
- 6× `useState`: log, tab, pendingUnlock, pendingAchievement, pacingQueue, showTutorial, advicePanel
- `useEffect` para unlock/achievement event subscribers
- `useCallback` para handleAuxiliarAdvice (SPEC-167)
- `useKeyboardNav`

### Sub-components a preservar
- TrophyCeremony, EfPanel/Button/Modal, UnlockTooltip, AhaMomentCard, AchievementPopup, ScarcityBanner, DreadIndicator, TutorialOverlay, IronmanMode
- Help component (P1-7 regression — sectores GOL/DEF/MEI/ATA)
- AnimatedStat (sectors animation)

---

## Output esperado

### Arquivos novos
1. **`src/styles/stitch-theme.css`** — Tailwind v4 `@theme` directive + custom utilities (`crt-bevel`, `crt-scanlines`, `text-headline-*`, etc). Tokens **Stitch named colors** + 7 typography scales.

### Arquivos modificados
1. **`vite.config.js`** — adicionar `@tailwindcss/vite` plugin
2. **`src/main.jsx`** — import `./styles/stitch-theme.css` antes de `index.css`
3. **`src/components/DashboardView.jsx`** — refactor JSX render (estrutura visual completa)
4. **`package.json`** — `tailwindcss@^4.3.0`, `@tailwindcss/vite@^4.3.0` (devDependencies)
5. **`CHANGELOG.md`** — entry SPEC-186
6. **`MEMORY.md`** — update CORE BLOCKS (foco shift)

### Estrutura visual nova (Stitch-faithful)

```
<div className="min-h-screen crt-scanlines">
  <TrophyCeremony />

  <!-- TOP NAV (sticky, h-16, border-b-4 border-pitch) -->
  <nav>
    [club crest] [team name] | [PLANTEL / TÁTICAS / MERCADO / TABELA] | [R$ wallet] [board status] [bell]
  </nav>

  <main>
    <!-- Season strip -->
    [SEM X/38] [POS Y SÉRIE A] [WED/VxExD] [streak chip]

    <!-- HERO MATCH PANEL (bg-forest-dark border-4 border-pitch crt-bevel) -->
    <section>
      "PRÓXIMO JOGO" tag
      [home crest letter] VS [away crest letter]
      [stadium info box]
      [ESCALAR E JOGAR neon CTA]
    </section>

    <!-- 3-COL BENTO GRID -->
    [ALERTAS]   [AÇÕES RÁPIDAS]   [ARTILHEIROS + FORMA]
    panel.       4 buttons.         top 5 + form chips.

    <!-- SECTORS STRIP (4-col compact) -->
    [GOL] [DEF] [MEI] [ATA] + Help tooltips

    <!-- TAB CONTENT PANEL (preserves all existing game logic) -->
    [tab buttons: GERAL/TÁTICAS/TREINO/CLUBE/OFERTAS]
    [active tab content rendered]

    <!-- GIANT FOOTER CTA -->
    [AVANÇAR SEMANA — full-width neon button border-b-8 border-r-8]
  </main>

  <!-- MOBILE BOTTOM NAV (fixed, md:hidden) -->
  <nav>
    [PLANTEL] [MERCADO] [TABELA]
  </nav>

  <!-- Modals (unchanged) -->
  pressQuestion, AdvicePanel, PacingQueue, UnlockTooltip, AchievementPopup, TutorialOverlay
</div>
```

---

## Validação (Harness — Regra 0)

### Build + lint + tests
- ✅ `npm run lint` → 0 errors (526 warnings cosméticos)
- ✅ `npm test` → 1631/1631 passed
- ✅ `npm run build` → ~1.0s (gate ≤1.5s)
- ✅ Initial bundle 315KB (gzip 92KB) — gate ≤500KB
- ✅ P1-7 regression test (Help components em sectores) passa

### Tailwind classes funcionando
- ✅ `bg-neon`, `text-trophy`, `border-pitch` etc renderizam cores corretas
- ✅ `crt-bevel` utility aplica box-shadow inset
- ✅ `font-headline-lg text-headline-lg` mapeia para Press Start 2P 24px
- ✅ `min-h-screen`, `flex`, `grid` standard Tailwind utilities OK

---

## Forbidden cases (não fazer)

1. **NÃO quebrar hooks existentes** — 6 useState, useEffect, useCallback preservados exatos.
2. **NÃO remover modais** — pressQuestion, advicePanel, pacingQueue, TutorialOverlay, AchievementPopup, UnlockTooltip continuam funcionais.
3. **NÃO mudar APIs do engine** — engine.checkPressConference(), engine.getPacingEvents(), engine.upgradeStadium(), etc, são chamadas iguais.
4. **NÃO remover Help components** (P1-7 regression).
5. **NÃO instalar Material Symbols** — usar Phosphor existing (mapeamento: warning→WarningOctagon, fire→Flame, gavel→Gavel, bandaids→Bandaids, trophy→Trophy, list_numbered→ListNumbers, notifications→Bell).
6. **NÃO mexer em outras views** — squad, market, standings, match, etc, ficam para SPECs futuras.

---

## Mudanças concretas

### Antes
```jsx
<div className="ef-dashboard-container">
  <div className="ef-dashboard-inner">
    <EfPanel variant="hero" padding="lg" className="ef-dashboard-header">
      ...
    </EfPanel>
    ...
  </div>
</div>
```

### Depois
```jsx
<div className="min-h-screen crt-scanlines text-on-background font-body-md">
  <nav className="bg-forest-dark flex justify-between items-center w-full px-margin-desktop h-16 z-50 border-b-4 border-pitch sticky top-0">
    ...
  </nav>
  <main className="p-margin-mobile md:p-margin-desktop bg-crt-black/60 max-w-[1400px] mx-auto">
    <section className="mb-gutter bg-forest-dark border-4 border-pitch p-6 relative overflow-hidden crt-bevel">
      <div className="absolute top-0 right-0 p-2 bg-pitch text-crt-black font-headline-sm text-headline-sm">PRÓXIMO JOGO</div>
      ...
    </section>
    ...
  </main>
</div>
```

---

## Next steps (out of scope — SPECs futuras)

- **SPEC-187**: Port `SquadView.jsx` ↔ `docs/stitch-designs/v1.1-final/squad.html`
- **SPEC-188**: Port `MarketView.jsx` ↔ `market.html`
- **SPEC-189**: Port `MatchView.jsx` ↔ `match.html`
- **SPEC-190**: Port `StandingsView.jsx` ↔ `standings.html`
- **SPEC-191**: Port `AchievementsView.jsx` ↔ `achievements.html`
- **SPEC-192**: Port `PressView.jsx` ↔ `press.html`
- **SPEC-193**: Port `TrophyView.jsx` ↔ `trophy.html`
- **SPEC-194**: Port `PreMatch.jsx` ↔ `prematch.html`
- **SPEC-195**: Port tutorial overlay ↔ `tutorial-step1.html`

Cada uma: spec mini + Tailwind classes + preserve game logic.

---

## Notas

- **PR #156 ainda open** com SPEC-183/184. Vai gerar conflito em `DashboardView.jsx`. Mergear PR #156 primeiro OU rebase essa branch após merge.
- **Tailwind v4** é bleeding-edge. Estável o suficiente para projetos pequenos/médios como OléFUT. CSS-first approach (no PostCSS) faz config simples.
- **Bundle delta**: initial chunk +25KB (290→315KB) por causa de Tailwind utilities. Gzip subiu 6KB (86→92). Aceitável.
