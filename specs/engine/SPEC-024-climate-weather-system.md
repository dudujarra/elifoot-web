# SPEC-024: Climate & Weather System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/WeatherSystem.js`  
**Linhas**: ~250

---

## O que é

Sistema de clima/tempo. 14 tipos de weather afetam match (velocidade bola, lesões, possession, táticas).

---

## 14 Weather Types

| Tipo | Temp (°C) | Visibility | Lesão risk | Possession | Passing % |
|------|---------|-----------|------|-----------|---|
| Ensolarado | 25-32 | Excelente | +0% | Normal | 95% |
| Nublado | 15-25 | Boa | +5% | Normal | 93% |
| Chuva leve | 12-18 | Boa | +10% | -10% | 85% |
| Chuva forte | 8-15 | Ruim | +25% | -20% | 75% |
| Neblina | 5-12 | Péssima | +15% | -15% | 80% |
| Granizo | 0-8 | Péssima | +30% | -25% | 70% |
| Vento forte | 10-20 | Boa | +10% | -5% | 90% |
| Tempestade | 0-5 | Péssima | +40% | -30% | 60% |
| Neve | -5-0 | Péssima | +35% | -25% | 65% |
| Geada | -10-5 | Ruim | +20% | -10% | 80% |
| Calor extremo | >35 | Excelente | +50% | -5% | 92% |
| Frio extremo | <-15 | Péssima | +45% | -20% | 70% |
| Altitude alta | - | Boa | +5% | -15% | 88% |
| Ar seco | 20-28 | Excelente | +8% | Normal | 94% |

---

## Input

```typescript
WeatherSystem.setWeather({
  weekOfYear: number,
  type: string,
  temperature: number,
  humidity: number (0-100),
  windSpeed: number (km/h)
})

WeatherSystem.getWeatherImpact({
  teamId: number,
  position: string,
  tactic: string
})
```

---

## Output

```typescript
{
  week: number,
  weather: {
    type: string,
    temp: number,
    humidity: number,
    windSpeed: number
  },
  matchImpact: {
    possession: number (-30 to +0 %),
    passing: number (-30 to +0 %),
    injuryRisk: number (+0 to +50 %),
    cardRisk: number (+0 to +20 %),
    goalsChance: number (-20 to +20 %)
  },
  tacticBonus: {
    'Defensivo': number,
    'Controlador': number,
    'Agressivo': number
  }
}
```

---

## Validações

- [ ] Weather gerado aleatório mas consistente (seeded)
- [ ] Cada weather type aplica efeitos corretos
- [ ] Lesão risk acumulado (weather + contact)
- [ ] Tática tem bonus contra weather (ex: Defensivo +10% chuva)
- [ ] Temperatura realista por região (Brasil > Europa)
- [ ] Visibilidade afeta passing accuracy
- [ ] Granizo/neve reduz espaço útil (ball control)
- [ ] Altitude causa fadiga (+10% minutes needed)

---

## Forbidden

- [ ] Weather type inválido
- [ ] Temperature impossível (ex: -100°C)
- [ ] Possession < 20% ou > 100%
- [ ] Injury risk < 0% ou > 100%
- [ ] Tática bonus > 30%
- [ ] Wind speed > 200 km/h

---

## Testes

```javascript
test('Chuva forte: possession -20%, passing 75%', () => {
  engine.setWeather('Chuva forte', { temp: 12 });
  const impact = engine.getWeatherImpact();
  
  expect(impact.possession).toBe(-20);
  expect(impact.passing).toBe(75);
});

test('Calor extremo: injury risk +50%', () => {
  engine.setWeather('Calor extremo', { temp: 38 });
  const impact = engine.getWeatherImpact();
  
  expect(impact.injuryRisk).toBe(50);
});

test('Tática bônus contra weather', () => {
  engine.setWeather('Chuva forte');
  const defensivo = engine.getWeatherImpact().tacticBonus.Defensivo;
  const agressivo = engine.getWeatherImpact().tacticBonus.Agressivo;
  
  expect(defensivo).toBeGreaterThan(agressivo);  // Defensivo melhor na chuva
});

test('Altitude: fadiga +10%', () => {
  engine.setWeather('Altitude alta');
  const match = engine.simulateMatch();
  
  expect(match.fatigueMultiplier).toBe(1.1);
});

test('Visibilidade péssima: passing reduzido', () => {
  engine.setWeather('Tempestade', { visibility: 'Péssima' });
  const impact = engine.getWeatherImpact();
  
  expect(impact.passing).toBeLessThan(80);
});

test('Weather consistente (seed)', () => {
  engine.setSeed(12345);
  const w1 = engine.getWeather(5);
  
  engine.setSeed(12345);
  const w2 = engine.getWeather(5);
  
  expect(w1).toEqual(w2);
});
```

---

## Regional Weather Bias

```javascript
// Brasil: quente, seco, chuva em ciclos
// Europa: frio, vento, neve em invernos
// Ásia: monções, umidade alta, altitude

const regionBias = {
  'Brasil': ['Ensolarado', 'Chuva leve', 'Calor extremo'],
  'Europa': ['Nublado', 'Vento forte', 'Neve'],
  'Ásia': ['Umidade alta', 'Monção', 'Altitude alta']
};
```

---
