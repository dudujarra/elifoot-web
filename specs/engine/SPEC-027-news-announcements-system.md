# SPEC-027: News & Announcements System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/NewsSystem.js`, `src/ui/News.jsx`  
**Linhas**: ~200

---

## O que é

Sistema de notícias in-game. Eventos geram headlines. Jogador pode ler/ignorar. Afeta morale/torcida.

---

## News Types (20)

| Tipo | Exemplo | Impacto | Duração |
|------|---------|--------|---------|
| Vitória | "Time vence com 2-0" | +5 morale | 1 week |
| Derrota | "Time perde para rival" | -10 morale | 2 weeks |
| Lesão star | "Crack se lesiona por 4 weeks" | -15 morale | Duração lesão |
| Gol record | "Player bate recorde de gols" | +8 prestige | Permanent |
| Contratação | "Time assina star player" | +10 morale | 2 weeks |
| Demissão tech | "Técnico é demitido" | -20 morale | 1 week |
| Rebaixamento | "Time cai de divisão" | -50 morale | 3 months |
| Título | "Campeão nacional!" | +30 morale | Permanent |
| Transferência (saída) | "Star sai para rival" | -20 morale | 2 weeks |
| Controvérsia | "Player envolvido em polêmica" | -15 morale | 3 weeks |
| Milestones | "500 matches no club" | +5 prestige | Permanent |
| Rival news | "Rival ganha título" | -5 morale | 1 week |
| Nacional callup | "5 players convocados" | +10 morale | Durante matches |
| Staff hire | "Novo director contratado" | +3 morale | 1 week |
| Stadium upgrade | "Estádio ampliado" | +5 morale | 2 weeks |
| Sponsor deal | "Novo patrocinador" | +5 morale | 2 weeks |
| Youth academy | "Jovem promissor promovido" | +3 morale | 2 weeks |
| Friendly offer | "Convite para amistoso" | +1 morale | 1 week |
| Awards | "Player voted best midfielder" | +8 prestige | Permanent |
| Market rumor | "Especulações sobre fichagens" | ±3 morale | 1 week |

---

## Input

```typescript
NewsSystem.generateNews({
  weekOfYear: number,
  event: {
    type: string,
    teamId: number,
    playerId: number,
    details: object
  }
})

NewsSystem.getNews({
  teamId: number,
  limit: number (default 10),
  filter: string (optional)  // 'team', 'rival', 'all'
})

NewsSystem.readNews({
  newsId: string,
  playerId: number  // afeta morale do player
})
```

---

## Output

```typescript
{
  id: string,
  headline: string,
  body: string,
  type: string,
  teamId: number,
  week: number,
  moralImpact: number,
  prestigeImpact: number,
  read: boolean,
  importance: 1-5  // 5 = major event
}
```

---

## Validações

- [ ] Notícia gerada apenas em eventos significativos
- [ ] Morale impact entre -50 a +30
- [ ] Headline é único (não duplica)
- [ ] Notícia expira após 4 weeks (archived)
- [ ] Rival news não afeta seu time (observação)
- [ ] Player reading news afeta individual morale
- [ ] Prestige impact = permanent (não decay)
- [ ] Importance 1-5 correlato ao impacto

---

## Forbidden

- [ ] Notícia sem evento (vibe news)
- [ ] Morale impact > 30 ou < -50
- [ ] Headline duplicado (mesma semana)
- [ ] Rival news no feed (separado)
- [ ] Notícia antes do evento (time travel)
- [ ] Prestige impact negativo (only for demissão/relegation)

---

## Testes

```javascript
test('Vitória gera news: +5 morale', () => {
  engine.simulateMatch(teamId, 'win');
  const news = engine.getNews(teamId)[0];
  
  expect(news.headline).toContain('vence');
  expect(news.moralImpact).toBe(5);
});

test('Lesão star: -15 morale', () => {
  engine.injurePlayer(starPlayerId);
  const news = engine.getNews(teamId)[0];
  
  expect(news.headline).toContain('lesiona');
  expect(news.moralImpact).toBe(-15);
});

test('Título: +30 morale, permanent prestige', () => {
  engine.finishSeason({ champion: true });
  const news = engine.getNews(teamId)[0];
  
  expect(news.moralImpact).toBe(30);
  expect(news.prestigeImpact).toBeGreaterThan(0);
  expect(news.prestigeImpact).toBe(50);  // SPEC-026
});

test('Notícia expira após 4 weeks', () => {
  const news = engine.getNews(teamId, { week: 1 })[0];
  const archived = engine.getNews(teamId, { week: 5 });
  
  expect(archived.find(n => n.id === news.id)).toBeUndefined();
});

test('Player reading news afeta morale', () => {
  const news = engine.getNews(teamId)[0];
  const moraleBefore = engine.getPlayer(playerId).morale;
  
  engine.readNews(news.id, playerId);
  const moraleAfter = engine.getPlayer(playerId).morale;
  
  expect(moraleAfter).not.toBe(moraleBefore);
});

test('Rival news separado', () => {
  engine.simulateMatch(rivalId, 'win');
  const allNews = engine.getNews(teamId, { filter: 'all' });
  const teamNews = engine.getNews(teamId, { filter: 'team' });
  
  const rivalNews = allNews.find(n => n.type === 'rival');
  expect(teamNews).not.toContain(rivalNews);
});

test('Importance correlato ao impacto', () => {
  const minorNews = engine.generateNews({ type: 'Market rumor' });
  const majorNews = engine.generateNews({ type: 'Título' });
  
  expect(minorNews.importance).toBeLessThan(majorNews.importance);
});
```

---

## Headline Templates

```javascript
const templates = {
  'Vitória': `${team} vence por ${score}`,
  'Derrota': `${team} cai diante de ${rival} (${score})`,
  'Lesão star': `${player} sofre lesão e fica fora por ${weeks} weeks`,
  'Contratação': `${team} anuncia ${player}`,
  'Título': `🏆 ${team} é CAMPEÃO!`,
  'Demissão': `${coach} deixa ${team}`,
  'Transferência': `${player} se transfere para ${newTeam}`,
  // ...
};
```

---
