#!/usr/bin/env node
/**
 * SPEC-149: Extrair sequências positivas do dataset para imitation learning.
 * Usage: node scripts/extract-imitation-dataset.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = join(__dirname, '../docs/dataset-finetune.jsonl');
const OUTPUT = join(__dirname, '../docs/dataset-imitation.jsonl');
const STATS_OUT = join(__dirname, '../docs/imitation-stats.json');

const EXCLUDED = new Set(['DREAD_RELEGATION', 'NARRATIVE_EVENT', 'PRESS_CONFERENCE', 'VISIT_VIEW']);

const lines = readFileSync(INPUT, 'utf-8').split('\n').filter(Boolean);
const [_meta, ...tuples] = lines.map(l => JSON.parse(l));

const positive = tuples.filter(t =>
    !EXCLUDED.has(t.action) &&
    (t.outcome?.won === 1 || (t.outcome?.rewardDelta !== null && t.outcome?.rewardDelta > 0))
);

// Dedupe
const seen = new Set();
const deduped = positive.filter(t => {
    const key = `${t.input?.season}_${t.input?.week}_${t.action}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
});

const output = [
    JSON.stringify({ meta: { total: deduped.length, source: INPUT, generated: new Date().toISOString() } }),
    ...deduped.map(t => JSON.stringify({
        state: t.input,
        action: t.action,
        actionArgs: t.actionArgs,
        quality: 'positive',
    }))
].join('\n') + '\n';

writeFileSync(OUTPUT, output);

const breakdown = {};
deduped.forEach(t => { breakdown[t.action] = (breakdown[t.action] || 0) + 1; });
writeFileSync(STATS_OUT, JSON.stringify({ total: deduped.length, breakdown }, null, 2));

console.log(`✅ Extracted ${deduped.length} positive examples → ${OUTPUT}`);
console.log('Breakdown:', breakdown);
