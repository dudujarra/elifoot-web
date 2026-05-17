/**
 * rng.js — Re-export shim for TypeScript migration.
 * All logic is now in rng.ts. This file exists so that
 * existing `import { rng } from './rng.js'` calls continue to work
 * without touching 50+ import sites.
 *
 * Will be removed when full TS migration completes.
 */
export { rng, setGlobalSeed, getGlobalSeed, deriveMatchSeed, createRng } from './rng.ts';
