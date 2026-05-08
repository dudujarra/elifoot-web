# SPEC-009: Youth Academy

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/YouthAcademy.js`  
**Linhas**: ~180

---

## O que é

Sistema de base. Gera 2-4 jovens/ano (15-17 anos). Qualidade depende nível academy (1-5) e reputação time.

---

## Input

```typescript
YouthAcademy.generateProspects({
  weekOfYear: number,
  academyLevel: 1 | 2 | 3 | 4 | 5,
  teamRenown: number (1-10)
})
```

---

## Output

```typescript
[{
  id: number,
  name: string,
  age: 15 | 16 | 17,
  position: 'GOL' | 'DEF' | 'MEI' | 'ATA',
  attributes: { FIS: 30-50, DEF, CRI, FIN, REF },
  personality: one of 5,
  potential: number (65-90)
}]
```

---

## Validações

- [ ] 2-4 jovens/ano gerados
- [ ] Age 15-17
- [ ] Atributos 30-50 (jovem potencial)
- [ ] Academy level 1 → potencial avg 65, level 5 → avg 85
- [ ] Renown afeta qualidade ±5
- [ ] Cada jovem tem personality

---

## Forbidden

- [ ] Sem jovens gerados (deve ter sempre)
- [ ] Atributos > 60 em jovem
- [ ] Potencial < 60 (irreal)

---

## Testes

```javascript
test('Academy level 1 → avg potential 65', () => {
  const prospects = YouthAcademy.generateProspects({ academyLevel: 1 });
  const avg = prospects.reduce((s, p) => s + p.potential, 0) / prospects.length;
  expect(avg).toBeCloseTo(65, -1);
});

test('Academy level 5 → avg potential 85', () => {
  const prospects = YouthAcademy.generateProspects({ academyLevel: 5 });
  const avg = prospects.reduce((s, p) => s + p.potential, 0) / prospects.length;
  expect(avg).toBeCloseTo(85, -1);
});
```
