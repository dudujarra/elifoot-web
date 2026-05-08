# SPEC-011: Staff System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/StadiumSystem.js`  
**Linhas**: ~150

---

## 5 Staff roles

| Cargo | Custo/sem | Efeito |
|---|---|---|
| Fisioterapeuta | R$50K | -50% lesão, +5 energia |
| Olheiro | R$40K | Scout revela 5 players OVR |
| Prep. Físico | R$45K | +1 atributo treino |
| Dir. Financeiro | R$60K | +10% receita, -10% salários |
| Trein. Base | R$35K | +1 OVR jovens |

---

## Validações

- [ ] Custo semanal aplicado
- [ ] Efeitos ativam quando contratado
- [ ] Máximo 1 por cargo
- [ ] Demissão é gratuita

---

## Testes

```javascript
test('Fisioterapeuta -50% injury chance', () => {
  engine.hireStaff('Fisioterapeuta');
  const injuryChance = engine.calculateInjuryChance();
  // Deve ser ~50% menos que sem
});

test('Dir. Financeiro +10% receita', () => {
  engine.hireStaff('Financeiro');
  const revenue = engine.calculateWeeklyRevenue();
  // Deve ser 10% mais
});
```
