# Stitch Screens — OléFUT (live)

**Project**: `1129586751616590793`
**Design System**: `assets/88a8720bc4f7464e9923da6c676f6074`
**Last updated**: 2026-05-13

---

## ✅ Generated (7/20 = 35%)

| # | Screen | Stitch ID | Notes |
|---|--------|----|-------|
| 1 | DashboardView | `6d195eea6d364f319d104f16ff031481` | Escritório central, 3-col bento |
| 2 | SquadView | `40202c0b989c4260a3279874334daf34` | Tabela 7-col, titulares/lesionados |
| 3 | MatchView | `6a725d226cb94f19869a9ce60c7cea52` | Scoreboard ao vivo + narração |
| 4 | TrophyCeremony | `2823e5a00e8b4599a27935871d5a00bb` | Cerimônia overlay full-screen |
| 5 | StartView | `56afdb02497d45f58ff4617ced09b460` | Title screen SNES |
| 6 | AchievementsView | `f1e0cb1b29514f73bbfd9a854fdea3cb` | Grid conquistas bronze→platina |
| 7 | LineageView | `e7104e925a764657b567a647b0ddceb8` | Hall de Lendas 6 slots |

## ⏳ Pending (13/20)

Timeout pattern detected (Stitch rate-limit possible):
- MarketView (4x timeout)
- StandingsView (3x timeout)
- PreMatchScreen (3x timeout)
- PressView (2x timeout)
- CosmeticShopView (2x timeout)
- TutorialView (2x timeout)
- RivalriesView (2x timeout)
- ChronicleView (2x timeout)
- MonitorView (2x timeout)
- SaveSlotsView (1x timeout)
- PostMatch
- PlayerDashboardView
- AutoPlayView

## How to Retry

Stitch generation has ~50% timeout rate on consecutive calls. Strategy:
1. Wait 5-10 min between batches
2. Use GEMINI_3_FLASH model (faster than Pro)
3. Keep prompts ultra-short (<200 chars)
4. Use `mcp__stitch__generate_screen_from_text` per pending screen

```bash
# Example pattern (já funcionou 7x)
mcp__stitch__generate_screen_from_text
  projectId: 1129586751616590793
  designSystem: assets/88a8720bc4f7464e9923da6c676f6074
  deviceType: DESKTOP
  modelId: GEMINI_3_FLASH
  prompt: "[short prompt <200 chars]"
```

