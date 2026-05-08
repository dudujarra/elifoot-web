// SPEC-024: Climate & Weather harness
import { describe, test, expect, beforeEach } from 'vitest';
import { WeatherSystem, WEATHER_TYPES, REGION_BIAS } from '../../src/engine/systems/WeatherSystem.js';

describe('SPEC-024: Climate & Weather System', () => {
    let weather;
    beforeEach(() => {
        weather = new WeatherSystem();
    });

    test('14 weather types defined', () => {
        expect(Object.keys(WEATHER_TYPES).length).toBe(14);
    });

    test('Regions have bias', () => {
        expect(REGION_BIAS.Brasil).toBeDefined();
        expect(REGION_BIAS.Europa).toBeDefined();
    });

    test('Set weather works', () => {
        const w = weather.setWeather({ weekOfYear: 1, type: 'Chuva forte', region: 'Brasil' });
        expect(w.type).toBe('Chuva forte');
    });

    test('Invalid type rejected', () => {
        const w = weather.setWeather({ weekOfYear: 1, type: 'Invalid' });
        expect(w).toBeNull();
    });

    test('Chuva forte: possession -20%', () => {
        weather.setWeather({ weekOfYear: 1, type: 'Chuva forte' });
        const impact = weather.getWeatherImpact(1);
        expect(impact.possession).toBe(-20);
    });

    test('Calor extremo: injury risk +50%', () => {
        weather.setWeather({ weekOfYear: 1, type: 'Calor extremo' });
        const impact = weather.getWeatherImpact(1);
        expect(impact.injuryRisk).toBe(50);
    });

    test('Tactic bonus exists for storm', () => {
        weather.setWeather({ weekOfYear: 1, type: 'Tempestade' });
        const impact = weather.getWeatherImpact(1);
        expect(impact.tacticBonus.Defensivo).toBeGreaterThan(impact.tacticBonus.Agressivo);
    });

    test('Altitude alta: fatigue +10%', () => {
        weather.setWeather({ weekOfYear: 1, type: 'Altitude alta' });
        const impact = weather.getWeatherImpact(1);
        expect(impact.fatigueMultiplier).toBe(1.1);
    });

    test('Deterministic with seed', () => {
        weather.setSeed(42);
        const w1 = weather.setWeather({ weekOfYear: 1, type: 'Chuva forte' });
        weather.setSeed(42);
        const w2 = weather.setWeather({ weekOfYear: 1, type: 'Chuva forte' });
        expect(w1.temp).toBe(w2.temp);
    });
});
