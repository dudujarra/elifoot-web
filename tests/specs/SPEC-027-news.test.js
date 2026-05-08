// SPEC-027: News & Announcements harness
import { describe, test, expect, beforeEach } from 'vitest';
import { NewsSystem, NEWS_TYPES } from '../../src/engine/systems/NewsSystem.js';

describe('SPEC-027: News System', () => {
    let news;
    beforeEach(() => {
        news = new NewsSystem();
    });

    test('20 news types', () => {
        expect(Object.keys(NEWS_TYPES).length).toBe(20);
    });

    test('Vitória: +5 morale', () => {
        const item = news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 5, details: { team: 'FC Test', score: '2-0' } });
        expect(item.moralImpact).toBe(5);
    });

    test('Título: +30 morale, prestige +50', () => {
        const item = news.generateNews({ type: 'Título', teamId: 1, weekOfYear: 38, details: { team: 'FC Test' } });
        expect(item.moralImpact).toBe(30);
        expect(item.prestigeImpact).toBe(50);
    });

    test('No duplicate same week', () => {
        const i1 = news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 5, details: { team: 'X', score: '1-0' } });
        const i2 = news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 5, details: { team: 'X', score: '1-0' } });
        expect(i1.id).toBe(i2.id);
    });

    test('Read news returns morale impact', () => {
        const item = news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 5, details: { team: 'X', score: '2-0' } });
        const impact = news.readNews(item.id, 999);
        expect(impact).toBe(5);
    });

    test('Read same news twice: 0 second time', () => {
        const item = news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 5, details: { team: 'X', score: '2-0' } });
        news.readNews(item.id, 999);
        expect(news.readNews(item.id, 999)).toBe(0);
    });

    test('Archive after 4 weeks', () => {
        news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 1, details: { team: 'X', score: '2-0' } });
        news.archiveOldNews(10);
        const fresh = news.getNews({ teamId: 1, week: 10 });
        expect(fresh.length).toBe(0);
    });

    test('Get news filtered by team', () => {
        news.generateNews({ type: 'Vitória', teamId: 1, weekOfYear: 1, details: { team: 'A', score: '2-0' } });
        news.generateNews({ type: 'Vitória', teamId: 2, weekOfYear: 1, details: { team: 'B', score: '3-0' } });
        const t1News = news.getNews({ teamId: 1, week: 1, filter: 'team' });
        expect(t1News.every((n) => n.teamId === 1)).toBe(true);
    });

    test('Importance correlation', () => {
        const minor = news.generateNews({ type: 'Market rumor', teamId: 1, weekOfYear: 1, details: {} });
        const major = news.generateNews({ type: 'Título', teamId: 1, weekOfYear: 1, details: { team: 'X' } });
        expect(major.importance).toBeGreaterThan(minor.importance);
    });
});
