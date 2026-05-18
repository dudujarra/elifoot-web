# 🚧 ROADMAP DE REFATORAÇÃO BRUTAL: "CHÃO DE FÁBRICA"
**Status:** ATIVO
**Regra Primária:** Sem baboseira acadêmica. O foco é performance, estabilidade e manutenibilidade. Um jogo não precisa de uma IA que ganha um Nobel, precisa de um clique que responda em 16ms.

---

## BLOCO 1: SANGRAMENTO DO TYPESCRIPT (Zero `any`)
*O compilador vai gritar, o build vai quebrar, e nós vamos arrumar.*

- [ ] **1.1 Ligar a Chave de Segurança:** Atualizar `tsconfig.json` forçando `"strict": true` e `"noImplicitAny": true`. O projeto vai falhar instantaneamente.
- [ ] **1.2 Mapeamento e Extermínio:** Identificar e tipar explicitamente os 641 `any` do código. 
    - **Alvos críticos:** `MatchSimulator.js` (passar para .ts), `SeasonProcessor`, payloads do `GameContext`.
- [ ] **1.3 Fim do `@ts-ignore` e `as any`:** Interfaces para todas as entidades fundamentais (Player, Club, MatchResult). Se o formato do dado não for previsível, o erro é do design do banco, não do Typescript.

## BLOCO 2: ESTANCAMENTO DO VAZAMENTO DO REACT
*React não é motor de simulação. Pare de forçar o DOM a pensar.*

- [ ] **2.1 Cirurgia no `GameContext.jsx`:**
    - Remover o `setState` síncrono atrelado ao `useEffect` de roteamento (linha 291).
    - Mudar a arquitetura de roteamento para usar o `useNavigate` nativo do `react-router-dom` em vez de sync forçado no estado global. Fim das renderizações em cascata.
- [ ] **2.2 Esvaziamento de Componentes Obesos:**
    - Pegar `PlayerDashboardView` (600 linhas), `MarketView` (500 linhas) e `SquadView` (480 linhas).
    - Toda lógica pesada de cálculo (somatórias de OVR, ordenamento de arrays) sai do JSX e vai para `useMemo` ou para um reducer externo.
    - O JSX será puramente burro: recebe props e exibe UI.

## BLOCO 3: EXTERMÍNIO DA LIXEIRA DE CSS (Purga dos 16k lines)
*O uso de `!important` significa que o desenvolvedor perdeu o controle do próprio código.*

- [ ] **3.1 Remoção do `!important`:** Busca em todo diretório `src/styles`. Eliminar as 54 instâncias reconstruindo a especificidade da regra (CSS Modules ou Tailwind).
- [ ] **3.2 Adoção Forçada do Tailwind:** O `package.json` já tem `@tailwindcss/vite` instalado. 
    - Iniciar a substituição agressiva dos estilos de arquivos enormes (`isssd-premium.css` de 2.7k linhas) por classes utilitárias no JSX.
- [ ] **3.3 Fim da Hipocrisia dos Inline Styles:** Limpar as violações do linter em `SquadContractsTab`, `SquadRosterTab`, etc. O que for variável dinâmica usa CSS Variable (`--minha-cor`), o que for fixo vai pro Tailwind. Zero exceções via `eslint-disable`.

## BLOCO 4: PODA DE OVERENGINEERING DA ENGINE
*Este é um jogo de manager no navegador, não um projeto de tese em Machine Learning. Simplicidade é o que escala.*

- [ ] **4.1 Rebaixamento da Inteligência (MARL → Heurística):** 
    - O `AdaptiveBrain` e algoritmos de Reinforcement Learning estão sugando a CPU da Main Thread. Vamos rebaixar isso para Árvores de Decisão Heurística (Decision Trees simples baseadas em tabelas de pesos). 
    - O usuário **não percebe** a diferença, mas a bateria do celular dele agradece. A simulação da temporada cai de minutos para milissegundos.
- [ ] **4.2 Enxugamento dos Sistemas Ocultos:** 
    - Desligar/simplificar sistemas não visíveis (`BoardTensionSystem` e `LearnedEmotionalModifiers` que dependem de dezenas de iterações por segundo para calcular nada). Feedback imediato é a única métrica: o time perdeu, torcida fica brava.

## BLOCO 5: DESTRUIÇÃO DE TESTES FRÁGEIS
*Testes que testam a classe CSS quebram a refatoração e geram estresse falso.*

- [ ] **5.1 Testes Baseados em Comportamento:** Identificar e excluir specs em Vitest que falham apenas porque a estrutura do DOM mudou. 
- [ ] **5.2 Imunização do Headless:** Garantir que o `v2-gaps-smoke.test.js` e a suite do modo Sinistro confiem apenas em Input (Time A vs Time B) e Output (Time B ganhou de 2x0). Como o React pinta a tela é irrelevante para o vitest.
