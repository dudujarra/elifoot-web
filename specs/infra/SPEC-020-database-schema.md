# SPEC-020: Database Schema & Data Layer

**Criticidade**: 🔴 CRÍTICO  
**Módulo**: `src/data/schema.sql`, `src/data/DataStore.js`  
**Linhas**: ~400

---

## O que é

Schema SQL + ORM camada. Armazena times, players, matches, contracts, transactions. Backup/restore automatizado.

---

## Core Tables

| Tabela | Colunas | Relações | Índices |
|--------|---------|----------|---------|
| `teams` | id, name, country, prestige, money, stadium_level, founded | academy(1), board(1), rivals(∞) | id, name, prestige |
| `players` | id, team_id, name, age, position, attributes(FIS/DEF/CRI/etc), ovr, potential, contract_id | team(n), contract(1), injuries(∞) | id, team_id, ovr |
| `contracts` | id, player_id, team_id, salary, duration, start_week, end_week, bonuses | player(1), team(1) | player_id, team_id, end_week |
| `matches` | id, home_team_id, away_team_id, week, competition_id, home_goals, away_goals, events, mvp_id | teams(2), competition(1) | week, competition_id |
| `staff` | id, team_id, role, cost_week, effect_type, weeks_hired | team(1) | team_id, role |
| `sponsors` | id, team_id, tier, start_week, end_week, weekly_revenue | team(1) | team_id, end_week |
| `injuries` | id, player_id, type, start_week, weeks_out, status | player(1) | player_id, status |
| `rivals` | id, team_a_id, team_b_id, type, points_a, points_b, total_matches | teams(2) | team_a_id, team_b_id |

---

## Input

```typescript
DataStore.createTeam({
  name: string,
  country: string,
  prestige: number,
  startMoney: number,
  stadiumLevel: 1-5
})

DataStore.createPlayer({
  name: string,
  age: 15-39,
  position: string,
  teamId: number,
  attributes: object,
  ovr: number,
  potential: number
})

DataStore.saveMatch({
  homeTeamId: number,
  awayTeamId: number,
  week: number,
  result: { homeGoals, awayGoals, events, mvp }
})

DataStore.backup()
DataStore.restore(backupPath)
```

---

## Output

```typescript
// Query results
[{
  id: number,
  ...fields matching schema
}]

// Backup
{
  timestamp: string,
  path: string,
  tables: number,
  rowCount: number,
  compressed: boolean
}
```

---

## Validações

- [ ] Foreign keys enforced
- [ ] Cascading deletes controlados (ex: team delete = players orphaned?)
- [ ] Índices criados p/ queries frequentes
- [ ] Transações ACID em operações críticas (transfer, salary)
- [ ] Backup automático weekly
- [ ] Restore valida integridade (FK checks)
- [ ] Player attributes entre 0-99
- [ ] OVR = 51-99 (nunca < 50)
- [ ] Potential ≥ OVR atual

---

## Forbidden

- [ ] Orphaned records (FK sem pai)
- [ ] Duplicação de player (mesmo name+team)
- [ ] Salary negativo
- [ ] Week < 1 ou > 52
- [ ] Contract start > end
- [ ] Backup > 1GB (compress)

---

## Testes

```javascript
test('Create team com cascata de tabelas', () => {
  const team = DataStore.createTeam({ name: 'FC Test' });
  const board = DataStore.query('SELECT * FROM board WHERE team_id = ?', team.id);
  expect(board.length).toBe(1);  // Board criado auto
});

test('Player attributes validados (0-99)', () => {
  const player = DataStore.createPlayer({
    name: 'Test',
    attributes: { FIS: 150 }  // Invalid
  });
  expect(player).toBe(null);  // Rejeitado
});

test('OVR sempre ≥ 51', () => {
  const player = DataStore.createPlayer({
    name: 'Novato',
    ovr: 40
  });
  expect(player).toBe(null);
});

test('Foreign key enforcement', () => {
  const contract = DataStore.createContract({
    playerId: 999999,  // Não existe
    teamId: 1
  });
  expect(contract).toBe(null);  // FK violation
});

test('Backup automático weekly', () => {
  const before = DataStore.listBackups().length;
  engine.processWeek(52);  // Semana final
  const after = DataStore.listBackups().length;
  expect(after).toBeGreaterThan(before);
});

test('Restore valida integridade', () => {
  const backup = DataStore.backup();
  DataStore.wipeDatabase();
  const result = DataStore.restore(backup.path);
  expect(result.status).toBe('ok');
  expect(result.rowsRestored).toBeGreaterThan(0);
});

test('Transação salary: atomicidade', () => {
  // Transferência: team A -500K, team B +500K
  // Se falha no meio, nenhum muda
  DataStore.beginTransaction();
  try {
    DataStore.debit(teamA, 500000);
    throw new Error('Network error');
    DataStore.credit(teamB, 500000);
  } catch (e) {
    DataStore.rollback();
  }
  
  const a = DataStore.getMoney(teamA);
  const b = DataStore.getMoney(teamB);
  expect(a).toBe(originalA);  // Nenhum mudou
  expect(b).toBe(originalB);
});
```

---

## Índices Críticos

```sql
CREATE INDEX idx_player_team ON players(team_id);
CREATE INDEX idx_contract_player ON contracts(player_id);
CREATE INDEX idx_contract_end ON contracts(end_week);
CREATE INDEX idx_match_week ON matches(week);
CREATE INDEX idx_match_competition ON matches(competition_id);
CREATE INDEX idx_injury_status ON injuries(status);
CREATE INDEX idx_staff_team_role ON staff(team_id, role);
CREATE INDEX idx_sponsor_end ON sponsors(end_week);
```

---
