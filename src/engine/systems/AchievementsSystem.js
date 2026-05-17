// SPEC-029: Achievements & Milestones System
// 30 achievements + 7 milestones. Reward por unlock.

import { BADGE } from '../EmojiConstants.js';

export const ACHIEVEMENTS = {
    // Team
    Champion: { name: 'Champion', desc: 'Campeão nacional', reward: 100, rarity: 'Common', badge: BADGE.TROPHY },
    Cup_winner: { name: 'Cup Winner', desc: 'Vence copa', reward: 50, rarity: 'Common', badge: BADGE.MEDAL },
    Legend_tier: { name: 'Legend Tier', desc: 'Prestige > 1000', reward: 200, rarity: 'Legendary', badge: BADGE.STAR },
    Back_to_back: { name: 'Back-to-back', desc: '2 títulos seguidos', reward: 150, rarity: 'Rare', badge: BADGE.FIRST_PLACE },
    Unbeaten: { name: 'Unbeaten', desc: '20 matches sem derrota', reward: 100, rarity: 'Rare', badge: BADGE.SHIELD },
    // Player
    '100_goals': { name: '100 Goals', desc: '100+ gols na carreira', reward: 50, rarity: 'Uncommon', badge: BADGE.SOCCER_BALL },
    Golden_boot: { name: 'Golden Boot', desc: 'Top scorer da liga', reward: 75, rarity: 'Uncommon', badge: BADGE.BULLSEYE },
    Iron_man: { name: 'Iron Man', desc: '50 matches', reward: 30, rarity: 'Common', badge: BADGE.MUSCLE },
    Hat_trick: { name: 'Hat Trick', desc: '3 gols em 1 match', reward: 10, rarity: 'Common', badge: BADGE.FIRE },
    Overhead: { name: 'Overhead', desc: 'Gol acrobático', reward: 15, rarity: 'Rare', badge: BADGE.SHOOTING_STAR },
    // Prestige
    National_hero: { name: 'National Hero', desc: 'Top 10 intl', reward: 100, rarity: 'Rare', badge: BADGE.GLOWING_STAR },
    Club_legend: { name: 'Club Legend', desc: '500+ matches no club', reward: 150, rarity: 'Rare', badge: BADGE.CROWN },
    Rookie: { name: 'Rookie', desc: 'Primeiro match', reward: 5, rarity: 'Common', badge: BADGE.NEW },
    Veteran_15: { name: 'Veteran (15 yrs)', desc: '15 seasons', reward: 100, rarity: 'Rare', badge: BADGE.MILITARY_MEDAL },
    // Rare
    Perfect_season: { name: 'Perfect Season', desc: '100% wins', reward: 200, rarity: 'Legendary', badge: BADGE.LIGHTNING },
    Cinderella: { name: 'Cinderella', desc: 'Base players win títre', reward: 150, rarity: 'Legendary', badge: BADGE.THEATER },
    Comeback: { name: 'Comeback', desc: '0-3 → vitória', reward: 100, rarity: 'Rare', badge: BADGE.REFRESH },
    Defensive_masterclass: { name: 'Defensive Masterclass', desc: '5 clean sheets', reward: 50, rarity: 'Uncommon', badge: BADGE.BRICKS },
    Flawless_match: { name: 'Flawless Match', desc: '0 cards, 100% pass', reward: 75, rarity: 'Rare', badge: BADGE.SPARKLES },
    From_zero: { name: 'From Zero', desc: 'Promovido + título', reward: 75, rarity: 'Rare', badge: BADGE.ROCKET },
    // Seasonal
    Winter_champion: { name: 'Winter Champion', desc: 'Líder mid-season', reward: 30, rarity: 'Common', badge: BADGE.SNOWFLAKE },
    Spring_winner: { name: 'Spring Winner', desc: 'Bottom 3 → top 10', reward: 80, rarity: 'Rare', badge: BADGE.SEEDLING },
    Survivor: { name: 'Survivor', desc: 'Avoid relegation', reward: 60, rarity: 'Common', badge: BADGE.LIFE_PRESERVER },
    // Social
    Rival_slayer: { name: 'Rival Slayer', desc: '5 wins vs rival', reward: 40, rarity: 'Common', badge: BADGE.CROSSED_SWORDS },
    Underdog: { name: 'Underdog', desc: 'Win vs top 3', reward: 50, rarity: 'Uncommon', badge: BADGE.DICE },
    Rivalry_master: { name: 'Rivalry Master', desc: '10 derbies', reward: 60, rarity: 'Common', badge: BADGE.BOXING_GLOVE },
};

export const MILESTONES = {
    matches_10: { event: '10 matches', reward: { type: 'morale', value: 5 } },
    matches_50: { event: '50 matches', reward: { type: 'prestige', value: 2 } },
    matches_100: { event: '100 matches', reward: { type: 'ovr', value: 1 } },
    matches_500: { event: '500 matches', reward: { type: 'prestige', value: 100 } },
    goals_1000: { event: '1000 goals (team)', reward: { type: 'prestige', value: 50 } },
    assists_500: { event: '500 assists (team)', reward: { type: 'prestige', value: 50 } },
    trophies_50: { event: '50 trophies', reward: { type: 'prestige', value: 500 } },
};

export class AchievementsSystem {
    constructor() {
        this.unlocked = new Map(); // playerId/teamId → Set<achievementId>
        this.progress = new Map(); // `${id}_${achievementId}` → number
        this.points = new Map(); // playerId/teamId → total points
    }

    unlockAchievement(entityId, achievementId, weekOfYear = 0) {
        if (!ACHIEVEMENTS[achievementId]) return null;
        const set = this.unlocked.get(entityId) || new Set();
        if (set.has(achievementId)) return { alreadyUnlocked: true };
        set.add(achievementId);
        this.unlocked.set(entityId, set);

        const achievement = ACHIEVEMENTS[achievementId];
        const totalPoints = (this.points.get(entityId) || 0) + achievement.reward;
        this.points.set(entityId, totalPoints);

        return {
            ...achievement,
            id: achievementId,
            unlocked: true,
            unlockedWeek: weekOfYear,
            entityId,
        };
    }

    setProgress(entityId, achievementId, value) {
        const key = `${entityId}_${achievementId}`;
        const v = Math.min(100, Math.max(0, value));
        this.progress.set(key, v);
        return v;
    }

    getProgress(entityId, achievementId) {
        const key = `${entityId}_${achievementId}`;
        return this.progress.get(key) || 0;
    }

    getAchievements(entityId) {
        const set = this.unlocked.get(entityId) || new Set();
        return [...set].map((id) => ({ id, ...ACHIEVEMENTS[id], unlocked: true }));
    }

    getPoints(entityId) {
        return this.points.get(entityId) || 0;
    }

    checkAchievements({ entityId, event, details = {} }) {
        const unlocked = [];
        // Auto-detect known events
        if (event === 'champion') {
            const r = this.unlockAchievement(entityId, 'Champion', details.week);
            if (r && !r.alreadyUnlocked) unlocked.push(r);
        }
        if (event === '100_goals' || (event === 'goal' && details.totalGoals >= 100)) {
            const r = this.unlockAchievement(entityId, '100_goals', details.week);
            if (r && !r.alreadyUnlocked) unlocked.push(r);
        }
        if (event === 'hat_trick') {
            const r = this.unlockAchievement(entityId, 'Hat_trick', details.week);
            if (r && !r.alreadyUnlocked) unlocked.push(r);
        }
        if (event === 'unbeaten_20' || (event === 'unbeaten' && details.streak >= 20)) {
            const r = this.unlockAchievement(entityId, 'Unbeaten', details.week);
            if (r && !r.alreadyUnlocked) unlocked.push(r);
        }
        if (event === 'matches' && details.total >= 100) {
            const r = this.unlockAchievement(entityId, 'Iron_man', details.week);
            if (r && !r.alreadyUnlocked) unlocked.push(r);
        }
        return unlocked;
    }

    processMilestone(entityId, type, value) {
        const key = `${type}_${value}`;
        if (!MILESTONES[key]) return null;
        return MILESTONES[key];
    }
}
