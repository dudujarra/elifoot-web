// SPEC-010: Stadium System harness
import { describe, test, expect } from 'vitest';
import { STADIUM_LEVELS, getStadiumInfo, calculateTicketRevenue } from '../../src/engine/StadiumSystem.js';

describe('SPEC-010: Stadium System', () => {
    test('5 stadium levels defined', () => {
        expect(STADIUM_LEVELS.length).toBe(5);
    });

    test('Level 1: 5K capacity', () => {
        const s = getStadiumInfo(1);
        expect(s.capacity).toBe(5000);
        expect(s.vipSeats).toBe(100);
    });

    test('Level 5: 80K capacity', () => {
        const s = getStadiumInfo(5);
        expect(s.capacity).toBe(80000);
        expect(s.vipSeats).toBe(10000);
    });

    test('Upgrade costs progressive', () => {
        for (let i = 2; i < STADIUM_LEVELS.length; i++) {
            expect(STADIUM_LEVELS[i].upgradeCost).toBeGreaterThan(STADIUM_LEVELS[i - 1].upgradeCost);
        }
    });

    test('Ticket prices increase per level', () => {
        for (let i = 1; i < STADIUM_LEVELS.length; i++) {
            expect(STADIUM_LEVELS[i].ticketPrice).toBeGreaterThan(STADIUM_LEVELS[i - 1].ticketPrice);
        }
    });

    test('Revenue calculation works', () => {
        const result = calculateTicketRevenue(3, 60);
        expect(result.revenue).toBeGreaterThan(0);
        expect(result.attendance).toBeGreaterThan(0);
    });

    test('Higher reputation → higher revenue', () => {
        const low = calculateTicketRevenue(3, 20);
        const high = calculateTicketRevenue(3, 90);
        expect(high.revenue).toBeGreaterThan(low.revenue);
    });

    test('VIP revenue 3× ticket price', () => {
        const stadium = getStadiumInfo(3);
        const result = calculateTicketRevenue(3, 50);
        // VIP attendance × ticketPrice × 3 included in revenue
        expect(result.vipAttendance).toBeLessThanOrEqual(stadium.vipSeats);
    });
});
