# Playtest B3.2 — Checklist (gate Bloco 3)

> Gate Bloco 3.2 do MASTER-ROADMAP-FOUNDATION-FIRST. Mandamento brutal #7: bloco não termina sem 5 humanos brasileiros. Esta checklist segue plano Dudu (10 itens 6.1-6.10).

---

## Status geral

- **Bloco**: 3.2 (Playtest 5 BR)
- **Owner**: Dudu (Eduardo Jarra)
- **Build alvo**: tag `v1.0-playtest-rc1` (criar após PRs #190-#194 merge)
- **Iniciar quando**: 5 PRs sessão atual merged → tag criada
- **Estimativa total**: 2 semanas (D+1 .. D+14)
- **Bloqueia**: Fase D launch real (SPEC-191 launch kit)

---

## Itens 6.1-6.10 (plano Dudu)

### 6.1 — Postar Twitter/X recrutamento
- **Deadline**: D+1
- **Status**: [ ] PENDENTE
- **Evidência**: URL do tweet
- **Texto**: já pronto em [RECRUITMENT.md](RECRUITMENT.md#twitter-x)
- **Ação Dudu**: copy-paste + post + colar URL aqui

```
URL: __________________________________
Data post: ____________
```

### 6.2 — Postar Discord/comunidades CM/FM BR retro
- **Deadline**: D+1
- **Status**: [ ] PENDENTE
- **Evidência**: screenshots do post em cada canal
- **Texto**: já pronto em [RECRUITMENT.md](RECRUITMENT.md#discordreddit-rfutebol-rbrdev)
- **Canais sugeridos**:
  - [ ] Discord OléFUT/Elifoot/CM retro BR (se existir)
  - [ ] Discord r/brdev
  - [ ] WhatsApp grupo amigos (texto em [RECRUITMENT.md](RECRUITMENT.md#whatsapp-grupo-amigos))
  - [ ] r/futebol Reddit
  - [ ] r/brdev Reddit
  - [ ] r/Brasil Reddit
- **Ação Dudu**: postar em ≥3 canais + capturar screenshots

```
Canais postados: ____________
Screenshots: docs/playtest/recruitment-evidence/ (criar dir)
```

### 6.3 — Filtrar candidatos pelos 5 perfis
- **Deadline**: D+3
- **Status**: [ ] PENDENTE
- **Evidência**: spreadsheet com 5 nomes finalizados
- **Perfis-alvo**: A, B, C, D, E (ver [RECRUITMENT.md](RECRUITMENT.md#perfis-alvo-dos-5-testers-a-e))
- **Critério filtro**:
  - Brasileiro (preferência geográfica + linguagem)
  - Disponibilidade 2h continuous na semana D+5..D+12
  - Aceita gravação (consent)
  - Tem Chrome desktop ou alternativa
  - Cobre 1 dos 5 perfis (não duplicar mesmo perfil)
- **Ação Dudu**: triar candidatos recebidos, manter spreadsheet privada

```
Tester 1 (Perfil A): __________________
Tester 2 (Perfil B): __________________
Tester 3 (Perfil C): __________________
Tester 4 (Perfil D): __________________
Tester 5 (Perfil E): __________________
```

### 6.4 — Agendar 5 calls 2h cada
- **Deadline**: D+5
- **Status**: [ ] PENDENTE
- **Evidência**: calendar links / confirmações
- **Tool sugerido**: Calendly free OR direct wpp/discord scheduling
- **Distribuir**: 5 sessões ao longo de D+6..D+12 (1 por dia, máx 2/dia)
- **Buffer**: 30min entre sessões pra notes + bathroom break
- **Ação Dudu**: criar 5 slots + confirmar com cada tester

```
Sessão 1: DD/MM HH:MM - HH:MM (Tester Perfil A)
Sessão 2: DD/MM HH:MM - HH:MM (Tester Perfil B)
Sessão 3: DD/MM HH:MM - HH:MM (Tester Perfil C)
Sessão 4: DD/MM HH:MM - HH:MM (Tester Perfil D)
Sessão 5: DD/MM HH:MM - HH:MM (Tester Perfil E)
```

### 6.5 — Build estável dedicado: tag + deploy
- **Deadline**: D+5
- **Status**: [ ] PENDENTE (depende merge PRs #190-#194)
- **Evidência**: URL build + tag git
- **Comando**:
  ```bash
  # Após PRs #190-#194 merged em main:
  git checkout main && git pull
  git tag v1.0-playtest-rc1
  git push origin v1.0-playtest-rc1
  # Deploy auto via .github/workflows/deploy.yml
  ```
- **Verify**: https://dudujarra.github.io/olefut/ carregando + commit SHA matching
- **Ação Dudu**: criar tag + verify deploy

```
Tag SHA: __________________
Deploy timestamp: __________________
Build URL: https://dudujarra.github.io/olefut/
```

### 6.6 — Roteiro 7 passos preparado
- **Deadline**: D+5
- **Status**: [x] **DONE via AKITA-427** (este PR)
- **Evidência**: [ROTEIRO.md](ROTEIRO.md) — 7 blocos com timings
- **Conteúdo**: pré-sessão → 5 blocos roteiro → wrap → pós-sessão
- **Talking points**: incluído + bandeiras vermelhas

### 6.7 — Executar 5 sessões + anotar bugs ao vivo
- **Deadline**: D+12
- **Status**: [ ] PENDENTE
- **Evidência**: 5 transcrições + bug lists em `docs/playtest/RESULTS-{nome}-{data}.md`
- **Tools**:
  - Zoom/Meet pra call + recording (consent obrigatório)
  - [BUG-REPORT-FORM.md](BUG-REPORT-FORM.md) preenchido em tempo real
  - [ROTEIRO.md](ROTEIRO.md) aberto em segunda tela
- **Ação Dudu**: rodar 5 sessões

```
Sessão 1 — Tester A — DD/MM — duração HH:MM — RESULTS link: __________
Sessão 2 — Tester B — DD/MM — duração HH:MM — RESULTS link: __________
Sessão 3 — Tester C — DD/MM — duração HH:MM — RESULTS link: __________
Sessão 4 — Tester D — DD/MM — duração HH:MM — RESULTS link: __________
Sessão 5 — Tester E — DD/MM — duração HH:MM — RESULTS link: __________
```

### 6.8 — Consolidar findings em RESULTS-{data}.md
- **Deadline**: D+13
- **Status**: [ ] PENDENTE
- **Evidência**: `docs/playtest/RESULTS-2026-05.md` (ou data correspondente) preenchido
- **Template**: [RESULTS-TEMPLATE.md](RESULTS-TEMPLATE.md)
- **Conteúdo**: sumário exec + 5 sessões + bugs deduplicados + métricas agregadas + NPS + brand reception + decisão GO/NO-GO
- **Ação Dudu**: ler 5 RESULTS individuais → consolidar

```
Doc consolidado: docs/playtest/RESULTS-{YYYY-MM}.md
```

### 6.9 — Triagem bugs P0 / P1 / P2
- **Deadline**: D+14
- **Status**: [ ] PENDENTE
- **Evidência**: tabela em [RESULTS-{data}.md](#triagem-p0--bloqueia-launch)
- **Critério**:
  - **P0** (blocker): crash, data loss, save corrupt, engine deadlock
  - **P1** (atrapalha): UX confuso, copy errada, slow, missing feedback
  - **P2** (cosmético): typo, alignment, color, animation jank
- **Definição GO Fase D**: zero P0 OPEN
- **Ação Dudu**: revisar bugs agregados + atribuir P0/P1/P2

```
Total P0: __ / Total P1: __ / Total P2: __
GO/NO-GO: __
```

### 6.10 — GitHub issues para cada P0
- **Deadline**: D+14
- **Status**: [ ] PENDENTE
- **Evidência**: lista de URLs GitHub issues
- **Template issue**: usar Akita bug workflow (`npm run bug:ticket`) ou Github UI direto
- **Cada issue inclui**:
  - Repro mínimo (passos do BUG-REPORT-FORM)
  - Browser + OS
  - Console error
  - Screenshot
  - Severity P0
  - Label `playtest-b3.2`
- **Ação Dudu**: criar 1 issue por P0 deduplicado

```
P0 #1 issue: https://github.com/dudujarra/olefut/issues/____
P0 #2 issue: https://github.com/dudujarra/olefut/issues/____
...
```

---

## Gate B3.2 — critério de fechamento

Bloco 3.2 fecha quando TODOS os itens abaixo estão DONE:

- [ ] 6.1 Twitter postado
- [ ] 6.2 Discord/Reddit postado (≥3 canais)
- [ ] 6.3 5 testers filtrados
- [ ] 6.4 5 calls agendadas
- [ ] 6.5 Build tagged + deploy
- [x] 6.6 Roteiro preparado (this PR)
- [ ] 6.7 5 sessões executadas
- [ ] 6.8 RESULTS consolidado
- [ ] 6.9 Triagem P0/P1/P2
- [ ] 6.10 P0 issues criadas

**Quando gate fecha**: pode passar para Bloco 3.4 Fase D launch real (SPEC-191 launch kit execution).

**Se gate não fecha em D+14**: re-scope (recrutar menos testers? mudar tom?) ou delay launch.

---

## Eventos pós-gate (Bloco 3.4 dependência)

- Fix bugs P0 (cada um = ticket + fix + regression test, Mandamento Akita #6)
- Retest 2-3 testers para validar fixes (se mudanças significativas)
- Criar tag `v1.0` (sem `-playtest-rc1` suffix)
- Execute SPEC-191 launch kit (ProductHunt + Reddit + Twitter)

---

**Spec**: [`specs/infra/SPEC-193-playtest-5br-prep.md`](../../specs/infra/SPEC-193-playtest-5br-prep.md)
**Branch**: `fix/akita-427-playtest-5br-prep`
**Updated**: 2026-05-19 (criação inicial)
