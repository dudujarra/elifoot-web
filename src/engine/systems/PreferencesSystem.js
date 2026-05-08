// SPEC-030: Customization & User Preferences
// Theme, language, formations saved, shortcuts. localStorage persist.

export const THEMES = ['Azul', 'Vermelho', 'Verde', 'Roxa', 'Laranja', 'Rosa', 'Ciano', 'Cinza',
                       'Marrom', 'Amarela', 'Turquesa', 'Marrom+Ouro', 'Neon', 'Pastel', 'Dark', 'High contrast'];

export const LANGUAGES = ['EN', 'PT-BR', 'ES', 'FR'];

export const DEFAULT_PREFS = {
    theme: 'Azul',
    mode: 'light', // light/dark/auto
    language: 'PT-BR',
    notifications: 'All',
    sound: true,
    visualFX: true,
    difficulty: 'Normal',
    stadiaView: 'Isometric',
    playerNames: 'Real',
    uiDensity: 'Normal',
    dateFormat: 'DD/MM/YYYY',
};

export const DEFAULT_SHORTCUTS = {
    'Ctrl+S': 'Save',
    'Ctrl+L': 'Load',
    Space: 'Play/Pause',
    R: 'Replay',
    T: 'Roster',
    M: 'Match info',
    S: 'Statistics',
    A: 'Achievements',
    E: 'Settings',
    '?': 'Help',
};

const MAX_FORMATIONS = 10;
const MAX_TACTICS = 8;

// In-memory fallback for tests (no DOM)
const memoryStore = new Map();

function getStorage() {
    if (
        typeof globalThis !== 'undefined' &&
        globalThis.localStorage &&
        typeof globalThis.localStorage.getItem === 'function' &&
        typeof globalThis.localStorage.setItem === 'function' &&
        typeof globalThis.localStorage.removeItem === 'function'
    ) {
        return globalThis.localStorage;
    }
    return {
        getItem: (k) => memoryStore.get(k) ?? null,
        setItem: (k, v) => memoryStore.set(k, v),
        removeItem: (k) => memoryStore.delete(k),
    };
}

export class PreferencesSystem {
    constructor() {
        this.store = getStorage();
    }

    _prefsKey(playerId) {
        return `prefs_${playerId}`;
    }

    _formationsKey(playerId) {
        return `formations_${playerId}`;
    }

    _shortcutsKey(playerId) {
        return `shortcuts_${playerId}`;
    }

    setPreference(playerId, key, value) {
        const prefs = this.getPreferences(playerId);
        if (key === 'theme' && !THEMES.includes(value)) return false;
        if (key === 'language' && !LANGUAGES.includes(value)) return false;
        prefs[key] = value;
        this.store.setItem(this._prefsKey(playerId), JSON.stringify(prefs));
        return true;
    }

    getPreference(playerId, key, defaultValue = null) {
        const prefs = this.getPreferences(playerId);
        return prefs[key] ?? defaultValue ?? DEFAULT_PREFS[key];
    }

    getPreferences(playerId) {
        const raw = this.store.getItem(this._prefsKey(playerId));
        if (!raw) return { ...DEFAULT_PREFS };
        try {
            return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
        } catch {
            return { ...DEFAULT_PREFS };
        }
    }

    saveFormation(playerId, { name, formation, tactic }) {
        const formations = this.getFormations(playerId);
        if (formations.length >= MAX_FORMATIONS) return false;
        const newForm = {
            id: `form_${formations.length + 1}_${Date.now()}`,
            name,
            formation,
            tactic,
            savedWeek: 0,
        };
        formations.push(newForm);
        this.store.setItem(this._formationsKey(playerId), JSON.stringify(formations));
        return newForm;
    }

    loadFormation(playerId, formationId) {
        const formations = this.getFormations(playerId);
        return formations.find((f) => f.id === formationId) || null;
    }

    getFormations(playerId) {
        const raw = this.store.getItem(this._formationsKey(playerId));
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    setShortcut(playerId, key, command) {
        const shortcuts = this.getShortcuts(playerId);
        // Reject conflict
        for (const [k, cmd] of Object.entries(shortcuts)) {
            if (k === key && cmd !== command) {
                return false;
            }
            if (cmd === command && k !== key) {
                return false;
            }
        }
        shortcuts[key] = command;
        this.store.setItem(this._shortcutsKey(playerId), JSON.stringify(shortcuts));
        return true;
    }

    getShortcuts(playerId) {
        const raw = this.store.getItem(this._shortcutsKey(playerId));
        if (!raw) return { ...DEFAULT_SHORTCUTS };
        try {
            return { ...DEFAULT_SHORTCUTS, ...JSON.parse(raw) };
        } catch {
            return { ...DEFAULT_SHORTCUTS };
        }
    }

    reset(playerId) {
        this.store.removeItem(this._prefsKey(playerId));
        this.store.removeItem(this._formationsKey(playerId));
        this.store.removeItem(this._shortcutsKey(playerId));
    }
}
