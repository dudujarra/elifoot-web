# ⚽ ELIFOOT — Soccer Manager RPG

Um simulador de futebol brasileiro com profundidade de RPG. Gerencie um dos **170 clubes reais**, treine o elenco, negocie contratos, suba de divisão e construa um legado como treinador.

## 🎮 Gameplay

### Modo Treinador
- Escolha entre **4 divisões** e **5 zonas regionais**
- **8 formações** (4-3-3, 4-4-2, 3-5-2...) + **6 táticas** (Posse, Pressão, Contra-Ataque...)
- **Match Engine ao vivo** com cronômetro e narração lance a lance
- **15 traits únicos** por jogador (Decisivo, Líder Nato, Cavalo de Aço...)
- **Vestiário dinâmico**: capitão estabiliza, cancer contamina
- **Career stats**: gols, assistências, MOTM por temporada
- **Youth Academy** com base de formação em 5 níveis
- **Promo/Relegation** automático ao fim de cada temporada

### Modo Jogador
- Viva a carreira de um atleta do banco à titularidade
- Relacionamentos com diretoria, torcida, sponsors e companheiros
- Stress e energia como recursos limitados
- Renome e Star Rating baseados em performance

## 🏗️ Stack

- **Engine:** JavaScript puro (headless, zero-UI)
- **UI:** React + Vite
- **Design:** Dark mode, glassmorphism, Inter + Outfit fonts
- **Dados:** 170 clubes brasileiros reais

## 🚀 Rodar

```bash
npm install
npm run dev
```

## 📊 Métricas

| Métrica | Valor |
|---|---|
| Engine modules | 14 |
| Engine linhas | 3.260 |
| React views | 8 |
| Total linhas | ~5.700 |
| Build time | 85ms |
| Bundle size | 367KB |
| Times | 170 |
| Torneios simultâneos | 16 |

## 📦 Sistemas

- ⚔️ Match Engine (narração contextual, trait modifiers, MOTM)
- ⏱️ Cronômetro ao vivo com lance a lance
- 📋 Formações, Táticas, Treino, Preleção
- 🧬 Player Development (growth, decline, retirement)
- 🔥 Form System (hot/cold streak)
- 🏷️ 15 Traits (habilidades especiais)
- 📊 Career Stats + Season Awards
- 🏠 Dressing Room Dynamics
- 🏛️ Board System (confiança + demissão)
- 🏥 Injury System (6 tipos)
- 🎓 Youth Academy (5 níveis + empréstimos)
- 🎙️ Press Conference (3 NPCs)
- 🏟️ Stadium (5 níveis) + Staff (5 cargos)
- 🔎 Scouting (5 regiões)
- 💰 Sponsors + Finanças semanais
- 📅 Calendar Events (pausa FIFA, janela, férias)
- 🏆 Promo/Relegation + Manager Legacy
- 📰 16 Morale Events narrativos
- 📚 Mentoring (veterano → jovem)
- 📝 Contract Renewal com personalidade

## 📝 Protocolo AKITA

Cada commit segue o formato `AKITA-XXX: Título — Descrição detalhada` com validação headless (vite build 0 erros) obrigatória antes de cada push.
