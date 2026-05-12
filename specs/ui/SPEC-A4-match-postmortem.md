# SPEC-A4: Match Post-Mortem (Painel Decisão)

> Status: **DRAFT — implementação no mesmo PR**
> Fase: A4 — Tornar JOGÁVEL

---

## O que é

Painel pós-jogo na fase `fulltime` do MatchView com 3 cards de análise causal:
1. **Melhor decisão** — o que funcionou
2. **Decisão duvidosa** — o que pode melhorar
3. **Sorte/Azar** — fator aleatório

Resolve problema #2 (decisões sem feedback) + #1 (dramatização) parcial. Player aprende causa-efeito sem precisar ler 90 eventos.

---

## Input

```typescript
{
  result: { home, away, homeGoals, awayGoals, isHomeTeam: boolean },
  tacticUsed: string,           // 'Ofensivo' etc
  formationUsed: string,        // '4-3-3'
  opponentStyle?: string,
  recentForm?: Array<'W'|'D'|'L'>,
  subsUsed?: number,            // quantas substituições
  matchStats?: {                // se disponível, refinar
    shotsHome: number,
    shotsAway: number,
    possession: number,
  }
}
```

---

## Output

```typescript
{
  best:    { title: string, body: string, type: 'tactic'|'formation'|'spirit' },
  dubious: { title: string, body: string, type: 'subs'|'tactic'|'preparation' },
  luck:    { title: string, body: string, type: 'good'|'bad'|'neutral' }
}
```

---

## Regras

### 1. Outcome aware
- [ ] Vitória → best mais elogioso, luck mostra confirmação
- [ ] Derrota → dubious mais crítico, luck pode apontar má sorte
- [ ] Empate → tom neutro, observa contexto

### 2. Tactic-driven
- [ ] Best inclui rationale da tática vs oponente
- [ ] Dubious aponta se tática contrastou com forma recente

### 3. Determinístico
- [ ] Mesmo input → mesma análise

### 4. PT-BR
- [ ] Todos os textos em português brasileiro
- [ ] Sem emoji em rationale

### 5. Não-bloqueante
- [ ] Componente abaixo do score, dismissable
- [ ] Botão "VOLTAR AO DASHBOARD" continua disponível

---

## Implementação

- **Novo**: `src/engine/MatchAnalyst.js` (~100 LOC)
- **Novo**: `src/components/MatchPostMortem.jsx` (~70 LOC)
- **Modifica**: `src/components/MatchView.jsx` (+5 LOC: render no fulltime)
- **Novo harness**: `tests/specs/SPEC-A4-match-analyst.test.js`

---

## Testes

```javascript
describe('SPEC-A4: MatchAnalyst', () => {
  test('rule 1: vitória → best elogioso', () => {});
  test('rule 1: derrota → dubious crítico', () => {});
  test('rule 1: empate → tom neutro', () => {});
  test('rule 2: tactic rationale presente em best', () => {});
  test('rule 3: determinism', () => {});
  test('rule 4: sem emoji', () => {});
});
```

---

**SPEC versão**: 1.0
