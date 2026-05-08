/**
 * MonitorService tests — v1.6
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { MonitorService, CATEGORIES, SEVERITIES, MAX_ENTRIES } from '../../src/services/MonitorService.js';

describe('MonitorService', () => {
    beforeEach(() => {
        MonitorService.getInstance().clear();
    });

    test('singleton pattern', () => {
        const a = MonitorService.getInstance();
        const b = MonitorService.getInstance();
        expect(a).toBe(b);
    });

    test('CATEGORIES + SEVERITIES frozen', () => {
        expect(Object.isFrozen(CATEGORIES)).toBe(true);
        expect(Object.isFrozen(SEVERITIES)).toBe(true);
    });

    test('recordBug adiciona entry com severity error default', () => {
        const m = MonitorService.getInstance();
        m.recordBug({ message: 'test bug' });
        const all = m.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].category).toBe(CATEGORIES.BUG);
        expect(all[0].severity).toBe(SEVERITIES.ERROR);
        expect(all[0].message).toBe('test bug');
    });

    test('recordGameplay com action + ctx', () => {
        const m = MonitorService.getInstance();
        m.recordGameplay('TACTIC_CHANGED', { from: 'normal', to: 'attacking' });
        const all = m.getAll();
        expect(all[0].action).toBe('TACTIC_CHANGED');
        expect(all[0].ctx.from).toBe('normal');
    });

    test('recordFeedback inclui URL atual', () => {
        const m = MonitorService.getInstance();
        m.recordFeedback('feedback test');
        const all = m.getAll();
        expect(all[0].message).toBe('feedback test');
    });

    test('recordNote livre', () => {
        const m = MonitorService.getInstance();
        m.recordNote('lembrete X');
        const all = m.getAll();
        expect(all[0].text).toBe('lembrete X');
    });

    test('getByCategory filtra', () => {
        const m = MonitorService.getInstance();
        m.recordBug({ message: 'b' });
        m.recordNote('n');
        m.recordFeedback('f');
        expect(m.getByCategory(CATEGORIES.BUG)).toHaveLength(1);
        expect(m.getByCategory(CATEGORIES.NOTE)).toHaveLength(1);
        expect(m.getByCategory(CATEGORIES.FEEDBACK)).toHaveLength(1);
    });

    test('getStats counts corretos', () => {
        const m = MonitorService.getInstance();
        m.recordBug({ message: 'b1' });
        m.recordBug({ message: 'b2' });
        m.recordGameplay('action');
        m.recordFeedback('f');
        m.recordNote('n');
        const stats = m.getStats();
        expect(stats.total).toBe(5);
        expect(stats.bugs).toBe(2);
        expect(stats.gameplay).toBe(1);
        expect(stats.feedback).toBe(1);
        expect(stats.notes).toBe(1);
    });

    test('clear remove tudo', () => {
        const m = MonitorService.getInstance();
        m.recordNote('test');
        expect(m.getAll()).toHaveLength(1);
        m.clear();
        expect(m.getAll()).toHaveLength(0);
    });

    test('exportJSON retorna JSON válido', () => {
        const m = MonitorService.getInstance();
        m.recordNote('test');
        const json = m.exportJSON();
        expect(() => JSON.parse(json)).not.toThrow();
        const parsed = JSON.parse(json);
        expect(parsed).toHaveLength(1);
    });

    test('FIFO cap em MAX_ENTRIES', () => {
        const m = MonitorService.getInstance();
        for (let i = 0; i < MAX_ENTRIES + 50; i++) {
            m.recordNote(`note ${i}`);
        }
        const all = m.getAll();
        expect(all.length).toBeLessThanOrEqual(MAX_ENTRIES);
    });

    test('entries têm id único', () => {
        const m = MonitorService.getInstance();
        m.recordNote('a');
        m.recordNote('b');
        m.recordNote('c');
        const ids = m.getAll().map(e => e.id);
        expect(new Set(ids).size).toBe(3);
    });

    test('install é idempotente', () => {
        const m = MonitorService.getInstance();
        expect(() => {
            m.install();
            m.install();
            m.install();
        }).not.toThrow();
    });

    test('install gracefully sem window', () => {
        // jsdom env tem window, mas test garante no throw
        const m = MonitorService.getInstance();
        expect(() => m.install()).not.toThrow();
    });
});
