# SPEC-146: Narrative Pool Expansion

> **Origem**: SPEC-105 = 81/100. "Clima excelente no vestiário" repetido 9× em 200 semanas.
> Pool de narrativas pequeno, previsível. Impacta imersão do jogador.

---

## O que é

Expande pool de narrativas semanais para reduzir repetição.
Adiciona variantes contextuais (por posição tabela, divisão, streak).

---

## Input

```typescript
context: {
    position: number,      // posição na tabela
    streak: number,        // win/loss streak
    division: number,
    moral: number,         // moral médio do elenco
    weeksToEnd: number,    // semanas para fim da temporada
}
```

---

## Output esperado

- SPEC-105 Narrative Coverage ≥ 90/100
- Nenhuma narrativa repete mais de 3× em 200 semanas
- ≥ 5 variantes para cada contexto (vitória, derrota, empate, fim de temporada)

---

## Regras de validação

- [ ] Narrativa mais repetida em 200 semanas ≤ 3×
- [ ] Pool total ≥ 60 narrativas únicas (vs ~20 atuais)
- [ ] Cada contexto (win/draw/loss/moral_high/moral_low) tem ≥ 5 variantes
- [ ] SPEC-105 ≥ 90 na telemetria

---

## Forbidden

- [ ] Narrativas genéricas sem contexto ("Clima excelente" sem variação)
- [ ] Pool < 40 narrativas

---

## Implementação

**Arquivo**: onde narrativas semanais são geradas (buscar "Clima excelente").

```javascript
// Adicionar variants por contexto:
const WEEKLY_NARRATIVES = {
    moral_high: [
        "🎉 Clima excelente no vestiário! Elenco em alta.",
        "💪 Semana de treinos intensa. Time focado.",
        "🔥 Moral nas alturas após a vitória.",
        "⚡ Jogadores motivados, treinamento acima da média.",
        "🌟 Vestiário unido. Tudo preparado para o próximo jogo.",
    ],
    moral_low: [
        "😞 Ambiente pesado após a derrota.",
        "🥀 Elenco cabisbaixo. Treinamento irregular.",
        "⚠️ Tensão no grupo. Técnico reuniu o time.",
        "💔 Sequência ruim afeta a confiança do elenco.",
        "🌧️ Semana difícil. Grupo precisa se reencontrar.",
    ],
    relegation_fight: [
        "😰 Pressão máxima. Cada ponto é vital.",
        "🧨 Semana decisiva na luta contra o rebaixamento.",
        "🏃 Time treinou dobrado, consciente da situação.",
    ],
    title_race: [
        "👑 Concentração total na disputa pelo título.",
        "🏆 Cada treino é tratado como final.",
        "🎯 Grupo blindado. Foco no campeonato.",
    ],
    // ... mais contextos
};

function pickWeeklyNarrative(ctx) {
    const key = ctx.moral > 70 ? 'moral_high'
        : ctx.moral < 40 ? 'moral_low'
        : ctx.position >= ctx.totalTeams - 3 ? 'relegation_fight'
        : ctx.position <= 2 ? 'title_race'
        : 'moral_high';
    const pool = WEEKLY_NARRATIVES[key];
    return pool[Math.floor(Math.random() * pool.length)];
}
```

---

## Testes

```javascript
describe('SPEC-146: Narrative Pool', () => {
  test('pool total >= 60 narrativas', () => { /* count */ });
  test('cada contexto tem >= 5 variantes', () => { /* per-key count */ });
  test('em 200 picks: nenhuma repete > 3x', () => { /* frequency */ });
  test('moral_high retorna narrativa positiva', () => { /* includes emoji */ });
  test('relegation_fight só dispara na zona de rebaixamento', () => { /* ctx check */ });
});
```
