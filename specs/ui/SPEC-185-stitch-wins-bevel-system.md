# SPEC-185: Stitch-Wins Bevel System Restoration

**Status**: DRAFT (awaiting Dudu approval before merge)
**Type**: UI / Design System Refactor
**Block**: B3.1 (Polish — UI consistency)
**Author**: Claude Code (Haiku 4.5) + Dudu
**Date**: 2026-05-13
**Depends on**: PR #156 (SPEC-183/184 brand alignment) — should merge first
**Supersedes**: nothing
**Linked memory**: `brand_v11_pixelify_final_2026_05_13.md`
**Linked Stitch project**: `1129586751616590793` (OléFUT ISSSD-Premium 32-bit)

---

## O que é

Restaurar o **bevel system completo** definido no Stitch design system, que foi inadvertidamente removido com 14 comentários `/* box-shadow removed for brand compliance */` espalhados em `isssd-premium.css` e `animations.css`.

Stitch é fonte de verdade canônica (project ID `1129586751616590793`, design system `OléFUT Design System — ISSSD-Premium 32-bit`). React divergiu: removeu sombras pensando que violavam brand, mas brand **EXIGE** bevel via 2-tone box-shadow pra simular cabinet arcade físico.

Esta SPEC alinha React **de volta** ao Stitch ground truth.

---

## Input

### Estado atual (divergência documentada)

- `src/styles/isssd-premium.css`: 12+ `box-shadow removed for brand compliance` comments
- `src/styles/animations.css`: 3 box-shadow removals em keyframes (button-press, etc)
- Tokens existem mas não usados: `--frame-bevel-highlight: #2D6A4F`, `--frame-bevel-shadow: #040805`

### Stitch ground truth (styleGuidelines)

**32-Bit Bevel**:
- 2px border
- Highlight `#2D6A4F` top + left edges
- Shadow `#040805` bottom + right edges
- Efeito "raised" físico

**Neon Glow**:
- 0px blur, 4px spread drop-shadow Primary Neon
- Apenas elementos críticos (botões ativos, notifications)
- Simula fósforo CRT emissive

**Button states**:
| State | bg | border | color |
|-------|-----|--------|-------|
| default | `#1B4332` | 2px solid `#2D6A4F` | `#F1FAEE` |
| hover | `#2D6A4F` | 2px solid `#39FF14` | `#39FF14` (com glow) |
| active | `#0E1F14` | 2px inset `#39FF14` | `#FFD700` |
| danger | `#8B0000` | 2px solid `#FF3333` | `#FF3333` |

**Panel header**: bg sólido `#1B4332` separa título do body.

**Input**: bg `#040805` (abyss), 2px border, focus pulsa neon, texto Data Mono.

**Badge**: Press Start 2P 8-10px, rectangular, bg neon/gold, text `#040805`.

**List item**: separator 1px Forest Dark, hover full-row bg Pitch Green `#52B788`.

---

## Output esperado

### Arquivos modificados

1. **`assets/design-tokens.css`** — adicionar utility tokens:
   ```css
   --component-bevel-shadow: 2px 2px 0 var(--frame-bevel-shadow), -1px -1px 0 var(--frame-bevel-highlight);
   --component-glow-neon: 0 0 4px 0 var(--primitive-color-green-neon);
   --component-glow-neon-strong: 0 0 0 4px var(--primitive-color-green-neon);
   ```

2. **`src/styles/isssd-premium.css`** — substituir 12 `/* box-shadow removed for brand compliance */` por `box-shadow: var(--component-bevel-shadow);` no contexto adequado (botões, panels, cards).

3. **`src/styles/animations.css`** — restaurar keyframes:
   - `button-press`: pulse via bevel inversion
   - `neon-pulse`: glow expand/contract

4. **`docs/STITCH-INTEGRATION.md`** — atualizar `Tokens Synced` section com bevel/glow.

5. **`CHANGELOG.md`** — entry novo:
   ```
   ### [Unreleased]
   - **AKITA-XXX (SPEC-185)**: Stitch-wins bevel system restoration. Restaurou 14 box-shadow bevels removidos por engano. Glow neon ativo em CTAs. Aligned React ↔ Stitch project 1129586751616590793.
   ```

### Critério de aceite

- ✅ `npm run lint` → 0 errors (115 warnings cosméticos OK)
- ✅ `npm test` → 1625/1625 verde
- ✅ `npm run build` → ≤1.5s, initial bundle ≤500KB
- ✅ Build budget tests verde
- ✅ Visual smoke: dashboard + match + squad com bevel visível (Playwright screenshot)
- ✅ Zero `box-shadow removed for brand compliance` comments restantes
- ✅ Commits `AKITA-XXX: SPEC-185 ...` format

---

## Validação (Harness — Regra 0)

Sem harness = mentira viva. Spec inclui:

### 1. Token regression test
`tests/specs/SPEC-185-bevel-tokens.test.js`:
```js
import fs from 'fs';
test('design tokens have bevel + glow utilities', () => {
  const css = fs.readFileSync('assets/design-tokens.css', 'utf8');
  expect(css).toContain('--component-bevel-shadow');
  expect(css).toContain('--component-glow-neon');
  expect(css).toContain('--frame-bevel-highlight: #2D6A4F');
  expect(css).toContain('--frame-bevel-shadow: #040805');
});

test('no orphan "removed for brand compliance" comments', () => {
  const files = [
    'src/styles/isssd-premium.css',
    'src/styles/animations.css',
  ];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    expect(content).not.toContain('box-shadow removed for brand compliance');
  }
});
```

### 2. Visual regression (Playwright)
`tests/visual/SPEC-185-bevel.spec.ts`:
```ts
test('dashboard has bevel-styled buttons', async ({ page }) => {
  await page.goto('/');
  // ... select dashboard
  const button = page.locator('.btn-primary').first();
  const shadow = await button.evaluate(el => getComputedStyle(el).boxShadow);
  expect(shadow).not.toBe('none');
});
```

### 3. Lint regression
`tests/static-checks.test.js` (extend):
- Grep `box-shadow removed` → 0 matches

---

## Forbidden cases (não fazer)

1. **Não tocar em telas além de estilos centrais**. Esta SPEC é token + base CSS. Telas individuais (SquadView, MarketView, etc) ficam pra SPECs futuras se necessário.
2. **Não regenerar `assets/design-tokens.json`** — adicionar bevel utilities apenas no `.css`. JSON é primitive-only.
3. **Não usar `box-shadow: 0 0 ...`** com blur. Stitch styleGuideline é explícito: `0px blur, 4px spread`. Blur = soft shadow proibido.
4. **Não adicionar transições novas**. Manter `transition: ... 50ms` existentes.
5. **Não mexer em PR #156** (SPEC-183/184) — mergea antes.
6. **Não criar component novo**. Só restaurar regras de styling em components existentes.
7. **Não commitar com tests falhando** (Mandamento #6).

---

## Migration order (1 commit por step, atômico)

1. **Add bevel/glow utility tokens** (`assets/design-tokens.css`) — 1 commit
2. **Restore box-shadow em buttons** (`isssd-premium.css` button styles) — 1 commit
3. **Restore box-shadow em panels/cards** (`isssd-premium.css` panel/card styles) — 1 commit
4. **Restore animations** (`animations.css` keyframes) — 1 commit
5. **Write harness tests** (`tests/specs/SPEC-185-bevel-tokens.test.js`) — 1 commit
6. **Update CHANGELOG + STITCH-INTEGRATION.md** — 1 commit
7. **PR**: 6 commits agrupados, linkado SPEC-185

---

## Notas

- **Playtest B3.2 vem depois**. Esta SPEC não bloqueia playtest — é polish visual que torna playtest mais representativo do produto final.
- **PR #156 deve mergear primeiro**. Conflito em CSS files quase garantido senão.
- **Stitch screens 90+ existem** mas escopo aqui é só tokens/base. Migration tela-a-tela seria SPEC-186 separada, pós-playtest.
- **Rollback**: 1 commit revertendo restore = volta sem bevel. Low blast radius.

---

## Estimativa

~2-3h:
- 30min spec review + finalize
- 45min restore box-shadows (find/replace + contextual)
- 30min animations keyframes
- 30min harness tests
- 15min CHANGELOG + docs
- 15min lint/test/build validate

---

**Owner**: Dudu (Eduardo Jarra)
**Branch**: `claude/peaceful-edison-440694` (worktree atual)
**Linked PR**: TBD (criar após PR #156 merge)
