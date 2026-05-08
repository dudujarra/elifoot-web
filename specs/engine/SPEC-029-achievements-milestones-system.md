# SPEC-029: Achievements & Milestones System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/AchievementsSystem.js`, `src/ui/Achievements.jsx`  
**Linhas**: ~200

---

## O que é

Sistema de achievements (troféus) e milestones (marcos). Jogador desbloqueia badges, recebe rewards.

---

## 30 Achievements

| Tipo | Descrição | Critério | Reward | Raro |
|------|-----------|----------|--------|------|
| **Team** | | | | |
| Champion | Campeão nacional | 1 título | 100 pts | Não |
| Cup winner | Vence copa | 1 copa | 50 pts | Não |
| Legend tier | Prestige > 1000 | Prestige 1000+ | 200 pts | Sim |
| Back-to-back | 2 títulos consecutivos | 2 years | 150 pts | Sim |
| Unbeaten | 20 matches s/ derrota | W/D only | 100 pts | Sim |
| **Player** | | | | |
| 100 goals | 100+ gols | 100 gols | 50 pts | Não |
| Golden boot | Melhor scorer | Top scorer | 75 pts | Não |
| Iron man | 50 matches | 50 matches | 30 pts | Não |
| Hat trick | 3 gols 1 match | 3 gols | 10 pts | Não |
| Overhead | Gol acrobático | Overhead kick | 15 pts | Sim |
| **Prestige** | | | | |
| National hero | Top 10 intl | Prestige 400+ | 100 pts | Sim |
| Club legend | 500+ matches | 500 matches | 150 pts | Sim |
| Rookie | Primeiro match | 1 match | 5 pts | Não |
| Veteran | 15 seasons | 15 years | 100 pts | Sim |
| **Rare** | | | | |
| Perfect season | 100% win rate (15+ matches) | All wins | 200 pts | Sim |
| From zero | Promovido, campeonato | Promoted | 75 pts | Sim |
| Cinderella | Base players win titre | Low OVR avg | 150 pts | Sim |
| Comeback | 0-3 → 3-3 ou vitória | Trailing > 2 gols | 100 pts | Sim |
| Defensive masterclass | 5+ clean sheets | 5 sheets | 50 pts | Sim |
| Flawless match | 0 cards, 100% pass | Perfect stats | 75 pts | Sim |
| **Seasonal** | | | | |
| Winter champion | Líder week 20 | Líder mid-season | 30 pts | Não |
| Spring winner | Win after relegation fear | Bottom 3 → top 10 | 80 pts | Sim |
| Survivor | Avoid relegation | Posição ≥ 18 final | 60 pts | Não |
| **Social** | | | | |
| Rival slayer | 5 vitórias vs rival | 5 wins vs rival | 40 pts | Não |
| Underdog | Win vs top 3 team | Beat elite | 50 pts | Não |
| Rivalry master | 10 derbies | 10 matches | 60 pts | Não |

---

## Milestones (Auto)

| Milestone | Evento | Reward |
|-----------|--------|--------|
| 10 matches | Player milestones | +5 OVR morale |
| 50 matches | — | +2 prestige |
| 100 matches | — | +1 permanent OVR |
| 500 matches | Club legend | +100 prestige |
| 1000 goals | Team record | +50 prestige |
| 500 assists | Team record | +50 prestige |
| 50 trophies | All competitions | +500 prestige |

---

## Input

```typescript
AchievementsSystem.checkAchievements({
  playerId: number,
  teamId: number,
  event: {
    type: string,
    details: object
  }
})

AchievementsSystem.unlockAchievement({
  playerId: number,
  achievementId: string
})

AchievementsSystem.getProgress({
  playerId: number,
  achievementId: string
})
```

---

## Output

```typescript
{
  id: string,
  name: string,
  description: string,
  unlocked: boolean,
  progress: number (0-100),
  reward: number (points),
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary',
  unlockedWeek: number | null,
  badge: string  // emoji/icon
}
```

---

## Validações

- [ ] Cada achievement único (não duplicate unlock)
- [ ] Progresso 0-100% (não salta)
- [ ] Reward depositado ao desbloquear
- [ ] Rarity correlato a dificuldade
- [ ] Milestone automático (sem manual)
- [ ] Achievement desbloquear anim/sound
- [ ] Histórico permanente (audit trail)
- [ ] Comparação achievement entre players

---

## Forbidden

- [ ] Duplicate unlock (1× por player)
- [ ] Progress > 100%
- [ ] Reward negativo
- [ ] Achievement sem critério claro
- [ ] Desbloquear sem evento (cheating)
- [ ] Achievement perdido (permanente)

---

## Testes

```javascript
test('100 goals: achievement unlocked', () => {
  const before = engine.getAchievements(playerId);
  engine.scoreGoals(playerId, 100);
  const after = engine.getAchievements(playerId);
  
  const a = after.find(x => x.name === '100 goals');
  expect(a.unlocked).toBe(true);
  expect(a.reward).toBe(50);
});

test('Championship: +100 pts reward', () => {
  const pointsBefore = engine.getAchievementPoints(playerId);
  engine.finishSeason({ champion: true });
  const pointsAfter = engine.getAchievementPoints(playerId);
  
  expect(pointsAfter - pointsBefore).toBe(100);
});

test('Progress rastreado', () => {
  engine.scoreGoals(playerId, 50);
  const progress = engine.getProgress(playerId, '100 goals');
  expect(progress).toBe(50);  // 50/100 = 50%
});

test('Milestone 100 matches: +1 OVR', () => {
  const ovrBefore = engine.getPlayer(playerId).ovr;
  engine.playMatches(playerId, 100);
  const ovrAfter = engine.getPlayer(playerId).ovr;
  
  expect(ovrAfter - ovrBefore).toBe(1);
});

test('Rare achievement (Cinderella): unlock rare', () => {
  engine.setTeamOVR(teamId, 65);  // Low OVR
  engine.finishSeason({ champion: true });
  
  const achievement = engine.getAchievements(teamId).find(a => a.name === 'Cinderella');
  expect(achievement.rarity).toBe('Legendary');
  expect(achievement.unlocked).toBe(true);
});

test('No duplicate unlock', () => {
  engine.unlockAchievement(playerId, 'Champion');
  engine.unlockAchievement(playerId, 'Champion');  // 2nd attempt
  
  const count = engine.getAchievements(playerId).filter(a => a.name === 'Champion').length;
  expect(count).toBe(1);
});

test('Perfect season: 100% wins (15+ matches)', () => {
  engine.winMatches(teamId, 15);
  const achievement = engine.getAchievements(teamId).find(a => a.name === 'Perfect season');
  
  if (achievement) {
    expect(achievement.rarity).toBe('Legendary');
    expect(achievement.reward).toBeGreaterThan(100);
  }
});
```

---

## Badge Design (Icons)

```
🏆 Champion
🏅 Cup winner
⭐ Legend tier
🔥 Hat trick
⚡ Perfect season
🛡️ Unbeaten
💪 Iron man
🌟 National hero
👑 Club legend
🎯 Golden boot
```

---
