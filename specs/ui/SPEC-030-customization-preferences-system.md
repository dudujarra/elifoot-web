# SPEC-030: Customization & User Preferences

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/ui/Settings.jsx`, `src/engine/PreferencesSystem.js`  
**Linhas**: ~250

---

## O que é

Sistema de customização. Tema, cores, formações favoritas, exibição dados. Persist em localStorage.

---

## Customization Options

| Categoria | Opções | Default |
|-----------|--------|---------|
| **Tema** | Light/Dark/Auto | Auto |
| **Cores** | 16 paletas | Azul |
| **Idioma** | EN/PT-BR/ES/FR | PT-BR |
| **Unidades** | Km/Miles, °C/°F | Km, °C |
| **Data** | DD/MM/YYYY, etc | Localizado |
| **Notificações** | All/Importantonly/Off | All |
| **Sound** | On/Off | On |
| **Visual FX** | On/Off/Reduced | On |
| **Difficulty** | Easy/Normal/Hard | Normal |
| **Formation saves** | Up to 10 custom | 0 saved |
| **Tactic presets** | Up to 8 custom | 0 saved |
| **Shortcut keys** | Customizable | Default |
| **Stadium view** | Aerial/Close/Isometric | Isometric |
| **Player names** | Real/Numbers | Real |
| **UI density** | Compact/Normal/Spacious | Normal |

---

## Theme Palettes (16)

```
1. Azul (default) - blues, white
2. Vermelho - reds, gold
3. Verde - greens, lime
4. Roxa - purples, lavender
5. Laranja - oranges, black
6. Rosa - pinks, white
7. Ciano - cyans, dark
8. Cinza - neutrals (corporate)
9. Marrom - earth tones
10. Amarela - yellows, dark
11. Turquesa - teals, white
12. Marrom+Ouro - elegant
13. Neon (gaming) - neon lights
14. Pastel - soft colors
15. Dark mode - true black
16. High contrast - a11y
```

---

## Input

```typescript
PreferencesSystem.setPreference({
  playerId: number,
  key: string,  // 'theme', 'colors', 'language', etc
  value: any
})

PreferencesSystem.getPreference({
  playerId: number,
  key: string,
  defaultValue: any
})

PreferencesSystem.saveFormation({
  playerId: number,
  name: string,
  formation: string,
  tactic: string
})

PreferencesSystem.loadFormation({
  playerId: number,
  formationId: string
})
```

---

## Output

```typescript
{
  preferences: {
    theme: string,
    colors: string,
    language: string,
    notifications: string,
    // ... all user prefs
  },
  formations: [
    {
      id: string,
      name: string,
      formation: string,
      tactic: string,
      savedWeek: number
    }
  ],
  shortcuts: {
    key: string,
    command: string
  }
}
```

---

## Validações

- [ ] Prefs salvos em localStorage (JSON)
- [ ] Formation saves ≤ 10 per player
- [ ] Tactic presets ≤ 8 per player
- [ ] Theme válida (16 opções)
- [ ] Idioma suportado (4 idiomas)
- [ ] Shortcuts não conflitam
- [ ] Dark mode aplicado globalmente
- [ ] Prefs não carregam indefinidamente (timeout)

---

## Forbidden

- [ ] Prefs perdido ao refresh (persist)
- [ ] Formation > 10 saves
- [ ] Tema inválido
- [ ] Shortcut duplicado
- [ ] Difficulty > Hard (sem cheat mode)
- [ ] Data format inválido

---

## Testes

```javascript
test('Theme salvo em localStorage', () => {
  engine.setPreference(playerId, 'theme', 'dark');
  const stored = localStorage.getItem(`prefs_${playerId}`);
  
  expect(JSON.parse(stored).theme).toBe('dark');
});

test('Dark mode aplicado globalmente', () => {
  engine.setPreference(playerId, 'theme', 'dark');
  const body = document.body;
  
  expect(body.classList.contains('dark-mode')).toBe(true);
});

test('Formation saved (max 10)', () => {
  for (let i = 0; i < 11; i++) {
    const saved = engine.saveFormation(playerId, {
      name: `Form ${i}`,
      formation: '4-4-2'
    });
    if (i < 10) expect(saved).toBe(true);
    if (i === 10) expect(saved).toBe(false);  // Rejected
  }
});

test('Load formation restaura setup', () => {
  engine.saveFormation(playerId, {
    name: 'Defensive',
    formation: '5-3-2',
    tactic: 'Defensivo'
  });
  
  const formation = engine.loadFormation(playerId, formationId);
  expect(formation.formation).toBe('5-3-2');
  expect(formation.tactic).toBe('Defensivo');
});

test('Shortcut conflict rejected', () => {
  engine.setShortcut(playerId, 'Ctrl+S', 'Save');
  const conflict = engine.setShortcut(playerId, 'Ctrl+S', 'Search');
  
  expect(conflict).toBe(false);
});

test('Prefs persistem após logout', () => {
  engine.setPreference(playerId, 'theme', 'dark');
  // Simula logout
  engine.logout(playerId);
  // Simula login
  engine.login(playerId);
  
  const pref = engine.getPreference(playerId, 'theme');
  expect(pref).toBe('dark');
});

test('Language changes UI', () => {
  engine.setPreference(playerId, 'language', 'EN');
  const ui = engine.getUIText('hello');
  
  expect(ui).toBe('Hello');  // English
  
  engine.setPreference(playerId, 'language', 'PT-BR');
  const uiPT = engine.getUIText('hello');
  expect(uiPT).toBe('Olá');
});
```

---

## localStorage Schema

```json
{
  "prefs_${playerId}": {
    "theme": "dark",
    "colors": "Azul",
    "language": "PT-BR",
    "notifications": "All",
    "sound": true,
    "visualFX": true,
    "difficulty": "Normal",
    "stadia_view": "Isometric",
    "player_names": "Real",
    "ui_density": "Normal",
    "date_format": "DD/MM/YYYY"
  },
  "formations_${playerId}": [
    {
      "id": "form_001",
      "name": "Defensive",
      "formation": "5-3-2",
      "tactic": "Defensivo",
      "savedWeek": 10
    }
  ]
}
```

---

## Keyboard Shortcuts (Default)

| Key | Action |
|-----|--------|
| Ctrl+S | Save game |
| Ctrl+L | Load game |
| Space | Play/Pause match |
| R | Replay last goal |
| T | Team roster |
| M | Match info |
| S | Statistics |
| A | Achievements |
| E | Settings |
| ? | Help |

---
