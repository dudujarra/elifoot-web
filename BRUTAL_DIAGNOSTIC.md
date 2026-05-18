# 🛑 DIAGNÓSTICO BRUTAL DA ARQUITETURA OLEFUT

Você pediu brutalidade real. O script Celeste Audit deu "A++", mas isso é **maquiagem de UI**. Quando tiramos o verniz do CSS e do "pixel-perfect", o núcleo do projeto ainda sofre com débito arquitetônico profundo. 

Aqui está a análise sem filtros do verdadeiro estado do sistema:

## 1. O Falso Decoupling (O "God Hook")
No papel, o `DashboardView.jsx` tem apenas 121 linhas e importa subcomponentes. Parece limpo. Mas você não desacoplou a lógica, você apenas escondeu a sujeira debaixo do tapete movendo tudo para **`useDashboardState.js`**.
- O hook gerencia **tudo**: Tutoriais, Cerimônias de troféu, transferências, treinos, cálculo de média do time adversário, chamadas de rede para o LLM (`handleAuxiliarAdvice`), e roteamento de telas.
- Isso é a definição de um **God Object** travestido de React Hook. Ele tem tantas responsabilidades que qualquer alteração em uma área (ex: mercado de transferências) corre o risco de quebrar outra (ex: tutorial).

## 2. A Bomba-Relógio do React (92 Warnings Ignorados)
Temos 92 warnings de ESLint no repositório inteiro. E não são frescuras de indentação:
- **`react-hooks/exhaustive-deps` (7x):** Funções e variáveis não declaradas no array de dependências do `useEffect`. Isso significa que o estado ficará "preso" em closures velhas. Bugs fantasmas de UI vão acontecer em tempo de execução.
- **`react-hooks/set-state-in-effect` (5x):** Isso causa re-renderizações duplas e lentidão. O dashboard está renderizando duas vezes toda vez que você avança a semana.
- **`react-hooks/immutability` (7x):** Arrays/Objetos estão sendo mutados diretamente no React, o que não trigga re-render da UI ou trigga quando não deve.

## 3. Acoplamento de Eventos (String Parsing vs. Pub/Sub)
Dentro do `useDashboardState`, você usa REGEX para detectar se o jogador ganhou um troféu ou liberou algo novo a partir do array de LOGS textuais do jogo:
```javascript
const unlockEvent = engine.weekEvents.find((e) => typeof e === 'string' && e.includes('🔓 Novo acesso'));
const match = unlockEvent.match(/desbloqueado: (\w+)/);
```
**Isso é terrível.** A interface gráfica está vasculhando um array de logs de texto feitos para humanos lerem, para então decidir se deve abrir um Modal! Se amanhã alguém mudar o emoji "🔓" no backend para "🔑", a UI **quebra silenciosamente**. O backend deveria emitir eventos tipados (ex: `engine.events.emit('ACHIEVEMENT_UNLOCKED', { id: '...' })`).

## 4. Backend: Os Monólitos Sobreviventes
Você mencionou "decompor componentes", mas o backend ainda é governado por God Classes enormes em arquivos únicos:
- `MatchSimulator.js` (649 linhas): Mistura lógica de física de bola, narração via logs e cálculo de atributos.
- `AutoPlayDecisions.js` (643 linhas) e `AutoPlayService.js` (496 linhas): A lógica do agente autônomo não está modularizada, é um script sequencial gigantesco de regras `if/else`.
- `SeasonProcessor.js` (457 linhas): Faz rotatividade de copa, promove times, aplica salários e gera sorteios da fase de grupos, tudo num arquivo só.

---

### O Veredito
O frontend está com o visual **A++** e os testes/tipagem passam (o motor de backend da simulação funciona muito bem). Mas a "cola" do React (state management) e o acoplamento UI <-> Engine estão amarrados por arame farpado.

**O que precisamos fazer para consertar de verdade (O NOVO ROADMAP BRUTAL):**
1. **Quebrar o `useDashboardState`** em pequenos hooks especialistas (`useTransfers`, `useTutorial`, `useLLMAdvice`, `useEngineEvents`).
2. **Eliminar o String Parsing na UI** implementando um Event Bus básico (Pub/Sub) onde a UI reage a eventos e não a Emojis no log de texto.
3. **Zerar as dependências fantasmas do ESLint** (`exhaustive-deps` e `set-state-in-effect`) para evitar loop de renders.
4. **Extrair lógica pesada** do React (cálculos de OVR no componente LLMAdvice) para getters memoizados na Engine.
