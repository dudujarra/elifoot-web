export class EpisodicMemory {
    constructor(maxSize = 30) {
        this.memory = [];
        this.memoryMax = maxSize;
    }

    restore(parsedMemory) {
        if (Array.isArray(parsedMemory)) {
            this.memory = parsedMemory;
        }
    }

    serialize() {
        return this.memory;
    }

    reset() {
        this.memory = [];
    }

    remember(entry) {
        if (!entry) return;
        this.memory.push({ ts: Date.now(), ...entry });
        if (this.memory.length > this.memoryMax) {
            this.memory = this.memory.slice(-this.memoryMax);
        }
    }

    recallContext(limit = 10) {
        return this.memory.slice(-limit).map((m, i) => {
            const r = (m.reward != null) ? `r=${m.reward.toFixed(1)}` : '';
            return `${i + 1}. wk${m.week ?? '?'}: ${m.action || m.decision || '?'} → ${m.result || ''} ${r}`.trim();
        }).join('\n');
    }
}
