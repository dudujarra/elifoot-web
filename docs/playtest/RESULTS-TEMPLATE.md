# Playtest B3.2 — Results consolidação (5 testers)

> Template para `docs/playtest/RESULTS-2026-05.md` (ou data correspondente) após executar 5 sessões. Consolida bugs, métricas, NPS, decisão launch GO/NO-GO.

---

## Sumário executivo (1 parágrafo)

[Em 3-5 frases: quantos testers, quantos bugs, NPS médio, recomendação launch GO/NO-GO]

Exemplo:
> Executados 5 sessões com perfis A-E entre DD/MM e DD/MM. NPS médio: X.X. Total bugs: N (P0=X, P1=Y, P2=Z). Time-to-first-match médio: XX:XX. Decisão: **GO/NO-GO** para Fase D launch. Bloqueador principal: [bug ou ausência].

---

## Sessões individuais (1 subsection por tester)

### Sessão 1 — Perfil A — DD/MM/2026

- **Tester**: [nome ou pseudônimo]
- **Duração**: HH:MM
- **Top bugs**:
  - Bug #001 (P0) — [título]
  - Bug #003 (P1) — [título]
- **NPS**: __/10
- **Top quote**: > "[quote]"
- **Bandeiras vermelhas**: [se houver]
- **Form completo**: [link para RESULTS-{tester}-{data}.md]

### Sessão 2 — Perfil B — DD/MM/2026

- **Tester**:
- **Duração**:
- **Top bugs**:
- **NPS**: __/10
- **Top quote**:
- **Bandeiras vermelhas**:
- **Form completo**:

### Sessão 3 — Perfil C — DD/MM/2026
(idem)

### Sessão 4 — Perfil D — DD/MM/2026
(idem)

### Sessão 5 — Perfil E — DD/MM/2026
(idem)

---

## Bugs agregados (deduplicado)

> Todos os bugs únicos das 5 sessões, deduplicados. Cada bug listado UMA vez com contagem de quantas sessões viram.

| # | Bug | Severidade | Sessões afetadas | GitHub issue |
|---|-----|------------|------------------|--------------|
| 001 | [título] | P0 | 1, 3, 4 (3/5) | #XXX |
| 002 | [título] | P1 | 2, 5 (2/5) | #XXX |
| 003 | [título] | P2 | 1 (1/5) | #XXX |

### Stats agregadas
- **Total bugs únicos**: N
- **P0 (blocker)**: X (Y% das sessões afetadas)
- **P1 (atrapalha)**: Y
- **P2 (cosmético)**: Z

---

## Triagem P0 — bloqueia launch?

| # | Bug | Fix scope | Estimativa | Issue | Status |
|---|-----|-----------|------------|-------|--------|
| 001 | [título] | [hotfix / refactor / feature] | Xh | #XXX | OPEN/IN PROGRESS/CLOSED |

**Critério GO**: zero P0 OPEN.
**Critério NO-GO**: ≥1 P0 OPEN sem ETA < 1 semana.

---

## Métricas agregadas

| Métrica | Média 5 sessões | Min | Max | Target |
|---------|-----------------|-----|-----|--------|
| Time-to-first-match | XX:XX | XX:XX | XX:XX | < 15min |
| Time no LandingIntro | XX:XX | XX:XX | XX:XX | < 1min |
| Bloco 1 onboarding | XX:XX | XX:XX | XX:XX | 10min ±50% |
| Bloco 2-3 seasons | XX:XX | XX:XX | XX:XX | 50min ±20% |
| Tester abandonou (count) | N/5 | — | — | 0/5 |
| Save persistiu reload | N/5 | — | — | 5/5 |

---

## NPS

- **Score médio**: X.X / 10
- **Distribuição**: [N de cada score 0-10]
- **Promoters (9-10)**: N
- **Passives (7-8)**: N
- **Detractors (0-6)**: N
- **NPS final** (% promoters - % detractors): XX

### Critério launch
- **NPS ≥ 7 médio**: GO Fase D launch
- **NPS 5-6**: fix top 3 bugs + retest 3 testers antes de GO
- **NPS < 5**: review estratégico, possivelmente delay v1.0

---

## Brand reception (v1.1 Pixelify Sans + Press Start 2P + verde Pacaembu)

| Pergunta | SIM / NÃO / NEUTRO (5 testers) |
|----------|-------------------------------|
| SNES nostalgia funciona? | S=N, N=N, NEUTRO=N |
| Fontes legíveis? | S=N, N=N |
| Cores certas? | S=N, N=N |
| Pixel art aprovado? | S=N, N=N |

**Decisão brand**: manter v1.1 / iterate / revert para v0.X / partir para v1.2

---

## Features mais gostadas (count)

| Feature | Vezes citada |
|---------|--------------|
| Match engine ao vivo | X/5 |
| Sabor BR (clube voices) | X/5 |
| AutoPlay Lab | X/5 |
| 170 clubes | X/5 |
| LandingIntro | X/5 |

---

## Features mais odiadas (count)

| Feature | Vezes citada |
|---------|--------------|
| [feature] | X/5 |

---

## Bandeiras vermelhas observadas

- [Lista qualquer padrão de abandono, frustração, confusão repetida cross-tester]

---

## Decisão launch Fase D

**GO / NO-GO**: __

**Justificativa**: [3-5 frases]

**Se NO-GO, próximos passos**:
1. Fix top-X P0
2. Retest N testers
3. Re-decisão em DD/MM/2026

**Se GO, próximos passos**:
1. Tag `v1.0` (já é `v1.0-playtest-rc1` post-PRs)
2. Postar launch kit (SPEC-191): ProductHunt + Reddit + Twitter
3. Setar GoatCounter analytics handle (SPEC-189)
4. Monitorar 48h pós-launch via analytics + GitHub issues

---

## Lições aprendidas (meta)

- [O que funcionou no formato playtest?]
- [O que mudar pra V2 playtest se tiver?]
- [Recomendações para outros solo devs fazendo playtest BR]

---

**Spec**: [`specs/infra/SPEC-193-playtest-5br-prep.md`](../../specs/infra/SPEC-193-playtest-5br-prep.md)
**Data consolidação**: DD/MM/2026
**Owner**: Dudu (Eduardo Jarra)
**Status**: DRAFT / FINAL
