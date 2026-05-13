# OléFUT Design System — Audit Report (v2)

**Date**: 2026-05-13 (re-audit)
**Auditor**: design:design-system skill via `/brand audit`
**Sources**: docs/brand-guidelines.md (v1.1), assets/design-tokens.json, src/styles/*.css, src/components/**/*.jsx

---

## Summary

| Metric | Value | Delta vs v1 |
|--------|-------|-------------|
| **Components reviewed** | 57 | — |
| **CSS files** | 29 | — |
| **CSS vars defined** | 321 | — |
| **Unique tokens consumed** | 155 | +11 ✅ |
| **Hardcoded hex remaining** | 101 | +86 ⚠️ (discovered learning/) |
| **Inline style props** | 611 | +141 (discovered learning/) |
| **BEM classes ef-*** | 1,355 | +76 ✅ |
| **WCAG AAA pairs** | 6/7 | — |
| **SPEC-171 tests** | ✅ passing | — |
| **SPEC-178 tests** | ✅ passing | — |
| **Score** | **84/100** | -6 ⚠️ (learning/ discovery) |

---

## ⚠️ NEW FINDING: learning/ subdirectory not audited in v1

| File | Hex Count | Status |
|------|-----------|--------|
| `src/components/learning/BrainDashboard.jsx` | 43 | ❌ Not migrated |
| `src/components/learning/CareerInfoPanel.jsx` | 14 | ❌ Not migrated |
| `src/components/learning/LearningPanel.jsx` | 9 | ❌ Not migrated |

**Total**: 66 hardcoded hex across 3 files. **Priority #1 to address.**

These contain MARL/RL learning visualizations — Q-table dashboards, brain state, career arcs. Critical for SPEC-119 LLM bridge UI.

---

## 1. Naming Consistency (8/10)

| Issue | Count | Recommendation |
|-------|-------|----------------|
| Legacy non-BEM classes in isssd-premium.css | 254 | Migrate to `ef-*` namespace progressively |
| Filename naming mismatch | 2 | `prematch-screen.css` (no hyphen) inconsistent w/ `tutorial-view.css` |

**BEM ef-* class count**: 1,355 (✅ strong)

---

## 2. Token Coverage (8.5/10) — DOWNGRADED

| Category | Defined | Hardcoded Found | Coverage |
|----------|---------|-----------------|----------|
| **Colors** | 80+ | **101** (was 15) | 88% |
| **Typography** | 24 | 0 | 100% ✅ |
| **Spacing** | 12 | ~50 (data-driven, OK) | 95% |
| **Borders** | 6 | 0 | 100% ✅ |

**Hardcoded hex breakdown**:
- ❌ `learning/BrainDashboard.jsx` — 43 (action needed)
- ❌ `learning/CareerInfoPanel.jsx` — 14
- ❌ `learning/LearningPanel.jsx` — 9
- ✅ `ChronicleView.jsx` — 8 (canvas API, intentional)
- ✅ `StyleguideView.jsx` — 4 (palette data, intentional)
- ✅ `MatchHighlightModal.jsx` — 3 (helper test fixtures, intentional)

**Non-intentional violations**: **66 hex** (must migrate)
**Intentional preserved**: 15 hex (canvas/palette/test, OK)

---

## 3. Component Completeness (8/10)

**Components with dedicated CSS (21/57)**: 36%
**Components with strong token usage**: 38/57 (66%)
**Components fully refactored (FASE 1-4)**: 25
**Components NOT yet refactored**:
- ❌ `learning/BrainDashboard.jsx` (43 hex)
- ❌ `learning/CareerInfoPanel.jsx` (14 hex)
- ❌ `learning/LearningPanel.jsx` (9 hex)
- ⚠️ AutoPlayView (token-migrated but structural still inline-heavy)
- ⚠️ ~19 small components rely on global tokens only

---

## 4. Accessibility (9/10) — unchanged

| Pair | Ratio | WCAG |
|------|-------|------|
| Parchment / CRT Black | 17.29:1 | AAA ✅ |
| Neon Green / CRT Black | 13.63:1 | AAA ✅ |
| Gold / CRT Black | 13.18:1 | AAA ✅ |
| Cartão Vermelho / CRT Black | 5.08:1 | AA |
| Smoke / CRT Black | 8.91:1 | AAA ✅ |
| Parchment / Bg Panel | 15.53:1 | AAA ✅ |
| Info Blue / CRT Black | 8.44:1 | AAA ✅ |

---

## 5. Forbidden Compliance (10/10) — unchanged

| Technique | Status |
|-----------|--------|
| `rgba()` transparency | ❌ Zero violations |
| CSS gradients | ❌ Zero in new code |
| `border-radius` | ❌ Zero in new code |
| `blur()`, glassmorphism | ❌ Zero |
| Pure white `#FFFFFF` | ❌ Zero |
| Soft shadows | ❌ Replaced with bevel |
| Generic fonts | ❌ Zero |

---

## 6. Voice & Tone (9.5/10) — unchanged

Brand-aligned across views. Minor dev-comment leakage.

---

## 7. SPEC Compliance

| SPEC | Status | Tests |
|------|--------|-------|
| SPEC-171 (font tokens) | ✅ | 6/6 passing |
| SPEC-178 (stitch integration) | ✅ | 6/6 passing |

---

## 8. Priority Actions (Updated)

### CRITICAL (must do for 95+)
1. **Migrate learning/ subdirectory** — 66 hex across 3 files (BrainDashboard, CareerInfoPanel, LearningPanel) → tokens. Estimated: 1 commit, AKITA-342.
2. **Remove luxury-arcade legacy non-BEM classes** — 254 classes in isssd-premium.css need ef-* prefix migration (gradual).

### HIGH
3. AutoPlayView structural refactor (952 LOC) — split into sub-components
4. Add CSS files for 19 remaining components (Sidebar, Tooltip, SquadView etc)

### MEDIUM
5. Document UI primitive variants (`/design-system document EfButton` etc)
6. Filename normalization (prematch-screen → pre-match-screen)

---

## 9. Score Breakdown (v2)

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Naming Consistency | 15% | 8.0 | 12.0 |
| Token Coverage | 25% | 8.5 | 21.25 |
| Component Completeness | 20% | 8.0 | 16.0 |
| Accessibility | 15% | 9.0 | 13.5 |
| Forbidden Compliance | 15% | 10.0 | 15.0 |
| Voice & Tone | 10% | 9.5 | 9.5 |
| **TOTAL** | **100%** | — | **87.25/100** |

**Grade**: **B+** (was A- at 90.75)

---

## 10. Path to 95+

| Action | Effort | Score Gain |
|--------|--------|------------|
| Migrate learning/ (66 hex) | 1 commit | +4 pts → 91 |
| AutoPlayView structural refactor | 2-3 commits | +2 pts → 93 |
| Legacy class migration (luxury-arcade) | gradual | +2 pts → 95 |
| UI primitive variant docs | 1 doc | +1 pt → 96 |
| Filename normalization | 1 commit | +0.5 pts → 96.5 |

**Realistic 95+ in 4-5 commits**.

---

## 11. v1 → v2 Diff

| Metric | v1 | v2 | Delta |
|--------|----|----|-------|
| Score | 90.75 | 87.25 | -3.5 |
| Tokens consumed | 144 | 155 | +11 |
| Hex remaining | 15 | 101 | +86 |
| BEM classes | 1279 | 1355 | +76 |

**Why score dropped**: v1 audit missed `src/components/learning/` subdirectory. v2 is more thorough → realistic baseline.

**Honest state**: A- claim was inflated. B+ reflects true coverage. Migration of learning/ → A- again. After legacy + AutoPlayView → A+.

---

**Audit complete (v2)**.
**Next**: `/brand gen` to refresh DESIGN.md, then attack learning/ migration (AKITA-342).
