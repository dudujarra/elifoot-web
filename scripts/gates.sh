#!/usr/bin/env bash
# gates.sh — Portão obrigatório antes de commit/PR
# QUALQUER agente (Claude, Gemini, Codex) DEVE rodar este script
# antes de declarar trabalho completo ou fazer commit.
#
# Exit codes:
#   0 = LIBERADO (pode commitar)
#   1 = BLOQUEADO (corrija antes)
#
# Uso:
#   ./scripts/gates.sh           # roda tudo (tsc + lint + test)
#   ./scripts/gates.sh --quick   # roda só tsc + lint (sem testes)
#   ./scripts/gates.sh --full    # roda tsc + lint + test + build

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
WARN=0
RESULTS=()
MODE="${1:-default}"

header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  GATES.SH — Portao Obrigatorio de Qualidade${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

run_gate() {
  local name="$1"
  local cmd="$2"
  local required="${3:-true}"

  echo -e "${YELLOW}[GATE]${NC} $name..."

  if eval "$cmd" > /tmp/gate-output-$$.txt 2>&1; then
    echo -e "${GREEN}  [PASS]${NC} $name"
    PASS=$((PASS + 1))
    RESULTS+=("PASS: $name")
  else
    if [ "$required" = "true" ]; then
      echo -e "${RED}  [FAIL]${NC} $name"
      echo -e "${RED}  Output:${NC}"
      tail -20 /tmp/gate-output-$$.txt | sed 's/^/    /'
      FAIL=$((FAIL + 1))
      RESULTS+=("FAIL: $name")
    else
      echo -e "${YELLOW}  [WARN]${NC} $name (non-blocking)"
      tail -5 /tmp/gate-output-$$.txt | sed 's/^/    /'
      WARN=$((WARN + 1))
      RESULTS+=("WARN: $name")
    fi
  fi
  rm -f /tmp/gate-output-$$.txt
}

summary() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  RESULTADO FINAL${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  for r in "${RESULTS[@]}"; do
    if [[ "$r" == PASS* ]]; then
      echo -e "  ${GREEN}ok${NC} ${r#PASS: }"
    elif [[ "$r" == FAIL* ]]; then
      echo -e "  ${RED}FAIL${NC} ${r#FAIL: }"
    else
      echo -e "  ${YELLOW}WARN${NC} ${r#WARN: }"
    fi
  done

  echo ""
  echo -e "  ${GREEN}Pass: $PASS${NC}  ${RED}Fail: $FAIL${NC}  ${YELLOW}Warn: $WARN${NC}"
  echo ""

  if [ $FAIL -gt 0 ]; then
    echo -e "${RED}${BOLD}  BLOQUEADO — NAO COMITE. Corrija os erros acima primeiro.${NC}"
    echo ""
    exit 1
  else
    echo -e "${GREEN}${BOLD}  LIBERADO — todos os gates passaram. Pode commitar.${NC}"
    echo ""
    exit 0
  fi
}

# ─── MAIN ───

header

# Gate 1: TypeScript (OBRIGATORIO)
run_gate "TypeScript (tsc --noEmit)" "npx tsc --noEmit" true

# Gate 2: ESLint errors only (OBRIGATORIO)
# --quiet mostra so errors. Output vazio = 0 errors = passa.
run_gate "ESLint (0 errors)" "npx eslint . --quiet" true

# Gate 3: ESLint warnings count (AVISO — nao bloqueia)
run_gate "ESLint warnings < 50" \
  "test \$(npx eslint . 2>&1 | grep -c 'warning' || echo 0) -lt 50" \
  false

if [ "$MODE" != "--quick" ]; then
  # Gate 4: Testes (OBRIGATORIO)
  run_gate "Vitest (npm test -- --run)" "npm test -- --run" true
fi

if [ "$MODE" = "--full" ]; then
  # Gate 5: Build (OBRIGATORIO no modo full)
  run_gate "Build (npm run build)" "npm run build" true
fi

summary
