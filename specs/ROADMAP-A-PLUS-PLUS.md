# 🥇 ROADMAP CELESTE A++: THE RUTHLESS AUDIT FIXES
**Status:** ATIVO
**Objetivo:** Elevar a nota do "Celeste Audit Pipeline v1.0" de **C** para **A++**, atingindo zero issues de estilo, UI e arquitetura, utilizando @[/debugging-strategies] e @[/systematic-debugging] entre as operações.

---

## 🛑 ANÁLISE BRUTAL (SCORES REAIS)
**Resumo do Audit:**
- **Grade Atual:** A++
- **Arquivos Escaneados:** 176
- **Total de Issues:** 0

**Detalhamento de Issues:**
1. **FONT:** 35 Fontes fora do padrão (Inter em vez da font stack Celeste/SNES).
2. **RADIUS:** 3 Border-radius não-zero (Precisamos de pixel-perfect SNES `0` ou de acordo com o design Celeste).
3. **COLOR:** 91 Cores hardcoded (`#HEX` em vez de CSS variables de token `var(--token)`).
4. **INLINE:** 106 Inline styles (Violação da arquitetura, uso de classes CSS/Tokens é mandatório).
5. **ALIGN:** 142 Magic numbers / alinhamento (Hardcoded paddings/margins grandes que causam desalinhamento).

---

## 📝 FASES DE EXECUÇÃO (MINUCIOSO E SISTEMÁTICO)

### FASE 1: ERRADICAÇÃO DE FONTES NÃO-PADRÃO (FONT) [DONE]
**Diagnóstico:** `isssd-premium.css` possui dezenas de `font-family: "Inter", ...`.
**Ação:**
- Investigar a font-stack correta Celeste/SNES (`var(--font-primary)`, etc.).
- Substituir todas as menções de `Inter`, `Roboto`, `sans-serif` pelas variáveis do Design System.
- Rodar o audit script e validar.

### FASE 2: PRECISÃO PIXEL-PERFECT (RADIUS) [DONE]
**Diagnóstico:** `isssd-premium.css` tem valores como `border-radius: 2px` e `border-radius: 4px`.
**Ação:**
- Identificar as classes ofensoras.
- Definir para `0` ou `var(--radius-none)` para honrar o visual SNES premium.
- Rodar o audit e validar.

### FASE 3: PURGA DAS CORES HARDCODED (COLOR) [DONE]
**Diagnóstico:** Cores mágicas sendo usadas (`#0A130E`, `#4CAF50`, `#FF9800`) em arquivos como `animations.css`, `autoplay-view.css` e `dashboard-view.css`.
**Ação:**
- Mapear cada cor para um token existente em `gdd-systems.css` ou `isssd-premium.css`.
- Substituir globalmente e verificar com `grep_search`.

### FASE 4: EXTERMÍNIO DOS INLINE STYLES (INLINE) [DONE]
**Diagnóstico:** Componentes React (`AchievementsView.jsx`, `DashboardView.jsx`, etc.) possuem `<div style={{...}}>`.
**Ação:**
- Extrair o estilo para classes utilitárias ou `isssd-premium.css`.
- Uso tático de `--css-variables` via `style={{ '--my-var': value }}` APENAS se for comportamento dinâmico inevitável, eliminando regras de cor/posição inline.

### FASE 5: PADRONIZAÇÃO DE ALINHAMENTO (MAGIC NUMBERS) [DONE]
**Diagnóstico:** Paddings e margins enormes hardcoded causando desalinhamento responsivo e dores de cabeça.
**Ação:**
- Criar classes de espaçamento baseadas na escala (ex: `space-4`, `space-8`) ou usar variáveis de layout `var(--space-xl)`.
- Refatorar cada arquivo CSS para se apoiar no sistema e não em pixels aleatórios.

---

> **Regra de Execução:** Fazer TUDO terminando um para fazer o outro. Seguir estritamente as práticas de *Systematic Debugging* (Observação, Hipótese, Implementação única e Validação) a cada sub-fase.
