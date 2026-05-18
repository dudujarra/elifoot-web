# GEMINI.md — espelho técnico para Gemini

Este arquivo existe para Gemini ter o mesmo ponto de partida que Claude.
**Fonte canônica de verdade técnica é [`CLAUDE.md`](CLAUDE.md)** — lê esse arquivo primeiro.

---

## 🚨 REGRA SUPREMA — GATES OBRIGATÓRIOS (NÃO NEGOCIÁVEL)

> **ANTES de commitar, ANTES de declarar trabalho completo, ANTES de dizer "pronto":**
> Rode `./scripts/gates.sh` e confirme saída `LIBERADO`.
> Se sair `BLOQUEADO`, corrija TUDO antes de continuar.

### Procedimento obrigatório (TODA sessão de trabalho):

```
1. INÍCIO: Lê CLAUDE.md + MASTER-ROADMAP
2. DURANTE: Faz o trabalho normalmente
3. ANTES DE COMMITAR (OBRIGATÓRIO — SEM EXCEÇÃO):
   a) npx tsc --noEmit        → deve ter 0 erros
   b) npm run lint             → deve ter 0 errors (warnings ok)
   c) npm test -- --run        → todos passam
   d) OU simplesmente rode:    ./scripts/gates.sh
4. SE QUALQUER GATE FALHAR:
   → NÃO comite
   → NÃO declare "pronto"
   → NÃO passe pro próximo passo
   → Corrija os erros PRIMEIRO
5. SÓ DEPOIS de gates verdes: git add + git commit
```

### ⛔ PROIBIÇÕES ABSOLUTAS

1. **PROIBIDO commitar com `--no-verify`** — o pre-commit hook existe por um motivo.
2. **PROIBIDO declarar trabalho "completo" sem rodar gates** — se não rodou `tsc + lint + test`, não está pronto.
3. **PROIBIDO commitar com "(a reverter)" no título** — se não está pronto, não comite.
4. **PROIBIDO editar mais de 5 arquivos sem rodar gates intermediários** — a cada batch de edições, valide.
5. **PROIBIDO ignorar erros de TypeScript** — se `tsc` mostra erros, o código está quebrado.
6. **PROIBIDO rodar `git config core.hooksPath`** — os hooks estão em `~/.git-hooks/olefut/` (fora do repo, read-only). Não mexa.
7. **PROIBIDO modificar/deletar arquivos em `~/.git-hooks/olefut/`** — eles são chmod 555. Não tente.

### O que acontece se você não seguir:

- O **pre-commit** bloqueia o commit.
- Se bypassar com `--no-verify`, o **pre-push** bloqueia o push.
- Se bypassar o push, o **CI** rejeita o PR.
- São 3 camadas. Nenhum agente passa pelas 3.

---

## 🚨 FOUNDATION-FIRST ATIVO (desde 2026-05-12)

**Status**: Todos os Blocos Foundation DONE. Reliability Hardening DONE (AKITA-407~411). 1814+ testes, 145 specs.
**Fonte estratégica única**: [`specs/MASTER-ROADMAP-FOUNDATION-FIRST.md`](specs/MASTER-ROADMAP-FOUNDATION-FIRST.md)

**Os 10 mandamentos brutais** (sobrepõem-se temporariamente aos 7 Akita):
- Zero feature nova até Bloco 1 done
- Zero spec retroativa
- Zero emoji em código novo
- Zero inline style em código novo
- README/CLAUDE.md auto-gen (não editar manual)
- Playtest obrigatório por bloco
- Máximo 2 PRs/semana
- Domingo OFF

## Regras críticas (Protocolo AKITA)

Antes de qualquer ação produtiva neste repo:

1. Lê [`specs/MASTER-ROADMAP-FOUNDATION-FIRST.md`](specs/MASTER-ROADMAP-FOUNDATION-FIRST.md) — bloco atual + sub-tasks
2. Lê [`AKITA_RULES.md`](AKITA_RULES.md) — constituição (7 mandamentos)
3. Lê [`CLAUDE.md`](CLAUDE.md) — arquitetura, comandos, stack + 10 mandamentos brutais
4. Lê [`specs/SPEC-RULES.md`](specs/SPEC-RULES.md) — governance SDD
5. Roda `spec-check.sh "<descrição do trabalho>"` antes de tocar código. Exit 1/2 bloqueia.

## Resumo dos 7 mandamentos

1. **SDD obrigatório** — sem spec, sem trabalho.
2. **Regra 0** — toda spec entrega harness executável no mesmo PR. Sem harness = mentira.
3. **Zero vibe coding** — dev pensa, IA digita.
4. **`CLAUDE.md` fonte única** — toda decisão técnica mora lá.
5. **GitHub público dia 1** — build in public.
6. **Bug = ticket + fix + regression test** — 3-artefact pareados.
7. **LLM local default** — Ollama / `claude -p` subprocess. API paga proibida.

## Restrições específicas da engine

- `src/engine/` é headless. Zero React, zero DOM, zero `useState`.
- `src/components/` é read-only. Zero lógica de jogo, zero cálculo de tabela/OVR.
- Engine fala com React só via `src/context/GameContext`.
- Tudo random passa por `src/engine/rng.js` (seed determinístico).

## Gates obrigatórios antes de commit (REPETINDO — É SÉRIO)

```bash
./scripts/gates.sh              # Roda tudo: tsc + lint + test
# OU manualmente:
npx tsc --noEmit                # 0 erros
npm run lint                    # 0 errors
npm test -- --run               # tudo passa
```

**NÃO EXISTE commit válido sem esses 3 gates verdes.**

PR sem SPEC/BUG linkado e sem harness = rejeitado.

---

Para qualquer outra coisa: **`CLAUDE.md`**.
