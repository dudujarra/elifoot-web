# SPEC-180: Global Tournament System

## O que é

Reestruturação do sistema global de torneios do OléFUT para garantir paridade estrutural entre todas as nações e continentes. 
Todos os países passam a ter obrigatoriamente Liga Nacional (com 1ª e 2ª divisões) e Copa Nacional. Os continentes (América e Europa) terão torneios Continentais próprios. Um novo Mundial de Clubes será criado reunindo os 4 melhores da América contra os 4 melhores da Europa.

## Input

### Tipo
N/A (Mudança estrutural no `SeasonSystem` e na geração de competições iniciais via `data.js` e construtores de torneios).

Configuração de um `Country` e `Season`:
```typescript
interface CountryStructure {
  id: string; // ex: 'BRA', 'ENG'
  continent: 'America' | 'Europe';
  leagues: {
    div1: TournamentId, // 1ª Divisão Nacional
    div2: TournamentId  // 2ª Divisão Nacional
  },
  nationalCup: TournamentId // Copa Nacional (mata-mata)
}

interface SeasonTournaments {
  nationalLeagues: TournamentId[];
  nationalCups: TournamentId[];
  continental: {
    america: TournamentId, // Continental América
    europe: TournamentId   // Continental Europa
  },
  worldCup: TournamentId   // Mundial de Clubes (Top 4 Am vs Top 4 Eu)
}
```

### Origem
- Geração de banco de dados (`src/engine/data.js` / `engine.js` init)
- Instanciação de temporada (`src/engine/SeasonSystem.js` / `Tournaments`)

## Output esperado

### Tipo
Geração correta e chaveamento de todos os torneios listados por país e continente, coexistindo no calendário anual.
O calendário de jogos de cada time vai cruzar Liga, Copa, e, se qualificado, Continental e Mundial.

### Exemplo de Estrutura Gerada (por país)
```json
{
  "country": "ENG",
  "tournaments": {
    "div1": "eng_premier",
    "div2": "eng_championship",
    "cup": "eng_fa_cup"
  }
}
```

### Exemplo do Mundial (World Cup)
```json
{
  "id": "world_club_cup",
  "type": "knockout",
  "participants": [
    "BRA_FLA", "ARG_BOC", "COL_NAC", "URU_PEN", // Top 4 América
    "ENG_MCU", "ESP_RMD", "ITA_MIL", "GER_BYM"  // Top 4 Europa
  ],
  "format": "Quarter-finals -> Semi-finals -> Final"
}
```

## Regras de validação

- [ ] Todo país configurado em `data.js` possui exatamente 2 divisões (1ª e 2ª divisão).
- [ ] Todo país possui um torneio do tipo `KnockoutCup` (Copa Nacional).
- [ ] Existe um `ContinentalCup` para a América (reunindo times de ligas da América).
- [ ] Existe um `ContinentalCup` para a Europa (reunindo times de ligas da Europa).
- [ ] Existe um `WorldClubCup` em formato mata-mata iniciando nas quartas-de-final.
- [ ] O `WorldClubCup` é populado automaticamente com os 4 semifinalistas (ou top 4) do Continental da América e os 4 do Continental da Europa.
- [ ] Equipes promovidas e rebaixadas (2ª div -> 1ª div) funcionam para todos os países (já existe no BR, precisa expandir o conceito).
- [ ] O calendário semanal (week) acomoda datas para Copa, Continental e Mundial sem sobreposição no mesmo dia.

## Forbidden

- [ ] ❌ País sem 2ª divisão.
- [ ] ❌ País sem Copa Nacional.
- [ ] ❌ Misturar continentes no mesmo torneio Continental (ex: time europeu na Libertadores).
- [ ] ❌ Mundial com mais ou menos de 8 times, ou com proporção diferente de 4 América e 4 Europa.
- [ ] ❌ Sobreposição de jogos impossíveis no calendário (time jogando Liga Nacional e Mundial na mesma semana, sem ajuste de rodada).

## Implementação

### Arquivos
- `src/engine/data.js` → Atualização dos times/nações para garantir 2 divisões mínimas por nação e classificação continental.
- `src/engine/SeasonSystem.js` → Orquestração do calendário. Criação das competições no reset da temporada.
- `src/engine/tournaments/League.js` → Suporte universal para promotion/relegation.
- `src/engine/tournaments/WorldClubCup.js` (Novo) → Lógica de chaveamento 4v4 intercontinental.

## Testes esperados

```javascript
describe('SPEC-180: Global Tournament System', () => {
  test('Todos os países devem ter 2 divisões e 1 copa (rule 1, 2)', () => { ... });
  test('Torneios Continentais devem ser estritamente segregados por continente (rule 3, 4)', () => { ... });
  test('Mundial de clubes deve ter 8 participantes, sendo 4 Am e 4 Eu (rule 5, 6)', () => { ... });
  test('Equipes de 2ª divisão sobem e da 1ª caem em todos os países (rule 7)', () => { ... });
  test('Calendário não gera dois jogos pro mesmo time na mesma semana (rule 8)', () => { ... });
  test('forbidden: País X não possui 2a divisão lança erro', () => { ... });
  test('forbidden: Mundial não pode ocorrer com 9 times', () => { ... });
});
```
