# Playtest B3.2 — Bug Report Form

> Template padronizado para anotar bugs durante sessão playtest. Dudu preenche em tempo real. 1 bug = 1 entry duplicada da tabela abaixo. Após sessão, bugs P0 viram GitHub issues (Mandamento Akita #6).

---

## Metadata sessão

- **Tester**: [nome ou pseudônimo, com consent]
- **Perfil**: A / B / C / D / E (ver [RECRUITMENT.md](RECRUITMENT.md))
- **Data**: YYYY-MM-DD
- **Duração total**: HH:MM
- **Browser**: Chrome / Safari / Firefox / Edge — versão XXX
- **OS**: macOS / Windows / Linux / iOS / Android — versão XXX
- **Build URL**: https://dudujarra.github.io/olefut/
- **Build commit/tag**: v1.0-playtest-rc1 (ou SHA)
- **Recording consent**: YES / NO
- **Recording URL**: [drive link ou local file path]

---

## Severidade — definições

| Label | Critério | Ação pós-sessão |
|-------|----------|-----------------|
| **P0** | Bloqueia launch. Crash, data loss, save corrupt, engine deadlock, security issue | GitHub issue imediato + fix antes Fase D |
| **P1** | Atrapalha experiência mas não bloqueia. UX confuso, copy errada, slow load, missing feedback | GitHub issue, fix pré-launch se possível |
| **P2** | Cosmético. Typo, alignment, color inconsistency, animation jank menor | Triage post-launch, backlog |

---

## Bug entry template (copia 1x por bug)

```
### Bug #001 — [título 1-linha]

- **Severidade**: P0 | P1 | P2
- **Bloco do roteiro**: Bloco 1 / 2 / 3 / 4 / 5 / 6 (qual etapa)
- **Reprodução**:
  1. [passo 1]
  2. [passo 2]
  3. [passo 3]
- **Esperado**: [o que deveria acontecer]
- **Observado**: [o que aconteceu]
- **Console error**: SIM / NÃO (cola erro se SIM)
- **Screenshot**: [caminho ou Imgur link]
- **Reproduzível**: 1/1 sempre / N/M tentativas (ex: 3/5)
- **GitHub issue**: [criada após sessão — #XXX]
```

---

## Bugs capturados (preencher durante sessão)

### Bug #001 — [título]

- **Severidade**:
- **Bloco do roteiro**:
- **Reprodução**:
  1.
- **Esperado**:
- **Observado**:
- **Console error**:
- **Screenshot**:
- **Reproduzível**:
- **GitHub issue**:

### Bug #002 — [título]

- **Severidade**:
- **Bloco do roteiro**:
- **Reprodução**:
  1.
- **Esperado**:
- **Observado**:
- **Console error**:
- **Screenshot**:
- **Reproduzível**:
- **GitHub issue**:

### Bug #003 — [título]

(repete conforme necessário)

---

## Confusões UX (não-bugs, mas atrito)

> Coisas que tester perguntou ou pareceu não entender. Não é bug técnico, mas dado importante para UX.

| # | Confusão | Bloco | Severidade UX |
|---|----------|-------|---------------|
| 1 | Ex: "como vendo jogador?" | Bloco 3 | P1 (não acha botão Sell) |
| 2 | | | |
| 3 | | | |

---

## Quotes diretas (com consent)

> Frases textuais do tester que capturam reação. Útil para marketing/depoimentos pós-launch.

- > "[quote]"
- > "[quote]"
- > "[quote]"

---

## Métricas timing (cronômetro)

| Métrica | Valor | Notas |
|---------|-------|-------|
| Time-to-first-match (start → primeira partida sim) | XX:XX | |
| Time-to-first-bug (start → primeiro bug visível) | XX:XX | |
| Tempo no LandingIntro (load → click CTA) | XX:XX | |
| Tempo total Bloco 1 onboarding | XX:XX | (target: 10min) |
| Tempo total Bloco 2-3 seasons | XX:XX | (target: 50min) |
| Tempo total Bloco 4 live match | XX:XX | (target: 30min) |
| Tempo total Bloco 5 save/load | XX:XX | (target: 20min) |
| Tester abandonou? | SIM / NÃO em qual bloco | |

---

## NPS final

- **Recomendaria pra amigo (0-10)**: __
- **Feature MAIS gostou**: __________
- **Feature MAIS odiou**: __________
- **O que mais quer ver?**: __________
- **Voltaria amanhã?**: SIM / NÃO
- **Pagaria? Quanto?**: __________
- **Brand reception**:
  - SNES nostalgia funciona? SIM / NÃO / NEUTRO
  - Fontes legíveis? SIM / NÃO
  - Cores certas (verde Pacaembu)? SIM / NÃO
  - Pixel art / logo aprovados? SIM / NÃO

---

## Notas livres (qualquer momento)

- [Anota aqui qualquer observação que não cabe acima]

---

**Spec**: [`specs/infra/SPEC-193-playtest-5br-prep.md`](../../specs/infra/SPEC-193-playtest-5br-prep.md)
**Após sessão**: copia este form preenchido para `docs/playtest/RESULTS-{nomeTester}-{data}.md`
