# SPEC-152: Comeback Drama — Zero Comebacks Fix

> **Origem**: deep soak v1 — hadComeback = false em 200 partidas analisadas.
> Jogo é determinístico demais. Quem começa perdendo nunca vira. Fun Score 56/100.

---

## O que é

Adiciona mecânica de comeback ao MatchSimulator. Quando time está perdendo por 1-2 gols após minuto 60, recebe boost de xG que simula pressão e agressividade. Cria drama de virada.

---

## Input

```typescript
// Contexto durante simulação:
homeGoals: number, awayGoals: number, minute: number
// Parâmetros de boost (novos):
COMEBACK_THRESHOLD_MINUTES: 60
COMEBACK_MAX_DEFICIT: 2  // só ativa se deficit ≤ 2 gols
COMEBACK_BOOST: 1.35     // +35% xG para quem está perdendo
```

---

## Output esperado

- `hadComeback = true` em ≥ 5% das partidas em soak de 20 temporadas
- Partidas com deficit de 1-2 gols após min 60: ≥ 15% viram ou empatam
- Placares finais mais variados (menos 1-0, 2-0 dominantes)
- Fun Score 56 → ≥ 65

---

## Regras de validação

- [ ] `hadComeback` = true em ≥ 5% partidas (atualmente 0%)
- [ ] Time perdendo por 1 gol após min 70 tem λ/μ aumentado em 35%
- [ ] Boost NÃO ativa se deficit > 2 gols (goleadas não viram)
- [ ] Boost NÃO ativa antes do minuto 60
- [ ] Fun Score ≥ 65 em telemetria após implementação

---

## Forbidden

- [ ] Boost ativar em goleadas (deficit > 2)
- [ ] Boost ativar antes do minuto 60
- [ ] Fun Score cair abaixo de 56 (não piorar)
- [ ] Win rate geral mudar mais que ±5% (não quebrar balanceamento)

---

## Implementação

**Arquivo**: `src/services/MatchSimulator.js`

```javascript
// No loop de minutos, após calcular lambda/mu iniciais:
// SPEC-152: Comeback boost — time perdendo recebe xG extra após min 60
const deficit = homeGoals - awayGoals;
const comebackMinute = minute >= 60;

if (comebackMinute) {
    if (deficit < 0 && deficit >= -2) {
        // Home está perdendo: boost no lambda home
        lambda *= 1.35;
    } else if (deficit > 0 && deficit <= 2) {
        // Away está perdendo: boost no mu away
        mu *= 1.35;
    }
}

// Registrar comeback no matchOutcome:
if (hadTrailingAtHalfTime && finalWinner === initialLoser) {
    matchOutcome.hadComeback = true;
}
```

---

## Testes

```javascript
describe('SPEC-152: Comeback Drama', () => {
  test('boost ativa quando perdendo por 1 após min 60', () => { /* lambda *= 1.35 */ });
  test('boost NÃO ativa se deficit > 2', () => { /* sem mudança */ });
  test('boost NÃO ativa antes min 60', () => { /* sem mudança */ });
  test('hadComeback true quando virar resultado', () => { /* registrado */ });
  test('win rate não muda mais que 5% em 1000 simulações', () => { /* balanceado */ });
  test('comebacks >= 5% em soak 20 temporadas', async () => { /* > 0 */ });
});
```
