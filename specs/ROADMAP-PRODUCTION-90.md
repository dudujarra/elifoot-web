# ROADMAP: MISSÃO 90/100 (O Fim do Arame Farpado)

Este roadmap define as etapas cirúrgicas para transformar a base de código do OléFUT de **56/100 (Ferrari com motor de Fusca)** para **90/100 (Engenharia de Software Nível Produção)**. As metas são inegociáveis: zero avisos no ESLint, zero mutações não seguras, e zero God Components.

---

## 🛑 FASE 1: Triage de Sobrevivência (Runtime Stability)
*Objetivo: O jogo não pode quebrar em produção silenciosamente.*

- [ ] **1.1. Corrigir Erros Fatais (`scoreClass`)**
  - Investigar e resolver o erro `scoreClass is not defined` no `AutoPlayView.jsx` ou dependências.
  - Garantir que o linter pare de emitir os 4 erros bloqueantes.
- [ ] **1.2. Zero Warnings (`eslint-disable` Purge)**
  - Auditar os 99 warnings remanescentes (principalmente `react-hooks/exhaustive-deps`).
  - Corrigir closures fantasmas adicionando as dependências corretas ou usando funções setter funcionais (ex: `setEvents(prev => [...prev])`).
  - Remover mutações de objeto diretas.
- [ ] **1.3. Otimizar `useEffect` (Fim dos Renders Duplos)**
  - Eliminar ou mitigar alertas de `set-state-in-effect` que causam renderizações em cascata e degradam a performance do loop de simulação.

---

## 🔪 FASE 2: Desmembramento do Monolito Frontend
*Objetivo: Nenhum arquivo React deve ter mais de 250 linhas.*

- [ ] **2.1. Fracionar `AutoPlayView.jsx` (Atualmente 949 linhas)**
  - O arquivo é gigantesco. Extrair lógicas específicas para subcomponentes:
    - `AutoPlayLogsPanel.jsx` (Visualização dos eventos da simulação).
    - `AutoPlayControls.jsx` (Botões de Play/Pause, Velocidade).
    - `AutoPlayMetrics.jsx` (Gráficos, estatísticas, convergence metrics).
- [ ] **2.2. Validar Desacoplamento da Dashboard**
  - Revisar se a extração anterior da Dashboard (`DashboardHeroMatch.jsx`, etc.) está estritamente recebendo props, sem gerenciar estados colossais globalmente.

---

## 🧱 FASE 3: Fronteiras Fortificadas (Engine vs. UI)
*Objetivo: O React reage. A Engine gerencia. Respeitar a imutabilidade.*

- [ ] **3.1. Fim do `engine.uiEvents = []` na UI**
  - No `useEngineEvents.js`, remover a atribuição destrutiva imperativa.
  - Criar um método formal na Engine: `engine.consumeUIEvents()` que limpa a fila internamente de forma transacional e segura.
- [ ] **3.2. Purga do God Service `MatchSimulator.js` (615 linhas)**
  - Continuar o trabalho iniciado na extração do Goleiro e Lesões.
  - Extrair o motor de Gols e Eventos Especiais para novos serviços (ex: `MatchEventsSystem.js`).
- [ ] **3.3. Refatorar `SeasonProcessor.js` e `AutoPlayService.js`**
  - Quebrar o `AutoPlayService.js` separando a lógica de "Agente/Brain" da lógica de "Coordenação/Pacing".

---

## ⚡ FASE 4: Escalabilidade de Bundling (Code Splitting)
*Objetivo: Remover o alerta "chunks larger than 500 kB" do Vite e garantir tempos de carregamento instantâneos.*

- [ ] **4.1. Lazy Loading nas Rotas Principais**
  - No `App.jsx` ou roteador central, encapsular as Views (`StandingsView`, `CosmeticShopView`, `TrophyCeremony`, etc.) com `React.lazy()` e `<Suspense>`.
- [ ] **4.2. Isolamento de Dependências Pesadas**
  - Garantir que bibliotecas pesadas (como o Recharts para gráficos do MARL ou o WebLLM) só sejam carregadas e "chunkadas" se a View que as utiliza for acessada.
- [ ] **4.3. Teste de Bundle Final**
  - Rodar `npm run build` e confirmar que não existem mais chunks > 500KB sem justificativa.

---

### Métrica de Sucesso (DoR - Definition of Ready):
A missão estará cumprida no momento em que:
1. `npm run lint` retornar **0 problemas**.
2. O `vitest` mantiver a linha de **1831 testes passando**.
3. Nenhum arquivo `.jsx` principal ultrapassar 250-300 linhas.
4. O `npm run build` terminar limpo, sem avisos vermelhos de chunking no Vite.
