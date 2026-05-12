# SPEC-171 — Font CSS Tokens (`--font-mono` / `--font-sans`)

> **Status**: ACTIVE
> **Owner**: Dudu (Eduardo Jarra)
> **Branch**: `claude/spec171-save-reload-fix`
> **Bloco**: 3.1 (UI consistency — Foundation-First Roadmap)
> **Origem**: SPEC-170 work, bug descoberto durante audit de tipografia.

---

## Problema

Os componentes usam massivamente duas variáveis CSS de tipografia:

- `var(--font-mono)` — usado em ~401 referências (`grep -r "var(--font-mono)\|var(--font-sans)"`)
- `var(--font-sans)`

Exemplos: `DashboardView.jsx`, `MatchView.jsx`, `SquadView.jsx`, `StandingsView.jsx`, etc.

**Mas** essas variáveis **NUNCA foram definidas** em `:root` em nenhum arquivo
CSS (`grep -rn "^\s*--font-mono\|^\s*--font-sans" src/ --include="*.css"`
retorna zero matches).

Resultado: silent fallback para `font-family` do `body`
(`'Pixelify Sans', system-ui, sans-serif` em `luxury-arcade.css`) — em todo lugar
que deveria ter divergência mono vs sans, está usando o mesmo. Visualmente
diferente do design pretendido pela art-direction.

Tokens canónicos existem mas com prefixo `--ef-`:

- `src/styles/tokens/typography.css`: `--ef-font-family-mono`, `--ef-font-family-body`, `--ef-font-family-display`.

Os 401 usos referenciam variáveis NÃO-prefixadas. Como criar alias é cheap e
não-invasivo (e refator de 401 sites é fora de escopo desta fix), o approach
escolhido é **definir aliases sem prefixo** que apontam para os tokens canónicos
existentes.

---

## Fix

Em `src/styles/luxury-arcade.css` (o `:root` global ativo), adicionar:

```css
:root {
  ...
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Consolas, monospace;
  --font-sans: 'Inter', 'Pixelify Sans', system-ui, sans-serif;
}
```

Por que essas stacks especificamente:

- `--font-mono` reflete os fallbacks já usados inline em `luxury-arcade.css`
  (linhas 307/355 — `'Geist Mono', 'Courier Prime', monospace`) + adiciona
  Geist Mono / JetBrains Mono / IBM Plex Mono que já aparecem como expectativa
  em tokens.json.
- `--font-sans` reflete `body { font-family: 'Pixelify Sans', system-ui, sans-serif }`
  do mesmo arquivo, com Inter (já importado via Google Fonts em `index.css`)
  como primeira escolha porque `var(--font-sans)` aparece em headers/labels
  modernos do dashboard (tipografia neutra > pixel-art).

---

## Validação

1. Após o fix, `grep -rn "^\s*--font-mono\|^\s*--font-sans" src/styles/` retorna ≥ 2 matches.
2. Build verde (`npm run build`).
3. Lint verde (`npm run lint`).
4. Regression test: `tests/specs/SPEC-171-font-tokens.test.js` (parse `luxury-arcade.css`, verifica que `--font-mono` e `--font-sans` estão definidas em `:root`).

---

## Out of scope

- Refatorar os 401 call-sites pra usar `--ef-font-family-*` (canónicos). Decisão
  deliberada de manter API simples e migrar incrementalmente quando tokens forem
  canonicalizados.
- Tipografia além desses dois tokens (sizes, weights, line-heights) — já cobertas
  por `src/styles/tokens/typography.css`.
