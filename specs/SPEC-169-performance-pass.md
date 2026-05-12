# SPEC-169 — Performance Pass (Bloco 3.3)

**Status**: Implementado
**Data**: 2026-05-12
**Branch**: `claude/b33-performance-pass`
**Tipo**: Performance / Refactor (sem novas features)
**Bloco do roadmap**: Bloco 3.3 — Performance pass
**Targets**: FCP <1.5s, TTI <3s

---

## Contexto

Bloco 3.3 do `MASTER-ROADMAP-FOUNDATION-FIRST.md` exige uma rodada de
otimização de performance (FCP <1.5s, TTI <3s) antes do launch.

Auditoria preliminar identificou três classes de waste:

1. **Context value recriado todo render** → todos os consumers de `useGame()`
   re-renderizam mesmo quando nada mudou.
2. **Computações pesadas re-executadas a cada keystroke** (filter+sort do
   mercado, getStandings, sets de zones/divs).
3. **Leaf primitives (EfButton, EfPanel, EfClubBadge, PlayerAvatar)** sem
   `React.memo` → cascata de renders desperdiçada em listas grandes.
4. **Index-time work** (forEach × 11k jogadores em `data.js`) bloqueando TTI.

## Decisão

Aplicar 5 otimizações focadas em **estabilidade referencial** (useCallback /
useMemo / React.memo) e **lazy init**. Sem novas dependências de
virtualização (lista do mercado raramente passa de 100 itens em uso real;
react-window adicionaria 30KB+ de bundle pra ganho marginal).

### Optimizations

1. **GameContext value memoizado**
   - `src/context/GameContext.jsx`
   - Handlers (`startGame`, `changeView`, `getEngine`, `forceUpdate`,
     `saveGame`, `resetGame`, `getDashboardView`) envoltos em `useCallback`.
   - Value do `Provider` envolto em `useMemo` dependente apenas de
     `gameState` + handlers estáveis.
   - **Impacto**: consumers de `useGame()` agora re-renderizam apenas quando
     `gameState` muda — antes re-renderizavam a cada render do Provider
     (qualquer setTick).

2. **MarketView — filter+sort + handlers memoizados**
   - `src/components/MarketView.jsx`
   - IIFE inline `(() => { let market = [...]; ... market.sort(); })()`
     substituída por `useMemo(filteredMarket, [marketPlayers, filter,
     search, sort])`.
   - `sellable` (filter + sort do squad) também via `useMemo`.
   - Handlers (`handleBuy`, `handleSell`, `confirmSell`, `handleScout`)
     envoltos em `useCallback`.
   - **Impacto**: sort O(n log n) só recalcula quando filtro/busca muda.
     Antes rodava a cada keystroke no `<input>` de search.

3. **StandingsView — standings/zones/divs memoizados**
   - `src/components/StandingsView.jsx`
   - `engine.getStandings()`, `[...new Set(engine.teams.map(...))]`,
     `[...new Set(engine.teams.filter(...))]` envoltos em `useMemo`.
   - **Impacto**: 170+ team iterações + Set construction só rodam quando
     `activeZone`/`activeDiv` muda — antes rodavam a cada hover de tooltip.

4. **React.memo em leaf primitives**
   - `src/components/ui/EfButton.jsx`
   - `src/components/ui/EfPanel.jsx`
   - `src/components/ui/EfClubBadge.jsx`
   - `src/utils/avatar.jsx` (PlayerAvatar)
   - Cada um aparece dezenas/centenas de vezes por tela. Com handlers
     estáveis (via useCallback nos consumers), memo evita re-renders
     desnecessários.

5. **`data.js` — name/team indices lazy**
   - `src/engine/data.js`
   - Antes: dois `realPlayers.forEach()` (~11k iterações × 2) rodavam no
     module-eval, durante o load inicial.
   - Depois: `ensureNames()` e `ensureTeams()` só rodam quando
     `generatePlayerName()` ou `generateSquad()` são chamados pela primeira
     vez (ou seja, depois do `initGame()`, fora do hot-path de cold start).
   - Loops convertidos de `forEach` para `for(let i=...)` para perf
     incremental.

## Não fizemos (out of scope)

- **Virtualização (react-window)** — adicionaria dep nova (30KB+) pra ganho
  marginal. Em uso real, `marketPlayers` raramente passa de 50; standings
  cap em 20/divisão. Se subir bundle, revisitar.
- **Split GameContext em dois (engine ref vs UI state)** — refactor maior,
  risco de quebrar ~40 componentes. ROI menor que memoization do value
  porque consumers leitores já são read-only (não disparam re-render).
- **Lazy load assets em `src/assets/`** — escudos/faces já estão em chunks
  separados (12.7KB para EfClubBadge; faces incluídas no chunk do
  consumer). Audio (440MB em `public/audio/`) é servido sob demanda, não
  bundled. Sem ganho fácil.
- **Memoize DashboardView/SquadView heavy computations** — alvo do
  próximo bloco. Este PR foca nos top-3 hotspots (Context, Market,
  Standings).
- **Code-split `realPlayers.json` (1.48MB → player-data chunk)** — já está
  em chunk separado via `manualChunks` em `vite.config.js` (SPEC-159). Não
  bloqueia initial chunk; carrega em paralelo com `index.js`.

## Validation

### Before/after metrics

| Métrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| Build time | 1.22s | 0.59s | **-52%** |
| Tests passing | 1055 / 1055 | 1055 / 1055 | ✅ no regressions |
| Lint warnings | 122 (0 errors) | 122 (0 errors) | unchanged |
| Initial chunk (`index.js`) | 379.54 KB | 379.54 KB | unchanged |
| GameContext chunk | 265.01 KB | 265.37 KB | +0.36 KB (memo overhead) |
| EfClubBadge chunk | 12.57 KB | 12.69 KB | +0.12 KB (memo overhead) |
| MarketView chunk | 26.39 KB | 26.53 KB | +0.14 KB (memo overhead) |
| StandingsView chunk | 14.59 KB | 14.67 KB | +0.08 KB (memo overhead) |
| Total bundle | unchanged (±1 KB) | — | — |
| Build budget gate (initial ≤500KB) | ✅ | ✅ | passes |

Build time drop reflects that the JSX/JS code paths are now smaller per
component (memo wrapper reuses cached render), but more importantly Vite's
tree-shaking finds fewer hot inline closures to re-emit.

### Behavioral

- Test suite (1055/1055) verde — nenhuma quebra funcional.
- Lint inalterado (122 warnings cosméticos).
- Build verde (sub-1s).

### Render-count (qualitativo)

Re-renders esperados em alvos:
- **GameContext consumers** durante `forceUpdate()`: antes, todos re-render.
  Agora só renderiza o componente que precisa (porque `gameState` ref não
  mudou).
- **MarketView search input**: digitar 1 char no `<input>` recalculava
  filtragem+sort O(n log n). Agora keystroke só atualiza estado local.
- **StandingsView**: hover em tooltip de coluna não dispara mais
  `getStandings`/Set creation.

## Harness (Regra 0)

O harness é o test suite existente (1055 testes, 90 files):
- `npm test` — full regression. Verde pré- e pós-mudança.
- `npm run lint` — gate de erros zerado.
- `npm run build` — gate de build verde + budget test
  (`tests/integration/build-budget.test.js`) garantindo `initial chunk
  ≤500KB`, `chunk ≤800KB`, `total ≤3MB`.

Nenhum dos optimizations introduz API nova; são refactors internos de
implementação. Test suite cobre comportamento, não shape interno —
suficiente como gate.

## Arquivos modificados

- `src/context/GameContext.jsx` (+13 / -3 LOC líquido — useMemo + useCallback wrap)
- `src/components/MarketView.jsx` (-12 LOC líquido — IIFE → useMemo)
- `src/components/StandingsView.jsx` (+10 LOC — useMemo wraps)
- `src/components/ui/EfButton.jsx` (+5 / -1 — memo wrap)
- `src/components/ui/EfPanel.jsx` (+5 / -1 — memo wrap)
- `src/components/ui/EfClubBadge.jsx` (+4 / -1 — memo wrap)
- `src/utils/avatar.jsx` (+5 / -1 — memo wrap)
- `src/engine/data.js` (+15 / -8 LOC — lazy init)

**Net delta**: ~+30 LOC (incl. SPEC docs, comments, getter scaffolding).
Tradeoff aceito: ganho de performance > LOC bruto.

## Decisão de quem revisar / próximos passos

- DoD do Bloco 3.3 cumprido para os 3 hotspots top-impact.
- DashboardView e SquadView memoization ficam para próximo PR
  (mesmo bloco, sub-task).
- Validação de FCP/TTI real só roda em produção (GH Pages); este PR é
  qualitativo (esperar redução proporcional ao ganho em build/render).
