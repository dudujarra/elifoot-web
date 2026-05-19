# Playtest B3.2 — Roteiro de sessão (2h)

> **SPEC-193 / AKITA-427**. Script para conduzir 1 sessão de playtest 2h com 1 tester brasileiro. Dudu = facilitator; tester = subject. Objetivo: capturar bugs P0/P1, métricas onboarding, validação brand v1.1.

---

## Pré-sessão (15min antes — assíncrono)

- [ ] Tester confirma data/hora via wpp/discord
- [ ] Tester abre https://dudujarra.github.io/olefut/ em Chrome desktop (preferencial)
- [ ] Tester NÃO instala nada (PWA opcional, não obrigatório)
- [ ] Dudu abre [BUG-REPORT-FORM.md](BUG-REPORT-FORM.md) em outra tela pra anotar
- [ ] Dudu pede consent gravação ANTES de começar — sem consent, no recording
- [ ] Dudu liga Zoom/Meet, compartilha tela do tester
- [ ] Cronômetro start

---

## Bloco 1 — Onboarding (00:00-00:10)

### Step 1 — Landing intro
**Tempo**: 00:00-00:03
**Objetivo**: medir clareza pitch + curiosidade

- Tester vê LandingIntro (SPEC-190): logo + tagline + 3 features + CTAs
- Dudu cala. Anota:
  - Reação verbal primeiros 5s ("o que é?", "interessante", "confuso")
  - Lê features? Pula? Clica "Pular intro"?
  - Tempo até clicar CTA principal

**Talking points (somente se tester travar > 60s):**
- "Pode clicar à vontade"
- NÃO explicar o que é o jogo

### Step 2 — StartView + escolha clube
**Tempo**: 00:03-00:10
**Objetivo**: medir curva escolha inicial

- Anota tempo até escolher clube
- Confusões verbais ("qual divisão?", "qual zona?")
- Brand: comenta fontes? Cores? Pixel art?

**Bandeiras vermelhas:**
- Tester abandona sem escolher (P0 — onboarding broken)
- Confuso > 5min (P1 — UX issue)

---

## Bloco 2 — 1ª season auto (00:10-00:35)

**Objetivo**: validar sim engine + autoplay deterministic feel

- Tester escolhe AutoPlay ou Manual Season 1
- Se AutoPlay: roda preset "Bombarda mid-table BR" ou similar
- Se Manual: dudu ajuda 1ª partida (talking points abaixo)

**Anota:**
- Tester entendeu match cards? Ou pediu help?
- Substituições intuitivas?
- Coletiva imprensa (se aparecer) — reação?
- Trophy ou crise final season — reação emocional?

**Talking points permitidos (Manual mode):**
- "Cards = ações disponíveis pro time"
- "Botão Substituir troca jogador"
- NÃO sugerir tática/formação

**Bandeiras vermelhas:**
- Match não termina (P0 — engine bug)
- Stats incoerentes (P0 — data bug)
- Crash console (P0)
- "Não sei o que tô fazendo" repetido (P1 — UX)

---

## Bloco 3 — 2ª season + market exploration (00:35-01:00)

**Objetivo**: validar depth — market, scout, contracts, formação manual

- Tester explora MarketView sozinho
- Squad management livre
- Scout (se disponível)
- Anota: navegação intuitiva? Pricing faz sentido? Filter/sort funciona?

**Bandeiras vermelhas:**
- Não acha como vender jogador (P1)
- Market gen quebrado (P0)
- Contract negotiations confuso (P1)

---

## Bloco 4 — Live match (01:00-01:30)

**Objetivo**: validar narração lance-a-lance + brand voice

- Simula 1 match ao vivo (não AutoPlay)
- Tester vê narração lance-a-lance
- Anota:
  - Narração faz sentido? Repetitiva?
  - Sabor BR aparece (clube voices, atmosphere)?
  - Audio toca (se sound on)? Reação?
  - Pace OK (não muito rápido/lento)?

**Bandeiras vermelhas:**
- Narração genérica (P1 — brand miss)
- Sound errors console (P0)
- Match trava (P0)
- Player nomes errados (P1 — data bug)

---

## Bloco 5 — Save/Load (01:30-01:50)

**Objetivo**: validar persistência localStorage + PWA offline

- Tester clica Save manual
- Tester fecha aba do navegador
- Tester reabre `https://dudujarra.github.io/olefut/`
- Tester verifica save existe + carrega

**Anota:**
- Save success toast aparece?
- Load funciona após reabrir?
- Slot management claro?
- Reset funciona se quiser começar de novo?

**Bandeiras vermelhas:**
- Save não persiste (P0 — DATA LOSS)
- Load corrompe state (P0)
- Slot UI confuso (P1)

---

## Bloco 6 — Bug report form (01:50-02:00)

**Objetivo**: capturar feedback estruturado antes wrap

- Dudu compartilha [BUG-REPORT-FORM.md](BUG-REPORT-FORM.md) (ou Google Form derivado)
- Tester preenche os 3-5 bugs mais importantes que notou
- Discussão verbal: "qual o pior?", "qual o melhor momento?"

**Captura:**
- NPS 0-10 ("recomendaria pra amigo?")
- 1 feature MAIS gostou
- 1 feature MAIS odiou
- Brand recepção (SNES nostalgia funciona? Fontes legíveis?)
- Voltaria amanhã? sim/não

---

## Bloco 7 — Wrap (02:00)

- Agradece tester
- Confirma crédito nos credits (CONTRIBUTORS.md)
- Manda link survey final (se houver follow-up)
- Stop recording
- Save transcrição

---

## Pós-sessão (Dudu solo)

- [ ] Transcrever notas (manuais → texto digital)
- [ ] Criar `docs/playtest/RESULTS-{nomeTester}-{data}.md` usando RESULTS-TEMPLATE.md
- [ ] Bugs P0 → criar GitHub issues imediato (Mandamento Akita #6)
- [ ] Adicionar tester aos CONTRIBUTORS.md
- [ ] Atualizar PLAYTEST-CHECKLIST.md status

---

## Anti-patterns (Dudu)

- ❌ Explicar features antes do tester perguntar (enviesa onboarding metric)
- ❌ Defender quando tester critica (mata feedback raw)
- ❌ Sugerir "ah, mas tem feature X" (perde momento de descoberta natural)
- ❌ Sentar quieto sem anotar (perde dados)
- ❌ Pular bloco se atrasar (tester fica frustrado)
- ❌ Gravar sem consent (legal + ético)
- ❌ Postar quotes do tester sem permissão depois

---

## Talking points seguros (qualquer momento)

- "Conta o que tá pensando"
- "Não tem certo nem errado"
- "Fica à vontade pra clicar onde quiser"
- "Pode falar mal, é pra isso que tô aqui"

---

**Spec**: [`specs/infra/SPEC-193-playtest-5br-prep.md`](../../specs/infra/SPEC-193-playtest-5br-prep.md)
**Branch**: `fix/akita-427-playtest-5br-prep`
**Owner**: Dudu (Eduardo Jarra)
