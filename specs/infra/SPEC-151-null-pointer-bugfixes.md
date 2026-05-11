# SPEC-151: Null Pointer Bugfixes — player.CRI + balance + narrations + biggestSale

> **Origem**: deep soak v1 análise. 56% das anomalias são "Cannot read properties of undefined (reading 'CRI')".
> Adicionalmente: balance/balanceByWeek redundantes, matchNarrations vazio, biggestSale null.

---

## O que é

Corrige 4 bugs de dados identificados na análise profunda dos arquivos de telemetria:
1. Null pointer ao acessar `player.CRI` (e outros atributos) sem guardar existência do jogador
2. `history.balance` e `history.balanceByWeek` idênticos — um deve ser delta semanal
3. `history.matchNarrations` sempre vazio — não capturado
4. `insights.biggestSale` sempre null — vendas não geram highlight

---

## Input

Nenhum input novo — fixes no fluxo existente de engine + telemetry.

---

## Output esperado

- `CRASH` anomalias do tipo "Cannot read CRI/DEF/FIN" = 0 em soak de 20 temporadas
- `history.balanceByWeek` contém delta (receita - despesa) por semana, não saldo acumulado
- `history.matchNarrations` populado com array de strings por semana
- `insights.biggestSale` registra maior venda da run (ex: `{player:'Igor Moura', ovr:82, price:3700000}`)

---

## Regras de validação

- [ ] Zero crashes "Cannot read properties of undefined (reading 'CRI')" em 20 temporadas
- [ ] `history.balanceByWeek[i]` ≠ `history.balance[i]` (delta ≠ saldo acumulado)
- [ ] `history.matchNarrations.length > 0` após 1 temporada
- [ ] `insights.biggestSale` não null após qualquer transferência
- [ ] `insights.biggestSale.price > 0`

---

## Forbidden

- [ ] `player.attributes.CRI` acessado sem checar `player && player.attributes`
- [ ] `balanceByWeek` continuar espelhando `balance`
- [ ] Crash em `getTraitMatchModifier` ou `calcOVR` por player null

---

## Implementação

### Bug 1 — null pointer player.CRI
**Local provável**: `src/engine/engine.js` no cálculo de setores + `src/engine/data.js` generatePlayer.

```javascript
// Padrão defensivo em todo acesso a player.attributes:
const safeAttr = (p, key, fallback = 50) => p?.attributes?.[key] ?? p?.[key] ?? fallback;

// Em vez de: player.attributes.CRI
// Usar: safeAttr(player, 'CRI')
```

Buscar todos os acessos diretos e adicionar optional chaining:
```bash
grep -rn "\.CRI\b\|\.DEF\b\|\.FIN\b\|\.REF\b\|\.FIS\b" src/engine/engine.js
```

### Bug 2 — balance vs balanceByWeek
**Local**: `src/services/telemetry/TelemetryAggregator.js` ou onde history é populado.

```javascript
// balanceByWeek deve armazenar delta por semana:
history.balanceByWeek.push(currentBalance - previousBalance); // delta
history.balance.push(currentBalance); // saldo acumulado (manter)
```

### Bug 3 — matchNarrations
**Local**: `src/services/MatchSimulator.js` — adicionar ao histórico após cada partida.

```javascript
// No final de simulateMatch():
if (engine.telemetry?.recordNarration) {
    engine.telemetry.recordNarration(events.textLog.map(e => e.text));
}
```

### Bug 4 — biggestSale
**Local**: `src/services/AutoPlayService.js` — ao registrar TRANSFER_SOLD.

```javascript
// Após cada venda confirmada:
const price = transferResult.price || 0;
if (!this.stats.insights.biggestSale || price > this.stats.insights.biggestSale.price) {
    this.stats.insights.biggestSale = { player: player.name, ovr: player.ovr, price };
}
```

---

## Testes

```javascript
describe('SPEC-151: Null Pointer Bugfixes', () => {
  test('Bug1: calcOVR não crasha com player sem attributes', () => {
    expect(() => calcOVR(null)).not.toThrow();
    expect(() => calcOVR({})).not.toThrow();
    expect(() => calcOVR({ attributes: {} })).not.toThrow();
  });
  test('Bug2: balanceByWeek é delta, não saldo', () => { /* delta != acumulado */ });
  test('Bug3: matchNarrations populado após partida', () => { /* length > 0 */ });
  test('Bug4: biggestSale registrado após venda', () => { /* not null */ });
  test('Bug1: soak 5 temporadas sem CRI crash', async () => { /* errorCount === 0 */ });
});
```
