# AKITA-RFCT-018: AutoPlayService Split (God Class Refactor)

## Pergunta/Objetivo
Como desmembrar a "God Class" de mais de 2000 linhas (`AutoPlayService.js`) em componentes focados, testáveis e com responsabilidade única, sem quebrar o loop do motor MARL?

## Sintoma/Motivação
O arquivo `AutoPlayService.js` atingiu +2014 linhas de código. Ele está centralizando orquestração, integração assíncrona do LLM (WebLLM), salvamento e persistência, gerenciamento do *pacing/friction*, e a própria matemática do Q-learning e buffers de replay. Essa violação do Single Responsibility Principle (SRP) torna a manutenção e os testes unitários frágeis (especialmente a integração LLM).

## Método
O refactoring deve extrair lógicas para 4 novos arquivos irmãos e manter o `AutoPlayService.js` estritamente como um orquestrador leve:
1. `AutoPlaySimulator.js`: Loop estrito de simulação de partidas e RL math.
2. `AutoPlayLLMBridge.js`: Toda integração assíncrona do WebLLM (gerenciamento do worker, fila de prompts, parse JSON do mercado). Referência: SPEC-119.
3. `AutoPlayPacing.js`: Emissor de eventos de fricção (ex: "diretoria nervosa", "janela fechando").
4. `AutoPlayPersistence.js`: Leitura, gravação, export e parsing de arquivos JSON (State, Telemetry).
5. `AutoPlayService.js`: Ficará com ≤ 400 LOC, apenas inicializando os sub-serviços e repassando eventos via injeção de dependência.

## Critério de Respondida
- O arquivo `AutoPlayService.js` deve ter ≤ 400 LOC após o refactoring.
- Os testes de soak (test:soak) devem passar sem quebras (1000 semanas ininterruptas).
- O WebLLM deve conseguir responder a ofertas de mercado com delay normal, sem gargalar o simulador sincrono.

## Plano de Execução
**(Pendente para a próxima sessão)**
- [ ] Criar stub dos arquivos na mesma pasta.
- [ ] Mover as dependências e dependentes para as fatias.
- [ ] Rodar os testes de regressão de budget (SPEC-159) para atestar que as funções puras continuam idênticas.
