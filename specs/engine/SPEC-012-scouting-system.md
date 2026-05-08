# SPEC-012: Scouting System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/StadiumSystem.js`  
**Linhas**: ~180

---

## 5 Regiões scouting

| Região | Tier | Custo | Com olheiro |
|---|---|---|---|
| Brasil | 2 | Grátis | 5 players, OVR visível |
| Argentina | 2 | R$50K | 5 players, OVR visível |
| Europa | 1 | R$200K | 5 players, OVR visível |
| África | 3 | R$30K | 2 players, OVR escondido |
| Ásia | 3 | R$20K | 2 players, OVR escondido |

Sem olheiro: 2 players, OVR = "??"

---

## Validações

- [ ] Custo debitado
- [ ] Jogadores gerados (Tier afeta atributos)
- [ ] Com olheiro: 5 players, OVR visível
- [ ] Sem olheiro: 2 players, OVR escondido
- [ ] Tier 1 > Tier 3 (melhor qualidade)

---

## Testes

```javascript
test('Brasil scouting grátis', () => {
  const before = engine.getMoney();
  engine.doScouting('Brasil');
  const after = engine.getMoney();
  expect(before).toBe(after);  // Sem custo
});

test('Com olheiro: 5 players OVR visível', () => {
  engine.hireStaff('Olheiro');
  const scouts = engine.doScouting('Europa');
  expect(scouts.length).toBe(5);
  scouts.forEach(p => expect(p.ovr).toBeDefined());
});

test('Sem olheiro: 2 players OVR oculto', () => {
  const scouts = engine.doScouting('Brasil');
  expect(scouts.length).toBe(2);
  scouts.forEach(p => expect(p.ovr).toBe('??'));
});
```
