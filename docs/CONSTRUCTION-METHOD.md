# Método de Construção Modular e Faseado

> Destilado das lições reais do projeto OléFUT (2025-2026).
> Prescritivo. Precedente ao AKITA Style. Para matar os problemas antes que nasçam.

---

## Por que este documento existe

Este projeto ensinou que **regras de qualidade no final** (lint, test, code review) não salvam um projeto que foi construído errado. Os problemas que tivemos:

| Problema | Causa raiz | Quando deveria ter sido prevenido |
|---|---|---|
| God Components (DashboardView 1400L) | Sem limite de tamanho na criação | Na hora de criar o componente |
| Engine acoplada a React | Sem fronteira arquitetural | No dia 1 da arquitetura |
| Inline styles por todo canto | Sem padrão CSS definido antes de codar | Antes da primeira linha de UI |
| Agente AI comitando lixo | Sem gates automatizados | Na infra de CI/hooks |
| Specs retroativas | Features criadas sem design prévio | No workflow de início de feature |
| jscodeshift CSS que destruiu o frontend | Refactor massivo sem validação incremental | Na regra de batch size |

**A solução não é mais regras no final. É um método de construção que torna impossível criar o problema.**

---

## Os 5 Princípios

### 1. Fronteiras Antes de Código

Antes de escrever uma linha de código, defina as fronteiras:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    ENGINE    │────>│   SERVICES   │────>│     UI       │
│  (headless)  │     │  (ponte)     │     │  (read-only) │
│  Zero React  │     │  Zero DOM    │     │  Zero lógica │
│  Zero DOM    │     │              │     │  de negócio  │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Regra:** Um módulo nunca importa de uma camada acima. Engine nunca importa de Services. Services nunca importam de UI.

**Como enforçar:** Teste estático no CI que verifica imports. Se `src/engine/` importa de `src/components/`, o build falha.

### 2. Especificação Antes de Implementação (SDD)

Nenhuma feature, refactor ou bugfix começa sem um documento que diga:
- **O que** vai mudar
- **Por que** (problema que resolve)
- **Critérios de aceite** (como saber que tá pronto)
- **Harness** (teste que prova que funciona)

**A spec é escrita ANTES do código. O código é escrito CONTRA a spec.**

Sem spec → sem trabalho. Sem exceção.

### 3. Tamanho Máximo por Unidade

| Unidade | Limite | O que fazer se ultrapassar |
|---|---|---|
| Arquivo | 400 linhas | Extrair módulo |
| Função | 50 linhas | Extrair sub-função |
| Componente React | 200 linhas | Decompor em sub-componentes |
| PR | 300 linhas de diff | Quebrar em PRs menores |
| Sessão de edição | 5 arquivos | Rodar gates intermediários |

**Estes limites não são sugestões. São gates automatizados.**

### 4. Validação Contínua, Não Final

Não espere terminar tudo pra validar. Valide a cada passo.

```
Editou 1 arquivo  → tsc passa?
Editou 3 arquivos → lint passa?
Editou 5 arquivos → OBRIGATÓRIO rodar ./scripts/gates.sh
Quer commitar     → pre-commit hook roda automaticamente
Quer mergear      → CI roda tudo (tsc + lint + test + build)
```

**A pirâmide de validação:**

```
         ┌─────────┐
         │   CI    │  ← última linha de defesa
        ┌┴─────────┴┐
        │ pre-commit │  ← impede commit quebrado
       ┌┴───────────┴┐
       │  gates.sh   │  ← agente roda antes de declarar "pronto"
      ┌┴─────────────┴┐
      │  IDE feedback  │  ← erros aparecem em tempo real
     ┌┴───────────────┴┐
     │ arquitetura certa │ ← previne o problema na raiz
     └─────────────────┘
```

### 5. Construção Faseada (Nunca Tudo de Uma Vez)

Todo trabalho passa por fases. Não pule fases.

```
FASE 0: SPEC
  → Escrever especificação
  → Definir critérios de aceite
  → Definir harness de teste

FASE 1: FUNDAÇÃO
  → Criar estrutura de diretórios/arquivos
  → Definir interfaces/tipos/contratos
  → Criar stubs (funções vazias com assinatura correta)
  → VALIDAR: tsc passa, lint passa

FASE 2: ESQUELETO
  → Implementar happy path básico
  → Implementar 1 teste que exercita o caminho principal
  → VALIDAR: gates.sh passa

FASE 3: CARNE
  → Implementar edge cases
  → Implementar error handling
  → Adicionar testes de regressão
  → VALIDAR: gates.sh passa

FASE 4: POLISH
  → Refinar UX/mensagens/logs
  → Documentar
  → VALIDAR: gates.sh --full passa

FASE 5: ENTREGA
  → PR aberto com spec linkada
  → CI verde
  → Code review (humano ou agente diferente do que implementou)
```

**Regra absoluta:** Cada fase termina com validação verde. Se a fase 2 quebra a validação, você não avança pra fase 3. Você conserta a fase 2.

---

## Anti-Padrões Mortais (O Que NUNCA Fazer)

### 1. Metralhadora de Edições
**Sintoma:** 200+ edições em uma sessão sem validar.
**Resultado:** Bugs empilhados que se mascaram mutuamente.
**Regra:** Máximo 5 arquivos editados sem rodar gates.

### 2. Refactor Massivo Automatizado
**Sintoma:** Usar codemod/jscodeshift/regex pra mudar 100+ arquivos de uma vez.
**Resultado:** Mudanças que parecem certas mas introduzem bugs sutis em 3% dos casos.
**Regra:** Refactor automatizado: máximo 10 arquivos por batch. Validar batch. Próximo batch.

### 3. Commit "(a reverter)"
**Sintoma:** Commitar trabalho incompleto com nota de que será revertido.
**Resultado:** Nunca é revertido. Vira dívida técnica permanente.
**Regra:** Se não está pronto, não comita. Use `git stash` ou uma branch descartável.

### 4. God Component / God Object
**Sintoma:** Arquivo que cresce "organicamente" até 1000+ linhas.
**Resultado:** Impossível de manter, testar ou decompor sem risco.
**Regra:** Quando um arquivo chega em 300 linhas, para e decompõe ANTES de continuar.

### 5. Declarar "Pronto" Sem Evidência
**Sintoma:** "Está tudo funcionando" sem mostrar output de gates.
**Resultado:** Alguém mais encontra os erros.
**Regra:** "Pronto" = output de `./scripts/gates.sh` mostrando `LIBERADO`.

---

## Checklist Para Agentes AI

Antes de qualquer sessão de trabalho:

```
[ ] Li a spec do trabalho (ou criei uma)
[ ] Entendo as fronteiras (engine / services / UI)
[ ] Sei o limite de tamanho (400L arquivo, 200L componente)
```

Durante o trabalho:

```
[ ] A cada 5 arquivos editados: rodei gates.sh --quick
[ ] Não estou fazendo refactor em mais de 10 arquivos por batch
[ ] Meus arquivos novos estão abaixo de 400 linhas
```

Antes de declarar pronto:

```
[ ] Rodei ./scripts/gates.sh (output mostra LIBERADO)
[ ] Não comitei com --no-verify
[ ] Não comitei com "(a reverter)" no título
[ ] Atualizei a spec/roadmap se necessário
```

---

## Infraestrutura de Enforcement

| Camada | Ferramenta | O que bloqueia |
|---|---|---|
| Pre-commit hook | `.git/hooks/pre-commit` | Commits com erros de tsc ou lint |
| Commit-msg hook | `.git/hooks/commit-msg` | Commits sem prefixo AKITA-XXX |
| Gates script | `./scripts/gates.sh` | Declaração de "pronto" sem evidência |
| ESLint rules | `.eslintrc` | Inline styles, imports errados |
| TSC strict | `tsconfig.json` | Tipos incorretos |
| Vitest | `npm test` | Regressões |
| CI (GitHub Actions) | `.github/workflows/` | Merge com qualquer gate falhando |

---

> **Este método não substitui criatividade nem velocidade.**
> Ele garante que a velocidade não destrua o que já foi construído.
> É mais rápido fazer certo do que fazer rápido e consertar depois.
