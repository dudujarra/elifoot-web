import { rng as systemRng } from './rng.js';
import { Player } from './types.js';

// ============================================================
// MENTORING — Veterano ensina Jovem
// ============================================================
export function processMentoring(squad: any[]): string[] {
    const events: string[] = [];

    // Find mentors: age 28+, moral 60+, no injury
    const mentors = squad.filter((p: Player) => (p.age || 25) >= 28 && (p.moral || 50) >= 60 && !p.injury);
    // Find mentees: age <= 22, no injury
    const mentees = squad.filter((p: Player) => (p.age || 25) <= 22 && !p.injury);

    if (mentors.length === 0 || mentees.length === 0) return events;

    // SCHEMA-UNIFIED: usa root-level stats
    const STAT_KEYS = ['attacking', 'technical', 'tactical', 'defending', 'creativity'];

    // One mentoring session per week (10% chance per eligible pair)
    for (const mentee of mentees) {
        if (systemRng() > 0.10) continue;
        const mentor = mentors[Math.floor(systemRng() * mentors.length)];

        // Mentee gets a small boost to a random attr
        if (mentee.attributes && mentee.attributes.mental) {
            const mKeys = Object.keys(mentee.attributes.mental);
            const attr = mKeys[Math.floor(systemRng() * mKeys.length)];
            const oldVal = mentee.attributes.mental[attr] || 10;
            
            // On a 1-20 scale, a boost of +1 is significant. 20% chance to actually gain a point.
            if (systemRng() > 0.8 && oldVal < 20) {
                mentee.attributes.mental[attr] += 1;
                mentee.moral = Math.min(100, (mentee.moral || 50) + 3);
                mentor.moral = Math.min(100, (mentor.moral || 50) + 1);
                events.push(`📚 ${mentor.name} treinou ${mentee.name} mentalmente (${attr} subiu para ${mentee.attributes.mental[attr]}).`);
            }
        } else {
            // Legacy schema
            const attr = STAT_KEYS[Math.floor(systemRng() * STAT_KEYS.length)];
            const boost = 1;
            const oldVal = mentee[attr] || 50;
            mentee[attr] = Math.min(99, oldVal + boost);

            if (mentee[attr] > oldVal) {
                // Mentee moral boost
                mentee.moral = Math.min(100, (mentee.moral || 50) + 3);
                // Mentor feels valued
                mentor.moral = Math.min(100, (mentor.moral || 50) + 1);

                events.push(`📚 ${mentor.name} treinou ${mentee.name}: ${attr} ${oldVal}→${mentee[attr]}`);
            }
        }
        break; // One mentoring per week
    }

    return events;
}
