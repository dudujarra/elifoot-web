import { create } from 'zustand';

export const useMatchStore = create((set) => ({
    // Match Live State
    result: null,
    narration: [],
    displayedEvents: [],
    currentMinute: 0,
    isPlaying: false,
    paused: false,
    speed: 200,
    half: '1º TEMPO',
    
    // Actions
    setResult: (res) => set(state => ({ result: typeof res === 'function' ? res(state.result) : res })),
    setNarration: (events) => set(state => ({ narration: typeof events === 'function' ? events(state.narration) : events })),
    setDisplayedEvents: (events) => set(state => ({ displayedEvents: typeof events === 'function' ? events(state.displayedEvents) : events })),
    addDisplayedEvents: (newEvents) => set(state => ({ displayedEvents: [...state.displayedEvents, ...newEvents] })),
    setCurrentMinute: (min) => set({ currentMinute: min }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setPaused: (p) => set({ paused: p }),
    setSpeed: (s) => set({ speed: s }),
    setHalf: (h) => set({ half: h }),

    // Reset for new match
    resetMatch: () => set({
        result: null,
        narration: [],
        displayedEvents: [],
        currentMinute: 0,
        isPlaying: false,
        paused: false,
        half: '1º TEMPO'
    })
}));
