# SPEC-193: Playtest 5 BR — preparation kit (B3.2)

> **Mandamento brutal #7**: Bloco 3 não termina sem 5 humanos brasileiros testando. Este SPEC entrega o material para Dudu **executar** o playtest (recrutamento template + roteiro + bug form + results template). A execução é manual (humanos), mas o material é code/docs gated por harness.

---

## O que é

Criar `docs/playtest/` com 5 arquivos:
- `RECRUITMENT.md` — tweets/posts pre-escritos + tabela 5 perfis-alvo de candidato
- `ROTEIRO.md` — script 7-step para conduzir sessão de 2h
- `BUG-REPORT-FORM.md` — template padronizado para anotar bugs ao vivo
- `RESULTS-TEMPLATE.md` — estrutura para consolidar findings pós-5-sessões
- `PLAYTEST-CHECKLIST.md` — gate B3.2 (linkado ao MASTER-ROADMAP)

Plus: git tag `v1.0-playtest-rc1` (executável após PRs #190-#194 merged).

**Out of scope (humans):**
- Postar tweets (Dudu)
- Filtrar candidatos reais (Dudu + spreadsheet)
- Agendar calls (Dudu + calendário)
- Executar sessões (Dudu + 5 humanos)
- Gravar sessões (Dudu + Zoom/equivalente)
- Anotar bugs ao vivo (Dudu durante sessão)
- Consolidar findings (Dudu pós-sessão)
- Triagem P0/P1 (Dudu)
- Criar GitHub issues P0 (Dudu)

---

## Input

### Origem
- Plano explícito do Dudu (B3.2 plan, 10 tarefas D+1..D+14)
- Mandamento brutal #7: "5 humanos brasileiros"
- Mandamento Akita #6: bug = ticket + fix + regression test
- Live URL: https://dudujarra.github.io/olefut/
- Brand v1.1 tom

### Arquivos a criar (todos `docs/playtest/`)
1. `RECRUITMENT.md`
2. `ROTEIRO.md`
3. `BUG-REPORT-FORM.md`
4. `RESULTS-TEMPLATE.md`
5. `PLAYTEST-CHECKLIST.md`

---

## Output esperado

### 1. RECRUITMENT.md
- Tweet 1 (anchor) + Tweet 2 (perks) + Tweet 3 (CTA com link form)
- Discord post body (formato Markdown)
- Tabela 5 perfis-alvo:
  - Perfil A: Hardcore FM/Football Manager veteran BR
  - Perfil B: Casual incremental/idle gamer BR
  - Perfil C: Elifoot 98 nostálgico (35-50 anos)
  - Perfil D: Streamer/Content creator pequeno
  - Perfil E: Dev/Tester crítico

### 2. ROTEIRO.md
- 7 passos com tempos:
  1. **00:00-00:10** Onboarding: open landing, watch reactions, no help
  2. **00:10-00:35** 1ª season: pick clube, run season auto
  3. **00:35-00:60** 2ª season: explore market/squad manually
  4. **00:60-01:30** Live match: simulate 1 match ao vivo, narração feedback
  5. **01:30-01:50** Save/Load: salvar, fechar tab, reabrir, verificar
  6. **01:50-02:00** Bug report: form padronizado preenchido
  7. **02:00** Wrap: thanks + perks delivery
- Talking points pra Dudu não enviesar feedback
- "Bandeiras vermelhas" a notar (confusion, frustração, abandono)

### 3. BUG-REPORT-FORM.md
- Template anotação rápida:
  - Severidade (P0 bloqueia / P1 atrapalha / P2 cosmético)
  - Reprodução (passos numerados)
  - Esperado vs observado
  - Browser + OS
  - Console error?
  - Screenshot?

### 4. RESULTS-TEMPLATE.md
- Estrutura `docs/playtest/RESULTS-2026-05.md` pós-sessões:
  - Sumário executivo (1 parágrafo)
  - 5 sessões individuais (tester perfil, duração, top bugs)
  - Tabela bugs agregada (deduplicada)
  - Triagem P0/P1/P2
  - Métricas: time-to-first-match, bounce rate, save success rate
  - Decisão launch: GO/NO-GO + justificativa

### 5. PLAYTEST-CHECKLIST.md
- Gate B3.2 conforme plano Dudu (10 itens 6.1-6.10)
- Status tracking: [ ] / [x] por item
- Evidência required por item (URL/screenshot/doc)
- Critério bloqueio launch: gate B3.2 incompleto = NO Fase D real

---

## Regras de validação

### Checklist
- [ ] Todos 5 arquivos em `docs/playtest/` criados
- [ ] Cada arquivo > 500 bytes (não placeholder vazio)
- [ ] RECRUITMENT tem tweet text + Discord text + 5 perfis tabela
- [ ] ROTEIRO tem 7 passos numerados + tempos
- [ ] BUG-REPORT-FORM tem campos: severity, repro, expected/observed, browser, OS, console, screenshot
- [ ] RESULTS-TEMPLATE tem estrutura sessão individual + agregada + triagem
- [ ] PLAYTEST-CHECKLIST cobre 10 itens do plano Dudu
- [ ] Tom respeitoso aos testers BR (não usar "rato de laboratório" etc)
- [ ] Zero links http:// (só https)
- [ ] Live URL e GitHub absolutos
- [ ] Suite +N tests (harness valida arquivos)
- [ ] Build clean (zero side effects — só docs)

### Harness `tests/integration/spec-193-playtest-kit.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../..');
const playDir = path.join(projectRoot, 'docs/playtest');

const REQUIRED = [
    'RECRUITMENT.md',
    'ROTEIRO.md',
    'BUG-REPORT-FORM.md',
    'RESULTS-TEMPLATE.md',
    'PLAYTEST-CHECKLIST.md',
];

describe('SPEC-193: Playtest 5 BR prep kit', () => {
    test.each(REQUIRED)('docs/playtest/%s exists + > 500 bytes', (file) => {
        const fpath = path.join(playDir, file);
        expect(fs.existsSync(fpath), `missing: ${file}`).toBe(true);
        expect(fs.statSync(fpath).size).toBeGreaterThan(500);
    });

    test('RECRUITMENT has tweets + discord + 5 perfis', () => {
        const src = fs.readFileSync(path.join(playDir, 'RECRUITMENT.md'), 'utf-8');
        expect(src).toMatch(/Twitter|Tweet/i);
        expect(src).toMatch(/Discord/i);
        expect(src).toMatch(/Perfil A/);
        expect(src).toMatch(/Perfil B/);
        expect(src).toMatch(/Perfil C/);
        expect(src).toMatch(/Perfil D/);
        expect(src).toMatch(/Perfil E/);
    });

    test('ROTEIRO has 7 steps + timings', () => {
        const src = fs.readFileSync(path.join(playDir, 'ROTEIRO.md'), 'utf-8');
        for (const step of ['Onboarding', '1ª season', '2ª season', 'Live match', 'Save/Load', 'Bug report', 'Wrap']) {
            expect(src, `missing step: ${step}`).toMatch(new RegExp(step.replace('ª', '.'), 'i'));
        }
        expect(src).toMatch(/00:00/);
        expect(src).toMatch(/02:00/);
    });

    test('BUG-REPORT-FORM has all key fields', () => {
        const src = fs.readFileSync(path.join(playDir, 'BUG-REPORT-FORM.md'), 'utf-8');
        for (const field of ['Severidade', 'Repro', 'Esperado', 'Observado', 'Browser', 'OS', 'Console', 'Screenshot']) {
            expect(src, `missing field: ${field}`).toMatch(new RegExp(field, 'i'));
        }
        expect(src).toMatch(/P0/);
        expect(src).toMatch(/P1/);
        expect(src).toMatch(/P2/);
    });

    test('RESULTS-TEMPLATE has session + aggregate + triage', () => {
        const src = fs.readFileSync(path.join(playDir, 'RESULTS-TEMPLATE.md'), 'utf-8');
        expect(src).toMatch(/Sumário/i);
        expect(src).toMatch(/Sessão/i);
        expect(src).toMatch(/Triagem|Bugs agregada/i);
        expect(src).toMatch(/GO|NO-GO/);
    });

    test('PLAYTEST-CHECKLIST has 10 plan items', () => {
        const src = fs.readFileSync(path.join(playDir, 'PLAYTEST-CHECKLIST.md'), 'utf-8');
        for (const item of ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10']) {
            expect(src, `missing item: ${item}`).toMatch(new RegExp(item.replace('.', '\\.'), 'i'));
        }
    });

    test('no http:// links (only https)', () => {
        for (const file of REQUIRED) {
            const src = fs.readFileSync(path.join(playDir, file), 'utf-8');
            expect(src, `${file} has http://`).not.toMatch(/http:\/\/(?!localhost)/);
        }
    });

    test('live URL referenced in RECRUITMENT', () => {
        const src = fs.readFileSync(path.join(playDir, 'RECRUITMENT.md'), 'utf-8');
        expect(src).toMatch(/https:\/\/dudujarra\.github\.io\/olefut/);
    });
});
```

---

## Forbidden

1. **Postar tweets reais** ou fazer signups em nome do Dudu — Dudu age.
2. **Convidar candidatos por nome** — privacy, Dudu seleciona.
3. **Promised "vai ficar pago" ou "premium"** nos posts — jogo é free per design.
4. **Templates com PII** (email, telefone Dudu) — só @handles públicos.
5. **Tons negativos** ("testem antes de fica ruim", "ajudem o coitado") — respeitoso/profissional sempre.
6. **Pedir signup obrigatório** — playtest é convite, não funil.
7. **Gravação sem consent** — ROTEIRO obriga pedido explícito antes de gravar.

---

## Dependências
- PRs #190 (OG tags), #191 (orphan cleanup), #192 (flake fix), #193 (analytics), #194 (landing) merged ANTES do playtest (build estável tagged)
- Live URL working

## Estimativa
- 5 docs (RECRUITMENT, ROTEIRO, BUG-FORM, RESULTS-TEMPLATE, CHECKLIST): ~1h30min
- Harness: 20min
- Build + test + commit + PR: 15min
- **Total: ~2h05min**

## Pós-merge ação Dudu (B3.2 execution, D+1..D+14)

| # | Tarefa | Deadline | Status |
|---|--------|----------|--------|
| 6.1 | Postar Twitter recrutamento (texto em RECRUITMENT.md) | D+1 | aguarda Dudu |
| 6.2 | Postar Discord/comunidades (texto em RECRUITMENT.md) | D+1 | aguarda Dudu |
| 6.3 | Filtrar candidatos pelos 5 perfis (RECRUITMENT.md tabela) | D+3 | aguarda Dudu |
| 6.4 | Agendar 5 calls 2h cada | D+5 | aguarda Dudu |
| 6.5 | Tag `v1.0-playtest-rc1` + deploy | D+5 | **após PRs merge** |
| 6.6 | Verificar ROTEIRO.md pronto | D+5 | feito neste PR |
| 6.7 | Executar 5 sessões (gravadas, consent) | D+12 | aguarda Dudu |
| 6.8 | Consolidar em `docs/playtest/RESULTS-2026-05.md` (usar RESULTS-TEMPLATE) | D+13 | aguarda Dudu |
| 6.9 | Triagem P0/P1/P2 (BUG-REPORT-FORM consolidado) | D+14 | aguarda Dudu |
| 6.10 | Issues GitHub para cada P0 | D+14 | aguarda Dudu |

Gate B3.2: 6.7 + 6.8 + 6.10 done = pode passar pra Fase D launch real (SPEC-191 launch kit).
