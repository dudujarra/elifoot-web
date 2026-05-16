/**
 * deep-tactical-engine-test.js
 * Runs a simple match simulation using the new DeepTacticalEngine.
 */

import { DeepTacticalEngine } from './src/engine/tactical/DeepTacticalEngine.js';

const engine = new DeepTacticalEngine();

const teamA = { name: 'Home Team', formation: '4-3-3' };
const teamB = { name: 'Away Team', formation: '4-4-2' };

engine.initializeMatch(teamA, teamB);

console.log('--- Deep Tactical Engine Simulation Started ---');

for (let minute = 1; minute <= 90; minute++) {
    engine.tickMinute();
    if (minute % 15 === 0) {
        console.log(`[Minute ${minute}] Possession: ${engine.matchState.possession}`);
        console.log(`           Ball Position: (${engine.grid.ballPosition.x}, ${engine.grid.ballPosition.y})`);
    }
}

console.log('--- Full Time ---');
console.log(`Score: ${teamA.name} ${engine.matchState.homeScore} - ${engine.matchState.awayScore} ${teamB.name}`);
console.log(`xG: ${engine.matchState.homeStats.xG.toFixed(2)} - ${engine.matchState.awayStats.xG.toFixed(2)}`);
console.log(`Shots: ${engine.matchState.homeStats.shots} - ${engine.matchState.awayStats.shots}`);
