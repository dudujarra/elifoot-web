# SPEC-C6: Seasonal BR Events (Catalog)

> Status: **DRAFT — implementação no mesmo PR**
> Fase: C6 — Tornar MEMORÁVEL

---

## O que é

4 eventos sazonais brasileiros ao longo da temporada (38 semanas). Cada evento dispara 1 carta narrativa com 1 escolha e effect. Adiciona ritmo cultural BR ao calendário do save.

Resolve gap roadmap: hoje calendário tem "pausa FIFA" mecânica, sem narrativa. Eventos sazonais = razão pra jogar manhã/noite diferente.

---

## Catálogo

| Evento | Trigger week | Tema |
|--------|--------------|------|
| Pré-temporada confraternização | 1 | Janeiro — galera retornou |
| Pausa Copa América | 13 | Junho — seleção BR convoca |
| Dia das Crianças categoria base | 26 | Outubro — youth visita treino |
| Balanço fim de ano | 38 | Dezembro — board avaliação |

---

## Output (por evento)

```typescript
{
  id: string,
  week: number,
  title: string,
  text: string,           // narrativa
  options: Array<{ label, effect, resultText }>
}
```

---

## Regras

### 1. Trigger
- [ ] `getSeasonalEvent(week)` retorna 1 evento se week match exato
- [ ] Outras semanas → null

### 2. Conteúdo
- [ ] ≥4 eventos
- [ ] 2-3 opções cada
- [ ] Effects ≤ ±10 (eventos não-disruptive)

### 3. PT-BR + sem emoji

### 4. Determinístico

---

## Implementação

- **Novo**: `src/engine/SeasonalBREvents.js` (~120 LOC)
- **Novo harness**: `tests/specs/SPEC-C6-seasonal-events.test.js`
- Wiring em WeekProcessor: SPEC-C6.2 PR futuro

---

**SPEC versão**: 1.0
